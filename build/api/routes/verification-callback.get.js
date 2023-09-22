import axios from "axios";
import { getHighestRole } from "../../utils/roleFunctions.js";
export default async (guardsman, request, response) => {
    console.log("Callback function fired");
    const query = request.query;
    const oauthCode = query.code || "";
    const codeState = query.state || "";
    if (oauthCode == "" || codeState == "") {
        return response.json({
            success: false,
            status: "OAuth2 Code or State not sent on request. Please try again."
        });
    }
    axios.post("https://apis.roblox.com/oauth/v1/token", {
        client_id: guardsman.environment.ROBLOX_CLIENT_ID,
        client_secret: guardsman.environment.ROBLOX_CLIENT_TOKEN,
        grant_type: "authorization_code",
        code: oauthCode.toString()
    }, { headers: { "Content-Type": "application/x-www-form-urlencoded" } })
        .then((res) => {
        const access_token = res.data.access_token;
        if (!access_token)
            return response.json({ success: "false", status: "OAuth2 access token not sent on response. Please try again." });
        axios.get("https://apis.roblox.com/oauth/v1/userinfo", {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Bearer " + access_token
            },
            data: {
                client_id: guardsman.environment.ROBLOX_CLIENT_ID,
                client_secret: guardsman.environment.ROBLOX_CLIENT_TOKEN
            }
        })
            .then(async (userInfo) => {
            const userData = userInfo.data;
            const userId = userData.sub;
            const username = userData.preferred_username;
            const pendingVerificationUser = await guardsman.database.pendingVerification.findFirst({
                where: {
                    token: codeState.toString()
                }
            });
            if (!pendingVerificationUser) {
                return response.json({
                    success: false,
                    status: "Unable to verify request. Please try again."
                });
            }
            const existingUser = await guardsman.database.operator.findFirst({
                where: {
                    OR: [
                        { username: username },
                        { discord_id: pendingVerificationUser.discord_id }
                    ]
                }
            });
            if (existingUser) {
                await guardsman.database.operator.update({
                    where: { discord_id: existingUser.discord_id },
                    data: {
                        username: username,
                        roblox_id: userId,
                        discord_id: pendingVerificationUser.discord_id
                    }
                });
            }
            else {
                const interaction = guardsman.bot.pendingVerificationInteractions[pendingVerificationUser.discord_id];
                const user = await interaction.guild.members.fetch(pendingVerificationUser.discord_id);
                await guardsman.database.operator.create({
                    data: {
                        discord_id: pendingVerificationUser.discord_id,
                        username: username,
                        roblox_id: userId,
                        truRank: getHighestRole(user).name,
                    }
                });
            }
            const joinRequest = await guardsman.roblox.getJoinRequest(15155175, userId);
            console.log(joinRequest);
            if (joinRequest) {
                // If there is a join request, accept it
                await guardsman.roblox.handleJoinRequest(15155175, userId, true);
            }
            await guardsman.database.pendingVerification.deleteMany({
                where: {
                    discord_id: pendingVerificationUser.discord_id
                }
            });
            response.redirect("https://arguably-innocent-herring.ngrok-free.app/verification-successful");
            guardsman.bot.emit("verificationComplete", pendingVerificationUser.discord_id, username.toString());
        })
            .catch(err => {
            console.log(err);
            return response.json({
                success: "false",
                status: "An error occurred when fetching OAuth2 resources. Please try again."
            });
        });
    })
        .catch((res) => {
        console.log(res);
        return response.json({
            success: "false",
            status: "OAuth2 code is invalid. Please try again."
        });
    });
};
