
import "dotenv/config";
import prisma from "@/lib/prisma";

async function main() {
  console.log("Seeding access_card_upgrade_cost...");
  
  // Check if exists first to avoid duplicates if re-run without clearing
  const count = await prisma.access_card_upgrade_cost.count();
  if (count > 0) {
      console.log("Table already has data, skipping or purging...");
      // Optional: await prisma.access_card_upgrade_cost.deleteMany({});
  }

  // Example data based on reasonable game progression or user request context if available.
  // Since I don't have the specific requirement for VALUES, I will create placeholders.
  // User can adjust values later.
  // ID is autoincrement, so we just provide costs.
  // BUT the Relation logic relies on IDs. 
  // schema: id Int @id @default(autoincrement())
  
  // We need to reset sequence if we want to be sure about IDs matching `level_upgrade_cost_id`=1, 2, ...
  // For PostgreSQL: ALTER SEQUENCE header_id_seq RESTART WITH 1;
  
  // Let's assume we just add data.
  
  const costs = [
      // Level 1 -> 2 (Cost ID 1)
      { eonix_cost: 100, big_item_amount_required: 0, small_item_amount_required: 0 },
      // Level 2 -> 3 (Cost ID 2)
      { eonix_cost: 200, big_item_amount_required: 0, small_item_amount_required: 0 },
      // Level 3 -> 4 (Cost ID 3)
      { eonix_cost: 500, big_item_amount_required: 1, small_item_amount_required: 5 },
      // ... add more as needed
  ];

  for (const cost of costs) {
      await prisma.access_card_upgrade_cost.create({
          data: cost
      });
  }
  
  console.log(`Seeded ${costs.length} costs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
