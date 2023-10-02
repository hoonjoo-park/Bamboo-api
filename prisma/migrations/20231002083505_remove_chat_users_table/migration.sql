/*
  Warnings:

  - You are about to drop the `ChatRoomUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ChatRoomUser` DROP FOREIGN KEY `ChatRoomUser_chatRoomId_fkey`;

-- DropForeignKey
ALTER TABLE `ChatRoomUser` DROP FOREIGN KEY `ChatRoomUser_userId_fkey`;

-- AlterTable
ALTER TABLE `ChatRoom` ADD COLUMN `unReadCount` INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE `ChatRoomUser`;

-- CreateTable
CREATE TABLE `_ChatRoomToUser` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ChatRoomToUser_AB_unique`(`A`, `B`),
    INDEX `_ChatRoomToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ChatRoomToUser` ADD CONSTRAINT `_ChatRoomToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `ChatRoom`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ChatRoomToUser` ADD CONSTRAINT `_ChatRoomToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
