import { SlashCommandStringOption } from "discord.js";
const cleanString = async (guardsman, string) => {
    string = await string;
    string = string.toString();
    const environment = guardsman.environment;
    const BLOCKED_VALUES = [
        environment.DISCORD_BOT_TOKEN,
        environment.ROBLOX_CLIENT_TOKEN,
        environment.ROBLOX_COOKIE,
        environment.DB_PASSWORD
    ];
    for (const value of BLOCKED_VALUES) {
        string = string.replace(value, "[Content Removed for Security Reasons.]");
    }
    string = string.replace(/`/g, "`" + String.fromCharCode(8203));
    string = string.replace(/@/g, "@" + String.fromCharCode(8203));
    return string;
};
export default class EvalCommand {
    name = "eval";
    description = "(DEVELOPER ONLY) Executes raw JavaScript.";
    guardsman;
    options = [
        new SlashCommandStringOption()
            .setName("code")
            .setDescription("The code to execute.")
            .setRequired(true)
    ];
    constructor(guardsman) {
        this.guardsman = guardsman;
    }
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });
        const code = interaction.options.getString("code", true);
        try {
            const evalReturn = eval(code);
            const cleanReturn = await cleanString(this.guardsman, evalReturn);
            await interaction.editReply({
                content: "Executed successfully.",
                files: [
                    {
                        attachment: Buffer.from(cleanReturn),
                        name: "result.js"
                    }
                ]
            });
        }
        catch (error) {
            await interaction.editReply({
                content: "Execution failed.",
                files: [
                    {
                        attachment: Buffer.from(await cleanString(this.guardsman, error)),
                        name: "result.js"
                    }
                ]
            });
        }
    }
}
