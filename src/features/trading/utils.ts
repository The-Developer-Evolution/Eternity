import prisma from "@/lib/prisma";
import { UserTrading } from "../user/types";
import { CraftAmountMap, CraftItem, RawAmountMap, RawMaterial, Recipe, RECIPES, TradingAmounts } from "./types/craft";

export function getRandomRawMaterial(): RawMaterial {
  const values = Object.values(RawMaterial);
  const randomIndex = Math.floor(Math.random() * values.length);
  return values[randomIndex];
}

export const createRawAmountMap = (): RawAmountMap => ({
  wood: 0,
  water: 0,
  coal: 0,
  metal: 0,
  glass: 0,
});

export const createCraftAmountMap = (): CraftAmountMap => ({
  brownPaper: 0,
  pen: 0,
  magnifyingGlass: 0,
  ink: 0,
  dividers: 0,
});

export function extractRawCraftAmounts(
  user: UserTrading
): TradingAmounts {
  const raw = createRawAmountMap();
  const craft = createCraftAmountMap();

  // --- RAW ITEMS ---
  for (const item of user.tradingData.rawItems) {
    const key = item.name as keyof typeof RawMaterial;
    if (key in raw) {
      raw[key]++;
    }
  }

  // --- CRAFT ITEMS ---
  for (const item of user.tradingData.craftItems) {
    const key = item.name as keyof typeof craft;
    if (key in craft) {
      craft[key]++;
    }
  }

  return { raw, craft };
}


