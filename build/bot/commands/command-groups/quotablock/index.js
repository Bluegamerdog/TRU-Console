import qbGetSubcommand from "./fetch.js"; // Import the subcommand class
import qbSetactiveSubcommand from "./setactive.js"; // Import the subcommand class
import qbOverviewSubcommand from "./overview.js"; // Import the subcommand class
export default class QuotaBlockCommands {
    name = "quotablock";
    description = "Is used to set the ID values for the server configurations.";
    guardsman;
    subcommands;
    constructor(guardsman) {
        this.guardsman = guardsman;
        // Create instances of subcommands and store them in the subcommands property
        this.subcommands = [
            new qbGetSubcommand(this.guardsman),
            new qbOverviewSubcommand(this.guardsman),
            new qbSetactiveSubcommand(this.guardsman),
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
