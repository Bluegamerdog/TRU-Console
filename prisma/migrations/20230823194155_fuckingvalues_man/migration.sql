/*
  Warnings:

  - The primary key for the `quotaBlocks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `blockNum` on the `quotaBlocks` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `logRequirement` on the `quotas` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `responseRequirement` on the `quotas` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_quotaBlocks" (
    "blockNum" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "unix_starttime" TEXT NOT NULL,
    "unix_endtime" TEXT NOT NULL,
    "blockActive" BOOLEAN NOT NULL
);
INSERT INTO "new_quotaBlocks" ("blockActive", "blockNum", "unix_endtime", "unix_starttime") SELECT "blockActive", "blockNum", "unix_endtime", "unix_starttime" FROM "quotaBlocks";
DROP TABLE "quotaBlocks";
ALTER TABLE "new_quotaBlocks" RENAME TO "quotaBlocks";
CREATE UNIQUE INDEX "quotaBlocks_blockNum_key" ON "quotaBlocks"("blockNum");
CREATE TABLE "new_quotas" (
    "rankName" TEXT NOT NULL PRIMARY KEY,
    "logRequirement" INTEGER NOT NULL,
    "responseRequirement" INTEGER NOT NULL,
    "quotaActive" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_quotas" ("logRequirement", "quotaActive", "rankName", "responseRequirement") SELECT "logRequirement", "quotaActive", "rankName", "responseRequirement" FROM "quotas";
DROP TABLE "quotas";
ALTER TABLE "new_quotas" RENAME TO "quotas";
CREATE UNIQUE INDEX "quotas_rankName_key" ON "quotas"("rankName");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
