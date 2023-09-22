import { Guardsman } from "index";
import {
    ApplicationCommandOptionBase,
    ChatInputCommandInteraction, Colors, EmbedBuilder,
    SlashCommandBooleanOption,
    SlashCommandStringOption,
    ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandAttachmentOption, SlashCommandIntegerOption
} from "discord.js";
import { getServerConfigs } from '../../../../utils/prismaUtils.js';
import { permissionsCheck } from '../../../../utils/roleFunctions.js'

export default class aptureRequestSubCommand implements ICommand {
    name: Lowercase<string> = "request";
    description: string = "Operators can use this to request additions to the dad-joke counter.";
    guardsman: Guardsman;
    options: ApplicationCommandOptionBase[] = [
        new SlashCommandIntegerOption()
            .setName("amount")
            .setDescription("The amount of jokes you'd like to add.")
            .setRequired(true),
        new SlashCommandStringOption()
            .setName("proof")
            .setDescription("Proof or reason for said request.")
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
        const requestedAmount = options.getInteger("amount", true)
        const requestProof = options.getString("proof", false)

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
            .setTitle(`<:trubotBeingLookedInto:1099642414303559720> Dad-Joke Counter Request`)
            .setDescription(`${interaction.member.nickname} is requesting to add **${requestedAmount} dad-jokes** to the counter.`)
            .addFields({ name: "Proof/Reason", value: requestProof || "No proof/reason provided" })
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
                    const counter = await this.guardsman.database.aptureJokeCounter.findFirst();
                    if (counter) {

                        const result = await this.guardsman.database.aptureJokeCounter.update({
                            where: { id: counter.id },
                            data: { amount: counter.amount + requestedAmount }
                        });

                        const embed = new EmbedBuilder()
                            .setTitle(`<:trubotAccepted:1096225940578766968> Dad-Joke Counter Request`)
                            .setDescription(`The request to add ${requestedAmount} dad-jokes to the counter was accepted.\n> **__New amount:__** ${counter.amount + requestedAmount}`)
                            .addFields({ name: "Proof/Reason", value: requestProof || "No proof/reason provided" })
                            .setColor(Colors.Green)
                            .setTimestamp()
                            .setFooter({ text: "Console Requests" });
                        await interaction.message.edit({ embeds: [embed], components: [] });
                    }
                    else { this.guardsman.bot.emit("databaseError", interaction, counter) }
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
                    const embed = new EmbedBuilder()
                        .setTitle(`<:trubotDenied:1099642433588965447> Dad-Joke Counter Request`)
                        .setDescription(`The request to add ${requestedAmount} dad-jokes to the counter was denied.`)
                        .addFields({ name: "Proof/Reason", value: requestProof || "No proof/reason provided" })
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Console Requests" });
                    await interaction.message.edit({ embeds: [embed], components: [] });
                }
            }
        }
        )
    }

}