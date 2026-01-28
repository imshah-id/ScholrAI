import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  evaluateUniversity,
  createCanonicalProfile,
  createCanonicalUniversity,
} from "@/lib/matching-engine";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const university = await prisma.university.findUnique({
      where: { id },
    });

    if (!university) {
      return NextResponse.json(
        { error: "University not found" },
        { status: 404 },
      );
    }

    const userProfile = await prisma.profile.findUnique({
      where: { userId: session.userId },
    });

    let result: any = {
      score: 70,
      match_category: "TARGET",
      acceptance_chance: "Medium",
      why_it_fits: [],
    };

    if (userProfile) {
      const canonicalProfile = createCanonicalProfile(
        session.userId,
        userProfile.gpa || "0",
        userProfile.gpaScale || "4.0",
        userProfile.englishTest || "",
        userProfile.testScore || "0",
        userProfile.budget || "0",
        userProfile.targetDegree || "Bachelors",
        [],
      );
      try {
        const prefs = JSON.parse(userProfile.preferredCountries || "[]");
        canonicalProfile.profile.preferences.preferred_countries =
          Array.isArray(prefs) ? prefs : [prefs];
      } catch (e) {}

      const canonicalUni = createCanonicalUniversity(university);

      const evaluation = evaluateUniversity(canonicalProfile, canonicalUni);

      // Map 0-10 scale to Percentage
      let score = Math.round((evaluation.score / 10) * 100);
      if (score > 100) score = 100;

      result = {
        score: score,
        match_category: evaluation.match_category,
        acceptance_chance: evaluation.acceptance_chance,
        why_it_fits: evaluation.why_it_fits,
      };
    }

    return NextResponse.json({
      ...university,
      matchData: result,
    });
  } catch (error) {
    console.error("University Detail API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
