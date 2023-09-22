import { EmbedBuilder, Colors } from "discord.js";
export default class TestCommand {
    name = "uptime";
    description = "Shows how long the bot has been online for.";
    guardsman;
    constructor(guardsman) {
        this.guardsman = guardsman;
    }
    async execute(interaction) {
        try {
            let timestampInSeconds;
            if (this.guardsman.bot.readyTimestamp)
                timestampInSeconds = Math.floor(this.guardsman.bot.readyTimestamp / 1000);
            console.log(timestampInSeconds);
            if (timestampInSeconds)
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`TRU Console Uptime`)
                            .setDescription(`➥ The Console started <t:${timestampInSeconds}:R> (<t:${timestampInSeconds}>)`)
                            .setColor(Colors.DarkRed)
                    ]
                });
            else
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`TRU Console Uptime Error`)
                            .setDescription(`➥ Unable to retrieve a valid timestamp.`)
                            .setColor(Colors.Orange)
                    ]
                });
        }
        catch (error) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`TRU Console Uptime Error`)
                        .setDescription(`An error occurred trying to get the readyTimestamp: ${error}`)
                        .setColor(Colors.Orange)
                ]
            });
        }
    }
}
