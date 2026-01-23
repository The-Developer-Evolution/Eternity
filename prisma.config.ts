// prisma.config.ts
import { defineConfig } from 'prisma/config';

export default defineConfig({
  // 1. Tell Prisma where your schema is
  schema: 'prisma/schema.prisma',
  
  // 2. Configure migrations and seeding
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts', // This replaces the package.json config
  },
});