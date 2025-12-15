'use server'

import { minusPoint, neutralizeMinusPoint } from "@/features/rally/services/user";
import { revalidatePath } from "next/cache";

export async function minusPointAction(userId: string, points: number) {
  try {
    await minusPoint(userId, points);
    revalidatePath("/admin/rally/minus-point");
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

export async function neutralizePointAction(userId: string, points: number) {
  try {
    await neutralizeMinusPoint(userId, points);
    revalidatePath("/admin/rally/minus-point");
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}