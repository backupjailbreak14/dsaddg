const axios = require("axios");

const Medal = require("../models/Medal");
const TrelloSync = require("../models/TrelloSync");
const GetAwardCategory = require("./getAwardCategory");


async function getTrelloLists() {

    const response = await axios.get(
        `https://api.trello.com/1/boards/${process.env.TRELLO_BOARD_ID}/lists`,
        {
            params: {
                key: process.env.TRELLO_KEY,
                token: process.env.TRELLO_TOKEN
            }
        }
    );

    return response.data;
}


async function getCardsFromList(listId) {

    const response = await axios.get(
        `https://api.trello.com/1/lists/${listId}/cards`,
        {
            params: {
                key: process.env.TRELLO_KEY,
                token: process.env.TRELLO_TOKEN
            }
        }
    );

    return response.data;
}


function findRobloxUser(guild, robloxName) {

    return guild.members.cache.find(member => {

        const names = [
            member.nickname,
            member.user.username
        ]
        .filter(Boolean)
        .map(name =>
            name.toLowerCase()
        );

        return names.includes(
            robloxName.toLowerCase()
        );

    });

}


async function syncTrelloAwards(client, guildId) {

    let synced = 0;
    let failed = 0;

    try {

        const guild =
            client.guilds.cache.get(
                guildId
            );


        if (!guild) {

            console.log(
                "❌ Guild not found"
            );

            return;

        }


        console.log(
            "🛰️ Starting Trello award sync..."
        );


        await guild.members.fetch();


        const lists =
            await getTrelloLists();


        for (const list of lists) {


            const awardName =
                list.name.trim();


            const cards =
                await getCardsFromList(
                    list.id
                );


            for (const card of cards) {


                const robloxName =
                    card.name.trim();


                // Skip information card

                if (
                    robloxName.toLowerCase()
                    === awardName.toLowerCase()
                ) {

                    continue;

                }


                const member =
                    findRobloxUser(
                        guild,
                        robloxName
                    );


                if (!member) {

                    failed++;

                    console.log(
                        `⚠️ User not found: ${robloxName}`
                    );

                    continue;

                }


                const category =
                    GetAwardCategory(
                        awardName
                    );


                await Medal.findOneAndUpdate(

                    {
                        userId:
                            member.id
                    },

                    {

                        $setOnInsert: {

                            username:
                                member.nickname ||
                                member.user.username

                        },


                        $addToSet: {

                            medals: {

                                name:
                                    awardName,

                                category:
                                    category,

                                reason:
                                    card.desc ||
                                    "No reason provided",

                                awardedBy: {

                                    id:
                                        "Trello",

                                    username:
                                        "Trello Sync"

                                }

                            }

                        }

                    },

                    {
                        upsert: true
                    }

                );


                synced++;


                console.log(
                    `✅ ${awardName} -> ${robloxName}`
                );

            }

        }


        await TrelloSync.findOneAndUpdate(

            {},

            {

                lastSync:
                    new Date(),

                syncedCards:
                    synced,

                status:
                    "success",

                error:
                    null

            },

            {
                upsert: true
            }

        );


        console.log(
            `🏅 Sync finished | Synced: ${synced} | Failed: ${failed}`
        );


    }
    catch(error) {


        console.log(
            "❌ Trello sync error:",
            error.message
        );


        await TrelloSync.findOneAndUpdate(

            {},

            {

                lastSync:
                    new Date(),

                status:
                    "failed",

                error:
                    error.message

            },

            {
                upsert: true
            }

        );


    }

}


module.exports = {
    syncTrelloAwards
};