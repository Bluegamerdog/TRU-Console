import { Colors, EmbedBuilder, SlashCommandIntegerOption, } from "discord.js";
import { getServerConfigs } from '../../../../utils/prismaUtils.js';
import { permissionsCheck } from '../../../../utils/roleFunctions.js';
export default class qbGetSubcommand {
    name = "fetch";
    description = "Gets a specified or the current quota blocks.";
    guardsman;
    options = [
        new SlashCommandIntegerOption()
            .setName("block-nr")
            .setDescription("The block you want to retrieve. [1-17] (Defaults to current quota block)")
            .setRequired(false),
    ];
    constructor(guardsman) {
        this.guardsman = guardsman;
    }
    async execute(interaction) {
        const guild = interaction.guild;
        const serverConfigs = await getServerConfigs(guild.id);
        if (!serverConfigs) {
            this.guardsman.bot.emit("missingServerConfigs", interaction);
            return;
        }
        const target = await interaction.guild.roles.fetch(serverConfigs.responsePingRoleID);
        if (!target) {
            this.guardsman.bot.emit("invalidServerConfigs", interaction);
            return;
        }
        const permission = permissionsCheck("rp", interaction.member, target, interaction);
        if (!permission) {
            this.guardsman.bot.emit("missingPermissions", interaction);
            return;
        }
        const options = interaction.options;
        const requestedBlock = options.getInteger("block-nr", false);
        let quotaBlockData;
        let disabled = false;
        if (disabled) {
            this.guardsman.bot.emit("incompleteCommand", interaction);
            return;
        }
        if (requestedBlock) {
            quotaBlockData = await this.guardsman.database.quotaBlocks.findUnique({ where: { blockNum: requestedBlock } });
            if (!quotaBlockData) {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Requested data not found!`)
                            .setDescription(`Could not find any quota block data for block-nr **${requestedBlock}** in the database.`)
                            .setColor(Colors.Red)
                            .setTimestamp()
                            .setFooter({ text: "Console Database" })
                    ]
                });
                return;
            }
        }
        else {
            quotaBlockData = await this.guardsman.database.quotaBlocks.findFirst({ where: { blockActive: true } });
        }
        if (!quotaBlockData) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`No data found!`)
                        .setDescription(`No quota block was specified and no active quota block was found.`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Console Database" })
                ]
            });
            return;
        }
        let blockStatus = "Inactive";
        if (quotaBlockData.blockActive) {
            blockStatus = "Active";
        }
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Data found!`)
                    .addFields([
                    { name: `➣ Block Number ${quotaBlockData.blockNum} | ${blockStatus}`, value: `<t:${quotaBlockData.unix_starttime}> - <t:${quotaBlockData.unix_endtime}>` },
                ])
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({ text: "Console Database" })
            ]
        });
        return;
    }
}
