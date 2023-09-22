import express from "express";
import { readdir, lstat } from "fs/promises";
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
class API {
    guardsman;
    server;
    constructor(guardsman) {
        this.guardsman = guardsman;
        this.server = express();
        this.server.set('view engine', 'ejs');
        this.middleware.read()
            .then(() => { guardsman.log.info("Middleware read successfully."); })
            .then(this.routes.read)
            .then(() => { guardsman.log.info("Routes read successfully."); })
            .then(() => {
            this.server.get("/", (_, res) => {
                res.json({ success: true, status: "Console API online and ready." });
            });
        })
            .then(() => {
            this.server.listen(guardsman.environment.API_PORT);
        });
    }
    routes = {
        list: {},
        parseDirectory: async (path) => {
            const routeFiles = await readdir(path);
            for (let routeFile of routeFiles) {
                const dirStats = await lstat(`${path}/${routeFile}`);
                if (dirStats.isDirectory()) {
                    await this.routes.parseDirectory(`${path}/${routeFile}`);
                }
                else {
                    const routeFunction = ((await import(`.${path.replace(__dirname, "")}/${routeFile}`)).default).bind(null, this.guardsman);
                    routeFile = routeFile.replace(/\.[^/.]+$/, "");
                    const nameComponents = routeFile.split(".");
                    const method = nameComponents[nameComponents.length - 1];
                    const route = (`${path.replace(`${__dirname}/routes`, "")}/${routeFile}`).replace(`.${method}`, "");
                    switch (method) {
                        case "get":
                            this.server.get(route, routeFunction);
                            break;
                        case "post":
                            this.server.post(route, routeFunction);
                            break;
                        case "delete":
                            this.server.delete(route, routeFunction);
                            break;
                        case "patch":
                            this.server.patch(route, routeFunction);
                            break;
                    }
                }
            }
        },
        read: async () => {
            await this.routes.parseDirectory(`${__dirname}/routes`);
        }
    };
    middleware = {
        list: {},
        parseDirectory: async (path) => {
            const middlewareFiles = await readdir(path);
            for (let middlewareFile of middlewareFiles) {
                const dirStats = await lstat(`${path}/${middlewareFile}`);
                if (dirStats.isDirectory()) {
                    await this.routes.parseDirectory(`${path}/${middlewareFile}`);
                }
                else {
                    const middlewareFunction = ((await import(`.${path.replace(__dirname, "")}/${middlewareFile}`)).default).bind(null, this.guardsman);
                    this.server.use(middlewareFunction);
                }
            }
        },
        read: async () => {
            await this.middleware.parseDirectory(`${__dirname}/middleware`);
        }
    };
}
export default API;
