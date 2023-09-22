import { Guardsman } from "index";
import {
    ApplicationCommandOptionBase,
    ChatInputCommandInteraction, Colors, EmbedBuilder,
    SlashCommandRoleOption
} from "discord.js";
import { PrismaClient } from '@prisma/client';
import { getServerConfigs } from '../../../../utils/prismaUtils.js';
import { permissionsCheck } from '../../../../utils/roleFunctions.js'

const prisma = new PrismaClient();

export default class BindRemoveSubcommand implements ICommand {
    name: Lowercase<string> = "remove";
    description: string = "Allows for the removal of an existing role bind.";
    guardsman: Guardsman;
    options: ApplicationCommandOptionBase[] = [
        new SlashCommandRoleOption()
            .setName("role")
            .setDescription("Role to remove.")
            .setRequired(true),
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
        const target = await interaction.guild.roles.fetch(serverConfigs?.commandRoleID)
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
        const guildRole = options.getRole("role", true);

        // Delete the existing role bind from the database
        const deleteResult = await prisma.verificationBinds.deleteMany({
            where: {
                guild_id: guild.id,
                role_id: guildRole.id,
            }
        });

        if (deleteResult.count > 0) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Console Database`)
                        .setDescription(`Successfully removed the role bind for <@&${guildRole.id}>.`)
                        .setColor(Colors.Green)
                        .setTimestamp()
                        .setFooter({ text: "Console Database" })
                ]
            });
        } else {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Console Database`)
                        .setDescription(`No existing role bind found for <@&${guildRole.id}>.`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Console Database" })
                ]
            });
        }
    }
}
