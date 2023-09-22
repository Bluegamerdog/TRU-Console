import { randomUUID } from "crypto";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder } from "discord.js";
import { getServerConfigs, createPendingVerification } from '../../../../utils/prismaUtils.js';
import { permissionsCheck } from '../../../../utils/roleFunctions.js';
export default class OperatorVerifySubsommand {
    name = "verify";
    description = "Allows users to verify with TRU Console.";
    guardsman;
    constructor(guardsman) {
        this.guardsman = guardsman;
    }
    async execute(interaction) {
        const guild = interaction.guild;
        await interaction.deferReply({ ephemeral: false });
        const serverConfigs = await getServerConfigs(guild.id);
        if (!serverConfigs) {
            this.guardsman.bot.emit("missingServerConfigs", interaction);
            return;
        }
        const target = await interaction.guild.roles.fetch(serverConfigs.memberRoleID);
        if (!target) {
            this.guardsman.bot.emit("invalidServerConfigs", interaction);
            return;
        }
        const permission = permissionsCheck("rp", interaction.member, target, interaction);
        if (!permission) {
            this.guardsman.bot.emit("missingPermissions", interaction);
            return;
        }
        const member = interaction.member;
        const channel = interaction.channel;
        const existingUserData = await this.guardsman.database.operator.findUnique({
            where: {
                discord_id: member.id
            }
        });
        if (existingUserData) {
            const continueVerification = await new Promise(async () => {
                const collector = channel?.createMessageComponentCollector({
                    time: 300000,
                    filter: (interact) => interact.member.id === member.id,
                    maxComponents: 1
                });
                collector?.on("collect", (collected) => {
                    collected.deferUpdate();
                    if (collected.customId == "continue") {
                        const token = randomUUID().replace("-", "");
                        const pendingrequest = createPendingVerification(interaction, token);
                        this.guardsman.bot.pendingVerificationInteractions[member.id] = interaction;
                        interaction.editReply({
                            components: [
                                new ActionRowBuilder()
                                    .addComponents(new ButtonBuilder()
                                    .setLabel("Login with ROBLOX")
                                    .setStyle(ButtonStyle.Link)
                                    .setURL(`https://authorize.roblox.com/?client_id=7721778689477453994&response_type=Code&redirect_uri=https%3A%2F%2Farguably-innocent-herring.ngrok-free.app%2Fverification-callback&scope=openid+profile&state=${token}&nonce=0&step=accountConfirm&nl=true&nl=true`))
                            ],
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("Console Verification")
                                    .setDescription("Please log in with ROBLOX to update your database information.")
                                    .setColor(Colors.Blurple)
                                    .setTimestamp()
                                    .setFooter({ text: "Console Verification - Prompt will time out in 5 minutes." })
                            ]
                        });
                    }
                    else {
                        interaction.deleteReply();
                    }
                });
                collector?.on("end", (collected) => {
                    if (collected.size == 0) {
                        interaction.editReply({
                            components: [],
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("Console Verification")
                                    .setDescription("Verification prompt timed out.")
                                    .setColor(Colors.Red)
                                    .setTimestamp()
                                    .setFooter({ text: "Console Verification" })
                            ]
                        });
                    }
                });
                await interaction.editReply({
                    components: [
                        new ActionRowBuilder()
                            .addComponents(new ButtonBuilder()
                            .setLabel("Continue")
                            .setCustomId("continue")
                            .setStyle(ButtonStyle.Success), new ButtonBuilder()
                            .setLabel("Cancel")
                            .setCustomId("cancel")
                            .setStyle(ButtonStyle.Danger))
                    ],
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Console Verification")
                            .setDescription("You are already verified! If you meant to `update` your roles, run `/update`. Otherwise, to update your database information, press continue below.")
                            .setColor(Colors.Orange)
                            .setTimestamp()
                            .setFooter({ text: "Console Verification - Prompt will time out in 30 seconds" })
                    ]
                });
            })
                .then((response) => {
                if (!response) {
                    interaction.editReply({
                        components: [],
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Console Verification")
                                .setDescription(`Prompt cancelled or timed-out.`)
                                .setColor(Colors.Red)
                                .setTimestamp()
                                .setFooter({ text: "Console Verification" })
                        ]
                    });
                    return false;
                }
                return response;
            })
                .catch((error) => {
                return interaction.editReply({
                    components: [],
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Console Verification")
                            .setDescription(`${error}`)
                            .setColor(Colors.Red)
                            .setTimestamp()
                            .setFooter({ text: "Console Verification" })
                    ]
                });
            });
            console.log(continueVerification);
            if (!continueVerification)
                return;
        }
        else {
            const token = randomUUID().replace("-", "");
            await this.guardsman.database.pendingVerification.create({
                data: {
                    discord_id: interaction.member.id,
                    token: token
                }
            });
            this.guardsman.bot.pendingVerificationInteractions[member.id] = interaction;
            await interaction.editReply({
                components: [
                    new ActionRowBuilder()
                        .addComponents(new ButtonBuilder()
                        .setLabel("ROBLOX TRU Group")
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://www.roblox.com/groups/15155175/QSO-Tactical-Response-Unit`), new ButtonBuilder() // Add a new button for confirming join request
                        .setLabel("I have an active join request")
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId("confirm-join-request"))
                ],
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Console Verification")
                        .setDescription("Please confirm that you have an active join request.")
                        .setColor(Colors.Blurple)
                        .setTimestamp()
                        .setFooter({ text: "Console Verification - Prompt will time out in 5 minutes." })
                ]
            });
            const collector = channel?.createMessageComponentCollector({
                time: 300000,
                filter: (interact) => interact.member.id === member.id && (interact.customId === "start-verification" || interact.customId === "confirm-join-request"),
                maxComponents: 1
            });
            collector?.on("collect", async (collected) => {
                await collected.deferUpdate();
                if (collected.customId === "confirm-join-request") {
                    // Handle confirmation of join request here
                    // Transition to the second embed and add the link button
                    await interaction.editReply({
                        components: [
                            new ActionRowBuilder()
                                .addComponents(new ButtonBuilder()
                                .setLabel("Login with ROBLOX")
                                .setStyle(ButtonStyle.Link)
                                .setURL(`https://authorize.roblox.com/?client_id=7721778689477453994&response_type=Code&redirect_uri=https%3A%2F%2Farguably-innocent-herring.ngrok-free.app%2Fverification-callback&scope=openid+profile&state=${token}&nonce=0&step=accountConfirm&nl=true&nl=true`))
                        ],
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Console Verification")
                                .setDescription("Please log in with ROBLOX to continue.")
                                .setColor(Colors.Blurple)
                                .setTimestamp()
                                .setFooter({ text: "Console Verification - Prompt will time out in 5 minutes." })
                        ]
                    });
                }
            });
            collector?.on("end", () => {
                interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Console Verification")
                            .setDescription("Verification prompt timed out.")
                            .setColor(Colors.Red)
                            .setTimestamp()
                            .setFooter({ text: "Console Verification" })
                    ],
                    components: [] // Remove buttons after timeout
                });
            });
        }
    }
}
