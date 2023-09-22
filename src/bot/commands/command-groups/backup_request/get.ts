import { Guardsman } from "index";
import {
    ApplicationCommandOptionBase,
    ChatInputCommandInteraction, Colors, EmbedBuilder,
    SlashCommandBooleanOption,
    SlashCommandStringOption,
    SlashCommandUserOption, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandAttachmentOption, SlashCommandNumberOption
} from "discord.js";
import { getServerConfigs } from '../../../../utils/prismaUtils.js';
import { permissionsCheck } from '../../../../utils/roleFunctions.js'

export default class brGetSubCommand implements ICommand {
    name: Lowercase<string> = "get";
    description: string = "Used to get backup response data.";
    guardsman: Guardsman;
    options: ApplicationCommandOptionBase[] = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("The user of which to show the response data from.")
            .setRequired(false),
        //new SlashCommandNumberOption()
        //    .setName("disabledatm-quota-block")
        //    .setDescription("The quota block from which you would like to get the data from.")
        //    .setRequired(false),
    ];

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        const guild = interaction.guild;
        await interaction.deferReply({ ephemeral: false })
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
        const user = options.getUser("user", false); // False means the option is not required

        if (user) {

            // Retrieve and display user's backup response data
            // Fetch the user's data from the database
            const userResponseData = await this.guardsman.database.backupResponses.findMany({
                where: {
                    responderID: user.id,
                    requestStatus: "Accepted"
                },
                orderBy: {
                    timestamp: "desc",
                },
            });

            if (userResponseData.length > 0) {
                const mostRecentResponse = userResponseData[0];
                const lastResponseTimestamp = mostRecentResponse.timestamp;
                const embed = new EmbedBuilder()
                    .setTitle("Data found!")
                    .setColor(Colors.DarkRed)
                    .setTimestamp()
                    .setFooter({ text: "Response Data" })
                    .addFields([
                        { name: "Roblox Username", value: `<@${user.id}>`, inline: false },
                        { name: "Total Backup Responses", value: `${userResponseData.length}`, inline: false },
                        { name: "Last Backup Response", value: `<t:${lastResponseTimestamp}>`, inline: false },
                    ]);

                await interaction.editReply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setTitle("No data found!")
                    .setDescription("User has not attended any backup requests.")
                    .setColor(Colors.Red)
                    .setTimestamp()
                    .setFooter({ text: "Response Data" });

                await interaction.editReply({ embeds: [embed] });
            }
        } else {
            // Handle case where user is not specified
            // Display an error message or instructions
            const embed = new EmbedBuilder()
                .setDescription("Please specify a user to retrieve backup response data for. (haven't made the leaderboard yet)")
                .setColor(Colors.Red)
                .setTimestamp()
                .setFooter({ text: "Response Data" });

            await interaction.editReply({ embeds: [embed] });
        }
    }
}