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

export default class qbOverviewSubcommand implements ICommand {
     name: Lowercase<string> = "overview";
     description: string = "Gets a list of all quota blocks.";
     guardsman: Guardsman;
     options: ApplicationCommandOptionBase[] = [];

     constructor(guardsman: Guardsman) {
          this.guardsman = guardsman;
     }

     async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
          const guild = interaction.guild;
          await interaction.deferReply({ ephemeral: true })
          const serverConfigs = await getServerConfigs(guild.id)
          if (!serverConfigs) {
               this.guardsman.bot.emit("missingServerConfigs", interaction)
               return
          }
          const target = await interaction.guild.roles.fetch(serverConfigs.responsePingRoleID)
          if (!target) {
               this.guardsman.bot.emit("invalidServerConfigs", interaction)
               return
          }
          const permission = permissionsCheck("rp", interaction.member, target, interaction)
          if (!permission) {
               this.guardsman.bot.emit("missingPermissions", interaction);
               return
          }

          let disabled = false
          if (disabled) {
               this.guardsman.bot.emit("incompleteCommand", interaction)
               return
          }

          const quotaBlocks = await this.guardsman.database.quotaBlocks.findMany()

          if (quotaBlocks.length > 0) {
               const quotaBlocksList = new EmbedBuilder()
                    .setTitle("TRU Quota Blocks | 2023")
                    .setColor(Colors.DarkRed)

               for (const block of quotaBlocks) {
                    const blockActive = block.blockActive ? "Active" : "Inactive";
                    quotaBlocksList.addFields({
                         name: `➣ Block Number ${block.blockNum} | ${blockActive}`,
                         value: `<t:${block.unix_starttime}> - <t:${block.unix_endtime}>`,
                         inline: false
                    }
                    );
               }
               await interaction.editReply({
                    embeds: [quotaBlocksList],
               });
          } else {
               await interaction.editReply({
                    embeds: [new EmbedBuilder()
                         .setTitle("No Quota Blocks found!")
                         .setDescription("No quota block data was found in the database.")
                         .setColor(Colors.Yellow)
                    ],
               });
          }
     }
}