import { ChatInputCommandInteraction } from "discord.js";
import { Guardsman } from "index";

export default class TestCommand implements ICommand {
    name: Lowercase<string> = "ping";
    description: string = "See if the bot response...";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.reply("Pong! 🏓");
    }
}