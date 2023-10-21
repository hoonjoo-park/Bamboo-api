/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `ChatRoom` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_chatRoomId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_senderId_fkey`;

-- AlterTable
ALTER TABLE `ChatRoom` DROP COLUMN `updatedAt`,
    ADD COLUMN `lastMessageId` INTEGER NULL;
