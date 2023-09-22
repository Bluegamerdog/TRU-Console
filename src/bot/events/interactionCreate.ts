import { Colors, EmbedBuilder, Interaction } from "discord.js";
import { Guardsman } from "index";

export default async (guardsman: Guardsman, interaction: Interaction<"cached">) => {
    if (interaction.isChatInputCommand()) {
        //await interaction.deferReply();

        const sentCommand = interaction.commandName;
        const options = interaction.options;
        let command: ICommand | undefined;

        guardsman.bot.commands.list.find(category => {
            command = category.find(com => com.name == sentCommand)
            return command;
        })

        if (!command) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Command Execution Error")
                        .setDescription(`No command was found matching name \`${sentCommand}\`.`)
                        .setColor(Colors.Red)
                ]
            })
        }

        const subCommand = options.getSubcommand(false);
        if (subCommand) {
            command = command.subcommands?.find(subCom => subCom.name == subCommand);
        }

        if (!command) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Command Execution Error")
                        .setDescription(`No command was found matching name \`${sentCommand}\`.`)
                        .setColor(Colors.Red)
                ]
            })
        }

        try {
            await command.execute(interaction);
        }
        catch (error) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Command Execution Error")
                        .setDescription(`${error}`)
                        .setColor(Colors.Red)
                ]
            })
        }
    }
}