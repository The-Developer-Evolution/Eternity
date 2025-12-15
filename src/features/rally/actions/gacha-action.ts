'use server'

import { gachaItem } from "@/features/rally/services/item";
import { revalidatePath } from "next/cache";

export async function gachaItemAction(userId: string) {
  try {
    const item = await gachaItem(userId);
    revalidatePath("/admin/rally/exchange");
    return { 
      success: true,
      item: {
        id: item.id,
        name: item.name
      }
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}