import { BalanceTradingLog, CraftItem, RawItem, TradingData, User } from "@/generated/prisma/client";


export interface UserTrading extends User{
    tradingData: AllTradingData
}

export interface AllTradingData extends TradingData{
    rawItems: RawItem[],
    craftItems: CraftItem[],
    balanceTradingLogs: BalanceTradingLog[]
}