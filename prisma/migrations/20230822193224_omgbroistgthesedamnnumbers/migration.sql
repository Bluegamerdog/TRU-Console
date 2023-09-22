/*
  Warnings:

  - The primary key for the `backupResponses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `responseRequestID` on the `backupResponses` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_backupResponses" (
    "responseRequestID" BIGINT NOT NULL PRIMARY KEY,
    "responderID" TEXT NOT NULL,
    "requestStatus" TEXT NOT NULL DEFAULT 'Pending',
    "timestamp" DATETIME NOT NULL,
    "revieweeID" TEXT NOT NULL DEFAULT 'Null'
);
INSERT INTO "new_backupResponses" ("requestStatus", "responderID", "responseRequestID", "revieweeID", "timestamp") SELECT "requestStatus", "responderID", "responseRequestID", "revieweeID", "timestamp" FROM "backupResponses";
DROP TABLE "backupResponses";
ALTER TABLE "new_backupResponses" RENAME TO "backupResponses";
CREATE UNIQUE INDEX "backupResponses_responseRequestID_key" ON "backupResponses"("responseRequestID");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
