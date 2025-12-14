import { PrismaClient, Role } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

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
  "Juliet753)",
  "Kilo987!",
  "Lima246@",
  "Mike753#",
  "November468$",
  "Oscar159%",
];

async function main() {
  // =========================
  // Trading Master Data
  // =========================
  const masterTrading = await prisma.masterTrading.upsert({
    where: { id: "tradingMasterData@Eternity" },
    update: {},
    create: {
      id: "tradingMasterData@Eternity",
    },
  });

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

  // =========================
  // Rally Master Data
  // =========================
  const masterRally = await prisma.masterRally.upsert({
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
