const axios = require("axios");

const Medal = require("../models/Medal");
const GetAwardCategory = require("./GetAwardCategory");


async function getTrelloLists() {

    const response =
        await axios.get(

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

    const response =
        await axios.get(

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


    return guild.members.cache.find(member =>

        member.nickname &&
        member.nickname.toLowerCase() ===
        robloxName.toLowerCase()

    );


}



async function syncTrelloAwards(client, guildId) {


    const guild =
        client.guilds.cache.get(guildId);



    if (!guild) {

        console.log(
            "Guild not found for award sync"
        );

        return;

    }



    // Make sure all members are available

    await guild.members.fetch();



    const lists =
        await getTrelloLists();



    for (const list of lists) {


        const awardName =
            list.name;



        const cards =
            await getCardsFromList(
                list.id
            );



        if (
            cards.length < 2
        ) {

            continue;

        }



        /*
            First card is award information.
            Other cards are recipients.
        */



        const recipientCards =
            cards.slice(1);



        for (const card of recipientCards) {


            const robloxName =
                card.name;



            const member =
                findRobloxUser(
                    guild,
                    robloxName
                );



            if (!member) {


                console.log(
                    `Could not find Discord user for ${robloxName}`
                );


                continue;

            }



            const reason =
                card.desc ||
                "No reason provided";



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
                                reason,


                            awardedBy: {

                                id:
                                    "Trello Sync",


                                username:
                                    "Trello"

                            }

                        }

                    }

                },


                {

                    upsert:true

                }

            );



            console.log(
                `Synced ${awardName} -> ${robloxName}`
            );


        }


    }


    console.log(
        "Award sync completed"
    );


}



module.exports = {
    syncTrelloAwards
};