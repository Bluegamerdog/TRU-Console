export default class aptureCounterSubcommand {
    name = "counter";
    description = "Gets apture's current dad-joke count.";
    guardsman;
    constructor(guardsman) {
        this.guardsman = guardsman;
    }
    async execute(interaction) {
        try {
            // Fetch the existing counter record
            const counter = await this.guardsman.database.aptureJokeCounter.findFirst();
            if (counter) {
                await interaction.reply(`Aptures current dad-joke count is: ${counter.amount}`);
            }
            else {
                await interaction.reply("Aptures dad-joke count is currently not available.");
            }
        }
        catch (error) {
            console.error(error);
            await interaction.reply(`An error occurred while fetching the counter: ${error}`);
        }
    }
}
