const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");


const Medal =
    require("../../models/Medal");



module.exports = {


    data: new SlashCommandBuilder()

        .setName("removemedal")

        .setDescription(
            "Remove a medal from a user"
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageRoles
        )



        .addStringOption(option =>

            option
                .setName("user")
                .setDescription(
                    "User mention or Discord ID"
                )
                .setRequired(true)

        )



        .addStringOption(option =>

            option
                .setName("medal")
                .setDescription(
                    "Medal to remove"
                )
                .setAutocomplete(true)
                .setRequired(true)

        ),





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
        // USER
        // =====================


        const input =

            interaction.options.getString(
                "user"
            );



        const userId =

            input.replace(
                /\D/g,
                ""
            );



        if (!userId) {


            return interaction.editReply(
                "❌ Invalid user ID."
            );


        }






        const medalName =

            interaction.options.getString(
                "medal"
            );







        const data =

            await Medal.findOne({

                userId:
                    userId

            });







        if (!data) {


            return interaction.editReply(
                "❌ This user has no medals."
            );


        }







        const before =

            data.medals.length;






        data.medals =

            data.medals.filter(

                medal =>

                    medal.name !== medalName

            );








        if (

            before === data.medals.length

        ) {


            return interaction.editReply(
                "❌ This user does not have this medal."
            );


        }







        await data.save();








        let username =

            data.username;






        if (!username) {


            try {


                const user =

                    await client.users.fetch(
                        userId
                    );


                username =
                    user.username;



            } catch {


                username =
                    "Unknown User";


            }


        }







        // =====================
        // EMBED
        // =====================


        const embed =

            new EmbedBuilder()



                .setTitle(
                    "🗑️ Medal Removed"
                )



                .setColor(
                    "#8B0000"
                )



                .addFields(



                    {

                        name:
                            "User",


                        value:

                            `${username} (${userId})`


                    },



                    {

                        name:
                            "Removed Medal",


                        value:

                            `🏅 ${medalName}`


                    },



                    {

                        name:
                            "Removed by",


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