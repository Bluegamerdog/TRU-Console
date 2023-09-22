import { Colors, EmbedBuilder, SlashCommandRoleOption, SlashCommandUserOption } from "discord.js";
import { PrismaClient } from '@prisma/client';
import { getServerConfigs } from '../../../../utils/prismaUtils.js';
import { permissionsCheck } from '../../../../utils/roleFunctions.js';
const prisma = new PrismaClient();
export default class BindUserSubcommand {
    name = "user";
    description = "Allows the binding of role to a specific user.";
    guardsman;
    options = [
        new SlashCommandRoleOption()
            .setName("role")
            .setDescription("The role to bind to.")
            .setRequired(true),
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("The user to bind the role to.")
            .setRequired(true),
    ];
    constructor(guardsman) {
        this.guardsman = guardsman;
    }
    async execute(interaction) {
        const guild = interaction.guild;
        //await interaction.deferReply({ephemeral:true})
        const serverConfigs = await getServerConfigs(guild.id);
        if (!serverConfigs) {
            this.guardsman.bot.emit("missingServerConfigs", interaction);
            return;
        }
        const target = await interaction.guild.roles.fetch(serverConfigs?.commandRoleID);
        if (!target) {
            this.guardsman.bot.emit("invalidServerConfigs", interaction);
            return;
        }
        const permission = permissionsCheck("rp", interaction.member, target, interaction);
        if (!permission) {
            this.guardsman.bot.emit("missingPermissions", interaction);
            return;
        }
        //this.guardsman.bot.emit("missingPermissions", interaction);
        const options = interaction.options;
        const guildRole = options.getRole("role", true);
        const bindUser = options.getUser("user", true);
        // validate role settings
        const userRoleBind = {
            type: "user",
            userId: bindUser.id,
        };
        const existingRole = await this.guardsman.database.verificationBinds.findFirst({
            where: {
                guild_id: guild.id,
                role_id: guildRole.id,
                role_data: JSON.stringify(userRoleBind)
            }
        });
        if (existingRole) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Console Database")
                        .setDescription(`A user role bind for <@&${guildRole.id}> with those properties already exists.`)
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
                role_data: JSON.stringify(userRoleBind)
            }
        });
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Console Database`)
                    .setDescription(`Successfully added a role bind for <@&${guildRole.id}> and ${bindUser}.`)
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({ text: "Console Database" })
            ]
        });
    }
}
