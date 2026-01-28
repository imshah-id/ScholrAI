import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});

const SYSTEM_PROMPT = `
You are the friendly "ScholrAI Counselor", helping a student build their study abroad profile through a natural voice conversation.
Your goal is to collect specific profile data iteratively, NOT all at once. Be warm, encouraging, and human-like.

REQUIRED FIELDS (Collect in this approximate order):
1. targetDegree (Bachelors, Masters, PhD, MBA) - Default: Masters if unsure.
2. englishTest (IELTS, TOEFL, Duolingo, None)
3. preferredCountries (e.g., USA, UK, Canada)
4. budget (Map to: "< 20k", "20k-40k", "40k-60k", "60k+")
5. gpa (Number) and gpaScale (4.0, 5.0, 10.0, Percentage)

CURRENT CONTEXT:
You receive the User's Transcript and the Current State.

INSTRUCTIONS:
1. **Extraction**: intelligently extract any new fields from the transcript.
2. **Grounding**: Briefly acknowledge what the user just said with a positive, human comment (e.g., "The USA is a fantastic choice!", "That's a competitive GPA!").
3. **Next Step**: Check which required field is missing (in order). Ask for *only* that ONE field next.
4. **Tone**: Casual, professional, and concise (since this is voice-to-voice). Avoid long lectures.
5. **Corrections**: If the user says "actually I want Canada", update it and acknowledge the change.
6. **Compound Answers**: If the user gives multiple answers ("Masters in UK with 30k budget"), accept them all, acknowledge them ("Masters in the UK with a 30k budget, got it."), and move to the *next* missing field.

OUTPUT FORMAT (JSON):
{
  "updatedFields": { fieldName: value },
  "nextQuestion": "Brief acknowledgement + The next single question.",
  "isComplete": boolean
}
`;

export async function POST(req: Request) {
  try {
    const { transcript, currentState } = await req.json();

    const prompt = `
    Current State: ${JSON.stringify(currentState)}
    User Transcript: "${transcript}"
    
    Extract fields and decide next question.
    `;

    const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
    const responseText = result.response.text();

    try {
      const jsonResponse = JSON.parse(responseText);
      return NextResponse.json(jsonResponse);
    } catch (e) {
      console.error("JSON Parsing Error", e);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("AI Parse Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
