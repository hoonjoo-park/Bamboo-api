/*
  Warnings:

  - The primary key for the `ChatRoomUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `ChatRoomUser` table. All the data in the column will be lost.
  - Added the required column `id` to the `ChatRoomUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ChatRoomUser` DROP PRIMARY KEY,
    DROP COLUMN `_id`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);
