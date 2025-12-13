import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      nim: string
    } & DefaultSession["user"]
  }

  interface User {
    nim: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    nim: string
  }
}