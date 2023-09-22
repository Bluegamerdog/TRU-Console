const responseTrello = {
    response_board_id: "6437e2978421d13cd9394a5d",

    default_list: "6437e2b7f6426e174d655d06",
    monday_list: "6437e49e10e8a03fa3dac765",
    tuesday_list: "6437e4a0c604da6927e42570",
    wednesday_list: "6437e4a282479e4e3039c33c",
    thursday_list: "6437e4a686c318850c172c2c",
    friday_list: "6437e4a76bfd790d5bdc6738",
    saturday_list: "6437e4aa35c94b574d3c8c47",
    sunday_list: "64386095c6f440093121fdd1",

    spontaneous_label: "6437e2974720c87ca4fe3e98",
    schedulued_label: "6437eb47965e94c2c8cb2eb3",
    cancelled_label: "6437e432cdf097cffdc2fda1"
}

const leadershipTrello = {
    leadership_board_id: "643707e584f45acbd7dd7c94",

    loa_label : "64373d1469dab5113422dd55",
    activeduty_label : "64373cae14c66fb33ccb6d12"
}

const activityTrello = {
    activity_board_id: "643c638f797233341d30294f"
}

import Trello from "trello"
const trello = new Trello("611905fd240d63a804e36a4fe7c9654e", "ATTA69143a1d63dd6eebe2b03a5715125045652f744b225c8f2fe7fe140e728a08c24D72615E");

let boardMembers;

export async function getAllComments(cardName: string) {
    try {
        // Find the card by name on the specified board
        const lists = await trello.getListsOnBoard(activityTrello.activity_board_id);
        let requested_card = null;
        let shouldBreak = false;
        for (const list of lists) {
            const cards = await trello.getCardsOnList(list.id);
            for (const card of cards) {
                console.log(card.name)
                if (card.name === cardName) {
                    requested_card = card
                    shouldBreak = true; // Set the flag to true to break both loops
                    break; // Break out of the inner loop
                }
            }

            if (shouldBreak) {
                break; // Break out of the outer loop if the flag is true
            }
        }

        if (!requested_card) {
            throw new Error(`Card not found with name: ${cardName}`);
        }

        // Fetch all comments for the found card
        const comments = await trello.makeRequest('get', `/1/cards/${requested_card.id}/actions`, {
            filter: 'commentCard',
        });

        

        // Convert the comments array to a string representation
        const commentsString = comments.map((comment: any) => {
            if (comment.data && comment.data.text) {
                const date = new Date(comment.date).getTime() / 1000;
                return `**${comment.memberCreator.username}:** ${comment.data.text} | <t:${Math.round(date)}>`;
            }
            return ''; // Handle cases where comment.data.text is missing or undefined
        }).join('\n');

        return commentsString;
    } catch (error) {
        console.error(`Error retrieving comments: ${error}`);
        throw error;
    }
}


export async function processUsersAndComments() {
    const noTrellocardFound = [];
    const noResponseFoundList = [];
    const ResponseList = [{'responseID': '1125156727881486387', 'timeEnded': '1688340184'}, {'responseID': '1128035059807551488', 'timeEnded': '1689024624'}, {'responseID': '1128374852173185214', 'timeEnded': '1689098392'}, {'responseID': '1128790602323087490', 'timeEnded': '1689211925'}, {'responseID': '1128961726663118880', 'timeEnded': '1689241725'}, {'responseID': '1129507179158851695', 'timeEnded': '1689377732'}, {'responseID': '1130017906906890341', 'timeEnded': '1689493550'}, {'responseID': '1130182961132752957', 'timeEnded': '1689534636'}, {'responseID': '1131864525335973888', 'timeEnded': '1689935667'}, {'responseID': '1131999106219393095', 'timeEnded': '1689967831'}, {'responseID': '1132576239601856592', 'timeEnded': '1690104570'}, {'responseID': '1132934453904277625', 'timeEnded': '1690189879'}, {'responseID': '1133089655223500871', 'timeEnded': '1690226940'}, {'responseID': '1133444921051852870', 'timeEnded': '1690312444'}, {'responseID': '1133658828907495464', 'timeEnded': '1690376576'}, {'responseID': '1133818669911249008', 'timeEnded': '1690402224'}, {'responseID': '1134059672098320447', 'timeEnded': '1690459182'}, {'responseID': '1134213087168315532', 'timeEnded': '1690491066'}, {'responseID': '1134671696943665303', 'timeEnded': '1690599470'}, {'responseID': '1134948554205569107', 'timeEnded': '1690675625'}, {'responseID': '1135142977044500531', 'timeEnded': '1690754980'}, {'responseID': '1135159790075654204', 'timeEnded': '1690719912'}, {'responseID': '1135478837057171527', 'timeEnded': '1690792237'}, {'responseID': '1136275012060459088', 'timeEnded': '1690986808'}, {'responseID': '1136342430682189977', 'timeEnded': '1691002885'}, {'responseID': '1136556922510786570', 'timeEnded': '1691049607'}, {'responseID': '1136557272747737089', 'timeEnded': '1691063652'}, {'responseID': '1137139678206775376', 'timeEnded': '1691195098'}, {'responseID': '1137464005963829308', 'timeEnded': '1691267609'}, {'responseID': '1137608645698392196', 'timeEnded': '1691304147'}, {'responseID': '1138004857018662982', 'timeEnded': '1691398153'}, {'responseID': '1138358668803457044', 'timeEnded': '1691483880'}, {'responseID': '1138517859031601273', 'timeEnded': '1691520900'}, {'responseID': '1138219142143541319', 'timeEnded': '1691451780'}, {'responseID': '1138864843223474176', 'timeEnded': '1691604198'}, {'responseID': '1139071480852918283', 'timeEnded': '1691654505'}, {'responseID': '1139234046564651059', 'timeEnded': '1691692039'}, {'responseID': '1139288380836941955', 'timeEnded': '1691719847'}, {'responseID': '1139380574675550208', 'timeEnded': '1691721738'}, {'responseID': '1139784302519914578', 'timeEnded': '1691819604'}, {'responseID': '1139996261211185162', 'timeEnded': '1691872738'}, {'responseID': '1140103065538670662', 'timeEnded': '1691893541'}, {'responseID': '1140496895899357224', 'timeEnded': '1691992730'}, {'responseID': '1140544979425566790', 'timeEnded': '1692005302'}, {'responseID': '1140727768515088514', 'timeEnded': '1692043804'}, {'responseID': '1140948849570086982', 'timeEnded': '1692100704'}, {'responseID': '1141053896916205729', 'timeEnded': '1692125550'}, {'responseID': '1141224873759363093', 'timeEnded': '1692164780'}, {'responseID': '1141285899620073493', 'timeEnded': '1692181746'}, {'responseID': '1141411910881923255', 'timeEnded': '1692212094'}, {'responseID': '1141809671582257213', 'timeEnded': '1692315199'}, {'responseID': '1142076226329128980', 'timeEnded': '1692369089'}, {'responseID': '1142497856398311494', 'timeEnded': '1692471843'}, {'responseID': '1142602316231495681', 'timeEnded': '1692493307'}, {'responseID': '1142734158104367211', 'timeEnded': '1692527406'}, {'responseID': '1142792772127051850', 'timeEnded': '1692557117'}, {'responseID': '1143300758356365352', 'timeEnded': '1692660720'}, {'responseID': '1143505433319985204', 'timeEnded': '1692711108'}, {'responseID': '1144677837220098058', 'timeEnded': '1692990039'}, {'responseID': '1144722100293222521', 'timeEnded': '1693006282'}, {'responseID': '1145536528634880091', 'timeEnded': '1693202506'}, {'responseID': '1145844444017459321', 'timeEnded': '1693269357'}, {'responseID': '1146100204806869123', 'timeEnded': '1693329967'}, {'responseID': '1146863005800333392', 'timeEnded': '1693510291'}, {'responseID': '1147584164888056028', 'timeEnded': '1693684155'}, {'responseID': '1147670533220081745', 'timeEnded': '1693703384'}, {'responseID': '1148026328076013568', 'timeEnded': '1693789716'}, {'responseID': '1148312783646097578', 'timeEnded': '1693853622'}]
    const userList = [{'name': 'DRWolfBlocks'}, {'name': 'xXDarkMemoriesXx'}, {'name': 'DRWolfBlocks'}, {'name': 'Latte_Feline'}, {'name': '6DisPan'}, {'name': 'AndrewsTimes'}, {'name': 'SpxxdyDev'}, {'name': 'LordVader20K'}, {'name': 'IRS_Evader'}, {'name': 'apture'}, {'name': 'TrueStarLumi'}, {'name': 'Juustopaketti'}, {'name': 'AgentSwitchBlade'}, {'name': 'Kyskii'}, {'name': 'Foxers'}, {'name': 'craccy1k'}]
    const fullSuccess = []
    const resultsList = []

    

    for (const user of userList) {
        try {
            
            // FIND TRELLO CARD START ============
            const lists = await trello.getListsOnBoard(activityTrello.activity_board_id);
            let requestedCard = null;
            let shouldBreak = false;

            for (const list of lists) {
                const cards = await trello.getCardsOnList(list.id);

                for (const card of cards) {
                    if (card.name === user.name) {
                        requestedCard = card;
                        shouldBreak = true;
                        break;
                    }
                }

                if (shouldBreak) {
                    break;
                }
            }

            if (!requestedCard) {
                noTrellocardFound.push(user.name); // Add user to list of no-card users
                // Make it go back to the next user
                continue;
            }
            // FIND TRELLO CARD END ============


            // GET ALL COMMENTS START ============
            const comments = await trello.makeRequest('get', `/1/cards/${requestedCard.id}/actions`, {
                filter: 'commentCard',
            });
            // GET ALL COMMENTS END ============



            let responseFoundCount = 0; // Count to see how many of the total could be "linked" to a response time
            const totalComments = comments.length // Total amount

            // LINK COMMENTS AND RESPONSE DATA START ============
            for (const comment of comments) {
                const commentDateTimestamp = Math.round(new Date(comment.date).getTime() / 1000); // GETS TIMESTAMP TO COMPARE IN SECONDS

                let responseFound = false;

                for (const response of ResponseList) {
                    const endDateTimestamp = parseInt(response.timeEnded);

                    if (Math.abs(commentDateTimestamp - endDateTimestamp) <= 5 * 60 * 60) {
                        fullSuccess.push({
                            userName: user.name,
                            commentDate: commentDateTimestamp,
                            responseDate: endDateTimestamp
                        });
                        responseFoundCount++;
                        responseFound = true;
                        break;
                    }
                }

                if (!responseFound) {
                    noResponseFoundList.push({
                        userName: user.name,
                        commentDate: commentDateTimestamp
                    });
                }

            }

            resultsList.push({
                userName: user.name,
                totalAmount: totalComments,
                foundAmount: responseFoundCount
            })
            // LINK COMMENTS AND RESPONSE DATA END ============
        } catch (error) {
            console.error(`Error processing user ${user.name}: ${error}`);
        }
    }

    // Proccess results

        console.log(noTrellocardFound, noResponseFoundList, fullSuccess, resultsList)

        return {noTrellocardFound, noResponseFoundList, fullSuccess, resultsList}
}
