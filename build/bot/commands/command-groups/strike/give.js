import { Colors, EmbedBuilder, SlashCommandStringOption, SlashCommandUserOption } from "discord.js";
import { getServerConfigs } from '../../../../utils/prismaUtils.js';
import { permissionsCheck } from '../../../../utils/roleFunctions.js';
import { v4 as uuidv4 } from 'uuid';
export default class StrikeGiveSubcommand {
    name = "give";
    description = "Gives a strike to a user.";
    guardsman;
    options = [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("The user to give the strike to.")
            .setRequired(true),
        new SlashCommandStringOption()
            .setName("reason")
            .setDescription("The reason for the strike.")
            .setRequired(true)
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
        const target = await interaction.guild.roles.fetch(serverConfigs.commandRoleID);
        if (!target) {
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
        const user = options.getUser("user", true);
        const reason = options.getString("reason", true);
        const errors = [];
        try { // Insert strike into Prisma database
            const strikeIDD = uuidv4();
            const strike = await this.guardsman.database.strikes.create({
                data: {
                    id: strikeIDD,
                    recieverID: user.id,
                    reason: reason,
                    timestamp: Math.floor(new Date().valueOf() / 1000).toString(),
                    giverID: interaction.user.id
                }
            });
            // DM the user about the strike
            try {
                const strikeEmbed = new EmbedBuilder()
                    .setTitle("<:trubotWarning:1099642918974783519> Strike Received")
                    .setDescription(`You have received a strike in the QSO Tactical Response Unit.`)
                    .addFields({ name: "Reason:", value: reason })
                    .setColor(Colors.NotQuiteBlack);
                await user.send({ embeds: [strikeEmbed] });
            }
            catch (error) {
                errors.push(`Failed to DM the user: ${error}`);
                // If unable to DM, mention in the reply
            }
            // Log the strike
            try {
                const consolelogsChannel = await this.guardsman.bot.channels.cache.get("1143525855960760390");
                const strikeLogEmbed = new EmbedBuilder()
                    .setTitle("Strike Given")
                    .setDescription(`${user} has received a strike.\n**ID:** ${strikeIDD}`)
                    .addFields({ name: "Reason:", value: reason })
                    .setColor(Colors.DarkButNotBlack)
                    .setTimestamp()
                    .setFooter({ text: `Processed by ${interaction.member.nickname}` });
                await consolelogsChannel.send({ embeds: [strikeLogEmbed] });
            }
            catch (error) {
                errors.push(`Failed to send the console log: ${error}`);
                // If unable to DM, mention in the reply
            }
            const stikeResponseEmbed = new EmbedBuilder()
                .setTitle("Strike Successfully Given")
                .setDescription(`${user} has received a strike.`)
                .addFields({ name: "Reason:", value: reason })
                .setColor(Colors.Green)
                .setTimestamp();
            if (errors.length > 0) {
                stikeResponseEmbed.addFields({ name: "Errors", value: errors.join("\n") });
            }
            // Reply whether the command worked or not
            await interaction.editReply({
                embeds: [stikeResponseEmbed],
            });
        }
        catch (error) {
            // Handle errors and reply with an error message
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Strike Giving Error")
                        .setDescription(`An error occurred while giving the strike: ${error}`)
                        .setColor(Colors.Red)
                        .setTimestamp(),
                ],
            });
        }
    }
}
