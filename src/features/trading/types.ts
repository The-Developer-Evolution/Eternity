
export const RawMaterial = {
  wood: "wood",
  water: "water",
  coal: "coal",
  metal: "metal",
  glass: "glass",
} as const;

export type RawMaterial = keyof typeof RawMaterial;

