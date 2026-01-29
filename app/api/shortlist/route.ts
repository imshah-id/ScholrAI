import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    console.log("GET /api/shortlist called");
    const session = await getSession();
    if (!session) {
      console.log("GET /api/shortlist: No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("GET /api/shortlist: Session found for user", session.userId);

    const shortlist = await prisma.shortlist.findMany({
      where: { userId: session.userId },
      include: { university: true },
    });

    return NextResponse.json(shortlist);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching shortlist" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { universityId, name } = await req.json();

    let finalUniversityId = universityId;

    // If name provided instead of ID (from AI Counsellor), look it up
    if (!universityId && name) {
      const university = await prisma.university.findFirst({
        where: {
          name: {
            contains: name,
            mode: "insensitive",
          },
        },
      });

      if (!university) {
        return NextResponse.json(
          { error: "University not found" },
          { status: 404 },
        );
      }

      finalUniversityId = university.id;
    }

    if (!finalUniversityId) {
      return NextResponse.json(
        { error: "University ID or name required" },
        { status: 400 },
      );
    }

    const existing = await prisma.shortlist.findUnique({
      where: {
        userId_universityId: {
          userId: session.userId,
          universityId: finalUniversityId,
        },
      },
    });

    if (existing) {
      console.log("Shortlist item already exists:", existing.id);
      return NextResponse.json(existing);
    }

    const shortlistItem = await prisma.shortlist.create({
      data: {
        userId: session.userId,
        universityId: finalUniversityId,
      },
      include: { university: true },
    });
    console.log("Created shortlist item:", shortlistItem.id);

    // Update user stage to Shortlist if they make their first shortlist
    const count = await prisma.shortlist.count({
      where: { userId: session.userId },
    });
    if (count === 1) {
      await prisma.profile
        .update({
          where: { userId: session.userId },
          data: { currentStage: "SHORTLIST" },
        })
        .catch((e) => console.error("Failed to update profile stage", e));
    }

    return NextResponse.json(shortlistItem);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error creating shortlist item" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { universityId, isLocked } = await req.json();

    const updated = await prisma.shortlist.update({
      where: {
        userId_universityId: {
          userId: session.userId,
          universityId: universityId,
        },
      },
      data: { isLocked },
    });

    // If locking, generate comprehensive guidance tasks for this university
    if (isLocked) {
      // Get university details for customized tasks
      const university = await prisma.university.findUnique({
        where: { id: universityId },
      });

      // Check if tasks exist
      const count = await prisma.guidanceTask.count({
        where: { shortlistId: updated.id },
      });

      if (count === 0 && university) {
        // Helper to formatting date
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
            dueDate: formatDate(14), // 2 weeks
          },
          {
            title: "Prepare 2-3 Letters of Recommendation",
            type: "Documents",
            status: "pending",
            dueDate: formatDate(21), // 3 weeks
          },
          {
            title: "Request Official Transcripts",
            type: "Documents",
            status: "pending",
            dueDate: formatDate(7), // 1 week
          },
          {
            title: "Upload English Test Scores (IELTS/TOEFL)",
            type: "Documents",
            status: "pending",
            dueDate: formatDate(14), // 2 weeks
          },
          {
            title: `Complete ${university.name} Application Form`,
            type: "Admin",
            status: "pending",
            dueDate: formatDate(28), // 4 weeks
          },
          {
            title: "Prepare Financial Documents & Bank Statements",
            type: "Documents",
            status: "pending",
            dueDate: formatDate(21), // 3 weeks
          },
          {
            title: "Update Resume/CV",
            type: "Documents",
            status: "pending",
            dueDate: formatDate(7), // 1 week
          },
        ];

        if (COMPREHENSIVE_TASKS.length > 0) {
          await prisma.guidanceTask.createMany({
            data: COMPREHENSIVE_TASKS.map((task) => ({
              shortlistId: updated.id,
              ...task,
            })),
          });
        }
      }

      // Update profile stage to Guidance
      await prisma.profile
        .update({
          where: { userId: session.userId },
          data: { currentStage: "GUIDANCE" },
        })
        .catch(() => {});
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating shortlist", error);
    return NextResponse.json(
      { error: "Error updating shortlist" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { universityId } = await req.json();

    await prisma.shortlist.deleteMany({
      where: {
        userId: session.userId,
        universityId: universityId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting shortlist item" },
      { status: 500 },
    );
  }
}
