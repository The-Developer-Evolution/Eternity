import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import { getAllBigItems } from "@/features/rally/services/item";
import { getServerSession } from "next-auth";
import CraftButton from "@/components/common/CraftButton";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

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
        <div className="relative z-10 my-[10%] p-12 rounded-lg bg-gradient-to-b from-[#79CCEE]/40 to-[#1400CC]/40 backdrop-blur-md shadow-lg w-[80%] border-[#684095] border-3 flex flex-col justify-center items-center gap-8 font-futura">
          <h1 className="text-3xl md:text-5xl text-center text-white font-impact">Crafting</h1>
          <h3 className="text-lg md:text-xl text-center text-white font-impact">
            Kalian dapat melakukan crafting Item Besar disini. Gunakan token dan material kalian dengan baik ya!
          </h3>
          {recipes.length === 0 ? (
            <p className="text-white">No crafting recipes available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {recipes.map((recipe) => (
                <div className="p-4 rounded-lg bg-[#23328C]/80 backdrop-blur-lg border-white border-3 flex flex-col gap-4 justify-center items-center" key={recipe.id}>
                  <h2 className="text-xl font-impact text-white">{recipe.resultItem.name}</h2>
                  <div className="text-xl font-futura text-slate-300">
                    Required item: {recipe.smallItem.name} x {recipe.quantity}
                  </div>
                  <CraftButton 
                    userId={session.user.id}
                    recipeId={recipe.id}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}