import { Guardsman } from "index";
import {
    ApplicationCommandOptionBase,
    ChatInputCommandInteraction, Colors, EmbedBuilder,
    SlashCommandBooleanOption,
    SlashCommandStringOption,
    SlashCommandUserOption
} from "discord.js";
import { getServerConfigs } from '../../../../utils/prismaUtils.js';
import { permissionsCheck } from '../../../../utils/roleFunctions.js'

export default class ResponseCreateSubcommand implements ICommand {
    name: Lowercase<string> = "create";
    description: string = "Used to manually add responses to the database.";
    guardsman: Guardsman;
    options: ApplicationCommandOptionBase[] = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("The user to give the strike to.")
            .setRequired(true),
        new SlashCommandStringOption()
            .setName("reason")
            .setDescription("The reason for the strike.")
            .setRequired(true),
        new SlashCommandBooleanOption()
            .setName("started")
            .setDescription("The reason for the strike.")
            .setRequired(false),
        new SlashCommandBooleanOption()
            .setName("spontaneous")
            .setDescription("The reason for the strike.")
            .setRequired(false),
        new SlashCommandBooleanOption()
            .setName("cancelled")
            .setDescription("The reason for the strike.")
            .setRequired(false),
    ];

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

        let disabled = true
        if (disabled) {
            this.guardsman.bot.emit("incompleteCommand", interaction)
            return
        }
    }
}