const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");

const Medal = require("../../models/Medal");

const awardEmojis =
    require("../../utils/awardEmojis");

module.exports = {


    data: new SlashCommandBuilder()

        .setName("medals")

        .setDescription(
            "View medals of a user"
        )

        .addStringOption(option =>

            option

                .setName("user")

                .setDescription(
                    "User mention or Discord ID (optional)"
                )

        ),




    async run(client, interaction) {


        await interaction.deferReply();



        const input =
            interaction.options.getString(
                "user"
            );



        let targetId;



        if (input) {


            if (

                !interaction.member.permissions.has(
                    PermissionFlagsBits.ManageRoles
                )

                &&

                interaction.user.id !== process.env.OWNER_ID

            ) {


                return interaction.editReply(
                    "❌ You cannot view other users' medals."
                );


            }



            targetId =
                input.replace(
                    /\D/g,
                    ""
                );


        } else {


            targetId =
                interaction.user.id;


        }




        const data =

            await Medal.findOne({

                userId:
                    targetId

            });





        if (!data || data.medals.length === 0) {


            return interaction.editReply(
                "❌ This user has no medals."
            );


        }





        let username =
            data.username || "Unknown";





        // ======================
        // GROUP BY CATEGORY
        // ======================


        const categories = {};



        for (const medal of data.medals) {


            const category =

                medal.category ||
                "other";



            if (!categories[category]) {

                categories[category] = [];

            }



            categories[category].push(
                medal.name
            );


        }






        const pages = [];



        let current = "";



        for (const category of Object.keys(categories)) {



            let text =

`
🏅 **${category.toUpperCase()}**

`;



            for (const award of categories[category]) {


                text +=
                `${awardEmojis[award] || "🏅"} ${award}\n`;


            }



            if (

                (current + text).length > 3500

            ) {


                pages.push(current);

                current = text;


            } else {


                current += text;


            }



        }



        if (current) {

            pages.push(current);

        }






        let page = 0;





        function createEmbed() {


            return new EmbedBuilder()


                .setTitle(
                    "🏅 Medal Record"
                )


                .setColor(
                    "#D4AF37"
                )


                .setDescription(

`
**User**
${username}

**User ID**
${targetId}

**Total Awards**
${data.medals.length}


${pages[page]}
`

                )


                .setFooter({

                    text:
                    `Page ${page + 1}/${pages.length} • USSR Management`,

                    iconURL:
                    client.user.displayAvatarURL()

                })


                .setTimestamp();



        }






        function buttons() {


            return new ActionRowBuilder()

                .addComponents(


                    new ButtonBuilder()

                        .setCustomId(
                            "previous"
                        )

                        .setEmoji(
                            "◀️"
                        )

                        .setStyle(
                            ButtonStyle.Secondary
                        )

                        .setDisabled(
                            page === 0
                        ),



                    new ButtonBuilder()

                        .setCustomId(
                            "next"
                        )

                        .setEmoji(
                            "▶️"
                        )

                        .setStyle(
                            ButtonStyle.Secondary
                        )

                        .setDisabled(
                            page === pages.length - 1
                        )

                );


        }






        const message =

            await interaction.editReply({

                embeds:
                [
                    createEmbed()
                ],

                components:

                pages.length > 1
                ?
                [
                    buttons()
                ]

                :

                []

            });







        if (pages.length <= 1)
            return;







        const collector =

            message.createMessageComponentCollector({

                time:
                120000

            });






        collector.on(
            "collect",
            async i => {


                if (

                    i.user.id !== interaction.user.id

                ) {


                    return i.reply({

                        content:
                        "❌ This menu is not for you.",

                        ephemeral:true

                    });


                }





                if (i.customId === "next") {


                    page++;


                }


                if (i.customId === "previous") {


                    page--;


                }





                await i.update({

                    embeds:
                    [
                        createEmbed()
                    ],

                    components:
                    [
                        buttons()
                    ]

                });


            }

        );




    }


};