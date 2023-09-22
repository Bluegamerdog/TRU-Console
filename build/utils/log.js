import chalk from "chalk";
import moment from "moment";
export default class Logger {
    name;
    guardsman;
    constructor(name, guardsman) {
        this.name = name;
        this.guardsman = guardsman;
    }
    _base = async (type, ...args) => {
        console.log(`${chalk.gray("[")} ${chalk.blueBright(this.name)} ${chalk.gray(":")} ${type} ${chalk.gray("]")}` +
            `${chalk.gray("[")} ${chalk.greenBright(moment().format("hh:mm:ss"))} ${chalk.gray("]")}` +
            `: ${args.join(", ")}`);
    };
    info = async (...args) => {
        await this._base(chalk.blueBright("INFO"), ...args);
    };
    warn = async (...args) => {
        await this._base(chalk.yellowBright("WARN"), ...args);
    };
    error = async (...args) => {
        await this._base(chalk.redBright("ERROR"), ...args);
    };
    critical = async (...args) => {
        await this._base(chalk.red("CRITICAL"), ...args);
    };
    debug = async (...args) => {
        if (!this.guardsman.debug)
            return;
        await this._base(chalk.greenBright("DEBUG"), ...args);
    };
}
