import { Colors, EmbedBuilder, SlashCommandUserOption } from "discord.js";
import { getServerConfigs } from '../../../../utils/prismaUtils.js';
import { hasRole, permissionsCheck } from '../../../../utils/roleFunctions.js';
export default class StrikeGetSubcommand {
    name = "get";
    description = "Gets a specific or list of strikes.";
    guardsman;
    options = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("The user to get the strikes from. (Defaults to yourself)")
            .setRequired(false),
    ];
    constructor(guardsman) {
        this.guardsman = guardsman;
    }
    async execute(interaction) {
        const guild = interaction.guild;
        //await interaction.deferReply({ ephemeral: true })
        const serverConfigs = await getServerConfigs(guild.id);
        if (!serverConfigs) {
            this.guardsman.bot.emit("missingServerConfigs", interaction);
            return;
        }
        const target = await interaction.guild.roles.fetch(serverConfigs.memberRoleID);
        const commandRole = await interaction.guild.roles.fetch(serverConfigs.commandRoleID);
        if (!target || !commandRole) {
            this.guardsman.bot.emit("invalidServerConfigs", interaction);
            return;
        }
        const permission = permissionsCheck("rp", interaction.member, target, interaction);
        if (!permission) {
            this.guardsman.bot.emit("missingPermissions", interaction);
            return;
        }
        let disabled = false;
        if (disabled) {
            this.guardsman.bot.emit("incompleteCommand", interaction);
            return;
        }
        const options = interaction.options;
        const user = options.getUser("user", false) || interaction.user;
        const strikeID = options.getString("id", false);
        const responseEmbed = new EmbedBuilder();
        responseEmbed.setTimestamp();
        let strikeData;
        if (user && user.id === interaction.user.id) {
            strikeData = await this.guardsman.database.strikes.findMany({
                where: { recieverID: user.id }
            });
            responseEmbed.setTitle(`${strikeData.length > 0 ? "Data found" : "No strikes found"}`);
            responseEmbed.setDescription(`${strikeData.length > 0 ? `Retrieved ${strikeData.length} strike(s) for ${user}.` : "You have no strikes."}`);
            if (strikeData.length > 0) {
                for (const strike of strikeData) {
                    responseEmbed.addFields({ name: `ID: ${strike.id} | <t:${strike.timestamp}>`, value: `Reason: ${strike.reason}` });
                }
            }
            responseEmbed.setFooter({ text: "Console Database" });
            responseEmbed.setColor(Colors.DarkRed);
            await interaction.reply({
                embeds: [responseEmbed], ephemeral: true
            });
            return;
        }
        else if (user && user.id !== interaction.user.id) {
            // Only leadership
            if (hasRole(interaction.member, commandRole.id)) {
                strikeData = await this.guardsman.database.strikes.findMany({
                    where: { recieverID: user.id }
                });
                responseEmbed.setTitle(`${strikeData.length > 0 ? "Data found" : "No strikes found"}`);
                responseEmbed.setDescription(`${strikeData.length > 0 ? `Retrieved ${strikeData.length} strike(s) for ${user}.` : `${user} has no strikes.`}`);
                if (strikeData.length > 0) {
                    for (const strike of strikeData) {
                        responseEmbed.addFields({ name: `ID: ${strike.id} | <t:${strike.timestamp}>`, value: `Reason: ${strike.reason}` });
                    }
                }
                responseEmbed.setFooter({ text: "Console Database" });
                responseEmbed.setColor(Colors.DarkRed);
            }
            else {
                responseEmbed.setTitle("Permission Error");
                responseEmbed.setDescription("You do not have permission to view other operators' strikes.");
                responseEmbed.setFooter({ text: "Console Permissions" });
                responseEmbed.setColor(Colors.Red);
            }
            await interaction.reply({
                embeds: [responseEmbed], ephemeral: true
            });
            return;
        }
    }
}
