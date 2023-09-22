import { Colors, EmbedBuilder, SlashCommandStringOption } from "discord.js";
import { getServerConfigs } from '../../../../utils/prismaUtils.js';
import { permissionsCheck } from '../../../../utils/roleFunctions.js';
export default class brFixSubCommand {
    name = "fix";
    description = "Incase the buttons fail, this is used to accept/deny any requests.";
    guardsman;
    options = [
        new SlashCommandStringOption()
            .setName("response-request-id")
            .setDescription("The ID of the response request to fix.")
            .setRequired(true),
        new SlashCommandStringOption()
            .setName("choice")
            .setDescription("Select the action to perform on the response request.")
            .setRequired(true)
            .addChoices({ name: "Accept", value: "accept", }, { name: "Deny", value: "deny", }, { name: "Delete", value: "delete", }),
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
        const target = await interaction.guild.roles.fetch(serverConfigs.commandRoleID);
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
        const responseRequestId = options.getString("response-request-id", true);
        const choice = options.getString("choice", true);
        const embed = new EmbedBuilder()
            .setTimestamp()
            .setFooter({ text: "Console Requests" });
        // Handle database updates based on the selected choice
        switch (choice) {
            case "accept":
                await this.guardsman.database.backupResponses.update({
                    where: { responseRequestID: parseInt(responseRequestId) },
                    data: { requestStatus: "Accepted" },
                });
                embed.setDescription("Response request has been set to 'Accepted'.");
                embed.setColor(Colors.Green);
                break;
            case "deny":
                await this.guardsman.database.backupResponses.update({
                    where: { responseRequestID: parseInt(responseRequestId) },
                    data: { requestStatus: "Denied" },
                });
                embed.setDescription("Response request has been set to 'Denied'.");
                embed.setColor(Colors.Green);
                break;
            case "delete":
                await this.guardsman.database.backupResponses.delete({
                    where: { responseRequestID: parseInt(responseRequestId) },
                });
                embed.setDescription("Response request has been deleted.");
                embed.setColor(Colors.Green);
                break;
            default:
                embed.setDescription("Invalid choice selected.");
                embed.setColor(Colors.Red);
        }
        await interaction.reply({ embeds: [embed] });
    }
}
