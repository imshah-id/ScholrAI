import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite-preview-02-05", // Use 2.0 Flash for structured output speed
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        rank: { type: SchemaType.INTEGER },
        fees: { type: SchemaType.STRING },
        acceptanceRate: { type: SchemaType.STRING },
        location: { type: SchemaType.STRING },
        summary: { type: SchemaType.STRING },
        academicStrengths: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      },
      required: [
        "fees",
        "acceptanceRate",
        "location",
        "summary",
        "academicStrengths",
        "tags",
      ],
    },
  },
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { universityId, universityName } = await req.json();

    if (!universityName) {
      return NextResponse.json(
        { error: "University Name required" },
        { status: 400 },
      );
    }

    console.log(`Enriching data for: ${universityName}`);

    const prompt = `
      Provide real-world data for "${universityName}".
      - Rank: Global ranking (QS or THE approximation). If unknown, use 999.
      - Fees: Annual Tuition for International Students in USD (e.g. "$45,000").
      - AcceptanceRate: Approximate rate (e.g. "15%").
      - Location: Just the City, Country (e.g. "Boston, USA").
      - Summary: A 2-sentence marketing summary highlighting its strengths.
      - AcademicStrengths: 3-4 keywords of strong majors.
      - Tags: 3 keywords (e.g. "Private", "Research", "Urban").
    `;

    const result = await model.generateContent(prompt);
    const data = JSON.parse(result.response.text());

    // Update DB
    const updated = await prisma.university.update({
      where: { id: universityId }, // Ideally use ID, or Name if ID not sure
      data: {
        rank: data.rank || 999,
        fees: data.fees,
        acceptanceRate: data.acceptanceRate,
        location: data.location,
        // We can store extras in 'tags' or new fields if schema permits
        // For now, reusing 'tags' for the tags list, and we lose summary/strengths unless we add cols.
        // Let's just update standard fields for the Hackathon MVP.
        // We will store the rich data in 'tags' as a JSON string if needed or just drop it.
        // Actually, let's keep it simple: Rank, Fees, Acceptance Rate are the P0s.
        tags: JSON.stringify(data.tags || ["AI Enriched"]),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Enrichment Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
