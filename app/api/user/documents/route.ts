import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "image/jpeg",
  "image/png",
];

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const docs = await prisma.document.findMany({
      where: { userId: session.userId },
      select: {
        id: true,
        name: true,
        category: true,
        size: true,
        mimeType: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(docs);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;

    if (!file)
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    if (!category)
      return NextResponse.json(
        { error: "No category provided" },
        { status: 400 },
      );

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 4MB allowed." },
        { status: 400 },
      );
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, DOCX, JPG, PNG allowed." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");

    const doc = await prisma.document.create({
      data: {
        userId: session.userId,
        name: file.name,
        category,
        size: file.size,
        mimeType: file.type,
        data: base64Data,
      },
      select: {
        id: true,
        name: true,
        category: true,
        size: true,
        createdAt: true,
      },
    });

    return NextResponse.json(doc);
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
