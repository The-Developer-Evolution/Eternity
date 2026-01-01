import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import { getAllBigItems } from "@/features/rally/services/item";
import { getServerSession } from "next-auth";
import CraftButton from "@/components/common/CraftButton";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import CardPanel from "@/components/ui/CardPanel";

export default async function Page() {
  const session = await getServerSession(authOptions);

  // Redirect jika tidak ada session atau user ID
  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const recipes = await getAllBigItems();

  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center">
        <BackgroundAssetsDesktop />
        <BackgroundAssetsMobile />
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-full top-0 left-0"></div>
        <CardPanel title="RALLY GAMES - CRAFTING" extraClass="">
          <h3 className="text-lg md:text-xl text-center text-white font-impact font-normal">
            Kalian dapat melakukan crafting Item Besar disini. Gunakan token dan material kalian dengan baik ya!
          </h3>
          {recipes.length === 0 ? (
            <p className="text-white">No crafting recipes available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {recipes.map((recipe) => (
                <div className="p-4 rounded-lg bg-black/50 backdrop-blur-lg border-white border-3 flex flex-col gap-4 justify-center items-center" key={recipe.id}>
                  <h2 className="text-xl font-impact text-white">{recipe.resultItem.name}</h2>
                  <div className="text-xl font-futura text-slate-300 text-center w-[80%]">
                    Required item:<br></br> {recipe.smallItem.name} x {recipe.quantity}
                  </div>
                  <CraftButton
                    userId={session.user.id}
                    recipeId={recipe.id}
                  />
                </div>
              ))}
            </div>
          )}
        </CardPanel>
      </div>
    </div>
  );
}