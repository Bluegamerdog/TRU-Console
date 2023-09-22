import { Guardsman } from "index";
import {
    ApplicationCommandOptionBase,
    ChatInputCommandInteraction, Colors, EmbedBuilder,
    SlashCommandBooleanOption,
    SlashCommandStringOption,
    SlashCommandUserOption, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandAttachmentOption
} from "discord.js";
import { getServerConfigs } from '../../../../utils/prismaUtils.js';
import { permissionsCheck } from '../../../../utils/roleFunctions.js'

export default class brLogSubCommand implements ICommand {
    name: Lowercase<string> = "log";
    description: string = "Operators can use this to log when they've responded to a TRU backup request.";
    guardsman: Guardsman;
    options: ApplicationCommandOptionBase[] = [
        new SlashCommandStringOption()
            .setName("patrol-proof")
            .setDescription("A message link to you doing /patrols show.")
            .setRequired(true),
        new SlashCommandStringOption()
            .setName("backup-request-message")
            .setDescription("A message link to the backup request in #on-duty.")
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
        const target = await interaction.guild.roles.fetch(serverConfigs.memberRoleID)
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
        const patrol_link = options.getString("patrol-proof", true)
        const backup_link = options.getString("backup-request-message", true)
        const username = interaction.member.nickname

        let disabled = false
        if (disabled) {
            this.guardsman.bot.emit("incompleteCommand", interaction)
            return
        }


        // Database Stuff

        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("accept")
                    .setEmoji("<:trubotAccepted:1096225940578766968>")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("deny")
                    .setEmoji("<:trubotDenied:1099642433588965447>")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setLabel("Cancel")
                    .setEmoji("<:trubotAbstain:1099642858505515018>")
                    .setCustomId("cancel")
                    .setStyle(ButtonStyle.Secondary)
            );

        const embed = new EmbedBuilder()
            .setDescription(`### <:trubotBeingLookedInto:1099642414303559720> Log Request - ${interaction.member.nickname}\n> **The patrol:** [here](${patrol_link})\n> **The backup request:** [here](${backup_link})`)
            .setColor(Colors.Yellow)
            .setTimestamp()
            .setFooter({ text: "Console Requests" });


        const reply = await interaction.reply({
            components: [actionRow],
            embeds: [embed]
        });

        await this.guardsman.database.backupResponses.create({
            data: {
                responseRequestID: parseInt(reply.id),
                responderID: interaction.user.id.toString(),
                timestamp: Math.floor(new Date().getTime() / 1000).toString(),
            }
        });

        //const filter = (i) => i.user.id === interaction.member.id

        const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button })

        collector.on('collect', async (interaction) => {

            if (interaction.customId === 'cancel') {
                if (interaction.message.interaction && interaction.user.id === interaction.message.interaction.user.id) {
                    const result = await this.guardsman.database.backupResponses.delete({
                        where: {
                            responseRequestID: parseInt(reply.id),
                        }
                    });
                    await interaction.message.delete();
                }
            }
            if (interaction.customId === 'accept') {
                const target = await interaction.guild.roles.fetch(serverConfigs.commandRoleID)
                if (!target) {
                    this.guardsman.bot.emit("invalidServerConfigs", interaction)
                    return
                }
                const permission = permissionsCheck("rp", interaction.member, target, interaction)
                if (permission && interaction.message.interaction) {
                    const result = await this.guardsman.database.backupResponses.update({
                        where: {
                            responseRequestID: parseInt(reply.id),
                        }, data: { requestStatus: "Accepted", revieweeID: interaction.user.id.toString() },
                    });
                    if (result) {
                        const embed = new EmbedBuilder()
                            .setDescription(`### <:trubotAccepted:1096225940578766968> Log Request - ${username}\n> **The patrol:** [here](${patrol_link})\n> **The backup request:** [here](${backup_link})`)
                            .setColor(Colors.Green)
                            .setTimestamp()
                            .setFooter({ text: "Console Requests" });
                        await interaction.message.edit({ embeds: [embed], components: [] });
                    }
                    else { this.guardsman.bot.emit("databaseError", interaction, result) }
                }
            }

            if (interaction.customId === 'deny') {
                const target = await interaction.guild.roles.fetch(serverConfigs.commandRoleID)
                if (!target) {
                    this.guardsman.bot.emit("invalidServerConfigs", interaction)
                    return
                }
                const permission = permissionsCheck("rp", interaction.member, target, interaction)
                if (permission && interaction.message.interaction) {
                    const result = await this.guardsman.database.backupResponses.update({
                        where: {
                            responseRequestID: parseInt(reply.id),
                        }, data: { requestStatus: "Denied", revieweeID: interaction.user.id.toString() },
                    });
                    if (result) {
                        const embed = new EmbedBuilder()
                            .setDescription(`### <:trubotDenied:1099642433588965447> Log Request - ${username}\n> **The patrol:** [here](${patrol_link})\n> **The backup request:** [here](${backup_link})`)
                            .setColor(Colors.Red)
                            .setTimestamp()
                            .setFooter({ text: "Console Requests" });
                        await interaction.message.edit({ embeds: [embed], components: [] });
                    }
                    else { this.guardsman.bot.emit("databaseError", interaction, result) }
                }
            }
        }
        )
    }

}