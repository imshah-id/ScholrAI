import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Special endpoint for AI Actions to lock by name
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name } = await req.json();
    if (!name)
      return NextResponse.json({ error: "Name required" }, { status: 400 });

    // 1. Find University
    const university = await prisma.university.findFirst({
      where: {
        name: { contains: name, mode: "insensitive" },
      },
    });

    if (!university) {
      return NextResponse.json(
        { error: "University not found" },
        { status: 404 },
      );
    }

    // 2. Upsert Shortlist (Add if not exists)
    // We first check if it exists to get ID
    let shortlistItem = await prisma.shortlist.findUnique({
      where: {
        userId_universityId: {
          userId: session.userId,
          universityId: university.id,
        },
      },
    });

    if (!shortlistItem) {
      shortlistItem = await prisma.shortlist.create({
        data: {
          userId: session.userId,
          universityId: university.id,
        },
      });
    }

    // 3. Lock It
    if (!shortlistItem.isLocked) {
      await prisma.shortlist.update({
        where: { id: shortlistItem.id },
        data: { isLocked: true },
      });

      // 4. Trigger Tasks (Copy logic from main route or rely on shared util)
      // For speed, I'll duplicate the task generation logic simply here or we assume the main route handles it.
      // The main route logic was inside PATCH. I should probably refactor, but for now I'll copy the task generation.
      const updated = await prisma.shortlist.findUnique({
        where: { id: shortlistItem.id },
        include: { university: true }, // reload with uni
      });

      // Generate Tasks
      const formatDate = (daysFromNow: number) => {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      };

      const COMPREHENSIVE_TASKS = [
        {
          title: `Write Statement of Purpose for ${university.name}`,
          type: "Essay",
          status: "pending",
          dueDate: formatDate(14),
        },
        {
          title: "Prepare 2-3 Letters of Recommendation",
          type: "Documents",
          status: "pending",
          dueDate: formatDate(21),
        },
        {
          title: "Request Official Transcripts",
          type: "Documents",
          status: "pending",
          dueDate: formatDate(7),
        },
        {
          title: "Upload English Test Scores (IELTS/TOEFL)",
          type: "Documents",
          status: "pending",
          dueDate: formatDate(14),
        },
        {
          title: `Complete ${university.name} Application Form`,
          type: "Admin",
          status: "pending",
          dueDate: formatDate(28),
        },
      ];

      // Check if tasks exist
      const count = await prisma.guidanceTask.count({
        where: { shortlistId: shortlistItem.id },
      });

      if (count === 0) {
        await prisma.guidanceTask.createMany({
          data: COMPREHENSIVE_TASKS.map((task) => ({
            shortlistId: shortlistItem!.id,
            ...task,
          })),
        });
      }

      // Update Profile Stage
      await prisma.profile.update({
        where: { userId: session.userId },
        data: { currentStage: "GUIDANCE" },
      });

      return NextResponse.json({ success: true, university: university.name });
    }

    return NextResponse.json({
      success: true,
      university: university.name,
      message: "Already locked",
    });
  } catch (error) {
    console.error("Lock by name error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
