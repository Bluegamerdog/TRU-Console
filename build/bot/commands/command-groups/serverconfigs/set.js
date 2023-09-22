import { EmbedBuilder, SlashCommandChannelOption, SlashCommandRoleOption } from "discord.js";
import { hasRole } from '../../../../utils/roleFunctions.js';
export default class ConfigsSetSubcommand {
    name = "set";
    description = "Is used to set the ID values for the server configurations.";
    guardsman;
    options = [
        new SlashCommandRoleOption()
            .setName("botdev-role")
            .setDescription("Which role is given to bot developers?")
            .setRequired(true),
        new SlashCommandRoleOption()
            .setName("leadership-role")
            .setDescription("What role is given to leadership members?")
            .setRequired(true),
        new SlashCommandRoleOption()
            .setName("responsehost-role")
            .setDescription("What is the minimum rank given to response hosts?")
            .setRequired(true),
        new SlashCommandRoleOption()
            .setName("mainaccess-role")
            .setDescription("What is the minimum rank given to full members?")
            .setRequired(true),
        new SlashCommandRoleOption()
            .setName("member-role")
            .setDescription("What role is given to all members?")
            .setRequired(true),
        new SlashCommandChannelOption()
            .setName("response-announcement-channel")
            .setDescription("Where should responses be announced?")
            .setRequired(true),
    ];
    constructor(guardsman) {
        this.guardsman = guardsman;
    }
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });
        const guild = interaction.guild;
        const targetRole = guild.roles.cache.find(role => role.name === "TRU Helper Developer");
        if (targetRole) {
            const permission = hasRole(interaction.member, targetRole.id);
            if (!permission) {
                this.guardsman.bot.emit("missingPermissions", interaction);
                return;
            }
        }
        const options = interaction.options;
        const responsePingRoleID = options.getRole("member-role", true)?.id;
        const responseAnnounceChannelID = options.getChannel("response-announcement-channel")?.id ?? "Not set";
        const memberRoleID = options.getRole("member-role", true)?.id;
        const hostRoleID = options.getRole("responsehost-role", true)?.id;
        const commandRoleID = options.getRole("leadership-role", true)?.id;
        const developerRoleID = options.getRole("botdev-role", true)?.id;
        // Store the configuration values in your database
        const config = await this.guardsman.database.serverSetup.upsert({
            where: {
                serverID: guild.id
            },
            update: {
                responsePingRoleID,
                responseAnnounceChannelID,
                memberRoleID,
                hostRoleID,
                commandRoleID,
                developerRoleID
            },
            create: {
                serverID: guild.id,
                responsePingRoleID,
                responseAnnounceChannelID,
                memberRoleID,
                hostRoleID,
                commandRoleID,
                developerRoleID
            }
        });
        const currentDate = new Date();
        let embed = new EmbedBuilder()
            .setTitle(config.serverID === guild.id ? "Server configuration updated!" : "Server configuration created!")
            .setColor(0x0099FF)
            .addFields({ name: 'Response Ping role:', value: `<@&${responsePingRoleID}>` }, { name: 'Response Announce channel:', value: responseAnnounceChannelID ? `<#${responseAnnounceChannelID}>` : "Not set" }, { name: 'Member role:', value: `<@&${memberRoleID}>` }, { name: 'Host role:', value: `<@&${hostRoleID}>` }, { name: 'Command role:', value: `<@&${commandRoleID}>` }, { name: 'Developer role:', value: `<@&${developerRoleID}>` })
            .setFooter({ text: `TRU Console • Today at ${currentDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false, timeZone: 'UTC' })}Z`, iconURL: 'https://cdn.discordapp.com/attachments/987872088297734145/1129749594805383308/TRU.png' });
        await interaction.editReply({ embeds: [embed] });
    }
}
