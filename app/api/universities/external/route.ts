import { NextRequest, NextResponse } from "next/server";
import {
  searchHipoUniversities,
  normalizeHipoUniversity,
} from "@/lib/external/hipo";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get("name");

  if (!name || name.length < 3) {
    return NextResponse.json([]);
  }

  try {
    const hipoResults = await searchHipoUniversities(name);
    // Normalize and limit to top 10 to avoid overwhelming the client
    const normalized = hipoResults.slice(0, 10).map(normalizeHipoUniversity);

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("External search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch external data" },
      { status: 500 },
    );
  }
}
