import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Maximum file size: 4MB (adjust if needed, Vercel/Servers have limits)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};

export async function GET() {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const docs = await prisma.document.findMany({
      where: { userId: session.userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        size: true,
        category: true,
        mimeType: true,
      }, // Exclude data to save bandwidth
    });

    // Format date
    const formatted = docs.map((d) => ({
      ...d,
      date: new Date(d.createdAt).toLocaleDateString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, data, size, mimeType } = await req.json();

    if (!name || !data) {
      return NextResponse.json({ error: "Missing file data" }, { status: 400 });
    }

    // Limit check (simple count)
    const count = await prisma.document.count({
      where: { userId: session.userId },
    });
    if (count >= 5) {
      return NextResponse.json(
        { error: "Limit reached (5 files max)." },
        { status: 403 },
      );
    }

    const doc = await prisma.document.create({
      data: {
        userId: session.userId,
        name,
        data, // Storing base64
        size,
        mimeType,
        category: "General",
      },
    });

    return NextResponse.json({
      id: doc.id,
      name: doc.name,
      date: new Date(doc.createdAt).toLocaleDateString(),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();

    await prisma.document.delete({
      where: { id: id, userId: session.userId }, // Ensure ownership
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
