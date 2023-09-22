export default class TestCommand {
    name = "ping";
    description = "See if the bot response...";
    guardsman;
    constructor(guardsman) {
        this.guardsman = guardsman;
    }
    async execute(interaction) {
        await interaction.reply("Pong! 🏓");
    }
}
