"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function register(
  name: string,
  password: string
) {
  if (!name || !password) {
    throw new Error("Missing fields");
  }

  const existingUser = await prisma.user.findUnique({
    where: { name },
  });

  if (existingUser) {
    throw new Error("Username already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
        name,
        password: hashedPassword,
    },
  });

  return {
    id: user.id,
    name: user.name,
  };
}