import { RawStockPeriod } from "@/generated/prisma/browser";
import { PrismaClient, Role } from "@/generated/prisma/client";
import {
  CraftStockPeriodCreateInput,
  CraftStockPeriodCreateManyInput,
  RawStockPeriodCreateManyInput,
} from "@/generated/prisma/models";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

type RecipePattern = {
  input: Record<string, number>; // e.g., { wood: 10 }
  output: string; // e.g., "brownPaper"
};
type ItemConfig = { id: string; stock: number; price: number };

type PeriodConfig = {
  periode: number;
  raw: ItemConfig[];
  craft: ItemConfig[];
};

// CRAFT ITEM's Recipe
const RECIPES: RecipePattern[] = [
  { input: { wood: 10, water: 5 }, output: "brownPaper" },
  { input: { wood: 10, coal: 8 }, output: "pen" },
  { input: { wood: 10, metal: 5, glass: 2 }, output: "magnifyingGlass" },
  { input: { water: 7, coal: 4 }, output: "ink" },
  { input: { wood: 15, metal: 5 }, output: "dividers" },
];

// Forbidden MAP's REICPE
const MAP_RECIPES = [
  { brownPaper: 2, pen: 1, ink: 2, dividers: 1, magnifyingGlass: 1 },
];

// stock and price in BlackMarket
const CUSTOM_PERIOD_DATA: PeriodConfig[] = [
  {
    periode: 1,
    raw: [
      { id: "1", stock: 15, price: 120 }, // Wood
      { id: "2", stock: 13, price: 550 }, // Glass
      { id: "3", stock: 14, price: 230 }, // Water
      { id: "4", stock: 24, price: 270 }, // Coal
      { id: "5", stock: 15, price: 375 }, // Metal
    ],
    craft: [
      { id: "1", stock: 2, price: 2250 }, // Brown Paper
      { id: "2", stock: 1, price: 3500 }, // Pen
      { id: "3", stock: 3, price: 3000 }, // Magnifying glass
      { id: "4", stock: 3, price: 3000 }, // Ink
      { id: "5", stock: 3, price: 2000 }, // Dividers
    ],
  },
  {
    periode: 2,
    raw: [
      { id: "1", stock: 11, price: 95 }, // Wood
      { id: "2", stock: 15, price: 490 }, // Glass
      { id: "3", stock: 23, price: 190 }, // Water
      { id: "4", stock: 20, price: 220 }, // Coal
      { id: "5", stock: 16, price: 325 }, // Metal
    ],
    craft: [
      { id: "1", stock: 5, price: 2500 }, // Brown Paper
      { id: "2", stock: 1, price: 5000 }, // Pen
      { id: "3", stock: 2, price: 3500 }, // Magnifying glass
      { id: "4", stock: 4, price: 3500 }, // Ink
      { id: "5", stock: 5, price: 2500 }, // Dividers
    ],
  },
  {
    periode: 3,
    raw: [
      { id: "1", stock: 23, price: 180 }, // Wood
      { id: "2", stock: 21, price: 620 }, // Glass
      { id: "3", stock: 20, price: 270 }, // Water
      { id: "4", stock: 12, price: 375 }, // Coal
      { id: "5", stock: 12, price: 500 }, // Metal
    ],
    craft: [
      { id: "1", stock: 3, price: 4500 }, // Brown Paper
      { id: "2", stock: 3, price: 8500 }, // Pen
      { id: "3", stock: 2, price: 8000 }, // Magnifying glass
      { id: "4", stock: 3, price: 6000 }, // Ink
      { id: "5", stock: 4, price: 5500 }, // Dividers
    ],
  },
  {
    periode: 4,
    raw: [
      { id: "1", stock: 25, price: 220 }, // Wood
      { id: "2", stock: 13, price: 575 }, // Glass
      { id: "3", stock: 13, price: 250 }, // Water
      { id: "4", stock: 14, price: 400 }, // Coal
      { id: "5", stock: 17, price: 600 }, // Metal
    ],
    craft: [
      { id: "1", stock: 5, price: 4750 }, // Brown Paper
      { id: "2", stock: 1, price: 7500 }, // Pen
      { id: "3", stock: 5, price: 7000 }, // Magnifying glass
      { id: "4", stock: 3, price: 5750 }, // Ink
      { id: "5", stock: 5, price: 4500 }, // Dividers
    ],
  },
  {
    periode: 5,
    raw: [
      { id: "1", stock: 22, price: 50 }, // Wood
      { id: "2", stock: 10, price: 350 }, // Glass
      { id: "3", stock: 25, price: 120 }, // Water
      { id: "4", stock: 23, price: 150 }, // Coal
      { id: "5", stock: 12, price: 280 }, // Metal
    ],
    craft: [
      { id: "1", stock: 4, price: 2000 }, // Brown Paper
      { id: "2", stock: 4, price: 3500 }, // Pen
      { id: "3", stock: 3, price: 3200 }, // Magnifying glass
      { id: "4", stock: 3, price: 2500 }, // Ink
      { id: "5", stock: 3, price: 2250 }, // Dividers
    ],
  },
  {
    periode: 6,
    raw: [
      { id: "1", stock: 18, price: 105 }, // Wood
      { id: "2", stock: 13, price: 520 }, // Glass
      { id: "3", stock: 19, price: 215 }, // Water
      { id: "4", stock: 11, price: 290 }, // Coal
      { id: "5", stock: 24, price: 360 }, // Metal
    ],
    craft: [
      { id: "1", stock: 1, price: 2975 }, // Brown Paper
      { id: "2", stock: 2, price: 5446 }, // Pen
      { id: "3", stock: 2, price: 4725 }, // Magnifying glass
      { id: "4", stock: 1, price: 4718 }, // Ink
      { id: "5", stock: 5, price: 3731 }, // Dividers
    ],
  },
  {
    periode: 7,
    raw: [
      { id: "1", stock: 14, price: 100 }, // Wood
      { id: "2", stock: 11, price: 500 }, // Glass
      { id: "3", stock: 20, price: 150 }, // Water
      { id: "4", stock: 12, price: 250 }, // Coal
      { id: "5", stock: 17, price: 350 }, // Metal
    ],
    craft: [
      { id: "1", stock: 2, price: 2000 }, // Brown Paper
      { id: "2", stock: 4, price: 4000 }, // Pen
      { id: "3", stock: 2, price: 3500 }, // Magnifying glass
      { id: "4", stock: 2, price: 3000 }, // Ink
      { id: "5", stock: 2, price: 2000 }, // Dividers
    ],
  },
  {
    periode: 8,
    raw: [
      { id: "1", stock: 10, price: 300 }, // Wood
      { id: "2", stock: 10, price: 1000 }, // Glass
      { id: "3", stock: 10, price: 450 }, // Water
      { id: "4", stock: 10, price: 550 }, // Coal
      { id: "5", stock: 10, price: 700 }, // Metal
    ],
    craft: [
      { id: "1", stock: 1, price: 5000 }, // Brown Paper
      { id: "2", stock: 1, price: 10000 }, // Pen
      { id: "3", stock: 1, price: 9500 }, // Magnifying glass
      { id: "4", stock: 1, price: 7000 }, // Ink
      { id: "5", stock: 1, price: 7000 }, // Dividers
    ],
  },
];

// Helper Mapping (Mapping string keys to DB IDs)
const RAW_ID_MAP: Record<string, string> = {
  wood: "1",
  glass: "2",
  water: "3",
  coal: "4",
  metal: "5",
};

const CRAFT_ID_MAP: Record<string, string> = {
  brownPaper: "1", // "brown paper"
  pen: "2", // "pen"
  magnifyingGlass: "3", // "magnifying glass"
  ink: "4", // "ink"
  dividers: "5", // "dividers"
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

  // Trading Duration
  // SEED Price Forbidden Map, USD/IDR rate usd
  await prisma.periodeTrading.createMany({
    data: [
      {
        periode: 1,
        cost_map: 1000,
        price_map: 120000,
        duration: 30,
        usdidr_rate: 16500,
      },
      {
        periode: 2,
        cost_map: 1300,
        price_map: 118000,
        duration: 20,
        usdidr_rate: 16830,
      },
      {
        periode: 3,
        cost_map: 1600,
        price_map: 116000,
        duration: 20,
        usdidr_rate: 15989,
      },
      {
        periode: 4,
        cost_map: 1900,
        price_map: 114000,
        duration: 20,
        usdidr_rate: 16628,
      },
      {
        periode: 5,
        cost_map: 2200,
        price_map: 112000,
        duration: 20,
        usdidr_rate: 17293,
      },
      {
        periode: 6,
        cost_map: 2500,
        price_map: 110000,
        duration: 20,
        usdidr_rate: 18677,
      },
      {
        periode: 7,
        cost_map: 2800,
        price_map: 108000,
        duration: 20,
        usdidr_rate: 17743,
      },
      {
        periode: 8,
        cost_map: 3100,
        price_map: 106000,
        duration: 20,
        usdidr_rate: 15969,
      },
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
      { id: "1", name: "Wood" },
      { id: "2", name: "Glass" },
      { id: "3", name: "Water" },
      { id: "4", name: "Coal" },
      { id: "5", name: "Metal" },
    ],
    skipDuplicates: true,
  });
  // seed craftItem
  await prisma.craftItem.createMany({
    data: [
      { id: "1", name: "Brown Paper" },
      { id: "2", name: "Pen" },
      { id: "3", name: "Magnifying Glass" },
      { id: "4", name: "Ink" },
      { id: "5", name: "Dividers" },
    ],
    skipDuplicates: true,
  });

  // Seed raw and craft price for each period
  await prisma.rawPeriod.createMany({
    data: [
      // id 1 : Wood
      { rawId: "1", periode: 1, price: 100 },
      { rawId: "1", periode: 2, price: 110 },
      { rawId: "1", periode: 3, price: 120 },
      { rawId: "1", periode: 4, price: 130 },
      { rawId: "1", periode: 5, price: 115 },
      { rawId: "1", periode: 6, price: 105 },
      { rawId: "1", periode: 7, price: 120 },
      { rawId: "1", periode: 8, price: 125 },

      // id 2 : Glass
      { rawId: "2", periode: 1, price: 500 },
      { rawId: "2", periode: 2, price: 530 },
      { rawId: "2", periode: 3, price: 530 },
      { rawId: "2", periode: 4, price: 490 },
      { rawId: "2", periode: 5, price: 470 },
      { rawId: "2", periode: 6, price: 520 },
      { rawId: "2", periode: 7, price: 535 },
      { rawId: "2", periode: 8, price: 505 },

      // id 3 : Water
      { rawId: "3", periode: 1, price: 200 },
      { rawId: "3", periode: 2, price: 215 },
      { rawId: "3", periode: 3, price: 185 },
      { rawId: "3", periode: 4, price: 175 },
      { rawId: "3", periode: 5, price: 215 },
      { rawId: "3", periode: 6, price: 215 },
      { rawId: "3", periode: 7, price: 200 },
      { rawId: "3", periode: 8, price: 220 },

      // id 4 : Coal
      { rawId: "4", periode: 1, price: 250 },
      { rawId: "4", periode: 2, price: 265 },
      { rawId: "4", periode: 3, price: 285 },
      { rawId: "4", periode: 4, price: 240 },
      { rawId: "4", periode: 5, price: 230 },
      { rawId: "4", periode: 6, price: 290 },
      { rawId: "4", periode: 7, price: 290 },
      { rawId: "4", periode: 8, price: 260 },

      // id 5 : metal
      { rawId: "5", periode: 1, price: 350 },
      { rawId: "5", periode: 2, price: 375 },
      { rawId: "5", periode: 3, price: 405 },
      { rawId: "5", periode: 4, price: 415 },
      { rawId: "5", periode: 5, price: 380 },
      { rawId: "5", periode: 6, price: 360 },
      { rawId: "5", periode: 7, price: 395 },
      { rawId: "5", periode: 8, price: 350 },
    ],
  });

  await prisma.craftPeriod.createMany({
    data: [
      // id 1: Brown Paper
      { craftId: "1", periode: 1, price: 4200 },
      { craftId: "1", periode: 2, price: 4568 },
      { craftId: "1", periode: 3, price: 4463 },
      { craftId: "1", periode: 4, price: 4568 },
      { craftId: "1", periode: 5, price: 4673 },
      { craftId: "1", periode: 6, price: 4463 },
      { craftId: "1", periode: 7, price: 4620 },
      { craftId: "1", periode: 8, price: 4935 },

      // id 2: Pen
      { craftId: "2", periode: 1, price: 7875 },
      { craftId: "2", periode: 2, price: 8474 },
      { craftId: "2", periode: 3, price: 8999 },
      { craftId: "2", periode: 4, price: 9146 },
      { craftId: "2", periode: 5, price: 8379 },
      { craftId: "2", periode: 6, price: 8169 },
      { craftId: "2", periode: 7, price: 8915 },
      { craftId: "2", periode: 8, price: 8421 },

      // id 3: Magnifyin glass
      { craftId: "3", periode: 1, price: 6825 },
      { craftId: "3", periode: 2, price: 7403 },
      { craftId: "3", periode: 3, price: 8033 },
      { craftId: "3", periode: 4, price: 8453 },
      { craftId: "3", periode: 5, price: 7613 },
      { craftId: "3", periode: 6, price: 7088 },
      { craftId: "3", periode: 7, price: 7928 },
      { craftId: "3", periode: 8, price: 7613 },

      // id 4: ink
      { craftId: "4", periode: 1, price: 6300 },
      { craftId: "4", periode: 2, price: 6762 },
      { craftId: "4", periode: 3, price: 7308 },
      { craftId: "4", periode: 4, price: 6762 },
      { craftId: "4", periode: 5, price: 6279 },
      { craftId: "4", periode: 6, price: 7077 },
      { craftId: "4", periode: 7, price: 7392 },
      { craftId: "4", periode: 8, price: 6993 },

      // id 5: dividers
      { craftId: "5", periode: 1, price: 5040 },
      { craftId: "5", periode: 2, price: 5387 },
      { craftId: "5", periode: 3, price: 5114 },
      { craftId: "5", periode: 4, price: 4589 },
      { craftId: "5", periode: 5, price: 5093 },
      { craftId: "5", periode: 6, price: 5597 },
      { craftId: "5", periode: 7, price: 5376 },
      { craftId: "5", periode: 8, price: 5418 },
    ],
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
        craftItemId: craftId,
      };
    });

    // Create the Parent (MapRecipe) AND Children (Components) in one go
    await prisma.mapRecipe.create({
      data: {
        mapRecipeComponents: {
          create: componentsData,
        },
      },
    });
  }

  // SEED BLACKMARKET STOCK and Price FOR EACH PERIOD

  const rawStockData: RawStockPeriodCreateManyInput[] = [];
  const craftStockData: CraftStockPeriodCreateManyInput[] = [];

  for (const pData of CUSTOM_PERIOD_DATA) {
    // Process Raw Items
    for (const item of pData.raw) {
      rawStockData.push({
        periode: pData.periode,
        rawId: item.id,
        stock: item.stock,
        price: BigInt(item.price), // TS requires BigInt() wrapper here
      });
    }

    // Process Craft Items
    for (const item of pData.craft) {
      craftStockData.push({
        periode: pData.periode,
        craftId: item.id,
        stock: item.stock,
        price: BigInt(item.price),
      });
    }
  }

  // 5. Insert
  if (rawStockData.length > 0) {
    console.log(`Seeding ${rawStockData.length} Raw Stocks...`);
    await prisma.rawStockPeriod.createMany({
      data: rawStockData,
      skipDuplicates: true,
    });
  }

  if (craftStockData.length > 0) {
    console.log(`Seeding ${craftStockData.length} Craft Stocks...`);
    await prisma.craftStockPeriod.createMany({
      data: craftStockData,
      skipDuplicates: true,
    });
  }

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
        amount: amount, // Requires the schema update mentioned above!
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
    const name = `${role}`;

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

  const dummyUserNames = [
    "001_Indonesia",
    "002_Malaysia",
    "003_Singapore",
    "004_Thailand",
    "005_Philippines",
    "006_Vietnam",
    "007_Laos",
    "008_Cambodia",
    "009_Myanmar",
    "010_Brunei",
    "011_Japan",
    "012_SouthKorea",
    "013_NorthKorea",
    "014_China",
    "015_Taiwan",
    "016_HongKong",
    "017_Macau",
    "018_India",
    "019_Pakistan",
    "020_Bangladesh",
    "021_Nepal",
    "022_Bhutan",
    "023_SriLanka",
    "024_Maldives",
    "025_Afghanistan",
    "026_Iran",
    "027_Iraq",
    "028_SaudiArabia",
    "029_UnitedArabEmirates",
    "030_Qatar",
    "031_Kuwait",
    "032_Oman",
    "033_Yemen",
    "034_Jordan",
    "035_Israel",
    "036_Palestine",
    "037_Turkey",
    "038_Greece",
    "039_Italy",
    "040_France",
    "041_Germany",
    "042_Netherlands",
    "043_Belgium",
    "044_Switzerland",
    "045_Austria",
    "046_Spain",
    "047_Portugal",
    "048_UnitedKingdom",
    "049_Ireland",
    "050_Iceland",
    "051_Norway",
    "052_Sweden",
    "053_Finland",
    "054_Denmark",
    "055_Poland",
    "056_CzechRepublic",
    "057_Slovakia",
    "058_Hungary",
    "059_Romania",
    "060_Bulgaria",
    "061_Serbia",
    "062_Croatia",
    "063_Slovenia",
    "064_Bosnia",
    "065_Montenegro",
    "066_Albania",
    "067_Russia",
    "068_Ukraine",
    "069_Belarus",
    "070_Lithuania",
    "071_Latvia",
    "072_Estonia",
    "073_UnitedStates",
    "074_Canada",
    "075_Mexico",
    "076_Brazil",
    "077_Argentina",
    "078_Chile",
    "079_Peru",
    "080_Colombia",
    "081_Venezuela",
    "082_Bolivia",
    "083_Paraguay",
    "084_Uruguay",
    "085_Ecuador",
    "086_Panama",
    "087_CostaRica",
    "088_Cuba",
    "089_Jamaica",
    "090_Haiti",
    "091_DominicanRepublic",
    "092_Australia",
    "093_NewZealand",
    "094_PapuaNewGuinea",
    "095_Fiji",
    "096_SolomonIslands",
    "097_SouthAfrica",
    "098_Nigeria",
    "099_Kenya",
    "100_Egypt",
  ];

  for (const name of dummyUserNames) {
    await prisma.user.upsert({
      where: { name },
      update: {},
      create: {
        name,
        password: await bcrypt.hash("12345678", 10),
        tradingData: {
          create: {},
        },
      },
    });
    console.log(`Created dummy user: ${name}`);
  }

  console.log({ masterTrading });

  // Rally Datas
  await prisma.rallyPeriod.createMany({
    data: [
      {
        id: "1",
        name: "Pasang Surut",
        duration: 20,
        special_ticket_name: "Special Ticket Pasang Surut",
        special_ticket_stock: 5,
      },
      {
        id: "2",
        name: "Musim Kemarau",
        duration: 20,
        special_ticket_name: "Special Ticket Musim Kemarau",
        special_ticket_stock: 5,
      },
      {
        id: "3",
        name: "Musim Salju",
        duration: 20,
        special_ticket_name: "Special Ticket Musim Salju",
        special_ticket_stock: 5,
      },
      {
        id: "4",
        name: "Banjir",
        duration: 20,
        special_ticket_name: "Special Ticket Banjir",
        special_ticket_stock: 5,
      },
      {
        id: "5",
        name: "Bulan Merah",
        duration: 20,
        special_ticket_name: "Special Ticket Bulan Merah",
        special_ticket_stock: 5,
      },
      {
        id: "6",
        name: "Cuaca Cerah",
        duration: 20,
        special_ticket_name: "Special Ticket Cuaca Cerah",
        special_ticket_stock: 5,
      },
      {
        id: "7",
        name: "Hujan Asam",
        duration: 20,
        special_ticket_name: "Special Ticket Hujan Asam",
        special_ticket_stock: 5,
      },
      {
        id: "8",
        name: "Tornado",
        duration: 20,
        special_ticket_name: "Special Ticket Tornado",
        special_ticket_stock: 5,
      },
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
      { id: "1", name: "Sigil Token", price: 5, show_in_inventory: true },
      { id: "2", name: "Chrono Token", price: 5, show_in_inventory: true },
      { id: "3", name: "Fragment Token", price: 5, show_in_inventory: true },
      { id: "4", name: "Rune Material", price: 5, show_in_inventory: true },
      { id: "5", name: "Shard Material", price: 5, show_in_inventory: true },
      { id: "6", name: "Flux Material", price: 5, show_in_inventory: true },
      { id: "7", name: "Kartu Zona", price: 25, show_in_inventory: false },
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
