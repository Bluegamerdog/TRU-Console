import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandRoleOption, ApplicationCommandOptionBase, SlashCommandUserOption } from "discord.js";
import { Guardsman } from "index";
import Noblox from "noblox.js";
import axios from "axios";
import { getHighestRole, } from "../../../../utils/roleFunctions.js"
import { getAbbreviation, changeNickname } from "../../../../utils/miscFunctions.js"
import { getServerConfigs } from '../../../../utils/prismaUtils.js';
import { permissionsCheck, updateRoles } from '../../../../utils/roleFunctions.js'

export default class OperatorUpdateSubcommand implements ICommand {
    name: Lowercase<string> = "update";
    description: string = "Allows users to update their Discord roles.";
    guardsman: Guardsman;
    options: ApplicationCommandOptionBase[] = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("Defaults to yourself. Only TRU Leadership may update others. [Noworkie atm]")
            .setRequired(false),
    ]

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {

        await interaction.deferReply({ ephemeral: false })
        const guild = interaction.guild;
        let user = await interaction.options.getUser("user", false);
        if (!user) {
            user = interaction.user
        }
        const serverConfigs = await getServerConfigs(guild.id)
        if (!serverConfigs) {
            this.guardsman.bot.emit("missingServerConfigs", interaction)
            return
        }
        const CommandRole = await interaction.guild.roles.fetch(serverConfigs.commandRoleID)
        if (!CommandRole) {
            this.guardsman.bot.emit("invalidServerConfigs", interaction)
            return
        }


        else if (user) {
            if (user.id !== interaction.user.id) {
                const permission = permissionsCheck("rp", interaction.member, CommandRole, interaction)
                if (!permission) {
                    await interaction.editReply({
                        components: [],

                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`Permissions Error!`)
                                .setDescription(
                                    "Only TRU Leadership and above may update other users."
                                )
                                .setColor(Colors.DarkRed)
                                .setTimestamp()
                                .setFooter({
                                    text: "Console Permissions"
                                }),
                        ],
                    });
                    return
                }
            }
        }
        const member = await interaction.guild.members.fetch(user)

        const existingUserData = await this.guardsman.database.operator.findUnique({
            where: {
                discord_id: member.id
            }
        });

        if (!existingUserData) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Console Verification")
                        .setDescription("You must be verified with TRU Console (`/verify`) to update your roles!")
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Console Verification" })
                ]
            })

            return;
        }

        const verificationBinds = await this.guardsman.database.verificationBinds.findMany({
            where: {
                guild_id: guild.id
            }
        });


        const results = await updateRoles(this.guardsman, member, existingUserData, verificationBinds, CommandRole, guild)

        if (results.isAllowed === false) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Permission Error!")
                        .setDescription("I am unable to update roles for TRU Leadership, sorry!")
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Console Permissions" })
                ]
            })

            return;

        }

        const embedBuilder = new EmbedBuilder()
            .setTitle("Console Verification")
            .setDescription(`Role update complete. See details below.`)
            .setColor(results.rolesChanged ? (results.errors.length > 0 ? Colors.Orange : Colors.Green) : Colors.DarkRed)
            .setTimestamp()
            .setFooter({ text: "Console Verification" });

        if (results.rolesChanged) {
            if (results.allowedRoles.length > 0) {
                const addedRoleNames = results.allowedRoles.map(role => `<@&${role.role_id}>`).join("\n • ");
                embedBuilder.addFields({ name: "Added Roles", value: `• ${addedRoleNames}` });
            }

            if (results.removedRoles.length > 0) {
                const removedRoleNames = results.removedRoles.map(role => `<@&${role.role_id}>`).join("\n • ");
                embedBuilder.addFields({ name: "Removed Roles", value: `• ${removedRoleNames}` });
            }
        } else {
            embedBuilder.setDescription("No changes were made. User is up to date.");
        }

        if (results.errors.length > 0) {
            embedBuilder.addFields({ name: "Errors", value: results.errors.join("\n") });
        }

        await interaction.editReply({
            embeds: [embedBuilder],
        });
    }
}