import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  // Configure webpack to externalize Prisma to fix __internal error during build
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
