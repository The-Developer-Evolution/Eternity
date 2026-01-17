'use server'

import prisma from "@/lib/prisma";
import { BalanceLogType, BalanceTradingResource } from "@prisma/client";

export interface TradingLogEntry {
  id: string;
  amount: string; // BigInt serialized as string
  message: string;
  type: BalanceLogType;
  resource: BalanceTradingResource;
  createdAt: string;
}

export interface TradingLogResult {
  logs: TradingLogEntry[];
  userName: string;
  userEternites: number;
  userIdr: string; // BigInt as string
  userUsd: string; // BigInt as string
}

export async function getUserTradingLogs(userId: string): Promise<TradingLogResult | null> {
  const tradingData = await prisma.tradingData.findFirst({
    where: { userId },
    include: {
      user: { select: { name: true } },
      balanceTradingLogs: {
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit to last 100 logs for performance
      }
    }
  });

  if (!tradingData) return null;

  return {
    logs: tradingData.balanceTradingLogs.map(log => ({
      id: log.id,
      amount: log.amount.toString(),
      message: log.message,
      type: log.type,
      resource: log.resource,
      createdAt: log.createdAt.toISOString(),
    })),
    userName: tradingData.user.name ?? 'Unknown',
    userEternites: tradingData.eternites,
    userIdr: tradingData.idr.toString(),
    userUsd: tradingData.usd.toString(),
  };
}

