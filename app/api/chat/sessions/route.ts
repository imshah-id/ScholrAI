import { NextResponse } from "next/server";
import { prisma as cachedPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

// Workaround for dev server cache issues with Prisma models
const prisma = (cachedPrisma as any).chatSession
  ? cachedPrisma
  : new PrismaClient();

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore
    const chatSessions = await prisma.chatSession.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(chatSessions);
  } catch (error) {
    console.error("Fetch sessions error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { title, messages } = body;

    // @ts-ignore - Prisma might have type issues temporarily
    if (!prisma.chatSession) {
      console.error("CRITICAL: prisma.chatSession is UNDEFINED on the server!");
      throw new Error("ChatSession model not found in Prisma Client");
    }

    const chatSession = await prisma.chatSession.create({
      data: {
        userId: session.userId,
        title: title || "New Chat",
        messages: JSON.stringify(messages || []),
      },
    });

    return NextResponse.json(chatSession);
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, deleteAll } = await req.json();

    if (deleteAll) {
      await prisma.chatSession.deleteMany({
        where: {
          userId: session.userId,
        },
      });
    } else if (sessionId) {
      await prisma.chatSession.delete({
        where: {
          id: sessionId,
          userId: session.userId,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete session error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
