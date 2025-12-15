
import prisma from "@/lib/prisma";

async function main() {
  const count = await prisma.access_card_upgrade_cost.count();
  console.log(`access_card_upgrade_cost count: ${count}`);
  if (count > 0) {
      const items = await prisma.access_card_upgrade_cost.findMany();
      console.log(JSON.stringify(items, null, 2));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
