"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import { getAllBigItems, getMyInventory } from "@/features/rally/services/item";
import CraftButton from "@/components/common/CraftButton";
import CardPanel from "@/components/ui/CardPanel";
import ModalTriggerButton from "@/components/common/ModalTriggerButton";
import InventoryModal from "@/components/ui/InventoryModal";

// Define types based on your Prisma schema
interface SmallItem {
  id: string;
  name: string;
  price: number;
  show_in_inventory: boolean;
}

interface ResultItem {
  id: string;
  name: string;
}

interface Recipe {
  id: string;
  result_item_id: string;
  small_item_id: string;
  quantity: number;
  resultItem: ResultItem;
  smallItem: SmallItem;
}

interface Material {
  name: string;
  quantity: number;
}

interface GroupedRecipe {
  resultItem: ResultItem;
  materials: Material[];
}

interface PageProps {
  recipes: Recipe[];
  inventory: {
    big_items: Array<{ id: string; big_item_id: string; amount: number }>;
    small_items: Array<{ id: string; small_item_id: string; amount: number }>;
  };
  userId: string;
}

export default function CraftPageClient({ recipes, inventory, userId }: PageProps) {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  // Gabungkan recipe berdasarkan resultItem.id
  const groupedRecipes = recipes.reduce<Record<string, GroupedRecipe>>((acc, recipe) => {
    const key = recipe.resultItem.id;
    if (!acc[key]) {
      acc[key] = {
        resultItem: recipe.resultItem,
        materials: [],
      };
    }
    acc[key].materials.push({
      name: recipe.smallItem.name,
      quantity: recipe.quantity,
    });
    return acc;
  }, {});

  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center">
        <BackgroundAssetsDesktop />
        <BackgroundAssetsMobile />
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-full top-0 left-0"></div>
        
        <CardPanel title="RALLY GAMES - CRAFTING" extraClass="">
          <div className="flex flex-col gap-4 justify-between items-center">
            <h3 className="text-lg md:text-xl text-center text-white font-impact font-normal flex-1">
              CRAFT BIG ITEM HERE.
            </h3>
            <h4 className="text-md md:text-lg text-center text-white font-impact font-light flex-1">
              USE YOUR TOKEN & MATERIALS WISELY!
            </h4>
            
            {/* Button untuk buka modal inventory */}
            <ModalTriggerButton 
              onClick={() => setIsInventoryOpen(true)}
              icon={<Package size={18} />}
            >
              MY INVENTORY
            </ModalTriggerButton>
          </div>
          
          {recipes.length === 0 ? (
            <p className="text-white">No crafting recipes available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {Object.values(groupedRecipes).map((item) => (
                <div className="p-4 rounded-lg bg-black/50 backdrop-blur-lg border-white border-3 flex flex-col gap-4 justify-center items-center" key={item.resultItem.id}>
                  <h2 className="text-xl font-impact text-white">{item.resultItem.name}</h2>
                  <div className="text-xl font-futura text-slate-300 text-center w-[80%]">
                    Required items:<br />
                    {item.materials.map((mat, idx) => (
                      <div key={idx}>{mat.name} x {mat.quantity}</div>
                    ))}
                  </div>
                  <CraftButton
                    userId={userId}
                    recipeId={item.resultItem.id}
                  />
                </div>
              ))}
            </div>
          )}
        </CardPanel>
      </div>

      {/* Modal inventory di luar CardPanel */}
      <InventoryModal 
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={inventory}
      />
    </div>
  );
}