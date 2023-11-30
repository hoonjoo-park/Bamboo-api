/*
  Warnings:

  - You are about to drop the column `hasSeenLatestMessage` on the `ChatRoomUser` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `ChatRoom` DROP FOREIGN KEY `ChatRoom_latestMessageId_fkey`;

-- AlterTable
ALTER TABLE `ChatRoomUser` DROP COLUMN `hasSeenLatestMessage`,
    ADD COLUMN `lastCheck` DATETIME(3) NULL;
