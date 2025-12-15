'use server'

import { craftBigItem } from "@/features/rally/services/item";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { craftTheVault } from "@/features/rally/services/item";

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
export async function craftVaultAction(userId: string) {
  try {
    const result = await craftTheVault(userId);
    
    // Get updated vault count
    const updatedData = await prisma.rallyData.findUnique({
      where: { user_id: userId },
      select: { vault: true }
    });
    
    revalidatePath("/admin/rally");
    return { 
      success: true,
      newVaultCount: updatedData?.vault || 0
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}