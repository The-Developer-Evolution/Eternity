import { Prisma } from "@/generated/prisma/client";

export function handlePrismaError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        const target = Array.isArray(error.meta?.target)
          ? error.meta.target.join("\n")
          : "field";

        return `The ${target} you entered already exists.`;
      }

      case "P2003":
        return "This action failed because it references data that does not exist.";

      case "P2012":
        return "A required field is missing. Please fill out all required fields.";

      case "P2000":
        return "One of the values is too long. Please shorten your input.";

      case "P2025":
        return "The item you are trying to access does not exist.";

      default:
        return "A database error occurred. Please try again.";
    }
  }

  // Prisma validation error (NOT zod validation)
  if (error instanceof Prisma.PrismaClientValidationError) {
    return "Invalid data was sent to the server. Please check your input.";
  }

  // Fallback for any non-Prisma error
  return "An unexpected server error occurred. Please try again.";
}
