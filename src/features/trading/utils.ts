import { RawMaterial } from "./types";

export function getRandomRawMaterial(): RawMaterial {
  const values = Object.values(RawMaterial);
  const randomIndex = Math.floor(Math.random() * values.length);
  return values[randomIndex];
}