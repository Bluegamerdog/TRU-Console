import { Guardsman } from "index";
import {
    ChatInputCommandInteraction, Colors, EmbedBuilder,
} from "discord.js";
import { getServerConfigs } from '../../../../utils/prismaUtils.js';
import { permissionsCheck } from '../../../../utils/roleFunctions.js'

export default class ConfigsViewSubcommand implements ICommand {
    name: Lowercase<string> = "view";
    description: string = "Displays the server configuration.";
    guardsman: Guardsman;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const guild = interaction.guild;
        await interaction.deferReply({ephemeral:true})
        // Retrieve the server configuration data from your database
        const config = await this.guardsman.database.serverSetup.findUnique({
            where: {
                serverID: guild.id
            }
        });

        if (!config) {
            this.guardsman.bot.emit("missingServerConfigs", interaction)
            return;
        }

        const currentDate = new Date();
        let embed = new EmbedBuilder()
            .setTitle(config.serverID === guild.id ? "Server configuration updated!" : "Server configuration created!")
            .setColor(0x0099FF)
            .addFields(
                { name: 'Response Ping role:', value: `<@&${config.responsePingRoleID}>`, inline: true },
                { name: 'Response Announce channel:', value: config.responseAnnounceChannelID ? `<#${config.responseAnnounceChannelID}>` : "Not set", inline: true },
                { name: 'Member role:', value: `<@&${config.memberRoleID}>`, inline: true },
                { name: 'Host role:', value: `<@&${config.hostRoleID}>`, inline: true },
                { name: 'Command role:', value: `<@&${config.commandRoleID}>`, inline: true },
                { name: 'Developer role:', value: `<@&${config.developerRoleID}>`, inline: true }
            )
            .setFooter({ text: `TRU Console • Today at ${currentDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false, timeZone: 'UTC' })}Z`, iconURL: 'https://cdn.discordapp.com/attachments/987872088297734145/1129749594805383308/TRU.png' });

        await interaction.editReply({ embeds: [embed] });
    }
}
