const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");


const Medal =
    require("../../models/Medal");


const getAwardCategory =
    require("../../utils/getAwardCategory");



const data =
    new SlashCommandBuilder()

        .setName("award")

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageRoles
        )

        .setDescription(
            "Award users with medals"
        );



// =====================
// USERS (30 MAX)
// =====================

for (let i = 1; i <= 30; i++) {

    data.addStringOption(option =>

        option
            .setName(`user${i}`)
            .setDescription(
                `User mention or Discord ID ${i}`
            )

    );

}



// =====================
// AWARDS (5 MAX)
// =====================

for (let i = 1; i <= 5; i++) {

    data.addStringOption(option =>

        option
            .setName(`award${i}`)
            .setDescription(
                `Award ${i}`
            )
            .setAutocomplete(true)

    );

}



// =====================
// REASON
// =====================

data.addStringOption(option =>

    option
        .setName("reason")
        .setDescription(
            "Reason for this award"
        )

);





module.exports = {


    data,



    async run(client, interaction) {



        if (

            !interaction.member.permissions.has(
                PermissionFlagsBits.ManageRoles
            )

            &&

            interaction.user.id !== process.env.OWNER_ID

        ) {


            return interaction.reply({

                content:
                    "❌ You need the **Manage Roles** permission.",

                ephemeral: true

            });


        }



        await interaction.deferReply();





        // =====================
        // GET USERS
        // =====================


        let users = [];



        for (let i = 1; i <= 30; i++) {


            const input =
                interaction.options.getString(
                    `user${i}`
                );



            if (!input) continue;



            // Supports:
            // @User
            // <@123>
            // 123


            const userId =
                input.replace(
                    /\D/g,
                    ""
                );



            if (!userId) continue;



            let username =
                "Unknown User";



            try {


                const discordUser =
                    await client.users.fetch(
                        userId
                    );


                username =
                    discordUser.username;



            } catch {

                // User does not exist or unavailable

            }



            users.push({

                id: userId,

                username: username

            });


        }





        // Remove duplicates

        users =
            [
                ...new Map(

                    users.map(user =>

                        [
                            user.id,
                            user

                        ]

                    )

                ).values()

            ];





        if (users.length === 0) {


            return interaction.editReply(
                "❌ Select at least one user."
            );


        }







        // =====================
        // GET AWARDS
        // =====================


        let awards = [];



        for (let i = 1; i <= 5; i++) {


            const award =
                interaction.options.getString(
                    `award${i}`
                );



            if (award) {

                awards.push(
                    award
                );

            }

        }





        awards =
            [
                ...new Set(
                    awards
                )
            ];





        if (awards.length === 0) {


            return interaction.editReply(
                "❌ Select at least one award."
            );


        }







        const reason =
            interaction.options.getString(
                "reason"
            );








        // =====================
        // SAVE MEDALS
        // =====================


        for (const user of users) {



            let data =
                await Medal.findOne({

                    userId:
                        user.id

                });






            if (!data) {


                data =
                    new Medal({

                        userId:
                            user.id,


                        username:
                            user.username,


                        medals: []

                    });


            }





            // Update username

            data.username =
                user.username;







            for (const award of awards) {



                const exists =

                    data.medals.some(

                        medal =>

                            medal.name === award

                    );






                if (!exists) {



                    data.medals.push({

                        name:
                            award,


                        category:
                            getAwardCategory(
                                award
                            ),



                        reason:
                            reason
                            ||
                            null,



                        awardedBy: {

                            id:
                                interaction.user.id,


                            username:
                                interaction.user.username

                        },


                        awardedAt:
                            new Date()


                    });



                }


            }





            await data.save();



        }








        // =====================
        // EMBED
        // =====================


        const embed =

            new EmbedBuilder()



                .setTitle(
                    "🏅 Awards Granted"
                )



                .setColor(
                    "#D4AF37"
                )



                .addFields(


                    {

                        name:
                            "Recipients",


                        value:

                            users
                                .map(user =>
                                    `${user.username} (${user.id})`
                                )
                                .join("\n")
                                .slice(0,1024)


                    },



                    {

                        name:
                            "Awards",


                        value:

                            awards
                                .map(award =>
                                    `🏅 ${award}`
                                )
                                .join("\n")


                    },



                    {

                        name:
                            "Reason",


                        value:

                            reason
                            ||
                            "No reason provided"


                    },



                    {

                        name:
                            "Awarded by",


                        value:

                            `${interaction.user.username} (${interaction.user.id})`


                    }


                )



                .setFooter({

                    text:
                        "USSR Management",

                    iconURL:
                        client.user.displayAvatarURL()

                })



                .setTimestamp();






        return interaction.editReply({

            embeds:
                [
                    embed
                ]

        });



    }


};