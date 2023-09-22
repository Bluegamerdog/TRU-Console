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
                              .setDescription("A server configs value associated with this command is invalid.")
                              .setColor(Colors.Red)
                              .setTimestamp()
                              .setFooter({ text: "Console Database" })]
               })

          }
          else {
               await interaction.reply({
                    components: [],
                    embeds: [
                         new EmbedBuilder()
                              .setTitle(`Console Database | Server Configs Error!`)
                              .setDescription("A server configs value associated with this command is invalid.")
                              .setColor(Colors.Red)
                              .setTimestamp()
                              .setFooter({ text: "Console Database" })], ephemeral: true
               })
          }
     }
}