import { Guardsman } from "index";
import {
    ApplicationCommandOptionBase,
    ChatInputCommandInteraction, Colors, EmbedBuilder,
    SlashCommandStringOption,
    TextChannel,
} from "discord.js";
import { getServerConfigs } from '../../../../utils/prismaUtils.js';
import { permissionsCheck } from '../../../../utils/roleFunctions.js'

export default class StrikeDeleteSubcommand implements ICommand {
    name: Lowercase<string> = "delete";
    description: string = "Is used to set the ID values for the server configurations.";
    guardsman: Guardsman;
    options: ApplicationCommandOptionBase[] = [
        new SlashCommandStringOption()
            .setName("id")
            .setDescription("The ID of the strike you want to delete.")
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
        const target = await interaction.guild.roles.fetch(serverConfigs.commandRoleID)
        if (!target) {
            this.guardsman.bot.emit("invalidServerConfigs", interaction)
            return
        }
        const permission = permissionsCheck("rp", interaction.member, target, interaction)
        if (!permission) {
            this.guardsman.bot.emit("missingPermissions", interaction);
            return
        }

        let disabled = false
        if (disabled) {
            this.guardsman.bot.emit("incompleteCommand", interaction)
            return
        }

        const options = interaction.options;
        const strikeId = options.getString("id", true);


        // Delete strike from Prisma database
        const getStrike = await this.guardsman.database.strikes.findUnique({
            where: { id: strikeId }
        })

        const deletedStrike = await this.guardsman.database.strikes.delete({
            where: { id: strikeId },
        });

        try {

            if (getStrike) {
                // Reply with success message
                // Log the strike deletion
                try {
                    const consolelogsChannel = await this.guardsman.bot.channels.cache.get("1143525855960760390") as TextChannel;
                    const strikeLogEmbed = new EmbedBuilder()
                        .setTitle("Strike Deleted")
                        .setDescription(`A strike with the ID **${getStrike.id}** has been deleted.`)
                        .addFields({ name: "Strike Details:", value: `**Receiver:** ${(await interaction.guild.members.fetch(getStrike.recieverID)).nickname}\n**Reason:** ${getStrike.reason}\n**Timestamp:** <t:${getStrike.timestamp}>\n**Giver:** ${(await interaction.guild.members.fetch(getStrike.giverID)).nickname}` })
                        .setColor(Colors.DarkButNotBlack)
                        .setTimestamp()
                        .setFooter({ text: `Processed by ${interaction.member.nickname}` })


                    await consolelogsChannel.send({ embeds: [strikeLogEmbed] });
                } catch (error) {
                    console.log(error)
                    // If unable to DM, mention in the reply
                }

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Strike Deleted")
                            .setDescription(`Strike with ID **${strikeId}** has been successfully deleted.`)
                            .setColor(Colors.Green)
                            .setTimestamp(),
                    ], ephemeral: true
                });
                return
            } else {
                // If strike not found, reply with error message
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Strike Deletion Failed")
                            .setDescription(`Strike with ID ${strikeId} was not found.`)
                            .setColor(Colors.Red)
                            .setTimestamp(),
                    ], ephemeral: true
                });
                return
            }
        } catch (error) {
            // Reply with error message if there was an issue with deletion
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Strike Deletion Error")
                        .setDescription(`An error occurred while deleting the strike: ${error}`)
                        .setColor(Colors.Red)
                        .setTimestamp(),
                ], ephemeral: true
            }); return
        }
    }
}