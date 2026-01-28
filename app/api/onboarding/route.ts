import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      targetDegree,
      targetIntake,
      gpa,
      gpaScale,
      englishTest,
      testScore,
      budget,
      preferredCountries,
    } = body;

    // Update Profile
    // Update or Create Profile
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: session.userId },
      update: {
        targetDegree,
        targetIntake,
        gpa,
        gpaScale: gpaScale || "4.0",
        englishTest,
        testScore,
        budget,
        preferredCountries: JSON.stringify(preferredCountries),
        currentStage: "DISCOVERY",
      },
      create: {
        userId: session.userId,
        targetDegree,
        targetIntake,
        gpa,
        gpaScale: gpaScale || "4.0",
        englishTest,
        testScore,
        budget,
        preferredCountries: JSON.stringify(preferredCountries),
        currentStage: "DISCOVERY",
        readinessScore: 30,
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
