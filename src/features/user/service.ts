'use server'

import { User } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { ActionResult } from "@/types/actionResult";
import { Role } from "@/generated/prisma/client";
//////////////////////
// GET FUNCTION
/////////////////////
export async function getAllUserWithAdmin(): Promise<ActionResult<User[]>> {
    try {
        const users = await prisma.user.findMany();
        return {
            success: true,
            data: users,
            message: `Fetched ${users.length} users successfully.`,
        };

    } catch (error) {
            console.log("Error fetching all users:", error);
            return {
                success: false,
                error: "Failed to fetch users",
            };
    }
}

export async function getAllUser(): Promise<ActionResult<User[]>> {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: Role.PARTICIPANT
      },
    });

    return {
      success: true,
      data: users,
      message: `Fetched ${users.length} non-admin users successfully.`,
    };
  } catch (error) {
    console.error("Error fetching non-admin users:", error);
    return {
      success: false,
      error: "Failed to fetch users",
    };
  }
}

// get user with its game data
export async function getUserById(userId: string): Promise<ActionResult<User>> {
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
            tradingData: true,
            rallyData:true
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



