import { ApplicationCommandOptionBase, ChatInputCommandInteraction, EmbedBuilder, SlashCommandStringOption, SlashCommandUserOption } from "discord.js";
import { Guardsman } from "index";
import { getHighestRole } from "../../../utils/roleFunctions.js"
import { getAllComments } from '../../../utils/trelloFunctions.js';

export default class DatabaseTestCommand implements ICommand {
    name: Lowercase<string> = "trello";
    description: string = "Insert something into the database.";
    guardsman: Guardsman;
    options: ApplicationCommandOptionBase[] = [
        new SlashCommandStringOption()
            .setName("name")
            .setDescription("card name")
            .setRequired(true),
    ];

    constructor(guardsman: Guardsman) {
        this.guardsman = guardsman;
    }

    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        await interaction.deferReply({ephemeral:false})
        try {
            const options = interaction.options;
            const name = options.getString("name", true);
            const console_logs = new EmbedBuilder()
            console_logs.setTitle("Test")
            const comments = await getAllComments(name)
            
            console_logs.setDescription(comments)
            await interaction.editReply({
                embeds: [
                     new EmbedBuilder()
                          .setTitle(`Test | ${name}`)
                          .setDescription(`${comments}`)
                          .setTimestamp()
                          .setFooter({ text: "Console Trello" })
                ]
           });
           return
        } catch (error) {
            console.log(error)
            await interaction.editReply({
                embeds: [
                     new EmbedBuilder()
                          .setTitle(`Test | FAILED SOB`)
                          .setDescription(`${error}`)
                          .setTimestamp()
                          .setFooter({ text: "Console Trello" })
                ]
           });
           return
        }

    }
}