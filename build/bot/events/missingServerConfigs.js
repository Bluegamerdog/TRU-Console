import { Colors, EmbedBuilder } from "discord.js";
export default async (guardsman, interaction) => {
    if (interaction.isChatInputCommand()) {
        if (interaction.deferred) {
            await interaction.editReply({
                components: [],
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Console Database | Server Configs Error!`)
                        .setDescription("Unable to find server configs for this server.")
                        .setColor(Colors.Red)
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
                        .setTitle(`Console Database | Server Configs Error!`)
                        .setDescription("Unable to find server configs for this server.")
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Console Database" })
                ]
            });
        }
    }
};
