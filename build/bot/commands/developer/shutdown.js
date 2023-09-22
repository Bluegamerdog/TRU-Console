export default class TestCommand {
    name = "shutdown";
    description = "Terminates the bot.";
    guardsman;
    authorizedUserIds = ["776226471575683082"];
    constructor(guardsman) {
        this.guardsman = guardsman;
    }
    async execute(interaction) {
        const member = interaction.member;
        if (this.authorizedUserIds.includes(member.id)) {
            try {
                await interaction.reply("Shutting down...");
                process.exit();
            }
            catch (error) {
                await interaction.reply(`ERROR: ${error}`);
            }
        }
        else {
            // Unauthorized user
            await interaction.reply("You do not have permission to use this command.");
        }
    }
}
