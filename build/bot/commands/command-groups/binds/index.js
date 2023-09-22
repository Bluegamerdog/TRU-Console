import BindRemoveSubcommand from "./remove.js";
import BindAddSubcommand from "./group.js";
import BindViewSubcommand from "./view.js";
import BindUserSubcommand from "./user.js";
export default class BindCommand {
    name = "binds";
    description = "Allows guild administrators to bind ROBLOX data to the guild for users to obtain roles.";
    guardsman;
    subcommands;
    constructor(guardsman) {
        this.guardsman = guardsman;
        // Create instances of subcommands and store them in the subcommands property
        this.subcommands = [
            new BindRemoveSubcommand(this.guardsman),
            new BindAddSubcommand(this.guardsman),
            new BindViewSubcommand(this.guardsman),
            new BindUserSubcommand(this.guardsman),
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
