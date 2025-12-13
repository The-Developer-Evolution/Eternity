'use server'

import { User } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { ActionResult } from "@/types/actionResult";


// get user with all trading details data
export async function getUserTradingById(userId: string): Promise<ActionResult<User>> {
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
                    rawItems: true,
                    craftItems: true,
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

    return {
      success: true,
      data: user,
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