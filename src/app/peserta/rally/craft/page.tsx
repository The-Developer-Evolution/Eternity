import { getAllBigItems, getMyInventory } from "@/features/rally/services/item";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import CraftPageClient from "@/components/ui/PesertaCraftPageClient";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const recipes = await getAllBigItems();
  const inventory = await getMyInventory(session.user.id);

  return (
    <CraftPageClient 
      recipes={recipes}
      inventory={inventory}
      userId={session.user.id}
    />
  );
}