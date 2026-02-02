import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  findOrCreateUniversity,
  addToShortlist,
} from "@/lib/university-service";

const getPersonaInstruction = (persona: string) => {
  const baseTools = `
TOOL USAGE FORMAT:
To use a tool, you MUST output a valid JSON object in the following format and NOTHING else:
{
  "tool": "tool_name",
  "args": {
    "key": "value"
  }
}

AVAILABLE TOOLS:
- Tool Name: "add_to_shortlist"
  - Description: Adds a university to the user's shortlist. Use when user says "Add [University]" or "I like [University]".
  - Args: "universityName" (string)

- Tool Name: "lock_university"
  - Description: Locking a university triggers advanced tasks. Use ONLY if user explicitly wants to "Lock" or "Finalize".
  - Args: "universityName" (string)

GUIDELINES:
- Be concise, direct, and conversational.
- DO NOT repeat generic greetings like "Hello" or "Hi" in every response.
- Use the student's name naturally and sparsely; do not over-address them.
- If NO tool is needed, simply reply with a helpful text response.
- Do NOT output the tool JSON if you are just chatting.
- If the tool succeeds, subsequent messages will inform you.
`;

  const personas: Record<string, string> = {
    "Supportive Mentor": `
You are the ScholrAI Counsellor acting as a SUPPORTIVE MENTOR.
Your goal is to help students with study abroad plans in an encouraging, empathetic way.

PERSONA BEHAVIOR:
- Be warm, encouraging, and positive while remaining realistic
- Acknowledge student achievements and strengths
- Frame weaknesses as opportunities for growth
- Provide constructive feedback with supportive language
- Use phrases like "You're on the right track", "Great start", "Let's work together"
- Balance honesty with encouragement
- Celebrate small wins and progress
${baseTools}`,

    "Strict Admissions Officer": `
You are the ScholrAI Counsellor acting as a STRICT ADMISSIONS OFFICER.
Your goal is to evaluate students with the same critical eye as a top-tier university admissions committee.

PERSONA BEHAVIOR:
- BE DIRECT, CRITICAL, AND DEMANDING with HIGH STANDARDS
- Point out profile weaknesses, gaps, and deficiencies WITHOUT sugar-coating
- Question unrealistic choices and challenge the student
- Use formal, professional language
- Focus heavily on what's MISSING or WEAK in their profile
- Compare them to competitive applicant pools honestly
- Use phrases like "Frankly", "Realistically", "Your profile shows significant gaps in", "This is concerning"
- Do NOT provide excessive encouragement or positivity
- Emphasize competitiveness and how tough admissions are
- Make them understand the harsh reality of competitive admissions
- Be blunt about low chances when appropriate
${baseTools}`,

    "Strategic Strategist": `
You are the ScholrAI Counsellor acting as a STRATEGIC STRATEGIST.
Your goal is to help students maximize their admission chances through data-driven, analytical advice.

PERSONA BEHAVIOR:
- Be analytical, logical, and data-focused
- Present options with probability assessments
- Focus on ROI (return on investment) and strategic positioning
- Use statistics, rankings, and concrete numbers when possible
- Suggest tactical moves to improve competitiveness
- Think in terms of "reach, match, safety" schools
- Use phrases like "Based on data", "Statistically speaking", "The most strategic approach"
- Balance multiple factors (cost, ranking, fit, chances)
- Provide clear action items with expected outcomes
${baseTools}`,
  };

  return personas[persona] || personas["Supportive Mentor"];
};

export async function POST(req: Request) {
  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.error("Missing HUGGINGFACE_API_KEY");
      return NextResponse.json(
        { error: "Configuration Error" },
        { status: 500 },
      );
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      message,
      messages = [],
      stream: shouldStream = true,
      persona = "Supportive Mentor",
    } = await req.json();

    // Context fetching: Profile + Shortlist
    const profile = await prisma.profile.findUnique({
      where: { userId: session.userId },
      include: { user: true },
    });

    const shortlist = await prisma.shortlist.findMany({
      where: { userId: session.userId },
      include: { university: true },
    });

    const lockedUni = shortlist.find((s) => s.isLocked);
    const shortlistNames = shortlist.map((s) => s.university.name).join(", ");

    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

    // Construct History for Qwen
    // HF Inference often prefers a simple array of { role, content }
    // We filter valid roles.
    let chatHistory = messages
      .filter(
        (m: any) =>
          m.role === "user" || m.role === "assistant" || m.role === "system",
      )
      .map((m: any) => ({
        role: m.role,
        content: m.content,
      }));

    const contextString = `
      USER CONTEXT:
      - Name: ${profile?.user.fullName || "Student"}
      - Target Degree: ${profile?.targetDegree}
      - GPA: ${profile?.gpa}
      - Target Major: ${profile?.targetMajor || "Not specified"}
      - Current Shortlist: ${shortlistNames || "Empty"}
      - Locked University: ${lockedUni?.university.name || "None"}
    `;

    // Append context to the last user message or system prompt
    // For simplicity, we prepend a system message with instructions + context
    const fullMessages = [
      {
        role: "system",
        content: getPersonaInstruction(persona) + contextString,
      },
      ...chatHistory,
      { role: "user", content: message },
    ];

    console.log("Using model: Qwen/Qwen2.5-72B-Instruct (or 7B fallback)");

    console.log("Using model: Qwen/Qwen2.5-72B-Instruct (Streaming)");

    if (!shouldStream) {
      const response = await hf.chatCompletion({
        model: "Qwen/Qwen2.5-72B-Instruct",
        messages: fullMessages,
        max_tokens: 500,
        temperature: 0.7,
      });
      return NextResponse.json({ reply: response.choices[0].message.content });
    }

    const stream = hf.chatCompletionStream({
      model: "Qwen/Qwen2.5-72B-Instruct",
      messages: fullMessages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    let isToolCall = false;
    let buffer = "";

    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (!content) continue;

            // First chunk detection for Tool Call
            if (buffer === "" && content.trim().startsWith("{")) {
              isToolCall = true;
            }

            if (isToolCall) {
              buffer += content;
            } else {
              controller.enqueue(encoder.encode(content));
            }
          }

          if (isToolCall) {
            // Process the buffered tool call
            const jsonMatch = buffer.match(/\{[\s\S]*"tool"[\s\S]*\}/);
            if (jsonMatch) {
              try {
                const toolCall = JSON.parse(jsonMatch[0]);
                console.log(
                  "Tool Call Triggered:",
                  toolCall.tool,
                  toolCall.args,
                );
                let toolResultText = "";

                if (toolCall.tool === "add_to_shortlist") {
                  const uniName = toolCall.args.universityName;
                  const res = await addToShortlist(session.userId, uniName);
                  toolResultText =
                    res.status === "success"
                      ? `Successfully added ${res.university.name} to the shortlist.`
                      : `${res.university.name} is already in the shortlist.`;
                } else if (toolCall.tool === "lock_university") {
                  const uniName = toolCall.args.universityName;
                  await addToShortlist(session.userId, uniName);
                  toolResultText = `I have shortlisted ${uniName} for you. Locking is a safety feature best done in the Shortlist tab.`;
                }

                const finalReply =
                  buffer.replace(jsonMatch[0], "").trim() +
                  "\n\n" +
                  `[System: ${toolResultText}]`;
                controller.enqueue(encoder.encode(finalReply));
              } catch (e) {
                controller.enqueue(encoder.encode(buffer));
              }
            } else {
              controller.enqueue(encoder.encode(buffer));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("Chat Error:", error);
    return NextResponse.json({
      reply: "I am having trouble connecting to my new brain (Hugging Face).",
    });
  }
}
