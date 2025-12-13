'use server';

import { AdminRallyRole, AdminTradingRole } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";

export interface UserRoles {
  isAdminTrading: boolean;
  isAdminRally: boolean;
  role?: AdminTradingRole | AdminRallyRole | null;
}

// export async function getUserRoles(userId: string): Promise<UserRoles> {
//   const [adminTrading, adminRally] = await Promise.all([
//     prisma.adminTrading.findUnique({ where: { userId } }),
//     prisma.adminRally.findUnique({ where: { userId } }),
//   ]);

//   return {
//     isAdminTrading: !!adminTrading,
//     tradingRole: adminTrading?.role ?? null,
//     isAdminRally: !!adminRally,
//     rallyRole: adminRally?.role ?? null,
//   };
// }

export async function getUserRoles(userId: string): Promise<UserRoles> {
  if (!userId) {
    throw new Error("userId is required");
  }

  const [adminTrading, adminRally] = await Promise.all([
    prisma.adminTrading.findUnique({ where: { userId } }),
    prisma.adminRally.findUnique({ where: { userId } }),
  ]);

  return {
    isAdminTrading: !!adminTrading,
    isAdminRally: !!adminRally,
    role: adminTrading?.role ?? adminRally?.role ?? null,
  };
}
