
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const period = await prisma.periodeTrading.findFirst();
  if (period) {
    console.log('Original Rate:', period.usdidr_rate);
    console.log('Type:', typeof period.usdidr_rate);
    try {
        const val = Number(period.usdidr_rate);
        console.log('Converted Number():', val);
    } catch (e) {
        console.error('Error converting with Number():', e);
    }
    
    if (period.usdidr_rate && typeof period.usdidr_rate === 'object' && 'toNumber' in period.usdidr_rate) {
        console.log('Converted .toNumber():', (period.usdidr_rate as any).toNumber());
    }
  } else {
    console.log('No period found');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
