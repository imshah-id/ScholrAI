import { NextResponse } from "next/server";
import { prisma as cachedPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

// Workaround for dev server cache issues with Prisma models
const prisma = (cachedPrisma as any).chatSession
  ? cachedPrisma
  : new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    console.log("FETCH_SESSION_SINGLE: Starting...");
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    console.log("FETCH_SESSION_SINGLE: ID:", id);

    // @ts-ignore
    const chatSession = await prisma.chatSession.findUnique({
      where: {
        id: id,
        userId: session.userId,
      },
    });

    if (!chatSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...chatSession,
      messages: JSON.parse(chatSession.messages),
    });
  } catch (error) {
    console.error("Fetch session error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title, messages } = await req.json();

    const updatedSession = await prisma.chatSession.update({
      where: {
        id: id,
        userId: session.userId,
      },
      data: {
        title: title !== undefined ? title : undefined,
        messages: messages !== undefined ? JSON.stringify(messages) : undefined,
      },
    });

    return NextResponse.json({
      ...updatedSession,
      messages: JSON.parse(updatedSession.messages),
    });
  } catch (error) {
    console.error("Update session error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
