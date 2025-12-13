
export const RawMaterial = {
  wood: "wood",
  water: "water",
  coal: "coal",
  metal: "metal",
  glass: "glass",
} as const;
export type RawMaterial = keyof typeof RawMaterial;

export const CraftItem = {
  brownPaper: "brown paper",
  pen: "pen",
  magnifyingGlass: "magnifying glass",
  ink: "ink",
  dividers: "dividers",
} as const;

export type CraftItemKey = keyof typeof CraftItem;
export type CraftItemLabel = typeof CraftItem[CraftItemKey];



export type Recipe = {
  input: Partial<Record<RawMaterial, number>>;
  output: CraftItemKey;
};

export const RECIPES: Recipe[] = [
  {
    input: { wood: 10, water: 5 },
    output: "brownPaper",
  },
  {
    input: { wood: 10, coal: 8 },
    output: "pen",
  },
  {
    input: { wood: 10, metal: 5, glass: 2 },
    output: "magnifyingGlass",
  },
  {
    input: { water: 7, coal: 4 },
    output: "ink",
  },
  {
    input: { wood: 15, metal: 5 },
    output: "dividers",
  },
];


// Material & Craft Amount
export type RawAmountMap = Record<RawMaterial, number>;
export type CraftAmountMap = Record<CraftItemKey, number>;

export interface TradingAmounts {
  raw: RawAmountMap;
  craft: CraftAmountMap;
}