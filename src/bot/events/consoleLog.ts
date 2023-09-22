import { Colors, EmbedBuilder, Interaction, TextChannel } from "discord.js";
import { Guardsman } from "index";

export default async (guardsman: Guardsman, interaction: Interaction<"cached">, embed: EmbedBuilder) => {
     try {
          const consolelogsChannel = await guardsman.bot.channels.cache.get("1143525855960760390") as TextChannel;
         console.log(consolelogsChannel)
         if (!consolelogsChannel) {
             console.log("Log channel not found.");
             return;
         }

         // Ensure the fetched channel is a TextChannel
         if (consolelogsChannel instanceof TextChannel) {
             // Sending the embed to the log channel
             await consolelogsChannel.send({
                 embeds: [
                     embed
                 ]
             });
         } else {
             console.log("Log channel is not a TextChannel.");
         }
     } catch (error) {
         console.error("Error fetching or sending to log channel:", error);
     }
}