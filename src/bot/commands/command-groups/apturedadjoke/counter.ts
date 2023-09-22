import { Guardsman } from "index";
import {
    ChatInputCommandInteraction,
} from "discord.js";

export default class aptureCounterSubcommand implements ICommand {
    name: Lowercase<string> = "counter";
    description: string = "Gets apture's current dad-joke count.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        try {
            // Fetch the existing counter record
            const counter = await this.guardsman.database.aptureJokeCounter.findFirst();

            if (counter) {
                await interaction.reply(`Aptures current dad-joke count is: ${counter.amount}`);
            } else {
                await interaction.reply("Aptures dad-joke count is currently not available.");
            }

        } catch (error) {
            console.error(error);
            await interaction.reply(`An error occurred while fetching the counter: ${error}`);
        }

    }
}
