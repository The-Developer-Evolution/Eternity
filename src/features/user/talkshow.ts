"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateTalkshowPoints(userId: string, amount: number) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        talkshowPoints: {
          increment: amount,
        },
      },
    });

    revalidatePath("/");
    
    return { success: true }; 
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update points" };
  }
}