import { NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  SchemaType,
  type Tool,
} from "@google/generative-ai";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  findOrCreateUniversity,
  addToShortlist,
} from "@/lib/university-service";

const SYSTEM_INSTRUCTION = `
You are the ScholrAI Counsellor.
Your goal is to help students with study abroad plans.
You have access to tools to help the student directly.

GUIDELINES:
- If the user asks to shortlist a university ("Add Stanford", "I like MIT"), USE THE TOOL \`add_to_shortlist\`.
- If the tool succeeds, confirm it to the user naturally ("I've added Stanford to your shortlist.").
- If the tool fails or university isn't found, apologize.
- Don't simply say you *will* do it, actually CALL THE FUNCTION.
`;

// Tool Definitions
const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "add_to_shortlist",
        description:
          "Adds a university to the user's shortlist. Use this when the user explicitly wants to save/shortlist a university.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            universityName: {
              type: SchemaType.STRING,
              description:
                "The name of the university to add (e.g. 'Harvard University', 'Stanford')",
            },
          },
          required: ["universityName"],
        },
      },
      {
        name: "lock_university",
        description:
          "Locks a university as the final target. Triggers SOP/Essay tasks generation. Use ONLY when user is certain.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            universityName: {
              type: SchemaType.STRING,
              description: "The name of the university to lock",
            },
          },
          required: ["universityName"],
        },
      },
    ],
  },
];

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, messages = [] } = await req.json();

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

    // Setup Model
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel(
      {
        model: "gemini-2.5-flash", // Stable version with robust tool support
        tools: tools,
      },
      { apiVersion: "v1beta" },
    );

    // Construct History
    // Filter to ensure history starts with user and alternates turns
    let textHistory = messages
      .filter(
        (m: any) => m.role === "user" || m.role === "model" || m.role === "ai",
      )
      .map((m: any) => ({
        role: m.role === "ai" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    // CRITICAL: Gemini history MUST start with 'user' role
    if (textHistory.length > 0 && textHistory[0].role === "model") {
      textHistory = textHistory.slice(1);
    }

    const contextString = `
      USER CONTEXT:
      - Name: ${profile?.user.fullName || "Student"}
      - Target Degree: ${profile?.targetDegree}
      - GPA: ${profile?.gpa}
      - Target Major: ${profile?.targetMajor || "Not specified"}
      - Current Shortlist: ${shortlistNames || "Empty"}
      - Locked University: ${lockedUni?.university.name || "None"}
    `;

    const chat = model.startChat({
      history: textHistory,
      systemInstruction: {
        role: "system",
        parts: [{ text: SYSTEM_INSTRUCTION + contextString }],
      },
    });

    console.log("Sending chat message with tools enabled...");
    const result = await chat.sendMessage(message);
    const response = await result.response;

    // Check for Function Calls
    const calls = response.functionCalls();

    if (calls && calls.length > 0) {
      const call = calls[0];
      console.log("Tool Call Triggered:", call.name, call.args);

      // Execute Tool
      let toolResultText = "";

      if (call.name === "add_to_shortlist") {
        const uniName = (call.args as any).universityName;
        try {
          const res = await addToShortlist(session.userId, uniName);
          if (res.status === "success") {
            toolResultText = `Successfully added ${res.university.name} to the shortlist.`;
          } else {
            toolResultText = `${res.university.name} is already in the shortlist.`;
          }
        } catch (e: any) {
          toolResultText = `Error adding university: ${e.message}`;
        }
      } else if (call.name === "lock_university") {
        // Minimal implementation for now - reusing matching logic if possible or update directly
        // For hackathon P0, just shortlist first then lock
        toolResultText =
          "Locking is a two-step process provided in the UI for safety. I have shortlisted it for you instead.";
        const uniName = (call.args as any).universityName;
        await addToShortlist(session.userId, uniName);
      }

      // Send Tool Result back to model to get final natural language response
      const resultParts = [
        {
          functionResponse: {
            name: call.name,
            response: { result: toolResultText },
          },
        },
      ];

      const finalResult = await chat.sendMessage(resultParts);
      const finalResponse = await finalResult.response;
      return NextResponse.json({ reply: finalResponse.text() });
    }

    return NextResponse.json({ reply: response.text() });
  } catch (error: any) {
    console.error("Chat Error:", error);
    // Fallback to simpler model if tools fail or model not found
    return NextResponse.json({
      reply:
        "I encountered an error processing that request. Please try again briefly.",
    });
  }
}
