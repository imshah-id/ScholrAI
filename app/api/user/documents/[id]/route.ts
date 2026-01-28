import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const docId = id;

    // Verify ownership
    const doc = await prisma.document.findUnique({
      where: { id: docId },
    });

    if (!doc)
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    if (doc.userId !== session.userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.document.delete({
      where: { id: docId },
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
