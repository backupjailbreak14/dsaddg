const axios = require("axios");

const TrelloSync = require("../models/TrelloSync");

const addAward =
    require("./addAward");



async function getTrelloLists() {

    const response =
        await axios.get(

            `https://api.trello.com/1/boards/${process.env.TRELLO_BOARD_ID}/lists`,

            {
                params: {

                    key:
                        process.env.TRELLO_KEY,

                    token:
                        process.env.TRELLO_TOKEN

                }

            }

        );


    return response.data;

}





async function getCardsFromList(listId) {


    const response =
        await axios.get(

            `https://api.trello.com/1/lists/${listId}/cards`,

            {

                params: {

                    key:
                        process.env.TRELLO_KEY,

                    token:
                        process.env.TRELLO_TOKEN

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








function getAwardCount(labels = []) {


    for (const label of labels) {


        const text =
            label.name || "";



        const match =
            text.match(
                /(\d+)\s*time/i
            );



        if (match) {

            return Number(match[1]);

        }



        const xMatch =
            text.match(
                /x(\d+)/i
            );



        if (xMatch) {

            return Number(xMatch[1]);

        }


    }



    return 1;

}







function cleanName(name) {


    return name

        .trim()

        .replace(
            /\s+/g,
            " "
        );


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
                cleanName(
                    list.name
                );




            const cards =
                await getCardsFromList(
                    list.id
                );





            for (const card of cards) {



                const robloxName =
                    cleanName(
                        card.name
                    );






                if (

                    [

                        "honorary title",

                        "recipients:",

                        "military order",

                        "civil order",

                        "military medal",

                        "soviet union awards trello",

                        "rules of wear",

                        "management"

                    ]

                    .includes(
                        robloxName.toLowerCase()
                    )

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






                const count =
                    getAwardCount(
                        card.labels
                    );





                for (
                    let i = 0;
                    i < count;
                    i++
                ) {



                    await addAward({

                        userId:
                            member.id,


                        username:

                            member.nickname ||

                            member.user.username,


                        award:
                            awardName,


                        reason:

                            card.desc ||

                            "No reason provided",



                        awardedBy: {

                            id:
                                "Trello",


                            username:
                                "Trello Sync"

                        }

                    });


                }







                synced++;




                console.log(

                    `✅ ${awardName} x${count} -> ${robloxName}`

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