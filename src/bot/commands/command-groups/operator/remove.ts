import { Guardsman } from "index";
import {
     ApplicationCommandOptionBase,
     ChatInputCommandInteraction, Colors, EmbedBuilder,
     SlashCommandBooleanOption,
     SlashCommandStringOption,
     SlashCommandUserOption
} from "discord.js";
import { getServerConfigs } from '../../../../utils/prismaUtils.js';
import { permissionsCheck } from '../../../../utils/roleFunctions.js'

export default class OperatorRemoveSubcommand implements ICommand {
     name: Lowercase<string> = "remove";
     description: string = "Is used to remove members from the database.";
     guardsman: Guardsman;
     options: ApplicationCommandOptionBase[] = [
          new SlashCommandUserOption()
               .setName("user")
               .setDescription("The user you want to remove.")
               .setRequired(false),
          new SlashCommandStringOption()
               .setName("id")
               .setDescription("The ID of the user you want to remove")
               .setRequired(false),
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


          const user = await interaction.options.getUser("user", false);
          const userIDstr = await interaction.options.getString("id", false)
          let disabled = false
          if (disabled) {
               this.guardsman.bot.emit("incompleteCommand", interaction)
               return
          }
          let removalID
          let removalType

          if (user) {
               removalID = user.id;
               removalType = "user";
          }
          else if (userIDstr) {
               removalID = userIDstr;
               removalType = "ID";
          } else {
               await interaction.reply({
                    embeds: [
                         new EmbedBuilder()
                              .setTitle(`Input error!`)
                              .setDescription(`You must provide either a user or a user id to run this command.`)
                              .setColor(Colors.Red)
                              .setTimestamp()
                              .setFooter({ text: "Console Database" })
                    ]
               });
               return;
          }


          try {
               if (removalID) {
                    const deletedUserData = await this.guardsman.database.operator.delete({
                         where: {
                              discord_id: removalID
                         }
                    });

                    if (deletedUserData) {
                         await interaction.reply({
                              embeds: [
                                   new EmbedBuilder()
                                        .setTitle(`User Removed`)
                                        .setDescription(`${removalType === "user" ? user : `User with ID ${removalID}`} has been removed from the database.`)
                                        .setColor(Colors.Green)
                                        .setTimestamp()
                                        .setFooter({ text: "Console Database" })
                              ]
                         });
                    } else {
                         await interaction.reply({
                              embeds: [
                                   new EmbedBuilder()
                                        .setTitle(`User not found!`)
                                        .setDescription(`${removalType === "user" ? user : `User with ID ${removalID}`} was not found in the database!`)
                                        .setColor(Colors.Red)
                                        .setTimestamp()
                                        .setFooter({ text: "Console Database" })
                              ]
                         });
                    }
               }
          } catch (error) {
               console.error("Error removing user data:", error);
               await interaction.reply({
                    content: "An error occurred while removing user data."
               });
          }
     }
}