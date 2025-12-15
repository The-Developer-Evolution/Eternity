-- CreateTable
CREATE TABLE "CraftRecipe" (
    "id" TEXT NOT NULL,
    "craftItemId" TEXT NOT NULL,
    "rawItemId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "CraftRecipe_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CraftRecipe" ADD CONSTRAINT "CraftRecipe_craftItemId_fkey" FOREIGN KEY ("craftItemId") REFERENCES "CraftItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftRecipe" ADD CONSTRAINT "CraftRecipe_rawItemId_fkey" FOREIGN KEY ("rawItemId") REFERENCES "RawItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
