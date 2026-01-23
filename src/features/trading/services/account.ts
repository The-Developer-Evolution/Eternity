'use server'

import { ActionResult } from "@/types/actionResult";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function createPlayerAccount(name: string, password: string): Promise<ActionResult<void>> {
    if (!name || !password) {
        return { success: false, error: "Name and password are required." };
    }

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { name }
        });

        if (existingUser) {
            return { success: false, error: "Username is already registered." };
        }

        // Create user using the requested upsert pattern
        // Although we checked existence, using upsert as requested ensuring we handle the "pattern" requirement.
        // Since we checked existence and returned error, this upsert will effectively act as a create in this flow.
        await prisma.user.upsert({
            where: { name },
            update: {}, // No op if exists (though we blocked it above)
            create: {
                name,
                password: await bcrypt.hash(password, 10),
                tradingData: {
                    create: {
                        eternites: 10000,
                        idr: -100000000000
                    },
                },
            },
        });

        return { success: true, message: "Account created successfully." };

    } catch (error) {
        console.error("Error creating account:", error);
        return { success: false, error: "Failed to create account." };
    }
}
