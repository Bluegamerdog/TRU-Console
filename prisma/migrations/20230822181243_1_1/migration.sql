-- CreateTable
CREATE TABLE "operator" (
    "discord_id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "truRank" TEXT NOT NULL,
    "roblox_id" TEXT NOT NULL,
    "activeLog" BOOLEAN NOT NULL DEFAULT false,
    "activeLogID" TEXT NOT NULL DEFAULT 'NULL'
);

-- CreateTable
CREATE TABLE "quotas" (
    "rankName" TEXT NOT NULL PRIMARY KEY,
    "logRequirement" TEXT NOT NULL,
    "responseRequirement" TEXT NOT NULL,
    "quotaActive" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "quotaBlocks" (
    "blockNum" TEXT NOT NULL PRIMARY KEY,
    "unix_starttime" TEXT NOT NULL,
    "unix_endtime" TEXT NOT NULL,
    "blockActive" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "responseData" (
    "responseID" TEXT NOT NULL PRIMARY KEY,
    "responseType" TEXT NOT NULL,
    "timeStarted" TEXT NOT NULL,
    "timeEnded" TEXT NOT NULL,
    "started" BOOLEAN NOT NULL,
    "cancelled" BOOLEAN NOT NULL,
    "spontaneous" BOOLEAN NOT NULL,
    "trelloCardID" TEXT NOT NULL,
    "operativeDiscordID" TEXT,
    "operativeName" TEXT,
    CONSTRAINT "responseData_operativeDiscordID_fkey" FOREIGN KEY ("operativeDiscordID") REFERENCES "operator" ("discord_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ranks" (
    "rankName" TEXT NOT NULL,
    "discordRoleID" TEXT NOT NULL PRIMARY KEY,
    "RobloxRankID" TEXT NOT NULL,
    "guildID" TEXT NOT NULL DEFAULT 'Null'
);

-- CreateTable
CREATE TABLE "serverSetup" (
    "serverID" TEXT NOT NULL PRIMARY KEY,
    "responsePingRoleID" TEXT NOT NULL,
    "responseAnnounceChannelID" TEXT NOT NULL,
    "memberRoleID" TEXT NOT NULL,
    "hostRoleID" TEXT NOT NULL,
    "commandRoleID" TEXT NOT NULL,
    "developerRoleID" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "verificationBinds" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guild_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "role_data" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "pendingVerification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "discord_id" TEXT NOT NULL,
    "token" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "strikes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recieverID" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "giverID" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "backupResponses" (
    "responseRequestID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "responderID" TEXT NOT NULL,
    "requestStatus" TEXT NOT NULL DEFAULT 'Pending',
    "timestamp" DATETIME NOT NULL,
    "revieweeID" TEXT NOT NULL DEFAULT 'Null'
);

-- CreateIndex
CREATE UNIQUE INDEX "operator_discord_id_key" ON "operator"("discord_id");

-- CreateIndex
CREATE UNIQUE INDEX "operator_username_key" ON "operator"("username");

-- CreateIndex
CREATE UNIQUE INDEX "operator_roblox_id_key" ON "operator"("roblox_id");

-- CreateIndex
CREATE UNIQUE INDEX "quotas_rankName_key" ON "quotas"("rankName");

-- CreateIndex
CREATE UNIQUE INDEX "quotaBlocks_blockNum_key" ON "quotaBlocks"("blockNum");

-- CreateIndex
CREATE UNIQUE INDEX "responseData_responseID_key" ON "responseData"("responseID");

-- CreateIndex
CREATE UNIQUE INDEX "ranks_rankName_key" ON "ranks"("rankName");

-- CreateIndex
CREATE UNIQUE INDEX "ranks_discordRoleID_key" ON "ranks"("discordRoleID");

-- CreateIndex
CREATE UNIQUE INDEX "ranks_RobloxRankID_key" ON "ranks"("RobloxRankID");

-- CreateIndex
CREATE UNIQUE INDEX "serverSetup_serverID_key" ON "serverSetup"("serverID");

-- CreateIndex
CREATE UNIQUE INDEX "strikes_id_key" ON "strikes"("id");
