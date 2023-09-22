import { Colors, EmbedBuilder } from "discord.js";
export default async (guardsman, discordId) => {
    try {
        const interaction = guardsman.bot.pendingVerificationInteractions[discordId];
        if (interaction) {
            const reply = await interaction.editReply({
                components: [],
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Console Verification`)
                        .setDescription("Discord account verification was successful! Please run </operator update:1143537021487427807> to obtain roles.")
                        .setColor(Colors.Green)
                        .setTimestamp()
                        .setFooter({
                        text: "Console Verification"
                    }),
                ],
            });
            const logChannel = guardsman.bot.channels.cache.get("1143525855960760390");
            if (logChannel) {
                await logChannel.send({
                    content: `<@776226471575683082> | <@${interaction.member.id}> has registered with TRU Console!`
                });
            }
            else {
                console.log("Channel not found while trying to send verification notice!");
            }
            await interaction.followUp({ content: `<@${interaction.member.id}>`, ephemeral: true });
        }
        else {
            console.log(`No valid interaction found for 'verificationComplete': ${interaction}`);
        }
    }
    catch (error) {
        console.log(error);
    }
};
