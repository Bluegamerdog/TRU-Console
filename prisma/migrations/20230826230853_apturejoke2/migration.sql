/*
  Warnings:

  - You are about to alter the column `amount` on the `aptureJokeCounter` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_aptureJokeCounter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" INTEGER NOT NULL
);
INSERT INTO "new_aptureJokeCounter" ("amount", "id") SELECT "amount", "id" FROM "aptureJokeCounter";
DROP TABLE "aptureJokeCounter";
ALTER TABLE "new_aptureJokeCounter" RENAME TO "aptureJokeCounter";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
