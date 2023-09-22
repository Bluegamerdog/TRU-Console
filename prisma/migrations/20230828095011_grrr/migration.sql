-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_strikes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recieverID" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "giverID" TEXT NOT NULL
);
INSERT INTO "new_strikes" ("giverID", "id", "reason", "recieverID", "timestamp") SELECT "giverID", "id", "reason", "recieverID", "timestamp" FROM "strikes";
DROP TABLE "strikes";
ALTER TABLE "new_strikes" RENAME TO "strikes";
CREATE UNIQUE INDEX "strikes_id_key" ON "strikes"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
