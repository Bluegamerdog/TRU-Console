import { Colors, EmbedBuilder } from "discord.js";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
//this.guardsman.bot.emit("missingPermissions", "type", interaction, member, target);
export default async (guardsman, interaction) => {
    if (interaction.isChatInputCommand()) {
        if (interaction.deferred) {
            await interaction.editReply({
                components: [],
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Permission Error`)
                        .setDescription("You do not have the permissions required to run this command.")
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({
                        text: "Console Permissions"
                    }),
                ],
            });
        }
        else {
            await interaction.reply({
                components: [],
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Permission Error`)
                        .setDescription("You do not have the permissions required to run this command.")
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({
                        text: "Console Permissions"
                    }),
                ], ephemeral: false
            });
        }
    }
};
