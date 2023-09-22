import StrikeDeleteSubcommand from "./delete.js";
import StrikeGetSubcommand from "./get.js";
import StrikeGiveSubcommand from "./give.js";
export default class StrikeCommand {
    name = "strike";
    description = "Used to hand out moderation strikes.";
    guardsman;
    subcommands;
    constructor(guardsman) {
        this.guardsman = guardsman;
        // Create instances of subcommands and store them in the subcommands property
        this.subcommands = [
            new StrikeDeleteSubcommand(this.guardsman),
            new StrikeGetSubcommand(this.guardsman),
            new StrikeGiveSubcommand(this.guardsman)
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
