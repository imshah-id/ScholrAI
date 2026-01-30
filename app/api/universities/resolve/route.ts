import { NextResponse } from "next/server";
import { findOrCreateUniversity } from "@/lib/university-service";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name)
      return NextResponse.json({ error: "Name required" }, { status: 400 });

    const uni = await findOrCreateUniversity(name);
    if (!uni)
      return NextResponse.json(
        { error: "Could not resolve university" },
        { status: 404 },
      );

    return NextResponse.json(uni);
  } catch (error) {
    console.error("Resolve Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
