import { Colors, EmbedBuilder } from "discord.js";
export default async (guardsman, interaction) => {
    if (interaction.isChatInputCommand()) {
        if (interaction.deferred) {
            await interaction.editReply({
                components: [],
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Console Commands | Command Disabled!`)
                        .setDescription("This command is not yet done.")
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
                        .setTitle(`Console Commands | Command Disabled!`)
                        .setDescription("This command is not yet done.")
                        .setColor(Colors.Orange)
                        .setTimestamp()
                        .setFooter({ text: "Console Database" })
                ],
                ephemeral: true
            });
        }
    }
};
