import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SEED_UNIVERSITIES = [
  {
    name: "Stanford University",
    location: "USA, California",
    country: "USA",
    rank: 2,
    fees: "$60k",
    acceptanceRate: "4%",
    tags: JSON.stringify(["Top Tier", "Research", "Entrepreneurship"]),
  },
  {
    name: "Technical University of Munich",
    location: "Germany, Munich",
    country: "Germany",
    rank: 28,
    fees: "€0",
    acceptanceRate: "8%",
    tags: JSON.stringify(["Engineering", "Public", "No Tuition"]),
  },
  {
    name: "University of Toronto",
    location: "Canada, Toronto",
    country: "Canada",
    rank: 21,
    fees: "$45k",
    acceptanceRate: "43%",
    tags: JSON.stringify(["Research", "Public", "Large Cohort"]),
  },
  {
    name: "University of Melbourne",
    location: "Australia, Melbourne",
    country: "Australia",
    rank: 33,
    fees: "$32k",
    acceptanceRate: "70%",
    tags: JSON.stringify(["Research", "Global City"]),
  },
  {
    name: "ETH Zurich",
    location: "Switzerland, Zurich",
    country: "Switzerland",
    rank: 9,
    fees: "€1.5k",
    acceptanceRate: "27%",
    tags: JSON.stringify(["Technology", "Low Tuition", "Prestigious"]),
  },
  {
    name: "National University of Singapore",
    location: "Singapore",
    country: "Singapore",
    rank: 11,
    fees: "$28k",
    acceptanceRate: "15%",
    tags: JSON.stringify(["Asia Top", "Research"]),
  },
  {
    name: "University of Oxford",
    location: "UK, Oxford",
    country: "UK",
    rank: 1,
    fees: "£30k",
    acceptanceRate: "17%",
    tags: JSON.stringify(["Historic", "Collegiate", "Elite"]),
  },
  {
    name: "Harvard University",
    location: "USA, Cambridge",
    country: "USA",
    rank: 4,
    fees: "$58k",
    acceptanceRate: "3%",
    tags: JSON.stringify(["Ivy League", "Elite"]),
  },
  {
    name: "MIT",
    location: "USA, Cambridge",
    country: "USA",
    rank: 1,
    fees: "$60k",
    acceptanceRate: "4%",
    tags: JSON.stringify(["Tech", "Innovation"]),
  },
  {
    name: "University of Cambridge",
    location: "UK, Cambridge",
    country: "UK",
    rank: 5,
    fees: "£32k",
    acceptanceRate: "21%",
    tags: JSON.stringify(["Historic", "Research"]),
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    // Check count
    const count = await prisma.university.count();

    // Seed if empty
    if (count === 0) {
      console.log("Seeding universities...");
      for (const uni of SEED_UNIVERSITIES) {
        await prisma.university.create({ data: uni });
      }
    }

    // Fetch filtered
    const universities = await prisma.university.findMany({
      where: {
        OR: [
          { name: { contains: query } }, // Case insensitive usually depends on DB collation, sqlite is mixed
          { location: { contains: query } },
          { country: { contains: query } },
        ],
      },
      take: 50,
    });

    return NextResponse.json(universities);
  } catch (error) {
    console.error("Universities API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
