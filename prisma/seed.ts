import { RawStockPeriod } from "@/generated/prisma/browser";
import { PrismaClient, Role } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });



type RecipePattern = {
  input: Record<string, number>; // e.g., { wood: 10 }
  output: string;                // e.g., "brownPaper"
};

// 2. Your Recipe Data
const RECIPES: RecipePattern[] = [
  { input: { wood: 10, water: 5 }, output: "brownPaper" },
  { input: { wood: 10, coal: 8 }, output: "pen" },
  { input: { wood: 10, metal: 5, glass: 2 }, output: "magnifyingGlass" },
  { input: { water: 7, coal: 4 }, output: "ink" },
  { input: { wood: 15, metal: 5 }, output: "dividers" },
];

const MAP_RECIPES = [
  { brownPaper: 2, pen: 1 },
  { magnifyingGlass: 1, ink: 3 },
  { magnifyingGlass: 1, ink: 1, dividers: 1 }
];

// 3. Helper Maps (Mapping your string keys to DB IDs)
const RAW_ID_MAP: Record<string, string> = {
  wood: "1",
  glass: "2",
  water: "3",
  coal: "4",
  metal: "5"
};

const CRAFT_ID_MAP: Record<string, string> = {
  brownPaper: "1",       // "brown paper"
  pen: "2",              // "pen"
  magnifyingGlass: "3",  // "magnifying glass"
  ink: "4",              // "ink"
  dividers: "5"          // "dividers"
};

const passwords = [
  "Alpha123!",
  "Bravo456@",
  "Charlie789#",
  "Delta321$",
  "Echo654%",
  "Foxtrot987^",
  "Golf246&",
  "Hotel135*",
  "India864(",
  "Juliet753)", //pitching
  "Kilo987!", // PITCHING GUARD
  "Lima246@",
  "Mike753#",
  "November468$",
  "Oscar159%",
];

async function main() {
  // =========================
  // Trading Master Data
  // =========================

  await prisma.periodeTrading.createMany({
    data: [
      { periode: 1, cost_map: 2000, price_map: 14700, duration: 30 },
      { periode: 2, cost_map: 2150, price_map: 12190, duration: 20 },
      { periode: 3, cost_map: 2300, price_map: 11550, duration: 20 },
      { periode: 4, cost_map: 2800, price_map: 10330, duration: 20 },
      { periode: 5, cost_map: 3300, price_map: 9335, duration: 20 },
      { periode: 6, cost_map: 3800, price_map: 8285, duration: 20 },
      { periode: 7, cost_map: 4000, price_map: 6450, duration: 20 },
      { periode: 8, cost_map: 4700, price_map: 5065, duration: 20 },
    ],
    skipDuplicates: true,
  });

  const masterTrading = await prisma.masterTrading.upsert({
    where: { id: "tradingMasterData@Eternity" },
    update: {},
    create: {
      id: "tradingMasterData@Eternity",
    },
  });

  
  // Seed RawItem
  await prisma.rawItem.createMany({
    data: [
      { id: "1", name: "wood" },
      { id: "2", name: "glass" },
      { id: "3", name: "water" },
      { id: "4", name: "coal" },
      { id: "5", name: "metal" }
    ],
    skipDuplicates: true,
  });

  await prisma.craftItem.createMany({
    data: [
      { id: "1", name: "brown paper" },
      { id: "2", name: "pen" },
      { id: "3", name: "magnifying glass" },
      { id: "4", name: "ink" },
      { id: "5", name: "dividers" }
    ],
    skipDuplicates: true,
  });


  // SEEDING MAP RECIPES
  console.log(`Seeding ${MAP_RECIPES.length} Map Recipes...`);
  for (const recipe of MAP_RECIPES) {
    // Convert the simple object { pen: 1 } into Prisma's "create" format
    const componentsData = Object.entries(recipe).map(([key, amount]) => {
      const craftId = CRAFT_ID_MAP[key];
      
      if (!craftId) {
        throw new Error(`Invalid item key: ${key}`);
      }

      return {
        amount: amount,
        craftItemId: craftId
      };
    });

    // Create the Parent (MapRecipe) AND Children (Components) in one go
    await prisma.mapRecipe.create({
      data: {
        mapRecipeComponents: {
          create: componentsData
        }
      }
  })}



  // SEED BLACKMARKET STOCK FOR EACH PERIOD
  // Define the periods you created (1 to 8)
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  // Define which items you want to stock (3 of each as requested)
  // Using IDs "1" (wood), "3" (water), "5" (metal)
  const targetRawIds = ["1", "3", "5"]; 

  // Using IDs "2" (pen), "4" (ink), "1" (brown paper)
  const targetCraftIds = ["2", "4", "1"]; 

  const rawStockData = [];
  const craftStockData = [];

  for (const p of periods) {
    // --- 1. Generate Raw Stock for this Period ---
    targetRawIds.forEach((rawId) => {
      rawStockData.push({
        periode: p,
        rawId: rawId,
        stock: Math.floor(Math.random() * 100) + 50, // Random stock between 50-150
        price: BigInt(Math.floor(Math.random() * 2000) + 1000), // Random price 1000-3000
      });
    });

    // --- 2. Generate Craft Stock for this Period ---
    targetCraftIds.forEach((craftId) => {
      craftStockData.push({
        periode: p,
        craftId: craftId,
        stock: Math.floor(Math.random() * 50) + 10, // Random stock between 10-60
        price: BigInt(Math.floor(Math.random() * 5000) + 5000), // Random price 5000-10000
      });
    });
  }

  console.log(`Seeding ${rawStockData.length} Raw Stocks...`);
  await prisma.rawStockPeriod.createMany({
    data: rawStockData,
    skipDuplicates: true,
  });

  console.log(`Seeding ${craftStockData.length} Craft Stocks...`);
  await prisma.craftStockPeriod.createMany({
    data: craftStockData,
    skipDuplicates: true,
  });




  ///////////////////////////
  // SEED CRAFT RECIPE
  ///////////////////////////
  // Prepare the data array for bulk insertion
  const recipeData = [];

  for (const recipe of RECIPES) {
    // Get the ID for the output item (CraftItem)
    const craftItemId = CRAFT_ID_MAP[recipe.output];

    if (!craftItemId) {
      console.warn(`Skipping unknown craft item: ${recipe.output}`);
      continue;
    }

    // Loop through the inputs (RawItems)
    for (const [rawName, amount] of Object.entries(recipe.input)) {
      const rawItemId = RAW_ID_MAP[rawName];

      if (!rawItemId) {
        console.warn(`Skipping unknown raw material: ${rawName}`);
        continue;
      }

      // Push to our data array
      recipeData.push({
        craftItemId: craftItemId,
        rawItemId: rawItemId,
        amount: amount // Requires the schema update mentioned above!
      });
    }
  }

  // Bulk create the recipes
  if (recipeData.length > 0) {
    await prisma.craftRecipe.createMany({
      data: recipeData,
      skipDuplicates: true,
    });
    console.log(`✅ Created ${recipeData.length} recipe ingredients.`);
  }



  // =========================
  // Rally Master Data
  // =========================
  const masterRally = await prisma.rallyMaster.upsert({
    where: { id: "rallyMasterData@Eternity" },
    update: {},
    create: {
      id: "rallyMasterData@Eternity",
    },
  });

  // create Admin user for each role
  const roles: Role[] = [
    Role.SUPER,
    Role.BLACKMARKET,
    Role.BUYRAW,
    Role.SELL,
    Role.CRAFT,
    Role.CURRENCY,
    Role.EXCHANGE,
    Role.MAP,
    Role.MONSTER,
    Role.PITCHING,
    Role.PITCHINGGUARD,
    Role.POSTGUARD,
    Role.TALKSHOW,
    Role.THUNT,
    Role.UPGRADE,
  ];



  for (let i = 0; i < roles.length; i++) {
    const role = roles[i];
    const plainPassword = passwords[i]; // ambil password dari array

    if (!plainPassword) {
      console.error(`No password defined for role index ${i}: ${role}`);
      continue; // skip jika password tidak ada
    }

    const password = await bcrypt.hash(plainPassword, 10);
    const name = `Admin ${role}`;

    try {
      const user = await prisma.user.create({
        data: {
          name,
          password,
          role,
        },
      });

      await prisma.rallyData.createMany({
        data: [{ user_id: user.id }],
      });

      console.log(
        `Created admin -> name: "${name}", password: "${plainPassword}"`
      );
    } catch (error) {
      console.log(`Admin ${name} already exists, skipping...`);
    }
  }

  // =========================
  // Dummy Users
  // =========================
  const user1 = await prisma.user.upsert({
    where: { name: "team1" },
    update: {},
    create: {
      name: "Dummy User One",
      password: await bcrypt.hash("password123", 10),
      tradingData: {
        create: {},
      },
    },
  });

  const user2 = await prisma.user.upsert({
    where: { name: "team2" },
    update: {},
    create: {
      name: "Dummy User Two",
      password: await bcrypt.hash("password123", 10),
      tradingData: {
        create: {},
      },
    },
  });

  console.log({ masterTrading, masterRally, user1, user2 });

  // Rally Datas
  await prisma.rallyPeriod.createMany({
    data: [
      { id: "1", name: "Pasang Surut", duration: 20 },
      { id: "2", name: "Musim Kemarau", duration: 20 },
      { id: "3", name: "Musim Salju", duration: 20 },
      { id: "4", name: "Banjir", duration: 20 },
      { id: "5", name: "Bulan Merah", duration: 20 },
      { id: "6", name: "Cuaca Cerah", duration: 20 },
      { id: "7", name: "Hujan Asam", duration: 20 },
      { id: "8", name: "Tornado", duration: 20 },
    ],
  });

  await prisma.rallyZone.createMany({
    data: [
      { id: "1", name: "Amerika" },
      { id: "2", name: "Asia" },
      { id: "3", name: "Eropa" },
      { id: "4", name: "Afrika" },
    ],
  });

  await prisma.rallyPos.createMany({
    data: [
      // Amerika Zone
      {
        name: "Ledger Of Balance",
        period_id: "1",
        zone_id: "1",
        eonix_cost: 2,
      },
      {
        name: "Ledger Of Balance",
        period_id: "2",
        zone_id: "1",
        eonix_cost: 2,
      },
      {
        name: "Ledger Of Balance",
        period_id: "3",
        zone_id: "1",
        eonix_cost: 3,
      },
      {
        name: "Ledger Of Balance",
        period_id: "4",
        zone_id: "1",
        eonix_cost: 4,
      },
      {
        name: "Ledger Of Balance",
        period_id: "5",
        zone_id: "1",
        eonix_cost: 2,
      },
      {
        name: "Ledger Of Balance",
        period_id: "6",
        zone_id: "1",
        eonix_cost: 3,
      },
      {
        name: "Ledger Of Balance",
        period_id: "7",
        zone_id: "1",
        eonix_cost: 4,
      },
      {
        name: "Ledger Of Balance",
        period_id: "8",
        zone_id: "1",
        eonix_cost: 3,
      },

      { name: "Spell Station", period_id: "1", zone_id: "1", eonix_cost: 2 },
      { name: "Spell Station", period_id: "2", zone_id: "1", eonix_cost: 2 },
      { name: "Spell Station", period_id: "3", zone_id: "1", eonix_cost: 3 },
      { name: "Spell Station", period_id: "4", zone_id: "1", eonix_cost: 4 },
      { name: "Spell Station", period_id: "5", zone_id: "1", eonix_cost: 2 },
      { name: "Spell Station", period_id: "6", zone_id: "1", eonix_cost: 3 },
      { name: "Spell Station", period_id: "7", zone_id: "1", eonix_cost: 4 },
      { name: "Spell Station", period_id: "8", zone_id: "1", eonix_cost: 3 },

      { name: "Word Bridge", period_id: "1", zone_id: "1", eonix_cost: 2 },
      { name: "Word Bridge", period_id: "2", zone_id: "1", eonix_cost: 2 },
      { name: "Word Bridge", period_id: "3", zone_id: "1", eonix_cost: 3 },
      { name: "Word Bridge", period_id: "4", zone_id: "1", eonix_cost: 4 },
      { name: "Word Bridge", period_id: "5", zone_id: "1", eonix_cost: 2 },
      { name: "Word Bridge", period_id: "6", zone_id: "1", eonix_cost: 3 },
      { name: "Word Bridge", period_id: "7", zone_id: "1", eonix_cost: 4 },
      { name: "Word Bridge", period_id: "8", zone_id: "1", eonix_cost: 3 },

      { name: "Count The Pion", period_id: "1", zone_id: "1", eonix_cost: 2 },
      { name: "Count The Pion", period_id: "2", zone_id: "1", eonix_cost: 2 },
      { name: "Count The Pion", period_id: "3", zone_id: "1", eonix_cost: 3 },
      { name: "Count The Pion", period_id: "4", zone_id: "1", eonix_cost: 4 },
      { name: "Count The Pion", period_id: "5", zone_id: "1", eonix_cost: 2 },
      { name: "Count The Pion", period_id: "6", zone_id: "1", eonix_cost: 3 },
      { name: "Count The Pion", period_id: "7", zone_id: "1", eonix_cost: 4 },
      { name: "Count The Pion", period_id: "8", zone_id: "1", eonix_cost: 3 },

      {
        name: "Create Your Story",
        period_id: "1",
        zone_id: "1",
        eonix_cost: 2,
      },
      {
        name: "Create Your Story",
        period_id: "2",
        zone_id: "1",
        eonix_cost: 2,
      },
      {
        name: "Create Your Story",
        period_id: "3",
        zone_id: "1",
        eonix_cost: 3,
      },
      {
        name: "Create Your Story",
        period_id: "4",
        zone_id: "1",
        eonix_cost: 4,
      },
      {
        name: "Create Your Story",
        period_id: "5",
        zone_id: "1",
        eonix_cost: 2,
      },
      {
        name: "Create Your Story",
        period_id: "6",
        zone_id: "1",
        eonix_cost: 3,
      },
      {
        name: "Create Your Story",
        period_id: "7",
        zone_id: "1",
        eonix_cost: 4,
      },
      {
        name: "Create Your Story",
        period_id: "8",
        zone_id: "1",
        eonix_cost: 3,
      },

      { name: "Charades", period_id: "1", zone_id: "1", eonix_cost: 2 },
      { name: "Charades", period_id: "2", zone_id: "1", eonix_cost: 2 },
      { name: "Charades", period_id: "3", zone_id: "1", eonix_cost: 3 },
      { name: "Charades", period_id: "4", zone_id: "1", eonix_cost: 4 },
      { name: "Charades", period_id: "5", zone_id: "1", eonix_cost: 2 },
      { name: "Charades", period_id: "6", zone_id: "1", eonix_cost: 3 },
      { name: "Charades", period_id: "7", zone_id: "1", eonix_cost: 4 },
      { name: "Charades", period_id: "8", zone_id: "1", eonix_cost: 3 },

      { name: "Memory Run", period_id: "1", zone_id: "1", eonix_cost: 2 },
      { name: "Memory Run", period_id: "2", zone_id: "1", eonix_cost: 2 },
      { name: "Memory Run", period_id: "3", zone_id: "1", eonix_cost: 3 },
      { name: "Memory Run", period_id: "4", zone_id: "1", eonix_cost: 4 },
      { name: "Memory Run", period_id: "5", zone_id: "1", eonix_cost: 2 },
      { name: "Memory Run", period_id: "6", zone_id: "1", eonix_cost: 3 },
      { name: "Memory Run", period_id: "7", zone_id: "1", eonix_cost: 4 },
      { name: "Memory Run", period_id: "8", zone_id: "1", eonix_cost: 3 },

      { name: "Find The Ball", period_id: "1", zone_id: "1", eonix_cost: 2 },
      { name: "Find The Ball", period_id: "2", zone_id: "1", eonix_cost: 2 },
      { name: "Find The Ball", period_id: "3", zone_id: "1", eonix_cost: 3 },
      { name: "Find The Ball", period_id: "4", zone_id: "1", eonix_cost: 4 },
      { name: "Find The Ball", period_id: "5", zone_id: "1", eonix_cost: 2 },
      { name: "Find The Ball", period_id: "6", zone_id: "1", eonix_cost: 3 },
      { name: "Find The Ball", period_id: "7", zone_id: "1", eonix_cost: 4 },
      { name: "Find The Ball", period_id: "8", zone_id: "1", eonix_cost: 3 },

      { name: "Drawing Relay", period_id: "1", zone_id: "1", eonix_cost: 2 },
      { name: "Drawing Relay", period_id: "2", zone_id: "1", eonix_cost: 2 },
      { name: "Drawing Relay", period_id: "3", zone_id: "1", eonix_cost: 3 },
      { name: "Drawing Relay", period_id: "4", zone_id: "1", eonix_cost: 4 },
      { name: "Drawing Relay", period_id: "5", zone_id: "1", eonix_cost: 2 },
      { name: "Drawing Relay", period_id: "6", zone_id: "1", eonix_cost: 3 },
      { name: "Drawing Relay", period_id: "7", zone_id: "1", eonix_cost: 4 },
      { name: "Drawing Relay", period_id: "8", zone_id: "1", eonix_cost: 3 },

      { name: "Flip It", period_id: "1", zone_id: "1", eonix_cost: 2 },
      { name: "Flip It", period_id: "2", zone_id: "1", eonix_cost: 2 },
      { name: "Flip It", period_id: "3", zone_id: "1", eonix_cost: 3 },
      { name: "Flip It", period_id: "4", zone_id: "1", eonix_cost: 4 },
      { name: "Flip It", period_id: "5", zone_id: "1", eonix_cost: 2 },
      { name: "Flip It", period_id: "6", zone_id: "1", eonix_cost: 3 },
      { name: "Flip It", period_id: "7", zone_id: "1", eonix_cost: 4 },
      { name: "Flip It", period_id: "8", zone_id: "1", eonix_cost: 3 },

      { name: "Make The Tower", period_id: "1", zone_id: "1", eonix_cost: 2 },
      { name: "Make The Tower", period_id: "2", zone_id: "1", eonix_cost: 2 },
      { name: "Make The Tower", period_id: "3", zone_id: "1", eonix_cost: 3 },
      { name: "Make The Tower", period_id: "4", zone_id: "1", eonix_cost: 4 },
      { name: "Make The Tower", period_id: "5", zone_id: "1", eonix_cost: 2 },
      { name: "Make The Tower", period_id: "6", zone_id: "1", eonix_cost: 3 },
      { name: "Make The Tower", period_id: "7", zone_id: "1", eonix_cost: 4 },
      { name: "Make The Tower", period_id: "8", zone_id: "1", eonix_cost: 3 },

      // Benua Asia
      { name: "Trivia Quiz", period_id: "1", zone_id: "2", eonix_cost: 3 },
      { name: "Trivia Quiz", period_id: "2", zone_id: "2", eonix_cost: 2 },
      { name: "Trivia Quiz", period_id: "3", zone_id: "2", eonix_cost: 4 },
      { name: "Trivia Quiz", period_id: "4", zone_id: "2", eonix_cost: 2 },
      { name: "Trivia Quiz", period_id: "5", zone_id: "2", eonix_cost: 2 },
      { name: "Trivia Quiz", period_id: "6", zone_id: "2", eonix_cost: 3 },
      { name: "Trivia Quiz", period_id: "7", zone_id: "2", eonix_cost: 3 },
      { name: "Trivia Quiz", period_id: "8", zone_id: "2", eonix_cost: 2 },

      { name: "Guess The Order", period_id: "1", zone_id: "2", eonix_cost: 3 },
      { name: "Guess The Order", period_id: "2", zone_id: "2", eonix_cost: 2 },
      { name: "Guess The Order", period_id: "3", zone_id: "2", eonix_cost: 4 },
      { name: "Guess The Order", period_id: "4", zone_id: "2", eonix_cost: 2 },
      { name: "Guess The Order", period_id: "5", zone_id: "2", eonix_cost: 2 },
      { name: "Guess The Order", period_id: "6", zone_id: "2", eonix_cost: 3 },
      { name: "Guess The Order", period_id: "7", zone_id: "2", eonix_cost: 3 },
      { name: "Guess The Order", period_id: "8", zone_id: "2", eonix_cost: 2 },

      { name: "Tunnel And Ball", period_id: "1", zone_id: "2", eonix_cost: 3 },
      { name: "Tunnel And Ball", period_id: "2", zone_id: "2", eonix_cost: 2 },
      { name: "Tunnel And Ball", period_id: "3", zone_id: "2", eonix_cost: 4 },
      { name: "Tunnel And Ball", period_id: "4", zone_id: "2", eonix_cost: 2 },
      { name: "Tunnel And Ball", period_id: "5", zone_id: "2", eonix_cost: 2 },
      { name: "Tunnel And Ball", period_id: "6", zone_id: "2", eonix_cost: 3 },
      { name: "Tunnel And Ball", period_id: "7", zone_id: "2", eonix_cost: 3 },
      { name: "Tunnel And Ball", period_id: "8", zone_id: "2", eonix_cost: 2 },

      {
        name: "Leading The Blind",
        period_id: "1",
        zone_id: "2",
        eonix_cost: 3,
      },
      {
        name: "Leading The Blind",
        period_id: "2",
        zone_id: "2",
        eonix_cost: 2,
      },
      {
        name: "Leading The Blind",
        period_id: "3",
        zone_id: "2",
        eonix_cost: 4,
      },
      {
        name: "Leading The Blind",
        period_id: "4",
        zone_id: "2",
        eonix_cost: 2,
      },
      {
        name: "Leading The Blind",
        period_id: "5",
        zone_id: "2",
        eonix_cost: 2,
      },
      {
        name: "Leading The Blind",
        period_id: "6",
        zone_id: "2",
        eonix_cost: 3,
      },
      {
        name: "Leading The Blind",
        period_id: "7",
        zone_id: "2",
        eonix_cost: 3,
      },
      {
        name: "Leading The Blind",
        period_id: "8",
        zone_id: "2",
        eonix_cost: 2,
      },

      { name: "Lava Floor", period_id: "1", zone_id: "2", eonix_cost: 3 },
      { name: "Lava Floor", period_id: "2", zone_id: "2", eonix_cost: 2 },
      { name: "Lava Floor", period_id: "3", zone_id: "2", eonix_cost: 4 },
      { name: "Lava Floor", period_id: "4", zone_id: "2", eonix_cost: 2 },
      { name: "Lava Floor", period_id: "5", zone_id: "2", eonix_cost: 2 },
      { name: "Lava Floor", period_id: "6", zone_id: "2", eonix_cost: 3 },
      { name: "Lava Floor", period_id: "7", zone_id: "2", eonix_cost: 3 },
      { name: "Lava Floor", period_id: "8", zone_id: "2", eonix_cost: 2 },

      { name: "Running Man", period_id: "1", zone_id: "2", eonix_cost: 3 },
      { name: "Running Man", period_id: "2", zone_id: "2", eonix_cost: 2 },
      { name: "Running Man", period_id: "3", zone_id: "2", eonix_cost: 4 },
      { name: "Running Man", period_id: "4", zone_id: "2", eonix_cost: 2 },
      { name: "Running Man", period_id: "5", zone_id: "2", eonix_cost: 2 },
      { name: "Running Man", period_id: "6", zone_id: "2", eonix_cost: 3 },
      { name: "Running Man", period_id: "7", zone_id: "2", eonix_cost: 3 },
      { name: "Running Man", period_id: "8", zone_id: "2", eonix_cost: 2 },

      { name: "Guess The Song", period_id: "1", zone_id: "2", eonix_cost: 3 },
      { name: "Guess The Song", period_id: "2", zone_id: "2", eonix_cost: 2 },
      { name: "Guess The Song", period_id: "3", zone_id: "2", eonix_cost: 4 },
      { name: "Guess The Song", period_id: "4", zone_id: "2", eonix_cost: 2 },
      { name: "Guess The Song", period_id: "5", zone_id: "2", eonix_cost: 2 },
      { name: "Guess The Song", period_id: "6", zone_id: "2", eonix_cost: 3 },
      { name: "Guess The Song", period_id: "7", zone_id: "2", eonix_cost: 3 },
      { name: "Guess The Song", period_id: "8", zone_id: "2", eonix_cost: 2 },

      { name: "Let Those Out", period_id: "1", zone_id: "2", eonix_cost: 3 },
      { name: "Let Those Out", period_id: "2", zone_id: "2", eonix_cost: 2 },
      { name: "Let Those Out", period_id: "3", zone_id: "2", eonix_cost: 4 },
      { name: "Let Those Out", period_id: "4", zone_id: "2", eonix_cost: 2 },
      { name: "Let Those Out", period_id: "5", zone_id: "2", eonix_cost: 2 },
      { name: "Let Those Out", period_id: "6", zone_id: "2", eonix_cost: 3 },
      { name: "Let Those Out", period_id: "7", zone_id: "2", eonix_cost: 3 },
      { name: "Let Those Out", period_id: "8", zone_id: "2", eonix_cost: 2 },

      // Benua Eropa
      { name: "Fly Cup, Fly", period_id: "1", zone_id: "3", eonix_cost: 2 },
      { name: "Fly Cup, Fly", period_id: "2", zone_id: "3", eonix_cost: 3 },
      { name: "Fly Cup, Fly", period_id: "3", zone_id: "3", eonix_cost: 3 },
      { name: "Fly Cup, Fly", period_id: "4", zone_id: "3", eonix_cost: 3 },
      { name: "Fly Cup, Fly", period_id: "5", zone_id: "3", eonix_cost: 3 },
      { name: "Fly Cup, Fly", period_id: "6", zone_id: "3", eonix_cost: 4 },
      { name: "Fly Cup, Fly", period_id: "7", zone_id: "3", eonix_cost: 2 },
      { name: "Fly Cup, Fly", period_id: "8", zone_id: "3", eonix_cost: 2 },

      { name: "Estafet Gelas", period_id: "1", zone_id: "3", eonix_cost: 2 },
      { name: "Estafet Gelas", period_id: "2", zone_id: "3", eonix_cost: 3 },
      { name: "Estafet Gelas", period_id: "3", zone_id: "3", eonix_cost: 3 },
      { name: "Estafet Gelas", period_id: "4", zone_id: "3", eonix_cost: 3 },
      { name: "Estafet Gelas", period_id: "5", zone_id: "3", eonix_cost: 3 },
      { name: "Estafet Gelas", period_id: "6", zone_id: "3", eonix_cost: 4 },
      { name: "Estafet Gelas", period_id: "7", zone_id: "3", eonix_cost: 2 },
      { name: "Estafet Gelas", period_id: "8", zone_id: "3", eonix_cost: 2 },

      { name: "Pair Hunt", period_id: "1", zone_id: "3", eonix_cost: 2 },
      { name: "Pair Hunt", period_id: "2", zone_id: "3", eonix_cost: 3 },
      { name: "Pair Hunt", period_id: "3", zone_id: "3", eonix_cost: 3 },
      { name: "Pair Hunt", period_id: "4", zone_id: "3", eonix_cost: 3 },
      { name: "Pair Hunt", period_id: "5", zone_id: "3", eonix_cost: 3 },
      { name: "Pair Hunt", period_id: "6", zone_id: "3", eonix_cost: 4 },
      { name: "Pair Hunt", period_id: "7", zone_id: "3", eonix_cost: 2 },
      { name: "Pair Hunt", period_id: "8", zone_id: "3", eonix_cost: 2 },

      { name: "Cup And Rubby", period_id: "1", zone_id: "3", eonix_cost: 2 },
      { name: "Cup And Rubby", period_id: "2", zone_id: "3", eonix_cost: 3 },
      { name: "Cup And Rubby", period_id: "3", zone_id: "3", eonix_cost: 3 },
      { name: "Cup And Rubby", period_id: "4", zone_id: "3", eonix_cost: 3 },
      { name: "Cup And Rubby", period_id: "5", zone_id: "3", eonix_cost: 3 },
      { name: "Cup And Rubby", period_id: "6", zone_id: "3", eonix_cost: 4 },
      { name: "Cup And Rubby", period_id: "7", zone_id: "3", eonix_cost: 2 },
      { name: "Cup And Rubby", period_id: "8", zone_id: "3", eonix_cost: 2 },

      { name: "Maze Marker", period_id: "1", zone_id: "3", eonix_cost: 2 },
      { name: "Maze Marker", period_id: "2", zone_id: "3", eonix_cost: 3 },
      { name: "Maze Marker", period_id: "3", zone_id: "3", eonix_cost: 3 },
      { name: "Maze Marker", period_id: "4", zone_id: "3", eonix_cost: 3 },
      { name: "Maze Marker", period_id: "5", zone_id: "3", eonix_cost: 3 },
      { name: "Maze Marker", period_id: "6", zone_id: "3", eonix_cost: 4 },
      { name: "Maze Marker", period_id: "7", zone_id: "3", eonix_cost: 2 },
      { name: "Maze Marker", period_id: "8", zone_id: "3", eonix_cost: 2 },

      { name: "Pass The Flour", period_id: "1", zone_id: "3", eonix_cost: 2 },
      { name: "Pass The Flour", period_id: "2", zone_id: "3", eonix_cost: 3 },
      { name: "Pass The Flour", period_id: "3", zone_id: "3", eonix_cost: 3 },
      { name: "Pass The Flour", period_id: "4", zone_id: "3", eonix_cost: 3 },
      { name: "Pass The Flour", period_id: "5", zone_id: "3", eonix_cost: 3 },
      { name: "Pass The Flour", period_id: "6", zone_id: "3", eonix_cost: 4 },
      { name: "Pass The Flour", period_id: "7", zone_id: "3", eonix_cost: 2 },
      { name: "Pass The Flour", period_id: "8", zone_id: "3", eonix_cost: 2 },

      {
        name: "Two Facts One Lies",
        period_id: "1",
        zone_id: "3",
        eonix_cost: 2,
      },
      {
        name: "Two Facts One Lies",
        period_id: "2",
        zone_id: "3",
        eonix_cost: 3,
      },
      {
        name: "Two Facts One Lies",
        period_id: "3",
        zone_id: "3",
        eonix_cost: 3,
      },
      {
        name: "Two Facts One Lies",
        period_id: "4",
        zone_id: "3",
        eonix_cost: 3,
      },
      {
        name: "Two Facts One Lies",
        period_id: "5",
        zone_id: "3",
        eonix_cost: 3,
      },
      {
        name: "Two Facts One Lies",
        period_id: "6",
        zone_id: "3",
        eonix_cost: 4,
      },
      {
        name: "Two Facts One Lies",
        period_id: "7",
        zone_id: "3",
        eonix_cost: 2,
      },
      {
        name: "Two Facts One Lies",
        period_id: "8",
        zone_id: "3",
        eonix_cost: 2,
      },

      { name: "Glass Race", period_id: "1", zone_id: "3", eonix_cost: 2 },
      { name: "Glass Race", period_id: "2", zone_id: "3", eonix_cost: 3 },
      { name: "Glass Race", period_id: "3", zone_id: "3", eonix_cost: 3 },
      { name: "Glass Race", period_id: "4", zone_id: "3", eonix_cost: 3 },
      { name: "Glass Race", period_id: "5", zone_id: "3", eonix_cost: 3 },
      { name: "Glass Race", period_id: "6", zone_id: "3", eonix_cost: 4 },
      { name: "Glass Race", period_id: "7", zone_id: "3", eonix_cost: 2 },
      { name: "Glass Race", period_id: "8", zone_id: "3", eonix_cost: 2 },

      // Benua Afrika
      { name: "Chopstick Master", period_id: "1", zone_id: "4", eonix_cost: 3 },
      { name: "Chopstick Master", period_id: "2", zone_id: "4", eonix_cost: 4 },
      { name: "Chopstick Master", period_id: "3", zone_id: "4", eonix_cost: 2 },
      { name: "Chopstick Master", period_id: "4", zone_id: "4", eonix_cost: 3 },
      { name: "Chopstick Master", period_id: "5", zone_id: "4", eonix_cost: 4 },
      { name: "Chopstick Master", period_id: "6", zone_id: "4", eonix_cost: 2 },
      { name: "Chopstick Master", period_id: "7", zone_id: "4", eonix_cost: 2 },
      { name: "Chopstick Master", period_id: "8", zone_id: "4", eonix_cost: 3 },

      { name: "Tic Tac Toe", period_id: "1", zone_id: "4", eonix_cost: 3 },
      { name: "Tic Tac Toe", period_id: "2", zone_id: "4", eonix_cost: 4 },
      { name: "Tic Tac Toe", period_id: "3", zone_id: "4", eonix_cost: 2 },
      { name: "Tic Tac Toe", period_id: "4", zone_id: "4", eonix_cost: 3 },
      { name: "Tic Tac Toe", period_id: "5", zone_id: "4", eonix_cost: 4 },
      { name: "Tic Tac Toe", period_id: "6", zone_id: "4", eonix_cost: 2 },
      { name: "Tic Tac Toe", period_id: "7", zone_id: "4", eonix_cost: 2 },
      { name: "Tic Tac Toe", period_id: "8", zone_id: "4", eonix_cost: 3 },

      { name: "What the Hey", period_id: "1", zone_id: "4", eonix_cost: 3 },
      { name: "What the Hey", period_id: "2", zone_id: "4", eonix_cost: 4 },
      { name: "What the Hey", period_id: "3", zone_id: "4", eonix_cost: 2 },
      { name: "What the Hey", period_id: "4", zone_id: "4", eonix_cost: 3 },
      { name: "What the Hey", period_id: "5", zone_id: "4", eonix_cost: 4 },
      { name: "What the Hey", period_id: "6", zone_id: "4", eonix_cost: 2 },
      { name: "What the Hey", period_id: "7", zone_id: "4", eonix_cost: 2 },
      { name: "What the Hey", period_id: "8", zone_id: "4", eonix_cost: 3 },

      { name: "Wrong Color", period_id: "1", zone_id: "4", eonix_cost: 3 },
      { name: "Wrong Color", period_id: "2", zone_id: "4", eonix_cost: 4 },
      { name: "Wrong Color", period_id: "3", zone_id: "4", eonix_cost: 2 },
      { name: "Wrong Color", period_id: "4", zone_id: "4", eonix_cost: 3 },
      { name: "Wrong Color", period_id: "5", zone_id: "4", eonix_cost: 4 },
      { name: "Wrong Color", period_id: "6", zone_id: "4", eonix_cost: 2 },
      { name: "Wrong Color", period_id: "7", zone_id: "4", eonix_cost: 2 },
      { name: "Wrong Color", period_id: "8", zone_id: "4", eonix_cost: 3 },

      { name: "Scoop Them All", period_id: "1", zone_id: "4", eonix_cost: 3 },
      { name: "Scoop Them All", period_id: "2", zone_id: "4", eonix_cost: 4 },
      { name: "Scoop Them All", period_id: "3", zone_id: "4", eonix_cost: 2 },
      { name: "Scoop Them All", period_id: "4", zone_id: "4", eonix_cost: 3 },
      { name: "Scoop Them All", period_id: "5", zone_id: "4", eonix_cost: 4 },
      { name: "Scoop Them All", period_id: "6", zone_id: "4", eonix_cost: 2 },
      { name: "Scoop Them All", period_id: "7", zone_id: "4", eonix_cost: 2 },
      { name: "Scoop Them All", period_id: "8", zone_id: "4", eonix_cost: 3 },

      {
        name: "Walk The Landmine",
        period_id: "1",
        zone_id: "4",
        eonix_cost: 3,
      },
      {
        name: "Walk The Landmine",
        period_id: "2",
        zone_id: "4",
        eonix_cost: 4,
      },
      {
        name: "Walk The Landmine",
        period_id: "3",
        zone_id: "4",
        eonix_cost: 2,
      },
      {
        name: "Walk The Landmine",
        period_id: "4",
        zone_id: "4",
        eonix_cost: 3,
      },
      {
        name: "Walk The Landmine",
        period_id: "5",
        zone_id: "4",
        eonix_cost: 4,
      },
      {
        name: "Walk The Landmine",
        period_id: "6",
        zone_id: "4",
        eonix_cost: 2,
      },
      {
        name: "Walk The Landmine",
        period_id: "7",
        zone_id: "4",
        eonix_cost: 2,
      },
      {
        name: "Walk The Landmine",
        period_id: "8",
        zone_id: "4",
        eonix_cost: 3,
      },

      { name: "Granny Pants", period_id: "1", zone_id: "4", eonix_cost: 3 },
      { name: "Granny Pants", period_id: "2", zone_id: "4", eonix_cost: 4 },
      { name: "Granny Pants", period_id: "3", zone_id: "4", eonix_cost: 2 },
      { name: "Granny Pants", period_id: "4", zone_id: "4", eonix_cost: 3 },
      { name: "Granny Pants", period_id: "5", zone_id: "4", eonix_cost: 4 },
      { name: "Granny Pants", period_id: "6", zone_id: "4", eonix_cost: 2 },
      { name: "Granny Pants", period_id: "7", zone_id: "4", eonix_cost: 2 },
      { name: "Granny Pants", period_id: "8", zone_id: "4", eonix_cost: 3 },

      { name: "Boom-Pop", period_id: "1", zone_id: "4", eonix_cost: 3 },
      { name: "Boom-Pop", period_id: "2", zone_id: "4", eonix_cost: 4 },
      { name: "Boom-Pop", period_id: "3", zone_id: "4", eonix_cost: 2 },
      { name: "Boom-Pop", period_id: "4", zone_id: "4", eonix_cost: 3 },
      { name: "Boom-Pop", period_id: "5", zone_id: "4", eonix_cost: 4 },
      { name: "Boom-Pop", period_id: "6", zone_id: "4", eonix_cost: 2 },
      { name: "Boom-Pop", period_id: "7", zone_id: "4", eonix_cost: 2 },
      { name: "Boom-Pop", period_id: "8", zone_id: "4", eonix_cost: 3 },

      { name: "Exchange Pos", period_id: "1", zone_id: "1", eonix_cost: 0 },
      { name: "Exchange Pos", period_id: "2", zone_id: "1", eonix_cost: 0 },
      { name: "Exchange Pos", period_id: "3", zone_id: "1", eonix_cost: 0 },
      { name: "Exchange Pos", period_id: "4", zone_id: "1", eonix_cost: 0 },

      { name: "Exchange Pos", period_id: "1", zone_id: "2", eonix_cost: 0 },
      { name: "Exchange Pos", period_id: "2", zone_id: "2", eonix_cost: 0 },
      { name: "Exchange Pos", period_id: "3", zone_id: "2", eonix_cost: 0 },
      { name: "Exchange Pos", period_id: "4", zone_id: "2", eonix_cost: 0 },

      { name: "Exchange Pos", period_id: "1", zone_id: "3", eonix_cost: 0 },
      { name: "Exchange Pos", period_id: "2", zone_id: "3", eonix_cost: 0 },
      { name: "Exchange Pos", period_id: "3", zone_id: "3", eonix_cost: 0 },
      { name: "Exchange Pos", period_id: "4", zone_id: "3", eonix_cost: 0 },

      { name: "Exchange Pos", period_id: "1", zone_id: "4", eonix_cost: 0 },
      { name: "Exchange Pos", period_id: "2", zone_id: "4", eonix_cost: 0 },
      { name: "Exchange Pos", period_id: "3", zone_id: "4", eonix_cost: 0 },
      { name: "Exchange Pos", period_id: "4", zone_id: "4", eonix_cost: 0 },
    ],
  });

  await prisma.rallyBigItem.createMany({
    data: [
      { id: "1", name: "Eternia Sigil" },
      { id: "2", name: "Chrono Key" },
      { id: "3", name: "Core Fragment" },
    ],
  });

  await prisma.rallySmallItem.createMany({
    data: [
      { id: "1", name: "Sigil Token" },
      { id: "2", name: "Chrono Token" },
      { id: "3", name: "Fragment Token" },
      { id: "4", name: "Rune" },
      { id: "5", name: "Shard" },
      { id: "6", name: "Flux" },
    ],
  });

  await prisma.rallyBigItemRecipe.createMany({
    data: [
      { result_item_id: "1", small_item_id: "1", quantity: 1 },
      { result_item_id: "1", small_item_id: "5", quantity: 2 },
      { result_item_id: "2", small_item_id: "2", quantity: 1 },
      { result_item_id: "2", small_item_id: "4", quantity: 2 },
      { result_item_id: "3", small_item_id: "3", quantity: 1 },
      { result_item_id: "3", small_item_id: "6", quantity: 2 },
    ],
  });
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
