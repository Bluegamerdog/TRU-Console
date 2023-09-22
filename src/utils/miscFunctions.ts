export function changeNickname(newRankName: string, currentNick: string): string {
     const rankAbbreviations: { [key: string]: string } = {
          "Entrant": "ENT",
          "Operator": "OPR",
          "Senior Operator": "SOPR",
          "Elite Operator": "EOPR",
          "Vanguard": "VGD",
          "Vanguard Officer": "VGO",
          "Senior Vanguard Officer": "S.VGO",
          "TRU Captain": "TRU Captain",
          "TRU Commander": "TRU Commander",
     };

     const username = currentNick.split(" ").slice(-1)[0];
     const newNick = `${rankAbbreviations[newRankName] || "Unknown"} ${username}`;
     return newNick;
}

export function chunkStringByNewline(str:string, maxLength:number) {
     const chunks = [];
     const lines = str.split('\n');
 
     let currentChunk = '';
     for (const line of lines) {
         if (currentChunk.length + line.length <= maxLength) {
             currentChunk += line + '\n';
         } else {
             chunks.push(currentChunk);
             currentChunk = line + '\n';
         }
     }
 
     if (currentChunk.length > 0) {
         chunks.push(currentChunk);
     }
 
     return chunks;
 }

export function getAbbreviation(RankName: string): string {
     const rankAbbreviations: { [key: string]: string } = {
          "Entrant": "ENT",
          "Operator": "OPR",
          "Senior Operator": "SOPR",
          "Elite Operator": "EOPR",
          "Vanguard": "VGD",
          "Vanguard Officer": "VGO"
     };
     return rankAbbreviations[RankName]
}

export function getAbbreviation_2(RankName: string): string {
     const rankAbbreviations: { [key: string]: string } = {
          "Entrant": "(**ENT**)",
          "Operator": "(**OPR**)",
          "Senior Operator": "(**SOPR**)",
          "Elite Operator": "(**EOPR**)",
          "Vanguard": "(**VGD**)",
          "Vanguard Officer": "(**VGO**)",
          "Senior Vanguard Officer": "(**S.VGO**)",
          "TRU Captain": "",
          "TRU Commander": "",
     };
     return rankAbbreviations[RankName] || ""
}

export function getRank_fromID(rankIdentifier: string | number): string {
     const rankInfo: { [key: string]: string } = {
          "1": "Entrant",
          "3": "Operator",
          "4": "Senior Operator",
          "5": "Elite Operator",
          "15": "Vanguard",
          "20": "Vanguard Officer",
          "251": "Senior Vanguard Officer",
          "252": "TRU Captain",
          "253": "TRU Commander"
     };

     if (typeof rankIdentifier === "string") {
          // Get the abbreviation from the name
          return rankInfo[rankIdentifier] || "";
     } else if (typeof rankIdentifier === "number") {
          // Get the name from the ID
          return rankInfo[String(rankIdentifier)] || "";
     } else {
          return "";
     }
}

export function get_promotion_message(rank_name: string) {
     const promotional_messages: { [rank_name: string]: string } = {
          "Operator": "Congratulations on your promotion to Operator (OPR)! As an Operator, you perform the most basic TRU duties in the field. You have shown progress and gained valuable experience. Enjoy free use of the Desert Eagle, a symbol of your proficiency. Your journey as an operator has just begun, and there is much to learn and accomplish. Continue to grow and develop your skills.",
          "Senior Operator": "Congratulations on your promotion to Senior Operator (SOPR)! As a Senior Operator, your experience and skills make you an invaluable asset to TRU. You are granted free use of the TRU Tactical Uniform and G-18s, which enhance your effectiveness in the field. Your continued dedication and expertise will contribute to the success of TRU operations.",
          "Elite Operator": "Congratulations on your promotion to Elite Operator (EOPR)! As an Elite Operator, you are a veteran with exceptional combat capabilities. Your authority within the operator class is significant, and your contributions are vital to TRU. You are granted free use of the Vector-45 and have the option for an M60 loadout [1:1 QSO to Raider ratio, or as a counter for RPD], along with a Riot Shield [1:1.5 QSO to Raider ratio]. Lead by example and continue to excel in your role.",
          "Vanguard": "Congratulations on your promotion to Vanguard (VGD)! As a Vanguard, you are entrusted with specific tasks assigned by the Response Leader. Demonstrate your leadership potential and actively showcase your skills to become a future Response Leader yourself. Embrace the challenge and continue to exhibit your expertise on the field. Enjoy free use of the M60, a truly formidable weapon if used right.",
          "Vanguard Officer": "Congratulations on your promotion to Vanguard Officer (VGO)! As a VGO, you have proven your exceptional skills as an operator and now take on the role of a leader. Your new responsibilities include leading TRU into conflict, making informed tactical decisions, and mentoring those below you. You are also granted free use of a Riot Shield [1:1 QSO to Raider ratio] and have the option for a HK416 and RPG loadout [1:1.5 QSO:Raider ratio or to counter RPG/MIN-134], along with the Juggernaut Suit. Lead with valor and inspire others to excel."
     }
     return promotional_messages[rank_name] || "There was an error fetching the promotional message. Please contact Blue."
}

