/*
  Warnings:

  - You are about to drop the column `latestMessageId` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the `ChatRoomUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ChatRoomUser` DROP FOREIGN KEY `ChatRoomUser_chatRoomId_fkey`;

-- DropForeignKey
ALTER TABLE `ChatRoomUser` DROP FOREIGN KEY `ChatRoomUser_userId_fkey`;

-- AlterTable
ALTER TABLE `ChatRoom` DROP COLUMN `latestMessageId`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- DropTable
DROP TABLE `ChatRoomUser`;

-- CreateTable
CREATE TABLE `UserChatRoom` (
    `userId` INTEGER NOT NULL,
    `chatRoomId` INTEGER NOT NULL,
    `lastCheck` DATETIME(3) NULL,
    `unreadMessageCount` INTEGER NOT NULL DEFAULT 0,
    `lastReadMessageId` INTEGER NULL,

    PRIMARY KEY (`userId`, `chatRoomId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserChatRoom` ADD CONSTRAINT `UserChatRoom_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserChatRoom` ADD CONSTRAINT `UserChatRoom_chatRoomId_fkey` FOREIGN KEY (`chatRoomId`) REFERENCES `ChatRoom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
