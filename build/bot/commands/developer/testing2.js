import { EmbedBuilder } from "discord.js";
import { processUsersAndComments } from '../../../utils/trelloFunctions.js';
import { chunkStringByNewline } from '../../../utils/miscFunctions.js';
export default class DatabaseTestCommand {
    name = "testing2";
    description = "Insert something into the database.";
    guardsman;
    options = [];
    constructor(guardsman) {
        this.guardsman = guardsman;
    }
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });
        try {
            const console_logs = new EmbedBuilder();
            console_logs.setTitle("Test");
            const comments = await processUsersAndComments();
            if (comments) {
                // Create formatted strings for all the lists
                const noTrellocardFoundString = comments.noTrellocardFound.map(item => `${item}`).join('\n');
                const noResponseFoundListString = comments.noResponseFoundList.map(item => `${item.userName}: <t:${item.commentDate}>`).join('\n');
                const resultsListString = comments.resultsList.map(item => `**${item.userName}:** ${item.foundAmount}/${item.totalAmount}`).join('\n');
                const fullSuccessString = comments.fullSuccess.map(item => `${item.userName}: <t:${item.commentDate}> | <t:${item.responseDate}>`).join('\n');
                const formattedNoTrellocardFound = noTrellocardFoundString || 'None';
                const formattedNoResponseFoundList = noResponseFoundListString || 'None';
                const formattedResultsList = resultsListString || 'None';
                const fullSuccessStringFound = fullSuccessString || 'None';
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Test | Data received`)
                            .setDescription(`Trying to send returned data.`)
                            .setTimestamp()
                            .setFooter({ text: "Console Trello" })
                    ]
                });
                // Split the content into chunks of 2000 characters or less
                const chunkedResults = chunkStringByNewline(formattedResultsList, 1900);
                const chunkedNoTrellocardFound = chunkStringByNewline(formattedNoTrellocardFound, 1900);
                const chunkedNoResponseFoundList = chunkStringByNewline(formattedNoResponseFoundList, 1900);
                const chunkedFullSuccessStringFound = chunkStringByNewline(fullSuccessStringFound, 1900);
                for (const chunk of chunkedResults) {
                    await interaction.followUp({ content: `### End results:\n${chunk}` });
                }
                for (const chunk of chunkedNoTrellocardFound) {
                    await interaction.followUp({ content: `### Failed to find card for:\n${chunk}` });
                }
                for (const chunk of chunkedNoResponseFoundList) {
                    await interaction.followUp({ content: `### Failed to link comment for:\n${chunk}` });
                }
                for (const chunk of chunkedFullSuccessStringFound) {
                    await interaction.followUp({ content: `### Linked comment to response for:\n${chunk}` });
                }
                return;
            }
            await interaction.followUp({ content: `Could not find returned items, received: ${comments}` });
            return;
        }
        catch (error) {
            console.log(error);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Test | FAILED SOB`)
                        .setDescription(`${error}`)
                        .setTimestamp()
                        .setFooter({ text: "Console Trello" })
                ]
            });
            return;
        }
    }
}
