/*
  Warnings:

  - You are about to drop the column `repoName` on the `Report` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Report" DROP COLUMN "repoName",
ADD COLUMN     "repoNames" TEXT[];
