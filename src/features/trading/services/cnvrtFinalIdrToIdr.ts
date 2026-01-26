"use server";


import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const cnvrtFinalIdrToIdr = async () => {
    try {
        const tradingDataList = await prisma.tradingData.findMany({
            where: {
                finalIDR: {
                    not: null,
                },
            },
        });

        const updates = tradingDataList.map((data) => {
            const finalIdrVal = data.finalIDR ? BigInt(data.finalIDR.split('.')[0]) : BigInt(0); // Handle potential decimals by truncating
            
             // Skip if no value to transfer
            if (finalIdrVal === BigInt(0)) return null;

            return prisma.tradingData.update({
                where: { id: data.id },
                data: {
                    idr: finalIdrVal,
                    finalIDR: "0",
                },
            });
        }).filter(Boolean); // Remove nulls

        if (updates.length > 0) {
            // @ts-expect-error: Transaction type mismatch with complex union types
            await prisma.$transaction(updates);
        }

        revalidatePath("/admin/trading/cnvrtFinalIdrToIdr");
        return { success: true, message: `Successfully converted ${updates.length} records.` };
    } catch (error) {
        console.error("Error converting Final IDR to IDR:", error);
        return { success: false, message: "Failed to convert Final IDR to IDR." };
    }
};
