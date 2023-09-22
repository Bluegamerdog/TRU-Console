import OperatorUpdateSubcommand from "./update.js"; // Import the subcommand class
import OperatorVerifySubsommand from "./verify.js"; // Import the subcommand class
import OperatorRankSubcommand from "./rank.js";
import OperatorRemoveSubcommand from "./remove.js";
import OperatorGetSubcommand from "./get.js";
export default class OperatorCommands {
    name = "operator";
    description = "Is used to set the ID values for the server configurations.";
    guardsman;
    subcommands;
    constructor(guardsman) {
        this.guardsman = guardsman;
        // Create instances of subcommands and store them in the subcommands property
        this.subcommands = [
            new OperatorUpdateSubcommand(this.guardsman),
            new OperatorVerifySubsommand(this.guardsman),
            new OperatorRankSubcommand(this.guardsman),
            new OperatorRemoveSubcommand(this.guardsman),
            new OperatorGetSubcommand(this.guardsman),
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
