'use server'

import { craftBigItem } from "@/features/rally/services/item";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { craftTheVault, buySmallItem } from "@/features/rally/services/item";
import { buySpecialTicket } from "@/features/rally/services/item";
import { giveItemsToUser } from "@/features/rally/services/user";

export async function buySpecialTicketAction(
  userId: string, 
  items: { id: string; type: 'big' | 'small'; amount: number }[]
) {
  try {
    await buySpecialTicket(userId, items);
    revalidatePath("/admin/rally/exchange");
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

export async function giveItemsAction(
  userId: string,
  items: { id: string; type: 'big' | 'small'; amount: number }[],
  eonix?: number
) {
  try {
    await giveItemsToUser(userId, items, eonix);
    revalidatePath("/admin/rally/posguard");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

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


export async function buyItemAction(userId: string, itemId: string) {
  try {
    await buySmallItem(userId, itemId);
    revalidatePath("/admin/rally"); // Sesuaikan path revalidate Anda
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}