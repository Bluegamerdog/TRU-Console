import { Guardsman } from "index";
import { ChatInputCommandInteraction } from "discord.js";
import brLogSubCommand from "./log.js"; // Import the subcommand class
import brGetSubCommand from "./get.js"; // Import the subcommand class
import brFixSubCommand from "./fix.js"

export default class BackupRequestCommand implements ICommand {
    name: Lowercase<string> = "backup_request";
    description: string = "Backup Request Commands.";
    guardsman: Guardsman;
    subcommands?: ICommand[] | undefined;

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;

        // Create instances of subcommands and store them in the subcommands property
        this.subcommands = [
            new brLogSubCommand(this.guardsman),
            new brGetSubCommand(this.guardsman),
            new brFixSubCommand(this.guardsman)
            // Add more subcommands here if needed
        ];
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        // Get the invoked subcommand name
        const invokedSubcommandName = interaction.options.getSubcommand(true);

        // Find the corresponding subcommand instance
        const invokedSubcommand = this.subcommands?.find(
            subcommand => subcommand.name === invokedSubcommandName
        );

        if (invokedSubcommand) {
            // Execute the subcommand's execute method
            await invokedSubcommand.execute(interaction);
        } else {
            // No valid subcommand was invoked, you can display an error message here
        }
    }
}
