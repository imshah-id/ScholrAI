import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate Profile Strength (sophisticated proportional scoring)
    let strength = 0;

    // 1. GPA Score (0-30 points based on performance)
    if (user.profile?.gpa && user.profile?.gpaScale) {
      const gpaValue = parseFloat(user.profile.gpa);
      const gpaScale = user.profile.gpaScale;

      if (!isNaN(gpaValue)) {
        let gpaScore = 0;
        if (gpaScale === "4.0") {
          gpaScore = (gpaValue / 4.0) * 30;
        } else if (gpaScale === "5.0") {
          gpaScore = (gpaValue / 5.0) * 30;
        } else if (gpaScale === "10.0") {
          gpaScore = (gpaValue / 10.0) * 30;
        } else if (gpaScale === "Percentage") {
          gpaScore = (gpaValue / 100) * 30;
        }
        strength += Math.min(30, gpaScore);
      }
    }

    // 2. Target degree and intake (20 points)
    if (user.profile?.targetDegree && user.profile?.targetIntake) {
      strength += 20;
    }

    // 3. English Test Score (0-25 points based on performance)
    if (
      user.profile?.englishTest &&
      user.profile?.englishTest !== "None" &&
      user.profile?.testScore
    ) {
      const testScore = parseFloat(user.profile.testScore);
      const testType = user.profile.englishTest;

      if (!isNaN(testScore)) {
        let testScorePoints = 0;

        if (testType === "IELTS") {
          testScorePoints = (testScore / 9.0) * 25;
        } else if (testType === "TOEFL") {
          testScorePoints = (testScore / 120) * 25;
        } else if (testType === "Duolingo") {
          testScorePoints = (testScore / 160) * 25;
        }

        strength += Math.min(25, testScorePoints);
      }
    }

    // 4. Budget defined (10 points)
    if (user.profile?.budget) strength += 10;

    // 5. Preferred countries selected (15 points)
    try {
      const countries = JSON.parse(user.profile?.preferredCountries || "[]");
      if (countries.length > 0) strength += 15;
    } catch (e) {
      // Invalid JSON, skip
    }

    strength = Math.round(strength);

    // Calculate Admission Chance
    let chance = 0;
    const gpaStr = user.profile?.gpa || "0";
    const gpaValue = parseFloat(gpaStr);
    const gpaScale = user.profile?.gpaScale || "4.0";

    if (gpaValue > 0) {
      let gpaPercentage = 0;

      if (gpaScale === "4.0") {
        gpaPercentage = (gpaValue / 4.0) * 100;
      } else if (gpaScale === "5.0") {
        gpaPercentage = (gpaValue / 5.0) * 100;
      } else if (gpaScale === "10.0") {
        gpaPercentage = (gpaValue / 10.0) * 100;
      } else if (gpaScale === "Percentage") {
        gpaPercentage = gpaValue;
      }

      chance = gpaPercentage * 0.6 + strength * 0.4;
    } else {
      chance = strength * 0.5;
    }

    if (chance > 95) chance = 95;
    if (chance < 35 && strength > 0) chance = 35;

    // Determine current stage dynamically
    // 1. Check for locked university -> GUIDANCE
    // 2. Check for any shortlist -> SHORTLIST
    // 3. Default -> DISCOVERY

    const shortlistItems = await prisma.shortlist.findMany({
      where: { userId },
      select: { isLocked: true },
    });

    const hasLocked = shortlistItems.some((item) => item.isLocked);

    // Default to the actual stored stage (Preserve PROFILE)
    let calculatedStage = user.profile?.currentStage || "DISCOVERY";

    if (hasLocked) {
      calculatedStage = "GUIDANCE";
    } else if (shortlistItems.length > 0) {
      calculatedStage = "SHORTLIST";
    } else {
      // If no items, fallback to DISCOVERY only if they were in SHORTLIST/GUIDANCE
      // Do NOT touch PROFILE stage (User hasn't finished onboarding)
      if (calculatedStage === "SHORTLIST" || calculatedStage === "GUIDANCE") {
        calculatedStage = "DISCOVERY";
      }
    }

    // Update DB if different (self-healing) - Fire and forget (don't await)
    if (user.profile && user.profile.currentStage !== calculatedStage) {
      prisma.profile
        .update({
          where: { userId },
          data: { currentStage: calculatedStage },
        })
        .catch((e) => console.error("Stage sync error", e));
    }

    return NextResponse.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
      ...user.profile,
      currentStage: calculatedStage, // Return computed stage
      profileStrength: strength,
      admissionChance: Math.round(chance),
      shortlistCount: shortlistItems.length,
      hasLockedUni: hasLocked,
    });
  } catch (error) {
    console.error("Fetch user error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
