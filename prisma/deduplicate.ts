import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Checking for duplicate universities...");

  // 1. Fetch all universities
  const universities = await prisma.university.findMany({
    include: {
      _count: {
        select: { shortlistedBy: true },
      },
    },
  });

  // 2. Group by Name
  const groups: Record<string, typeof universities> = {};

  for (const uni of universities) {
    // Normalize name to catch "Harvard" vs "Harvard "
    const name = uni.name.trim();
    if (!groups[name]) {
      groups[name] = [];
    }
    groups[name].push(uni);
  }

  // 3. Identify Duplicates
  let deletedCount = 0;

  for (const name in groups) {
    const list = groups[name];
    if (list.length > 1) {
      console.log(`Found ${list.length} records for "${name}"`);

      // Sort to keep the "best" one
      // Criteria: Most shortlists first, then oldest ID logic (if uuid, consistent)
      // Actually, let's keep the one that looks most "official" or just the first one if unsure.
      // Prioritize ones with shortlists to avoid breaking user data.

      list.sort((a, b) => b._count.shortlistedBy - a._count.shortlistedBy);

      const [keep, ...remove] = list;

      console.log(
        `✅ Keeping ID: ${keep.id} (Shortlists: ${keep._count.shortlistedBy})`,
      );

      for (const rm of remove) {
        console.log(
          `🗑️ Deleting ID: ${rm.id} (Shortlists: ${rm._count.shortlistedBy})`,
        );

        // Move shortlists to the 'keep' university if any exist (though we sorted by count)
        // If 'remove' has shortlists, we must migrate them to 'keep' to avoid data loss.
        if (rm._count.shortlistedBy > 0) {
          await prisma.shortlist
            .updateMany({
              where: { universityId: rm.id },
              data: { universityId: keep.id },
            })
            .catch((e) => {
              // Ignore unique constraint violations if user already shortlisted 'keep'
              console.log("Skipping shortlist migration due to conflict");
            });
        }

        // Now safe to delete
        await prisma.university.delete({
          where: { id: rm.id },
        });
        deletedCount++;
      }
    }
  }

  console.log(
    `🎉 Cleanup complete. Deleted ${deletedCount} duplicate universities.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
