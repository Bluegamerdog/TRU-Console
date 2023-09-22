import { Guardsman } from "index";
import {
    ApplicationCommandOptionBase,
    ChatInputCommandInteraction, Colors, EmbedBuilder,
    Role,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandNumberOption,
    SlashCommandRoleOption
} from "discord.js";
import { getServerConfigs } from '../../../../utils/prismaUtils.js';
import { hasRole, permissionsCheck } from '../../../../utils/roleFunctions.js'

export default class aptureAddSubcommand implements ICommand {
    name: Lowercase<string> = "add";
    description: string = "Adds a specified amount to the counter.";
    guardsman: Guardsman;
    options: ApplicationCommandOptionBase[] = [
        new SlashCommandIntegerOption()
            .setName("amount")
            .setDescription("How many do you want to add to the counter? [Default is 1]")
            .setRequired(false)
    ]

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {

        const guild = interaction.guild;

        const serverConfigs = await getServerConfigs(guild.id)
        if (!serverConfigs) {
            this.guardsman.bot.emit("missingServerConfigs", interaction)
            return
        }
        const target = await interaction.guild.roles.fetch(serverConfigs.commandRoleID)
        if (!target) {
            this.guardsman.bot.emit("invalidServerConfigs", interaction)
            return
        }
        const permission = permissionsCheck("rp", interaction.member, target, interaction)
        if (!permission) {
            this.guardsman.bot.emit("missingPermissions", interaction);
            return
        }


        const options = interaction.options;

        let amount = options.getInteger("amount", false);
        if (!amount) {
            amount = 1
        }


        try {
            // Fetch the existing counter record
            const counter = await this.guardsman.database.aptureJokeCounter.findFirst();

            if (counter) {
                // If a record exists, increment the amount
                await this.guardsman.database.aptureJokeCounter.update({
                    where: { id: counter.id },
                    data: { amount: counter.amount + amount }
                });

            } else {
                // If no record exists, create a new one
                await this.guardsman.database.aptureJokeCounter.create({
                    data: { amount: amount }
                });
            }

            const updatedCounter = await this.guardsman.database.aptureJokeCounter.findFirst();

            await interaction.reply(`Successfully added ${amount} to the counter.\n> New Total: ${updatedCounter?.amount}`);

        } catch (error) {
            console.error(error);
            await interaction.reply(`An error occurred while updating the counter: ${error}`);
        }
    }
}