'use server'

import { User } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { ActionResult } from "@/types/actionResult";
import { UserTrading } from "./types";


// get user with all trading details data
export async function getUserTradingById(userId: string): Promise<ActionResult<UserTrading>> {
  if (!userId) {
    return {
      success: false,
      error: "User ID is required",
    };
  }

  try {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { 
            tradingData: {
                include:{
                    rawUserAmounts: true,
                    craftUserAmounts: true,
                    balanceTradingLogs: true
                }
            },
        },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    if(!user.tradingData){
      return{
        success:false,
        error: "Unconfigured User"
      }
    }

    return {
      success: true,
      data: user as UserTrading,
      message: "User fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return {
      success: false,
      error: "Failed to fetch user",
    };
  }
}