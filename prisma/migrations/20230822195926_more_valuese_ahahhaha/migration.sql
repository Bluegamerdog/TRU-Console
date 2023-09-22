-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_backupResponses" (
    "responseRequestID" BIGINT NOT NULL PRIMARY KEY,
    "responderID" TEXT NOT NULL,
    "requestStatus" TEXT NOT NULL DEFAULT 'Pending',
    "timestamp" TEXT NOT NULL,
    "revieweeID" TEXT NOT NULL DEFAULT 'Null'
);
INSERT INTO "new_backupResponses" ("requestStatus", "responderID", "responseRequestID", "revieweeID", "timestamp") SELECT "requestStatus", "responderID", "responseRequestID", "revieweeID", "timestamp" FROM "backupResponses";
DROP TABLE "backupResponses";
ALTER TABLE "new_backupResponses" RENAME TO "backupResponses";
CREATE UNIQUE INDEX "backupResponses_responseRequestID_key" ON "backupResponses"("responseRequestID");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
