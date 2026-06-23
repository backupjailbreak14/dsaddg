const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const Medal =
    require("../../models/Medal");



module.exports = {


    data: new SlashCommandBuilder()

        .setName("medalleaderboard")

        .setDescription(
            "View the award leaderboard"
        ),





    async run(client, interaction) {


        await interaction.deferReply();






        const users =

            await Medal.find({});






        if (!users || users.length === 0) {


            return interaction.editReply(
                "❌ No awards have been given yet."
            );


        }







        const leaderboard =


            users

                .map(user => ({


                    userId:
                        user.userId,


                    username:
                        user.username ||
                        "Unknown User",


                    count:
                        user.medals.length


                }))


                .sort(

                    (a,b) =>
                        b.count - a.count

                )


                .slice(0,5);








        const ranks = [

            "🥇",

            "🥈",

            "🥉",

            "🏅",

            "🏅"

        ];







        let description = "";







        for (
            let i = 0;
            i < leaderboard.length;
            i++
        ) {



            const user =
                leaderboard[i];



            let display =
                user.username;



            try {


                const discordUser =

                    await client.users.fetch(
                        user.userId
                    );


                display =
                    `<@${discordUser.id}>`;



            } catch {


                display =
                    user.username;


            }






            description +=

`
${ranks[i]} **${display}**

🏅 Awards: **${user.count}**

`;



        }







        const embed =

            new EmbedBuilder()



                .setTitle(
                    "🏆 Award Leaderboard"
                )



                .setColor(
                    "#D4AF37"
                )



                .setDescription(
                    description
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