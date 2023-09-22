import { Colors, EmbedBuilder, SlashCommandStringOption, SlashCommandUserOption } from "discord.js";
import { getServerConfigs } from '../../../../utils/prismaUtils.js';
import { permissionsCheck, updateRoles } from '../../../../utils/roleFunctions.js';
import { getRank_fromID, get_promotion_message } from '../../../../utils/miscFunctions.js';
import Noblox from "noblox.js";
export default class OperatorRankSubcommand {
    name = "rank";
    description = "Is used to promote or demote members.";
    guardsman;
    options = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("The user you want to promote.")
            .setRequired(true),
        new SlashCommandStringOption()
            .setName("rank")
            .setDescription("The rank you want to promote the user to.")
            .setRequired(true)
            .addChoices({ name: 'Vanguard Officer', value: '20' }, { name: "Vanguard", value: "15" }, { name: "Elite Operator", value: "5" }, { name: "Senior Operator", value: "4" }, { name: "Operator", value: "3" }, { name: "Entrant", value: "1" }),
        new SlashCommandStringOption()
            .setName("demotion-reason")
            .setDescription("ONLY FOR DEMOTIONS.")
            .setRequired(false),
    ];
    constructor(guardsman) {
        this.guardsman = guardsman;
    }
    async execute(interaction) {
        const guild = interaction.guild;
        await interaction.deferReply({ ephemeral: true });
        const serverConfigs = await getServerConfigs(guild.id);
        if (!serverConfigs) {
            this.guardsman.bot.emit("missingServerConfigs", interaction);
            return;
        }
        const CommandRole = await interaction.guild.roles.fetch(serverConfigs.commandRoleID);
        if (!CommandRole) {
            this.guardsman.bot.emit("invalidServerConfigs", interaction);
            return;
        }
        const permission = permissionsCheck("rp", interaction.member, CommandRole, interaction);
        if (!permission) {
            this.guardsman.bot.emit("missingPermissions", interaction);
            return;
        }
        const options = interaction.options;
        const user = options.getUser("user", true);
        const rank = options.getString("rank", true);
        const demotionReason = options.getString("demotion-reason", false);
        const member = await interaction.guild.members.fetch(user);
        let disabled = false;
        if (disabled) {
            this.guardsman.bot.emit("incompleteCommand", interaction);
            return;
        }
        const existingUserData = await this.guardsman.database.operator.findUnique({
            where: {
                discord_id: member.id
            }
        });
        if (!existingUserData) { // If user is not registered
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`User not found!`)
                        .setDescription(`${user} was not found in the database!`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Console Database" })
                ]
            });
            return;
        }
        const getRobloxGroupID = await this.guardsman.database.verificationBinds.findFirst({
            where: {
                guild_id: guild.id
            }
        });
        const verificationBinds = await this.guardsman.database.verificationBinds.findMany({
            where: {
                guild_id: guild.id
            }
        });
        if (!getRobloxGroupID) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`No role binds found!`)
                        .setDescription(`Could not find any role binds for this guild nor information about the ROBLOX group!`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Console Database" })
                ]
            });
            return;
        }
        const roleBindData = JSON.parse(getRobloxGroupID.role_data);
        const currentRank = await Noblox.getRankInGroup(roleBindData.groupId, parseInt(existingUserData.roblox_id));
        if (currentRank >= 250) { // Can't rank TRU leadership
            await interaction.editReply({
                components: [],
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Permission Error!`)
                        .setDescription(`Blue said I'm not allowed to demote TRU Leadership or above. ${user} is a member of TRU Leadership or above.`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "TRU Console" })
                ]
            });
            return;
        }
        if (currentRank == parseInt(rank)) { // Can't promote to current rank
            await interaction.editReply({
                components: [],
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Ranking Error!`)
                        .setDescription(`${user} is already ranked as **${existingUserData.truRank}**`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Console" })
                ]
            });
            return;
        }
        // Updates Operator database
        const updatedUserData = await this.guardsman.database.operator.update({
            where: {
                discord_id: member.id
            },
            data: {
                truRank: getRank_fromID(parseInt(rank))
            }
        });
        try {
            // Updates Roblox group
            await Noblox.setRank(roleBindData.groupId, parseInt(existingUserData.roblox_id), parseInt(rank));
            const results = await updateRoles(this.guardsman, member, existingUserData, verificationBinds, CommandRole, guild);
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
                });
                return;
            }
        }
        catch (error) {
            console.error(error);
            await interaction.editReply({
                components: [],
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Ranking Error!`)
                        .setDescription(`An error occurred while ranking ${user.tag}: ${error}`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "TRU Console" })
                ]
            });
        }
        const dm_notification = new EmbedBuilder();
        const console_logs = new EmbedBuilder();
        const consolelogsChannel = await this.guardsman.bot.channels.cache.get("1143525855960760390");
        if (currentRank < parseInt(rank)) { // Promotion
            // Handle promotion logic
            try {
                dm_notification.setTitle("<a:trubotCelebration:1099643172012949555> TRU Promotion!");
                dm_notification.setDescription(`You have been promoted from **${existingUserData.truRank}** to **${updatedUserData.truRank}**!\n\n${get_promotion_message(updatedUserData.truRank)}`);
                dm_notification.setFooter({ text: `Processed by ${interaction.member.nickname}`, iconURL: interaction.user.displayAvatarURL() });
                dm_notification.setColor(Colors.LuminousVividPink);
                try {
                    await member.send({ embeds: [dm_notification] }); // DM Notification
                }
                catch (error) {
                    console.log(error);
                }
                console_logs.setTitle("User Promoted");
                console_logs.setDescription(`${member} has been promoted from **${existingUserData.truRank}** to **${updatedUserData.truRank}**.`);
                console_logs.setFooter({ text: `Processed by ${interaction.member.nickname}`, iconURL: interaction.user.displayAvatarURL() });
                console_logs.setColor(Colors.DarkButNotBlack);
                if (consolelogsChannel) {
                    await consolelogsChannel.send({ embeds: [console_logs] });
                }
                //this.guardsman.bot.emit("consoleLog", console_logs) // Console Logs
                await interaction.editReply({
                    components: [],
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`User Promoted`)
                            .setDescription(`${member} has been promoted from **${existingUserData.truRank}** to **${getRank_fromID(parseInt(rank))}**.`)
                            .setColor(Colors.Green)
                            .setTimestamp()
                            .setFooter({ text: "TRU Console" })
                    ]
                });
                const onDutyChannel = this.guardsman.bot.channels.cache.get("1095845193149862028");
                if (!onDutyChannel) {
                    console.log("Log channel not found.");
                    return;
                }
                await onDutyChannel.send({
                    content: `Please congratulate **${member.nickname}** on their promotion to **${updatedUserData.truRank}**! <a:trubotCelebration:1099643172012949555>`
                });
                return;
            }
            catch (error) {
                console.error(error);
                await interaction.editReply({
                    components: [],
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Promotion Error`)
                            .setDescription(`An error occurred while promoting ${user.tag}: ${error}`)
                            .setColor(Colors.Red)
                            .setTimestamp()
                            .setFooter({ text: "TRU Console" })
                    ]
                });
            }
        }
        else if (currentRank > parseInt(rank)) { // Demotion
            try {
                dm_notification.setTitle("<:trubotWarning:1099642918974783519> TRU Demotion");
                dm_notification.setDescription(`You have been demoted from **${existingUserData.truRank}** to **${updatedUserData.truRank}**!`);
                dm_notification.addFields({ name: "Reason", value: `${demotionReason}` });
                dm_notification.setFooter({ text: `Processed by ${interaction.member.nickname}`, iconURL: interaction.user.displayAvatarURL() });
                dm_notification.setColor(Colors.NotQuiteBlack);
                try {
                    await member.send({ embeds: [dm_notification] }); // DM Notification
                }
                catch (error) {
                    console.log(error);
                }
                console_logs.setTitle("User Demoted");
                console_logs.setDescription(`${member} has been demoted from **${existingUserData.truRank}** to **${updatedUserData.truRank}**.`);
                console_logs.addFields({ name: "Reason", value: `${demotionReason}` });
                console_logs.setFooter({ text: `Processed by ${interaction.member.nickname}`, iconURL: interaction.user.displayAvatarURL() });
                console_logs.setColor(Colors.DarkButNotBlack);
                if (consolelogsChannel) {
                    await consolelogsChannel.send({ embeds: [console_logs] });
                }
                //this.guardsman.bot.emit("consoleLog", console_logs)
                await interaction.editReply({
                    components: [],
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`User Demoted`)
                            .setDescription(`${member} has been demoted from **${existingUserData.truRank}** to **${getRank_fromID(parseInt(rank))}**.`)
                            .setColor(Colors.Green)
                            .setTimestamp()
                            .setFooter({ text: "TRU Console" })
                    ]
                });
                return;
            }
            catch (error) {
                console.error(error);
                await interaction.editReply({
                    components: [],
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Demotion Error`)
                            .setDescription(`An error occurred while demoting ${user.tag}: ${error}`)
                            .setColor(Colors.Red)
                            .setTimestamp()
                            .setFooter({ text: "TRU Console" })
                    ]
                });
            }
        }
        else { // I hope we never get here
            console.log("You fucked up somewhere lmao");
            await interaction.editReply({ content: "If you're seeing this, Blue MAJORLY fucked something up lmao" });
        }
    }
}
