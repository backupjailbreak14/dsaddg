require("dotenv").config();

const mongoose = require("mongoose");
const Medal = require("./models/Medal");
const legacyAwards = require("./legacyAwards");

const { Client, GatewayIntentBits } = require("discord.js");
const getAwardCategory = require("./utils/getAwardCategory");


// =========================
// CONFIG
// =========================

const TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const MONGO_URI = process.env.MONGO_URI;


// =========================
// DISCORD CLIENT
// =========================

const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildMembers

    ]

});



// =========================
// IMPORT
// =========================

async function run() {


    try {


        console.log("Connecting to MongoDB...");

        await mongoose.connect(
            MONGO_URI
        );



        console.log("Logging into Discord...");

        await client.login(
            TOKEN
        );



        const guild =
            await client.guilds.fetch(
                GUILD_ID
            );



        await guild.members.fetch();




        let imported = 0;

        let failed = [];




        for (const entry of legacyAwards) {



            const search =
                entry.username.toLowerCase();




            const member =
                guild.members.cache.find(member =>


                    member.user.username.toLowerCase() === search ||


                    (
                        member.user.globalName &&

                        member.user.globalName.toLowerCase() === search

                    ) ||


                    member.displayName.toLowerCase() === search


                );





            if (!member) {



                console.log(
                    `❌ User not found: ${entry.username}`
                );



                failed.push(
                    entry.username
                );


                continue;


            }






            let data =
                await Medal.findOne({

                    userId:
                        member.user.id

                });






            if (!data) {



                data =
                    new Medal({


                        userId:
                            member.user.id,


                        username:
                            member.user.username,


                        medals: []


                    });


            }






            // Update username

            data.username =
                member.user.username;







            // =========================
            // IMPORT AWARDS
            // =========================


            for (const award of entry.awards) {



                const awardName =
                    typeof award === "string"
                        ? award
                        : award.name;



                const awardCount =
                    typeof award === "string"
                        ? 1
                        : award.count || 1;






                const existingMedal =
                    data.medals.find(

                        medal =>
                            medal.name === awardName

                    );







                if (existingMedal) {



                    // 

                    if (awardCount > (existingMedal.count || 1)) {

                        existingMedal.count = awardCount;

                    }



                    continue;


                }








                data.medals.push({



                    name:
                        awardName,



                    count:
                        awardCount,



                    category:
                        getAwardCategory(
                            awardName
                        ),



                    reason:
                        "Legacy award imported from Trello",



                    awardedBy: {


                        id:
                            "SYSTEM",



                        username:
                            "Legacy Import"


                    },



                    awardedAt:
                        new Date()



                });




            }







            await data.save();




            imported++;




            console.log(
                `✅ Imported ${entry.username}`
            );



        }







        console.log("\n=================");

        console.log(
            `Imported: ${imported}`
        );


        console.log(
            `Failed: ${failed.length}`
        );






        if (failed.length > 0) {



            console.log(
                "\nMissing users:"
            );



            failed.forEach(user =>

                console.log(
                    `- ${user}`
                )

            );


        }






        console.log(
            "=================\n"
        );




        process.exit(0);






    } catch (err) {



        console.error(err);


        process.exit(1);



    }



}



run();