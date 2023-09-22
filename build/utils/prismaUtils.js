import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function getServerConfigs(serverID) {
    try {
        const serverConfigs = await prisma.serverSetup.findFirst({
            where: { serverID: serverID }
        });
        return serverConfigs;
    }
    catch (error) {
        console.error("Error fetching server configs:", error);
        return null;
    }
}
export async function createPendingVerification(interaction, token) {
    try {
        if (interaction.user.id) {
            await prisma.pendingVerification.create({
                data: {
                    discord_id: interaction.user.id,
                    token: token
                }
            });
            return true;
        }
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
}
