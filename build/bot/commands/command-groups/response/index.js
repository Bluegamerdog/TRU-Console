//import ConfigsViewSubcommand from "./view.js"; // Import the subcommand class
//import ConfigsSetSubcommand from "./set.js"; // Import the subcommand class
export default class ServerConfigsCommand {
    name = "response";
    description = "Response Commands.";
    guardsman;
    subcommands;
    constructor(guardsman) {
        this.guardsman = guardsman;
        // Create instances of subcommands and store them in the subcommands property
        this.subcommands = [
        //new ConfigsViewSubcommand(this.guardsman),
        //new ConfigsSetSubcommand(this.guardsman)
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
