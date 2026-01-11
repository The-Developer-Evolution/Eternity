
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Price Periods...");

  const rawItems = await prisma.rawItem.findMany();
  const craftItems = await prisma.craftItem.findMany();

  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  console.log(`Found ${rawItems.length} RawItems and ${craftItems.length} CraftItems.`);

  // Seed RawPeriods
  console.log("Seeding RawPeriods...");
  for (const rawItem of rawItems) {
    for (const period of periods) {
      // Check if exists to avoid duplicates if run multiple times
      const exists = await prisma.rawPeriod.findFirst({
        where: {
          rawId: rawItem.id,
          periode: period
        }
      });

      if (!exists) {
        await prisma.rawPeriod.create({
          data: {
            rawId: rawItem.id,
            periode: period,
            price: BigInt(3000)
          }
        });
      }
    }
  }

  // Seed CraftPeriods
  console.log("Seeding CraftPeriods...");
  for (const craftItem of craftItems) {
    for (const period of periods) {
       const exists = await prisma.craftPeriod.findFirst({
        where: {
          craftId: craftItem.id,
          periode: period
        }
      });

      if (!exists) {
        await prisma.craftPeriod.create({
          data: {
            craftId: craftItem.id,
            periode: period,
            price: BigInt(3000)
          }
        });
      }
    }
  }

  console.log("✅ Seeding Price Periods Completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
