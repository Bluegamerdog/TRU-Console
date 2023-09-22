import { Colors, EmbedBuilder } from "discord.js";
export default async (guardsman, interaction, error) => {
    if (interaction.isChatInputCommand()) {
        if (interaction.deferred) {
            await interaction.editReply({
                components: [],
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Console Database Error`)
                        .setDescription(`A database error occurred while executing that command.\nOutput: ${error}`)
                        .setColor(Colors.Orange)
                        .setTimestamp()
                        .setFooter({ text: "Console Database" })
                ]
            });
        }
        else {
            await interaction.reply({
                components: [],
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Console Database Error`)
                        .setDescription(`A database error occurred while executing that command.\nOutput: ${error}`)
                        .setColor(Colors.Orange)
                        .setTimestamp()
                        .setFooter({ text: "Console Database" })
                ], ephemeral: true
            });
        }
    }
};
