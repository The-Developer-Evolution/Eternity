'use server'

import { payPosPrice } from "@/features/rally/services/pos";
import { revalidatePath } from "next/cache";

export async function buyPosAccessAction(
  userId: string, 
  posName: string, 
  zoneId: string
) {
  try {
    const result = await payPosPrice(posName, zoneId, userId);
    
    if (!result) {
      return { 
        success: false, 
        error: "POS not found or no active period" 
      };
    }
    
    revalidatePath("/admin/rally/pos");
    return { 
      success: true, 
      data: {
        posName: result.name,
        eonixCost: result.eonix_cost,
        zoneName: result.rally_zone?.name
      }
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}