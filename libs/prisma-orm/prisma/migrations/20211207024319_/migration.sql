-- DropForeignKey
ALTER TABLE `BroadcasterContacts` DROP FOREIGN KEY `BroadcasterContacts_broadcasterId_fkey`;

-- DropIndex
DROP INDEX `BroadcasterContacts_broadcasterId_fkey` ON `BroadcasterContacts`;

-- AlterTable
ALTER TABLE `BroadcasterContacts` MODIFY `broadcasterId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `BroadcasterContacts` ADD CONSTRAINT `BroadcasterContacts_broadcasterId_fkey` FOREIGN KEY (`broadcasterId`) REFERENCES `Broadcaster`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
