"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function register(
  name: string,
  email: string,
  password: string,
  nim: string
) {
  if (!name || !email || !password || !nim) {
    throw new Error("Missing fields");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
        name,
        email,
        password: hashedPassword,
        nim,
    },
  });

  return {
    id: user.id,
    email: user.email,
  };
}