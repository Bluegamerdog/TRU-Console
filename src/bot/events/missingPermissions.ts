import { Colors, EmbedBuilder, Interaction, GuildMember, Role, Snowflake } from "discord.js";
import { Guardsman } from "index";
import { hasRolePermission, hasRole, isUser } from '../../utils/roleFunctions.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

//this.guardsman.bot.emit("missingPermissions", "type", interaction, member, target);

export default async (guardsman: Guardsman, interaction: Interaction<"cached">) => {
     if (interaction.isChatInputCommand()) {

          if (interaction.deferred) {
               await interaction.editReply({
                    components: [],

                    embeds: [
                         new EmbedBuilder()
                              .setTitle(`Permission Error`)
                              .setDescription(
                                   "You do not have the permissions required to run this command."
                              )
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
                              .setDescription(
                                   "You do not have the permissions required to run this command."
                              )
                              .setColor(Colors.Red)
                              .setTimestamp()
                              .setFooter({
                                   text: "Console Permissions"
                              }),
                    ], ephemeral: false
               });
          }
     }
}

