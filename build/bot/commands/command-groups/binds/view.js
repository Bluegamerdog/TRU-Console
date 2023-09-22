import { Colors, EmbedBuilder, SlashCommandRoleOption } from "discord.js";
export default class BindViewSubcommand {
    name = "view";
    description = "View existing role binds for the guild.";
    guardsman;
    options = [
        new SlashCommandRoleOption()
            .setName("role")
            .setDescription("The role to view binds for.")
    ];
    constructor(guardsman) {
        this.guardsman = guardsman;
    }
    async execute(interaction) {
        const guild = interaction.guild;
        const options = interaction.options;
        await interaction.deferReply({ ephemeral: false });
        let guildRole = options.getRole("role");
        if (!guildRole) {
            // If no specific role is provided, view all binds
            const allBinds = await this.guardsman.database.verificationBinds.findMany({
                where: {
                    guild_id: guild.id
                }
            });
            if (allBinds.length === 0) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Console Database")
                            .setDescription(`No role binds found for the guild.`)
                            .setColor(Colors.Yellow)
                            .setTimestamp()
                            .setFooter({ text: "Console Database" })
                    ]
                });
                return;
            }
            const embed = new EmbedBuilder()
                .setTitle(`Console Database - All Role Binds`)
                .setColor(Colors.DarkRed);
            for (const bind of allBinds) {
                const roleData = JSON.parse(bind.role_data);
                const role = guild.roles.cache.get(bind.role_id);
                let fieldContent = '';
                if (role) {
                    if (roleData.type === "group") {
                        fieldContent = `> **Discord Role:** <@&${role.id}>\n> **Roblox Group ID:** ${roleData.groupId}\n> **Rank IDs:** ${roleData.minRank} - ${roleData.maxRank}`;
                    }
                    else if (roleData.type === "user") {
                        const user = await guild.members.fetch(roleData.userId);
                        if (user) {
                            fieldContent = `> **Discord Role:** <@&${role.id}>\n> **User:** ${user}`;
                        }
                        else {
                            fieldContent = `> **Discord Role:** <@&${role.id}>\n> **User:** Not found!`;
                        }
                    }
                    else {
                        fieldContent = `Unknown bind type ${roleData.type}. Please contact Blue.`;
                    }
                }
                else {
                    if (roleData.type === "group") {
                        fieldContent = `> **Discord Role:** Not found!\n> **Roblox Group ID:** ${roleData.groupId}\n> **Rank IDs:** ${roleData.minRank} - ${roleData.maxRank}`;
                    }
                    else if (roleData.type === "user") {
                        fieldContent = `> **Discord Role:** Not found!\n> **User:** Not found!`;
                    }
                    else {
                        fieldContent = `Unknown bind type ${roleData.type}. Please contact Blue.`;
                    }
                }
                embed.addFields({
                    name: role ? `Role Name: ${role.name}` : 'Role Not Found!',
                    value: fieldContent,
                });
            }
            await interaction.editReply({
                embeds: [embed]
            });
        }
        else {
            // View specific bind for the provided role
            const existingBinds = await this.guardsman.database.verificationBinds.findMany({
                where: {
                    guild_id: guild.id,
                    role_id: guildRole.id
                }
            });
            if (existingBinds.length === 0) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Console Database")
                            .setDescription(`No role binds found for <@&${guildRole.id}>.`)
                            .setColor(Colors.Yellow)
                            .setTimestamp()
                            .setFooter({ text: "Console Database" })
                    ]
                });
                return;
            }
            const embed = new EmbedBuilder()
                .setTitle(`Console Database`)
                .setColor(Colors.DarkRed);
            for (const bind of existingBinds) {
                const roleData = JSON.parse(bind.role_data);
                const role = guild.roles.cache.get(bind.role_id);
                let fieldContent = '';
                if (role) {
                    if (roleData.type === "group") {
                        fieldContent = `> **Discord Role:** <@&${role.id}>\n> **Roblox Group ID:** ${roleData.groupId}\n> **Rank IDs:** ${roleData.minRank} - ${roleData.maxRank}`;
                    }
                    else if (roleData.type === "user") {
                        const user = await guild.members.fetch(roleData.userId);
                        if (user) {
                            fieldContent = `> **Discord Role:** <@&${role.id}>\n> **User:** ${user}`;
                        }
                        else {
                            fieldContent = `> **Discord Role:** <@&${role.id}>\n> **User:** Not found!`;
                        }
                    }
                    else {
                        fieldContent = `Unknown bind type ${roleData.type}. Please contact Blue.`;
                    }
                }
                else {
                    if (roleData.type === "group") {
                        fieldContent = `> **Discord Role:** Not found!\n> **Roblox Group ID:** ${roleData.groupId}\n> **Rank IDs:** ${roleData.minRank} - ${roleData.maxRank}`;
                    }
                    else if (roleData.type === "user") {
                        fieldContent = `> **Discord Role:** Not found!\n> **User:** Not found!`;
                    }
                    else {
                        fieldContent = `Unknown bind type ${roleData.type}. Please contact Blue.`;
                    }
                }
                embed.addFields({
                    name: role ? `Role Name: ${role.name}` : 'Role Not Found!',
                    value: fieldContent,
                });
            }
            await interaction.editReply({
                embeds: [embed]
            });
        }
    }
}
