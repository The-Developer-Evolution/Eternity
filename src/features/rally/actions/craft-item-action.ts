'use server'

import { craftBigItem } from "@/features/rally/services/item";
import { revalidatePath } from "next/cache";

export async function craftItemAction(userId: string, recipeId: string) {
  try {
    await craftBigItem(userId, recipeId);
    revalidatePath("/peserta/rally/craft");
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}