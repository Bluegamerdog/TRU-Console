import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Guardsman } from "index";

export default class TestCommand implements ICommand {
    name: Lowercase<string> = "shutdown";
    description: string = "Terminates the bot.";
    guardsman: Guardsman;
    authorizedUserIds: string[] = ["776226471575683082"];

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const member = interaction.member as GuildMember;

        if (this.authorizedUserIds.includes(member.id)) {
            try {
                await interaction.reply("Shutting down...");
                process.exit()
            } catch (error) {
                await interaction.reply(`ERROR: ${error}`);
            }

        } else {
            // Unauthorized user
            await interaction.reply("You do not have permission to use this command.");
        }
    }
}