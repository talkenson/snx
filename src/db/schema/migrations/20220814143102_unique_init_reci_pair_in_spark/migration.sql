/*
  Warnings:

  - A unique constraint covering the columns `[initiatorId,recipientId]` on the table `Spark` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Spark_initiatorId_recipientId_key" ON "Spark"("initiatorId", "recipientId");
