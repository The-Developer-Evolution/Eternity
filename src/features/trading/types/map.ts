import { CraftItemKey } from "./craft";

export type MapRecipe = {
  input: Partial<Record<CraftItemKey, number>>;
};

export const MAP_RECIPES: MapRecipe[] = [
  {
    input: { brownPaper: 2, pen: 1 },
  },
  {
    input: { magnifyingGlass: 1, ink: 3 },
  },
];
