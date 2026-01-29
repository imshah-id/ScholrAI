import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

const SYSTEM_INSTRUCTION = `
You are the ScholrAI Counsellor, an expert educational consultant for students aiming to study abroad.
Your goal is to help students with:
- Selecting universities based on their profile.
- Understanding application requirements (SOP, LOR, transcripts).
- Finding scholarships.
- Improving their application essays.

CRITICAL RESPONSE GUIDELINES:
1. **Scope Enforcement**: You are STRICTLY a study abroad counsellor.
   - If a user asks about politics, entertainment, coding (unrelated to study), general life advice, or anything outside education/careers/studying abroad, you MUST politely decline.
   - Example Refusal: "I apologize, but I specialize only in study abroad counseling and educational guidance. How can I help you with your university applications?"
   - Do NOT answer the off-topic question even briefly.

2. **Tone & Style**:
   - Be professional, empathetic, and encouraging.
   - **NO ROBOTIC GREETINGS**: Do NOT start every response with "Hello [Name]". Use the user's name sparsely (e.g., only when specifically emphasising a point). It is better to dive straight into the answer.
   - Use clear formatting with Markdown:
     - Use **bold** for key terms.
     - Use bullet points for lists.
     - Keep paragraphs short.

3. **Context Awareness**:
   - Use the provided user profile (GPA, budget, target country) to tailor your advice.
   - If context is missing, ask clarifying questions.

4. **Actionable Recommendations**:
   - If you recommend a specific university that seems like a good fit, enable the user to shortlist it easily.
   - Use the format: "[SHORTLIST: University Name]" at the end of your sentence.
   - Example response: "Stanford is a great reach for you. [SHORTLIST: Stanford University]"
   - Only use this when you are explicitly recommending a university.

5. **Refusal Strategy**:
   - If the question is off-topic, provide a *short* pivot without a lecture.
   - Bad: "I apologize but I cannot answer that because I am a study abroad counsellor..."
   - Good: "I focus on your educational goals. Usage of that topic is outside my scope, but I can help you with [University/Scholarship/Essay]."
`;

export async function POST(req: Request) {
  try {
    console.log("POST /api/chat called");

    // Debug API Key presence
    if (!process.env.GEMINI_API_KEY) {
      console.error("CRITICAL: GEMINI_API_KEY is missing in process.env");
      return NextResponse.json(
        { error: "Server misconfiguration: Missing API Key" },
        { status: 500 },
      );
    } else {
      console.log(
        "GEMINI_API_KEY is present (starts with " +
          process.env.GEMINI_API_KEY.substring(0, 4) +
          "...)",
      );
    }

    const session = await getSession();
    if (!session) {
      console.log("POST /api/chat: Unauthorized - No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload;
    try {
      payload = await req.json();
    } catch (e) {
      console.error("POST /api/chat: Failed to parse JSON body");
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { message, messages = [] } = payload;
    console.log("Received message:", message);
    console.log("History length:", messages?.length);

    // Fetch user profile for context
    const profile = await prisma.profile
      .findUnique({
        where: { userId: session.userId },
        include: { user: true },
      })
      .catch((e) => {
        console.error("Profile fetch error (non-fatal):", e);
        return null;
      });

    // Fetch locked shortlist (University + Guidance Tasks)
    const lockedShortlist = await prisma.shortlist
      .findFirst({
        where: { userId: session.userId, isLocked: true },
        include: {
          university: true,
          guidanceTasks: true,
        },
      })
      .catch((e) => {
        console.error("Shortlist fetch error:", e);
        return null;
      });

    let contextPrompt = "";
    if (profile) {
      contextPrompt += `
      User Profile Context:
      Name: ${profile.user.fullName}
      Target Degree: ${profile.targetDegree}
      Targt Intake: ${profile.targetIntake}
      Current GPA: ${profile.gpa}
      Budget: ${profile.budget}
      Preferred Countries: ${profile.preferredCountries}
      `;
    }

    if (
      lockedShortlist &&
      lockedShortlist.university &&
      lockedShortlist.guidanceTasks
    ) {
      const uni = lockedShortlist.university;
      const tasks = lockedShortlist.guidanceTasks
        .map(
          (t: any) =>
            `- [${t.status === "completed" ? "X" : " "}] ${t.title} (${t.type})`,
        )
        .join("\n");

      contextPrompt += `
        \nCURRENT APPLICATION STATUS:
        Target University: ${uni.name} in ${uni.country}
        
        Outstanding Guidance Checklist:
        ${tasks}
        
        INSTRUCTION: references these specific tasks when offering help. If a task is pending, offer specific advice for it.
        `;
    } else {
      contextPrompt += `\nNote: The user has NOT selected a final university yet. Encourage them to shortlist and lock a university to get specific guidance.`;
    }

    // Creating model instance inside request to ensure env var is picked up if hot-loaded
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use standard 1.5 flash for stability and speed
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Filter history to ensure it complies with Gemini's requirement (User turn first)
    // The greeting is "ai", so we likely need to drop it if it's the first one.
    let validHistory = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Find the index of the first user message
    const firstUserIndex = validHistory.findIndex(
      (m: any) => m.role === "user",
    );

    // If no user message in history (unlikely if we are sending one now, but technically history is PAST messages),
    // then history should be empty.
    // If there is a user message, slice from there.
    if (firstUserIndex !== -1) {
      validHistory = validHistory.slice(firstUserIndex);
    } else {
      validHistory = []; // No prior user messages found, start fresh
    }

    const chat = model.startChat({
      history: validHistory,
    });

    const fullMessage = `${SYSTEM_INSTRUCTION}\n\n${contextPrompt}\n\nUser Question: ${message}`;

    console.log("Sending request to Gemini...");
    const result = await chat.sendMessage(fullMessage);
    const response = await result.response;
    const text = response.text();
    console.log("Received response from Gemini");

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error("Gemini Chat Error Details:", error);

    // Graceful handling of Rate Limits (429)
    if (error.message?.includes("429") || error.status === 429) {
      return NextResponse.json({
        reply:
          "I'm currently receiving too many requests. Please give me a moment to cooldown and try again in about 30 seconds.",
      });
    }

    // Return specific error if possible to help frontend debugging
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 },
    );
  }
}
