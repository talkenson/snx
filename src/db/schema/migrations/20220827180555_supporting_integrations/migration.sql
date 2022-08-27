/*
  Warnings:

  - A unique constraint covering the columns `[origin,externalId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[origin,email]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AccountOrigin" AS ENUM ('Local', 'VK');

-- DropIndex
DROP INDEX "Account_email_key";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "externalId" INTEGER,
ADD COLUMN     "origin" "AccountOrigin" NOT NULL DEFAULT 'Local',
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Account_origin_externalId_key" ON "Account"("origin", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_origin_email_key" ON "Account"("origin", "email");
