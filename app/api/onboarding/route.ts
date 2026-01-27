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
    const updatedProfile = await prisma.profile.update({
      where: { userId: session.userId },
      data: {
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
