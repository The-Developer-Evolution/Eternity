import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
});
const prisma = new PrismaClient({adapter});

async function main() {
  // 1. Create Dummy User 1
  const user1 = await prisma.user.upsert({
    where: { email: 'dummy1@example.com' },
    update: {}, // No updates if exists
    create: {
      email: 'dummy1@example.com',
      name: 'Dummy User One',
      password: 'password123', // In a real app, hash this with bcrypt!
      nim: '1234500001',
      // Create the linked TradingData immediately
      tradingData: {
        create: {},
      },
    },
  })

  // 2. Create Dummy User 2
  const user2 = await prisma.user.upsert({
    where: { email: 'dummy2@example.com' },
    update: {},
    create: {
      email: 'dummy2@example.com',
      name: 'Dummy User Two',
      password: 'password123',
      nim: '1234500002',
      tradingData: {
        create: {},
      },
    },
  })

  console.log({ user1, user2 })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })