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
      targetMajor,
      targetIntake,
      highestQualification,
      fieldOfStudy,
      citizenship,
      gpa,
      gpaScale,
      englishTest,
      testScore,
      budget,
      preferredCountries,
      isFinal, // New flag
    } = body;

    // Helper to filter undefined/null values for update to avoid overwriting with empty
    // actually, for onboarding, we generally want to overwrite if the user changed it.
    // But if we send partial data, we need to be careful.
    // For now, we assume the frontend sends the full state it has.
    // The critical part is currentStage.

    const stageUpdate = isFinal ? { currentStage: "DISCOVERY" } : {};

    // Update or Create Profile
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: session.userId },
      update: {
        targetDegree,
        targetMajor,
        targetIntake,
        highestQualification,
        fieldOfStudy,
        citizenship,
        gpa,
        gpaScale: gpaScale || "4.0",
        englishTest,
        testScore,
        budget,
        preferredCountries: preferredCountries
          ? JSON.stringify(preferredCountries)
          : undefined,
        ...stageUpdate,
      },
      create: {
        userId: session.userId,
        targetDegree: targetDegree || "",
        targetMajor: targetMajor || "",
        targetIntake: targetIntake || "",
        highestQualification: highestQualification || "",
        fieldOfStudy: fieldOfStudy || "",
        citizenship: citizenship || "",
        gpa: gpa || "",
        gpaScale: gpaScale || "4.0",
        englishTest: englishTest || "None",
        testScore: testScore || "",
        budget: budget || "",
        preferredCountries: preferredCountries
          ? JSON.stringify(preferredCountries)
          : "[]",
        currentStage: isFinal ? "DISCOVERY" : "PROFILE",
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
