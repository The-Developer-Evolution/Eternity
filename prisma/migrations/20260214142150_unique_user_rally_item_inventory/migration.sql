/*
  Warnings:

  - A unique constraint covering the columns `[user_id,big_item_id]` on the table `UserBigItemInventory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,small_item_id]` on the table `UserSmallItemInventory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserBigItemInventory_user_id_big_item_id_key" ON "UserBigItemInventory"("user_id", "big_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserSmallItemInventory_user_id_small_item_id_key" ON "UserSmallItemInventory"("user_id", "small_item_id");
