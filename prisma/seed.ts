import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Don't delete - use conditional create to avoid foreign key issues

  const universities = [
    // USA - Top Tier
    {
      name: "Massachusetts Institute of Technology",
      location: "Cambridge, MA",
      country: "USA",
      rank: 1,
      fees: "$55,000 - $75,000",
      acceptanceRate: "4%",
      tags: JSON.stringify([
        "STEM",
        "Research",
        "Engineering",
        "Computer Science",
      ]),
    },
    {
      name: "Stanford University",
      location: "Stanford, CA",
      country: "USA",
      rank: 3,
      fees: "$56,000 - $78,000",
      acceptanceRate: "4%",
      tags: JSON.stringify(["STEM", "Business", "Research", "Innovation"]),
    },
    {
      name: "Harvard University",
      location: "Cambridge, MA",
      country: "USA",
      rank: 4,
      fees: "$54,000 - $76,000",
      acceptanceRate: "3%",
      tags: JSON.stringify(["Liberal Arts", "Business", "Research", "Law"]),
    },
    {
      name: "California Institute of Technology",
      location: "Pasadena, CA",
      country: "USA",
      rank: 6,
      fees: "$58,000 - $80,000",
      acceptanceRate: "3%",
      tags: JSON.stringify(["STEM", "Research", "Engineering", "Physics"]),
    },
    {
      name: "University of California, Berkeley",
      location: "Berkeley, CA",
      country: "USA",
      rank: 10,
      fees: "$45,000 - $65,000",
      acceptanceRate: "15%",
      tags: JSON.stringify(["STEM", "Public", "Research", "Liberal Arts"]),
    },
    {
      name: "Carnegie Mellon University",
      location: "Pittsburgh, PA",
      country: "USA",
      rank: 28,
      fees: "$52,000 - $72,000",
      acceptanceRate: "13%",
      tags: JSON.stringify(["STEM", "Computer Science", "Engineering", "Arts"]),
    },
    {
      name: "University of Michigan",
      location: "Ann Arbor, MI",
      country: "USA",
      rank: 33,
      fees: "$52,000 - $70,000",
      acceptanceRate: "20%",
      tags: JSON.stringify(["STEM", "Business", "Public", "Research"]),
    },
    {
      name: "Northwestern University",
      location: "Evanston, IL",
      country: "USA",
      rank: 35,
      fees: "$56,000 - $74,000",
      acceptanceRate: "7%",
      tags: JSON.stringify([
        "Business",
        "Journalism",
        "Research",
        "Liberal Arts",
      ]),
    },
    {
      name: "New York University",
      location: "New York, NY",
      country: "USA",
      rank: 38,
      fees: "$54,000 - $72,000",
      acceptanceRate: "13%",
      tags: JSON.stringify(["Business", "Arts", "Liberal Arts", "Film"]),
    },
    {
      name: "Boston University",
      location: "Boston, MA",
      country: "USA",
      rank: 70,
      fees: "$48,000 - $66,000",
      acceptanceRate: "18%",
      tags: JSON.stringify(["STEM", "Business", "Liberal Arts", "Medicine"]),
    },

    // UK - Top Tier
    {
      name: "University of Oxford",
      location: "Oxford",
      country: "UK",
      rank: 2,
      fees: "$35,000 - $50,000",
      acceptanceRate: "15%",
      tags: JSON.stringify(["Research", "Liberal Arts", "Law", "Medicine"]),
    },
    {
      name: "University of Cambridge",
      location: "Cambridge",
      country: "UK",
      rank: 5,
      fees: "$35,000 - $50,000",
      acceptanceRate: "18%",
      tags: JSON.stringify(["STEM", "Research", "Liberal Arts", "Engineering"]),
    },
    {
      name: "Imperial College London",
      location: "London",
      country: "UK",
      rank: 7,
      fees: "$38,000 - $52,000",
      acceptanceRate: "11%",
      tags: JSON.stringify(["STEM", "Engineering", "Medicine", "Research"]),
    },
    {
      name: "University College London",
      location: "London",
      country: "UK",
      rank: 9,
      fees: "$32,000 - $48,000",
      acceptanceRate: "10%",
      tags: JSON.stringify([
        "STEM",
        "Liberal Arts",
        "Research",
        "Architecture",
      ]),
    },
    {
      name: "King's College London",
      location: "London",
      country: "UK",
      rank: 40,
      fees: "$30,000 - $45,000",
      acceptanceRate: "12%",
      tags: JSON.stringify(["Liberal Arts", "Law", "Medicine", "Research"]),
    },
    {
      name: "University of Edinburgh",
      location: "Edinburgh",
      country: "UK",
      rank: 22,
      fees: "$28,000 - $42,000",
      acceptanceRate: "10%",
      tags: JSON.stringify(["STEM", "Liberal Arts", "Research", "Medicine"]),
    },
    {
      name: "University of Manchester",
      location: "Manchester",
      country: "UK",
      rank: 27,
      fees: "$28,000 - $40,000",
      acceptanceRate: "17%",
      tags: JSON.stringify(["STEM", "Business", "Research", "Engineering"]),
    },
    {
      name: "London School of Economics",
      location: "London",
      country: "UK",
      rank: 45,
      fees: "$32,000 - $46,000",
      acceptanceRate: "9%",
      tags: JSON.stringify(["Business", "Economics", "Social Sciences", "Law"]),
    },

    // Canada
    {
      name: "University of Toronto",
      location: "Toronto, ON",
      country: "Canada",
      rank: 21,
      fees: "$25,000 - $40,000",
      acceptanceRate: "43%",
      tags: JSON.stringify(["STEM", "Research", "Liberal Arts", "Medicine"]),
    },
    {
      name: "University of British Columbia",
      location: "Vancouver, BC",
      country: "Canada",
      rank: 34,
      fees: "$24,000 - $38,000",
      acceptanceRate: "52%",
      tags: JSON.stringify(["STEM", "Research", "Liberal Arts", "Business"]),
    },
    {
      name: "McGill University",
      location: "Montreal, QC",
      country: "Canada",
      rank: 31,
      fees: "$20,000 - $35,000",
      acceptanceRate: "46%",
      tags: JSON.stringify(["Research", "Liberal Arts", "Medicine", "STEM"]),
    },
    {
      name: "University of Waterloo",
      location: "Waterloo, ON",
      country: "Canada",
      rank: 112,
      fees: "$28,000 - $42,000",
      acceptanceRate: "53%",
      tags: JSON.stringify([
        "STEM",
        "Engineering",
        "Computer Science",
        "Co-op",
      ]),
    },
    {
      name: "University of Alberta",
      location: "Edmonton, AB",
      country: "Canada",
      rank: 110,
      fees: "$22,000 - $36,000",
      acceptanceRate: "58%",
      tags: JSON.stringify(["STEM", "Research", "Engineering", "Affordable"]),
    },

    // Australia
    {
      name: "Australian National University",
      location: "Canberra",
      country: "Australia",
      rank: 30,
      fees: "$32,000 - $48,000",
      acceptanceRate: "35%",
      tags: JSON.stringify([
        "Research",
        "STEM",
        "Liberal Arts",
        "Public Policy",
      ]),
    },
    {
      name: "University of Melbourne",
      location: "Melbourne",
      country: "Australia",
      rank: 14,
      fees: "$35,000 - $50,000",
      acceptanceRate: "70%",
      tags: JSON.stringify(["STEM", "Research", "Liberal Arts", "Business"]),
    },
    {
      name: "University of Sydney",
      location: "Sydney",
      country: "Australia",
      rank: 19,
      fees: "$34,000 - $48,000",
      acceptanceRate: "30%",
      tags: JSON.stringify(["STEM", "Liberal Arts", "Research", "Business"]),
    },
    {
      name: "University of Queensland",
      location: "Brisbane",
      country: "Australia",
      rank: 43,
      fees: "$30,000 - $44,000",
      acceptanceRate: "52%",
      tags: JSON.stringify(["STEM", "Research", "Medicine", "Environmental"]),
    },

    // Germany
    {
      name: "Technical University of Munich",
      location: "Munich",
      country: "Germany",
      rank: 49,
      fees: "$2,000 - $5,000",
      acceptanceRate: "8%",
      tags: JSON.stringify(["STEM", "Engineering", "Research", "Affordable"]),
    },
    {
      name: "Ludwig Maximilian University",
      location: "Munich",
      country: "Germany",
      rank: 59,
      fees: "$1,500 - $4,000",
      acceptanceRate: "12%",
      tags: JSON.stringify(["Research", "Liberal Arts", "STEM", "Affordable"]),
    },
    {
      name: "Heidelberg University",
      location: "Heidelberg",
      country: "Germany",
      rank: 64,
      fees: "$1,500 - $4,000",
      acceptanceRate: "15%",
      tags: JSON.stringify([
        "Research",
        "Medicine",
        "Liberal Arts",
        "Affordable",
      ]),
    },
  ];

  // Create universities if they don't exist
  let created = 0;
  for (const uni of universities) {
    const exists = await prisma.university.findFirst({
      where: { name: uni.name },
    });

    if (!exists) {
      await prisma.university.create({
        data: uni,
      });
      created++;
    }
  }

  const count = await prisma.university.count();
  console.log(
    `✅ Created ${created} new universities. Total: ${count} universities`,
  );
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
