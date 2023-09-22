import { Guardsman } from "index";
import {
     ApplicationCommandOptionBase,
     ChatInputCommandInteraction, Colors, EmbedBuilder,
     SlashCommandIntegerOption
} from "discord.js";
import { getServerConfigs } from '../../../../utils/prismaUtils.js';
import { permissionsCheck } from '../../../../utils/roleFunctions.js'

export default class qbSetactiveSubcommand implements ICommand {
     name: Lowercase<string> = "setactive";
     description: string = "Sets a quota block as active.";
     guardsman: Guardsman;
     options: ApplicationCommandOptionBase[] = [
          new SlashCommandIntegerOption()
               .setName("block-nr")
               .setDescription("The block you want to set as active. [1-17]")
               .setRequired(true),
     ];

     constructor(guardsman: Guardsman) {
          this.guardsman = guardsman;
     }

     async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
          const guild = interaction.guild;
          //await interaction.deferReply({ephemeral:true})
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


          const options = interaction.options;
          let disabled = false
          if (disabled) {
               this.guardsman.bot.emit("incompleteCommand", interaction)
               return
          }

          const newBlockNum = options.getInteger("block-nr", true);

          if (newBlockNum) {
               let blockExistanceCheck = await this.guardsman.database.quotaBlocks.findUnique({ where: { blockNum: newBlockNum } })

               if (!blockExistanceCheck) {
                    await interaction.reply({
                         embeds: [
                              new EmbedBuilder()
                                   .setTitle(`Requested data not found!`)
                                   .setDescription(`Could not find any quota block data for block-nr **${newBlockNum}** in the database.`)
                                   .setColor(Colors.Red)
                                   .setTimestamp()
                                   .setFooter({ text: "Console Database" })
                         ], ephemeral: true
                    });
                    return
               }
          }
          
          await this.guardsman.database.quotaBlocks.updateMany(
               {where: {blockActive: true}, data: {blockActive: false}})

          const newQuotaBlock = await this.guardsman.database.quotaBlocks.update(
               {where: {blockNum: newBlockNum}, data: { blockActive: true }})

          if (!newQuotaBlock) {
               await interaction.reply({
                    embeds: [
                         new EmbedBuilder()
                         .setTitle("Failed to update Quota Blocks!") 
                         .setDescription(`There was an error updating the database: ${newQuotaBlock}`)
                         .setColor(Colors.Red)
                         .setTimestamp()
                         .setFooter({text: "Console Database"})
                    ], ephemeral: true
               });
               return
          }
          else {
               await interaction.reply({
                    embeds: [
                         new EmbedBuilder()
                         .setTitle("Active Quota Block Updated!") 
                         .setDescription(`The active quota block has been updated to block number ${newBlockNum}.`)
                         .setColor(Colors.Green)
                         .addFields({
                              name: `➣ Block Number ${newQuotaBlock.blockNum} | ${newQuotaBlock.blockActive ? "Active" : "Inactive"}`,
                              value: `<t:${newQuotaBlock.unix_starttime}> - <t:${newQuotaBlock.unix_endtime}>`,
                              inline: false
                         })
                         .setTimestamp()
                         .setFooter({text: "Console Database"})
                    ], ephemeral: true
               });
          }
     }
}