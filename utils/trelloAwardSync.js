const axios = require("axios");

const Medal = require("../models/Medal");
const TrelloSync = require("../models/TrelloSync");

const GetAwardInfo = require("./getAwardInfo");



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







function formatAwardName(name) {

    return name

        .trim()

        .toLowerCase()

        .replace(/\b\w/g, char =>
            char.toUpperCase()
        )

        .replace(/\bIi\b/g, "II")
        .replace(/\bIii\b/g, "III")
        .replace(/\bIv\b/g, "IV");

}







function getAwardCount(labels = []) {

    for (const label of labels) {


        const xMatch =
            label.name.match(
                /x(\d+)/i
            );


        if (xMatch) {

            return Number(xMatch[1]);

        }



        const timeMatch =
            label.name.match(
                /(\d+)\s*time/i
            );


        if (timeMatch) {

            return Number(timeMatch[1]);

        }

    }


    return 1;

}


function getCardCreatedDate(cardId) {

    const timestamp =
        parseInt(cardId.substring(0, 8), 16) * 1000;

    return new Date(timestamp);

}





function findRobloxUser(guild, name) {

    const search = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");


    const members = guild.members.cache.map(member => {

        const names = [
            member.nickname,
            member.user.username,
            member.user.globalName
        ]

        .filter(Boolean)
        .map(x =>
            x.toLowerCase()
             .replace(/[^a-z0-9]/g, "")
        );


        return {
            member,
            names
        };

    });



    // Exact match first
    const exact = members.find(data =>
        data.names.includes(search)
    );


    if (exact) {
        return exact.member;
    }



    // No unsafe short matches
    if (search.length < 6) {
        return null;
    }



    // Partial match only when the search is almost the same length
    const partial = members.find(data => {

        return data.names.some(username => {

            if (Math.abs(username.length - search.length) > 4) {
                return false;
            }


            return (
                username.includes(search) ||
                search.includes(username)
            );

        });

    });



    return partial?.member || null;

}









async function syncTrelloAwards(client, guildId) {


    let synced = 0;

    let failed = 0;

    let activeTrelloCards = [];



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
                formatAwardName(
                    list.name
                );



            const awardInfo =
                GetAwardInfo(
                    awardName
                );






            const cards =
                await getCardsFromList(
                    list.id
                );





            for (const card of cards) {



                activeTrelloCards.push(
                    card.id
                );




                const robloxName =
                    card.name.trim();






                const ignored = [

                    "HONORARY TITLE",
                    "RECIPIENTS:",
                    "MILITARY ORDER",
                    "CIVIL ORDER",
                    "MILITARY MEDAL",
                    "SOVIET UNION AWARDS TRELLO",
                    "RULES OF WEAR",
                    "MANAGEMENT",

                    "MILITARY AND CIVIL ORDER",
                    "CAMPAIGN MEDAL",
                    "CIVILIAN MEDAL",
                    "JUBILEE MEDAL",
                    "MILITARY BADGE",
                    "BADGE"

                ];




                if (

                    ignored.includes(
                        robloxName.toUpperCase()
                    )

                ) {

                    continue;

                }








                const member =
                    findRobloxUser(
                        guild,
                        robloxName
                    );

                console.log(
                    "MATCH:",
                    robloxName,
                    "->",
                    member ? `${member.user.username} (${member.id})` : "NOT FOUND"
                );





                if (!member) {


                    failed++;


                    console.log(
                        `⚠️ User not found: ${robloxName}`
                    );


                    continue;


                }







                const count =
                    getAwardCount(
                        card.labels
                    );







                const reason =
                    card.desc?.trim() || "";







                let user =
                    await Medal.findOne({

                        userId:
                            member.id

                    });






                if (!user) {


                    user =
                        new Medal({

                            userId:
                                member.id,


                            username:
                                member.user.username,


                            medals: []

                        });


                }







                const existing =
                    user.medals.find(

                        medal =>

                            medal.trelloCardId === card.id

                    );







                if (existing) {



                    existing.name =
                        awardInfo.name;



                    existing.category =
                        awardInfo.category;



                    existing.count =
                        count;



                    existing.reason =
                        reason;

                    existing.awardedAt =
                        getCardCreatedDate(card.id);



                }

                else {



                    user.medals.push({

                        name:
                            awardInfo.name,

                        category:
                            awardInfo.category,

                        count,

                        source:
                            "trello",

                        trelloCardId:
                            card.id,

                        reason,

                        awardedBy: {

                            id:
                                "Trello",

                            username:
                                "Trello Sync"

                        },

                        awardedAt:
                        getCardCreatedDate(card.id)

                    });



                }







                await user.save();



                synced++;



                console.log(

                    `✅ ${awardInfo.name} x${count} -> ${robloxName}`

                );



            }


        }








        // ===========================
        // REMOVE OLD TRELLO AWARDS
        // ===========================


        const users =
            await Medal.find({});




        for (const user of users) {



            const before =
                user.medals.length;





            user.medals =
                user.medals.filter(medal => {



                    // Handmatige awards behouden

                    if (

                        medal.source !== "trello"

                    ) {

                        return true;

                    }





                    // Alleen bestaande Trello kaarten behouden

                    return activeTrelloCards.includes(

                        medal.trelloCardId

                    );


                });







            if (

                before !== user.medals.length

            ) {


                await user.save();



                console.log(

                    `🗑️ Removed deleted Trello medals from ${user.username}`

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
                    null,


                startedBy:
                    "automatic"

            },


            {

                upsert:true

            }

        );






        console.log(

            `🏅 Trello sync completed | Synced: ${synced} | Failed: ${failed}`

        );






    }

    catch(error) {



        console.log(

            "❌ Trello sync failed:",
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

                upsert:true

            }

        );


    }


}







module.exports = {

    syncTrelloAwards

};