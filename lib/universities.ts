import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  createCanonicalProfile,
  createCanonicalUniversity,
  evaluateUniversity,
} from "@/lib/matching-engine";

export async function getUniversities(page: number = 1, limit: number = 50) {
  try {
    const session = await getSession();
    let userProfile: any = null;

    if (session) {
      userProfile = await prisma.profile.findUnique({
        where: { userId: session.userId },
      });
    }

    // Fetch candidate universities (top ranked via offset)
    const universities = await prisma.university.findMany({
      orderBy: {
        rank: "asc",
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    // Score and Sort
    const scoredUniversities = universities.map((uni: any) => {
      let score = 0;
      let reasons: string[] = [];
      let matchCategory = "TARGET";
      let matchChance = "Medium";

      if (userProfile && session) {
        // Convert User & Uni to Canonical Format
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

        const canonicalUni = createCanonicalUniversity(uni);

        // Run Evaluation
        try {
          const result = evaluateUniversity(canonicalProfile, canonicalUni);
          score = Math.round((result.score / 12) * 100);
          if (score > 100) score = 100;

          matchCategory = result.match_category;
          matchChance = result.acceptance_chance;
          reasons = result.why_it_fits;
        } catch (err) {
          console.error("Scoring error", err);
          score = 50;
        }
      } else {
        score = 70; // Default for guests
      }

      return {
        ...uni,
        fees: uni.fees ? uni.fees.toString() : null,
        matchScore: score,
        matchCategory,
        matchChance,
        reasons,
        tags: uni.tags || "[]",
      };
    });

    // Sort by Match Score descending (Client-side sort of this chunk)
    // Note: True global sort by match score is hard without computing all scores.
    // For now, we fetch by Rank (proxy for quality) and sort the chunk by Match Score.
    // Ideally we would compute match scores for ALL unis in a background job and store in DB.
    scoredUniversities.sort((a, b) => b.matchScore - a.matchScore);

    return scoredUniversities;
  } catch (error) {
    console.error("Failed to fetch universities:", error);
    return [];
  }
}
