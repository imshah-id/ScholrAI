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

    const { universityId, name, universityData } = await req.json();

    let finalUniversityId = universityId;

    // Handle External University Creation (JIT)
    if (universityData && !name) {
      // Check if university exists by name
      const existingUni = await prisma.university.findUnique({
        where: { name: universityData.name },
      });

      if (existingUni) {
        finalUniversityId = existingUni.id;
      } else {
        // Create new external university
        console.log("Creating new external university:", universityData.name);
        try {
          const newUni = await prisma.university.create({
            data: {
              // If ID is provided (hipo_...), use it, otherwise let Prisma generate
              id: universityId?.startsWith("hipo_") ? universityId : undefined,
              name: universityData.name,
              country: universityData.country || "Unknown",
              location: universityData.country || "Unknown", // Fallback for location
              rank: 9999, // Placeholder
              fees: "TBD",
              acceptanceRate: "TBD",
              tags: JSON.stringify(["External", "Hipo"]),
            },
          });
          finalUniversityId = newUni.id;
        } catch (createError) {
          console.error("Failed to create external university", createError);
          // Race condition fallback: check if it was created just now
          const retryUni = await prisma.university.findUnique({
            where: { name: universityData.name },
          });
          if (retryUni) {
            finalUniversityId = retryUni.id;
          } else {
            return NextResponse.json(
              { error: "Failed to create university record" },
              { status: 500 },
            );
          }
        }
      }
    }

    // If name provided instead of ID (from AI Counsellor legacy flow), look it up
    if (!universityId && name && !universityData) {
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

        // AI GENERATED ROADMAP
        try {
          console.log("Generating AI Roadmap for", university.name);
          const { GoogleGenerativeAI } = require("@google/generative-ai");
          const genAI = new GoogleGenerativeAI(
            process.env.GEMINI_API_KEY || "",
          );
          const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-lite-preview-02-05", // Fast model
            generationConfig: { responseMimeType: "application/json" },
          });

          const prompt = `
                Create a specific, step-by-step application checklist for an international student applying to ${university.name}.
                Structure the response as a JSON array of objects with fields:
                - title: Actionable task name (e.g. "Draft Statement of Purpose", "Submit CSS Profile").
                - type: One of "Essay", "Documents", "Admin", "Test".
                - daysDue: Integer number of days from now the deadline should be roughly (e.g. 7 for 1 week, 60 for 2 months). Order them chronologically.
                Limit to 8-10 high-impact tasks.
            `;

          const result = await model.generateContent(prompt);
          const tasks = JSON.parse(result.response.text());

          if (Array.isArray(tasks) && tasks.length > 0) {
            await prisma.guidanceTask.createMany({
              data: tasks.map((task: any) => ({
                shortlistId: updated.id,
                title: task.title,
                type: task.type || "Admin",
                status: "pending",
                dueDate: formatDate(task.daysDue || 30),
              })),
            });
          } else {
            throw new Error("Invalid AI response");
          }
        } catch (aiError) {
          console.error(
            "AI Roadmap Generation Failed, using fallback:",
            aiError,
          );
          // Fallback to static list
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
            {
              title: "Prepare Financial Documents",
              type: "Documents",
              status: "pending",
              dueDate: formatDate(21),
            },
            {
              title: "Update Resume/CV",
              type: "Documents",
              status: "pending",
              dueDate: formatDate(7),
            },
          ];
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
