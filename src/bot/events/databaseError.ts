import { Colors, EmbedBuilder, Interaction } from "discord.js";
import { Guardsman } from "index";

export default async (guardsman: Guardsman, interaction: Interaction<"cached">, error: string) => {
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
          } else {
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