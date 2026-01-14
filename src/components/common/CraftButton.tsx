'use client'

import { craftItemAction } from "@/features/rally/actions/craft-item-action";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface CraftButtonProps {
  userId: string;
  recipeId: string;
}

export default function CraftButton({ userId, recipeId }: CraftButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCraft = async () => {
    if (!userId) {
      toast.error("You must select a user to craft items for.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await craftItemAction(userId, recipeId);

      if (result.success) {
        toast.success("Crafting successful!");
        router.refresh();
      } else {
        toast.error("Crafting failed: " + result.error);
      }
    } catch (error) {
      toast.error("Crafting failed: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCraft}
      disabled={isLoading}
      className="justify-center border-[#3E344A] border-3 rounded-lg px-4 py-2 text-lg md:text-2xl bg-[#78CCEE] text-[#3E344A] font-impact flex items-center gap-4 hover:bg-[#5AA8D6] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? "Crafting..." : "Craft"}
    </button>
  );
}