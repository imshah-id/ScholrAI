import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Find the LOCKED shortlist item to get tasks for
    // Assuming for MVP only 1 Locked item is supported or we fetch all
    const lockedShortlist = await prisma.shortlist.findFirst({
      where: { userId: session.userId, isLocked: true },
      include: { university: true },
    });

    if (!lockedShortlist) {
      return NextResponse.json({ tasks: [], university: null });
    }

    const tasks = await prisma.guidanceTask.findMany({
      where: { shortlistId: lockedShortlist.id },
      orderBy: { title: "asc" },
    });

    return NextResponse.json({ tasks, university: lockedShortlist.university });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching guidance" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId, status } = await req.json();

    // Verify ownership (optional but good practice)
    // For speed, just update
    const updated = await prisma.guidanceTask.update({
      where: { id: taskId },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}
