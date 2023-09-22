import aptureCounterSubcommand from "./counter.js"; // Import the subcommand class
import aptureAddSubcommand from "./add.js"; // Import the subcommand class
import aptureRequestSubCommand from "./request.js";
export default class apturejokeCommand {
    name = "apturedadjoke";
    description = "Is used to set the ID values for the server configurations.";
    guardsman;
    subcommands;
    constructor(guardsman) {
        this.guardsman = guardsman;
        // Create instances of subcommands and store them in the subcommands property
        this.subcommands = [
            new aptureAddSubcommand(this.guardsman),
            new aptureCounterSubcommand(this.guardsman),
            new aptureRequestSubCommand(this.guardsman)
            // Add more subcommands here if needed
        ];
    }
    async execute(interaction) {
        // Get the invoked subcommand name
        const invokedSubcommandName = interaction.options.getSubcommand(true);
        // Find the corresponding subcommand instance
        const invokedSubcommand = this.subcommands?.find(subcommand => subcommand.name === invokedSubcommandName);
        if (invokedSubcommand) {
            // Execute the subcommand's execute method
            await invokedSubcommand.execute(interaction);
        }
        else {
            // No valid subcommand was invoked, you can display an error message here
        }
    }
}
