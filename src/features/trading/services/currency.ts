'use server'

import { checkUserRole } from "@/features/auth/utils";
import { getUserTradingById } from "@/features/user/trading.service";
import { AdminTradingRole, BalanceLogType, BalanceTradingResource } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ActionResult } from "@/types/actionResult";
import { TradingData } from "@/generated/prisma/client";

const CURRENCY_RATE = {
    IDR: 1,
    USD: 16000,
    ETERNITE: 1000000
}
export type CurrencyType = keyof typeof CURRENCY_RATE;

export async function convertCurrency(
    userId: string, 
    amount: number, 
    from: CurrencyType, 
    to: CurrencyType
): Promise<ActionResult<TradingData>> {
    
    // 1. Check Role
    const roleCheck = await checkUserRole([AdminTradingRole.CURRENCY, AdminTradingRole.SUPER]);
    if (!roleCheck.success) {
        return { success: false, error: roleCheck.error };
    }

    // 2. Validate inputs
    if (amount <= 0) return { success: false, error: "Amount must be positive" };
    if (from === to) return { success: false, error: "Cannot convert to same currency" };

    const fromRate = CURRENCY_RATE[from];
    const toRate = CURRENCY_RATE[to];
    
    // 3. Calculate conversion
    // Formula: Amount * (ValueFrom / ValueTo)
    // Example: 1 USD (14000) -> IDR (1) = 14000 / 1 = 14000 IDR. Correct.
    const convertedAmount = Math.floor(amount * (fromRate / toRate));
    
    if (convertedAmount <= 0) {
         return { success: false, error: "Converted amount is too small" };
    }

    // 4. Get User Data
    const userResult = await getUserTradingById(userId);
    if (!userResult.success || !userResult.data?.tradingData) {
        return { success: false, error: "User or trading data not found" };
    }
    const tradingData = userResult.data.tradingData;

    // 5. Check Balance
    const currentBalance = (() => {
        if (from === 'IDR') return Number(tradingData.idr);
        if (from === 'USD') return Number(tradingData.usd);
        if (from === 'ETERNITE') return Number(tradingData.eternites);
        return 0;
    })();

    if (currentBalance < amount) {
        return { success: false, error: `Insufficient ${from} balance` };
    }

    // 6. Transaction
    const fieldMap: Record<CurrencyType, keyof TradingData> = {
        'IDR': 'idr',
        'USD': 'usd',
        'ETERNITE': 'eternites'
    };
    
    // Map to Enum
    const resourceMap: Record<CurrencyType, BalanceTradingResource> = {
        'IDR': BalanceTradingResource.IDR,
        'USD': BalanceTradingResource.USD,
        'ETERNITE': BalanceTradingResource.ETERNITES
    };

    // Prepare update data
    // Values need to be BigInt for IDR/USD, Int for ETERNITE.
    // We used Math.floor above so numbers are integers.
    const decrementValue = from === 'ETERNITE' ? Math.floor(amount) : BigInt(Math.floor(amount));
    const incrementValue = to === 'ETERNITE' ? convertedAmount : BigInt(convertedAmount);

    const [, updatedTradingData] = await prisma.$transaction([
        // Update Balances (Single Update if possible? No, different fields)
        // Actually we can do one update with multiple field changes
        prisma.tradingData.update({
            where: { id: tradingData.id },
            data: {
                [fieldMap[from]]: { decrement: BigInt(Math.floor(amount)) },
                [fieldMap[to]]: { increment: BigInt(convertedAmount) }
            } 
        }),
        
        // Log Debit
         prisma.balanceTradingLog.create({
            data: {
                tradingDataId: tradingData.id,
                amount: BigInt(Math.floor(-amount)),
                type: BalanceLogType.DEBIT,
                resource: resourceMap[from],
                message: `Converted ${amount} ${from} to ${to}`
            }
        }),

        // Log Credit
         prisma.balanceTradingLog.create({
            data: {
                tradingDataId: tradingData.id,
                amount: BigInt(convertedAmount),
                type: BalanceLogType.CREDIT,
                resource: resourceMap[to],
                message: `Received ${convertedAmount} ${to} from ${from}`
            }
        }),
    ]);

    // Return fresh data 
    const finalData = await prisma.tradingData.findUnique({
        where: { id: tradingData.id },
         include: {
            rawItems: true,
            craftItems: true,
            balanceTradingLogs: true,
        },
    });

    return { success: true, data: finalData! };
}