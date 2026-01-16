'use server'

import { addEonix, minusEonix } from "@/features/rally/services/user";
import { revalidatePath } from "next/cache";

export async function addEonixAction(userId: string, amount: number) {
  try {
    await addEonix(userId, amount);
    revalidatePath("/admin/rally/eonix");
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

export async function subtractEonixAction(userId: string, amount: number) {
  try {
    await minusEonix(userId, amount);
    revalidatePath("/admin/rally/eonix");
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
