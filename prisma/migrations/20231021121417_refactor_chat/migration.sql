/*
  Warnings:

  - You are about to drop the column `lastMessageId` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the `_ChatRoomToUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[latestMessageId]` on the table `ChatRoom` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[iosToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `_ChatRoomToUser` DROP FOREIGN KEY `_ChatRoomToUser_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ChatRoomToUser` DROP FOREIGN KEY `_ChatRoomToUser_B_fkey`;

-- DropIndex
DROP INDEX `Message_chatRoomId_fkey` ON `Message`;

-- DropIndex
DROP INDEX `Message_senderId_fkey` ON `Message`;

-- AlterTable
ALTER TABLE `ChatRoom` DROP COLUMN `lastMessageId`,
    ADD COLUMN `latestMessageId` INTEGER NULL;

-- DropTable
DROP TABLE `_ChatRoomToUser`;

-- CreateTable
CREATE TABLE `ChatRoomUser` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `chatRoomId` INTEGER NOT NULL,
    `hasSeenLatestMessage` BOOLEAN NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `ChatRoom_latestMessageId_key` ON `ChatRoom`(`latestMessageId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_iosToken_key` ON `User`(`iosToken`);

-- AddForeignKey
ALTER TABLE `ChatRoom` ADD CONSTRAINT `ChatRoom_latestMessageId_fkey` FOREIGN KEY (`latestMessageId`) REFERENCES `Message`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ChatRoomUser` ADD CONSTRAINT `ChatRoomUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatRoomUser` ADD CONSTRAINT `ChatRoomUser_chatRoomId_fkey` FOREIGN KEY (`chatRoomId`) REFERENCES `ChatRoom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_chatRoomId_fkey` FOREIGN KEY (`chatRoomId`) REFERENCES `ChatRoom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
