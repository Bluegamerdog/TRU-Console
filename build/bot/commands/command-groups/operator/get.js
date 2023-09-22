import { PermissionFlagsBits, SlashCommandUserOption, EmbedBuilder, Colors } from "discord.js";
import { hasTRUExcusedRole } from '../../../../utils/roleFunctions.js';
import { getAbbreviation_2 } from '../../../../utils/miscFunctions.js';
export default class OperatorGetSubcommand {
    name = "get";
    description = "Returns a user's data";
    defaultMemberPermissions = PermissionFlagsBits.ModerateMembers;
    guardsman;
    options = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("The user to return")
            .setRequired(false)
    ];
    constructor(guardsman) {
        this.guardsman = guardsman;
    }
    async execute(interaction) {
        let user = await interaction.options.getUser("user", false);
        if (!user) {
            user = interaction.user;
        }
        const member = await interaction.guild.members.fetch(user);
        try {
            if (user) {
                const userData = await this.guardsman.database.operator.findUnique({
                    where: {
                        discord_id: user.id
                    }
                });
                if (userData) {
                    await interaction.reply({
                        components: [],
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`User found!`)
                                .setColor(Colors.DarkRed)
                                .setTimestamp()
                                .setFooter({ text: "Console Database" })
                                .addFields([
                                { name: "Roblox Username", value: `${userData.username}(**${userData.roblox_id}**)`, inline: true },
                                { name: "TRU Rank", value: `${userData.truRank}${getAbbreviation_2(userData.truRank)}`, inline: true },
                                { name: "Activity Status", value: `${hasTRUExcusedRole(member) ? "On Leave of Absence" : "On Active Duty"}`, inline: true },
                                //{ name: "", value: ``, inline: false },
                                //{ name: "Responses Attended", value: `placeholder`, inline: true },
                                //{ name: "Backup Responses", value: `placeholder`, inline: true },
                            ])
                        ],
                    });
                }
                else {
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`User not found!`)
                                .setDescription(`${user} was not found in the database!`)
                                .setColor(Colors.Red)
                                .setTimestamp()
                                .setFooter({ text: "Console Database" })
                        ]
                    });
                }
            }
        }
        catch (error) {
            console.error("Error retrieving user data:", error);
            await interaction.reply({
                content: "An error occurred while retrieving user data."
            });
        }
    }
}
