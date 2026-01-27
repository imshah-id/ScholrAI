import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { fullName, email, password } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: hashedPassword,
        profile: {
          create: {
            targetDegree: "Masters", // Defaults (will be updated in Onboarding)
            targetIntake: "Fall 2026",
            gpa: "",
            budget: "",
            preferredCountries: "", // Empty JSON string or null
            currentStage: "PROFILE",
          },
        },
      },
    });

    // Auto-login
    await setSession(user.id, user.email);

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
