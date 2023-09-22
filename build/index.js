import { PrismaClient } from '@prisma/client';
import Bot from "./bot/index.js";
import logger from "./utils/log.js";
import { config } from "dotenv";
import Noblox from "noblox.js";
import { exec } from 'child_process';
import API from "./api/index.js";
export var GuardsmanState;
(function (GuardsmanState) {
    GuardsmanState[GuardsmanState["OFFLINE"] = 0] = "OFFLINE";
    GuardsmanState[GuardsmanState["STARTING"] = 1] = "STARTING";
    GuardsmanState[GuardsmanState["ONLINE"] = 2] = "ONLINE";
    GuardsmanState[GuardsmanState["STOPPING"] = 3] = "STOPPING";
})(GuardsmanState || (GuardsmanState = {}));
class GuardsmanObject {
    state = GuardsmanState.OFFLINE;
    log;
    debug = process.argv.includes("--debug");
    environment = config().parsed || {};
    database;
    roblox;
    api;
    bot;
    constructor() {
        this.log = new logger("Console", this);
        this.log.info("Initializing Console...");
        this.state = GuardsmanState.STARTING;
        this.log.debug("Connecting to database...");
        this.database = new PrismaClient();
        this.log.debug("Connecting to ROBLOX API...");
        this.roblox = Noblox;
        this.roblox.setCookie(this.environment.ROBLOX_COOKIE);
        //this.log.debug("Running database migrations...");
        //this.runMigrations();
        this.log.info("Initializing API...");
        this.api = new API(this);
        this.log.info("Initializing discord bot...");
        this.bot = new Bot(this);
    }
    async runMigrations() {
        try {
            await exec('npx prisma migrate save --name initial --experimental');
            await exec('npx prisma migrate up --experimental');
        }
        catch (error) {
            this.log.error('Error running migrations:', error);
            throw error;
        }
    }
}
const Guardsman = new GuardsmanObject();
export default Guardsman;
