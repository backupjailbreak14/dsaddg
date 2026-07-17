const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");


const addAward =
    require("../../utils/addAward");


const awardEmojis =
    require("../../utils/awardEmojis");



const data =
    new SlashCommandBuilder()

        .setName("award")

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageRoles
        )

        .setDescription(
            "Award users with medals"
        );





for (let i = 1; i <= 22; i++) {

    data.addStringOption(option =>

        option

            .setName(`user${i}`)

            .setDescription(
                `User mention or Discord ID ${i}`
            )

    );

}





for (let i = 1; i <= 2; i++) {

    data.addStringOption(option =>

        option

            .setName(`award${i}`)

            .setDescription(
                `Award ${i}`
            )

            .setAutocomplete(true)

    );

}





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
                    "❌ You need the Manage Roles permission.",

                ephemeral:true

            });


        }



        await interaction.deferReply();





        let users = [];



        for (let i = 1; i <= 22; i++) {


            const input =
                interaction.options.getString(
                    `user${i}`
                );


            if (!input)
                continue;



            const userId =
                input.replace(/\D/g,"");



            if (!userId)
                continue;



            let username =
                "Unknown User";


            try {


                const discordUser =
                    await client.users.fetch(
                        userId
                    );


                username =
                    discordUser.username;


            }
            catch {}



            users.push({

                id:userId,

                username

            });


        }






        users =
            [
                ...new Map(

                    users.map(u =>
                        [
                            u.id,
                            u
                        ]
                    )

                ).values()

            ];





        let awards = [];



        for (let i = 1; i <= 2; i++) {


            const award =
                interaction.options.getString(
                    `award${i}`
                );


            if (award)
                awards.push(award);


        }



        awards =
            [
                ...new Set(awards)
            ];





        const reason =
            interaction.options.getString(
                "reason"
            );






        let awardedList = [];





        for (const user of users) {



            for (const award of awards) {



                await addAward({

                    userId:user.id,

                    username:user.username,

                    award,

                    reason,

                    source:"manual",

                    awardedBy:{

                        id:
                            interaction.user.id,

                        username:
                            interaction.user.username

                    }

                });



                awardedList.push({

                    name:award,

                    count:1

                });


            }


        }







        const embed =

            new EmbedBuilder()


                .setTitle(
                    "🏅 Awards Granted"
                )


                .setColor(
                    "#D4AF37"
                )


                .setDescription(

                    awardedList

                        .map(a =>

                            `${awardEmojis[a.name] || "🏅"} ${a.name}`

                        )

                        .join("\n")

                )


                .addFields({

                    name:"Reason",

                    value:
                        reason ||
                        "No reason provided"

                })


                .setFooter({

                    text:
                        "USSR Management",

                    iconURL:
                        client.user.displayAvatarURL()

                })


                .setTimestamp();






        return interaction.editReply({

            embeds:[
                embed
            ]

        });


    }


};