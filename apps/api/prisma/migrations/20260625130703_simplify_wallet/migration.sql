/*
  Warnings:

  - You are about to drop the column `balance` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Wallet` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Wallet_userId_idx";

-- DropIndex
DROP INDEX "Wallet_userId_type_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "balance";

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "type";

-- DropEnum
DROP TYPE "WalletType";

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");
