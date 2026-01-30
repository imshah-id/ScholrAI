import { prisma } from "@/lib/prisma";

const HIPO_API_URL = "http://universities.hipolabs.com/search";

export async function findOrCreateUniversity(name: string) {
  // 1. Try Local DB first (Exact Match)
  const local = await prisma.university.findUnique({
    where: { name: name },
  });
  if (local) return local;

  // 1.b Try Fuzzy/Contains match in Local DB
  const fuzzyLocal = await prisma.university.findFirst({
    where: {
      name: { contains: name, mode: "insensitive" },
    },
  });
  if (fuzzyLocal) return fuzzyLocal;

  // 2. Fallback to Hipo Labs API
  try {
    const res = await fetch(`${HIPO_API_URL}?name=${encodeURIComponent(name)}`);
    const data = await res.json();

    if (!data || data.length === 0) return null;

    // Take the best match (first one usually, or prefer specific countries if needed)
    // Hipo returns many duplicates, so we pick the first one matching the name closest
    const match = data[0]; // Simplest strategy for hackathon

    // Check if THIS specific name exists (to avoid unique constraint race conditions)
    const existing = await prisma.university.findUnique({
      where: { name: match.name },
    });
    if (existing) return existing;

    // 3. Create Skeleton Record
    // We lack fees/rank data, so we set defaults or "Unknown"
    const newUni = await prisma.university.create({
      data: {
        name: match.name,
        country: match.country || "Unknown",
        location: match.country || "Unknown Location", // Hipo lacks city often
        rank: 999, // "Unranked" / External
        fees: "$0", // Pending
        acceptanceRate: "Unknown",
        tags: JSON.stringify(["External", "Data Pending"]),
      },
    });

    return newUni;
  } catch (error) {
    console.error("University Service Error:", error);
    return null;
  }
}

export async function addToShortlist(userId: string, universityName: string) {
  const uni = await findOrCreateUniversity(universityName);
  if (!uni) throw new Error(`Could not find university: ${universityName}`);

  // Check if exists
  const existing = await prisma.shortlist.findUnique({
    where: {
      userId_universityId: {
        userId,
        universityId: uni.id,
      },
    },
  });

  if (existing) return { status: "already_exists", university: uni };

  const item = await prisma.shortlist.create({
    data: {
      userId,
      universityId: uni.id,
    },
  });
  return { status: "success", university: uni };
}
