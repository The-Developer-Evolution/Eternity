-- CreateTable
CREATE TABLE "MapRecipe" (
    "id" TEXT NOT NULL,

    CONSTRAINT "MapRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapRecipeComponent" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "mapRecipeId" TEXT NOT NULL,
    "craftItemId" TEXT NOT NULL,

    CONSTRAINT "MapRecipeComponent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MapRecipeComponent" ADD CONSTRAINT "MapRecipeComponent_mapRecipeId_fkey" FOREIGN KEY ("mapRecipeId") REFERENCES "MapRecipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapRecipeComponent" ADD CONSTRAINT "MapRecipeComponent_craftItemId_fkey" FOREIGN KEY ("craftItemId") REFERENCES "CraftItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
