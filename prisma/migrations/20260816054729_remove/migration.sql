/*
  Warnings:

  - You are about to drop the column `token` on the `invitations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token_hash]` on the table `invitations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token_hash` to the `invitations` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "invitations_token_idx";

-- DropIndex
DROP INDEX "invitations_token_key";

-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "token",
ADD COLUMN     "token_hash" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_hash_key" ON "invitations"("token_hash");
