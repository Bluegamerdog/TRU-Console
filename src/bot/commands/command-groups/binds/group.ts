import { Guardsman } from "index";
import {
    ApplicationCommandOptionBase,
    ChatInputCommandInteraction, Colors, EmbedBuilder,
    SlashCommandNumberOption,
    SlashCommandRoleOption
} from "discord.js";
import { PrismaClient } from '@prisma/client';
import { getServerConfigs } from '../../../../utils/prismaUtils.js';
import { permissionsCheck } from '../../../../utils/roleFunctions.js'



const prisma = new PrismaClient();


export default class BindGroupSubcommand implements ICommand {
    name: Lowercase<string> = "group";
    description: string = "Allows the binding of ROBLOX group data to a discord role.";
    guardsman: Guardsman;
    options: ApplicationCommandOptionBase[] = [
        new SlashCommandRoleOption()
            .setName("role")
            .setDescription("The role to bind to.")
            .setRequired(true),
        new SlashCommandNumberOption()
            .setName("group")
            .setDescription("The ID of the group to bind to.")
            .setRequired(true),
        new SlashCommandNumberOption()
            .setName("minrank")
            .setDescription("The minimum rank to obtain the role."),
        new SlashCommandNumberOption()
            .setName("maxrank")
            .setDescription("The maximum rank to obtain the role.")
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
        const target = await interaction.guild.roles.fetch(serverConfigs?.commandRoleID)
        if (!target) {
            this.guardsman.bot.emit("invalidServerConfigs", interaction)
            return
        }
        const permission = permissionsCheck("rp", interaction.member, target, interaction)
        if (!permission) {
            this.guardsman.bot.emit("missingPermissions", interaction);
            return
        }


        //this.guardsman.bot.emit("missingPermissions", interaction);
        const options = interaction.options;
        const guildRole = options.getRole("role", true);
        const groupId = options.getNumber("group", true);
        const minRank = options.getNumber("minrank");
        const maxRank = options.getNumber("maxrank");

        // validate role settings
        const groupRoleBind: RoleData<RoleDataGroupBind> = {
            type: "group",
            groupId: groupId,
            minRank: minRank || 0,
            maxRank: maxRank || 255
        }

        const existingRole = await this.guardsman.database.verificationBinds.findFirst({
            where: {
                guild_id: guild.id,
                role_id: guildRole.id,
                role_data: JSON.stringify(groupRoleBind)
            }
        });


        if (existingRole) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Console Database")
                        .setDescription(`A group role bind for <@&${guildRole.id}> with those properties already exists.`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({ text: "Console Database" })
                ]
            });

            return;
        }

        await this.guardsman.database.verificationBinds.create({
            data: {
                guild_id: guild.id,
                role_id: guildRole.id,
                role_data: JSON.stringify(groupRoleBind)
            }
        });


        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Console Database`)
                    .setDescription(`Successfully added a group bind for <@&${guildRole.id}> for Group ${groupId} at rank ${groupRoleBind.minRank} up to rank ${groupRoleBind.maxRank}.`)
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({ text: "Console Database" })
            ]
        })
    }
}