import { Colors, EmbedBuilder, Interaction } from "discord.js";
import { Guardsman } from "index";

export default async (guardsman: Guardsman, interaction: Interaction<"cached">) => {
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
                              .setFooter({ text: "Console Database" })]
               })
          } else {
               await interaction.reply({
                    components: [],
                    embeds: [
                         new EmbedBuilder()
                              .setTitle(`Console Database | Server Configs Error!`)
                              .setDescription("Unable to find server configs for this server.")
                              .setColor(Colors.Red)
                              .setTimestamp()
                              .setFooter({ text: "Console Database" })]
               })
          }
     }
}