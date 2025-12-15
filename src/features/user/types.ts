import { BalanceTradingLog, CraftItem, RawItem, TradingData, User, RawUserAmount, CraftUserAmount } from "@/generated/prisma/client";


export interface UserTrading extends User{
    tradingData: AllTradingData
}

export interface AllTradingData extends TradingData{
    rawItems: RawItem[], // Keeping legacy for now if used elsewhere, but ideally remove
    craftItems: CraftItem[], // Keeping legacy
    rawUserAmounts: RawUserAmount[],
    craftUserAmounts: CraftUserAmount[],
    balanceTradingLogs: BalanceTradingLog[]
}