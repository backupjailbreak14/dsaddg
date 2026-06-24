const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


async function getRandomMeme(category) {

    const subReddits = [
        "meme",
        "Memes_Of_The_Dank",
        "memes",
        "dankmemes"
    ];


    const subreddit =
        category ||
        subReddits[
            Math.floor(Math.random() * subReddits.length)
        ];


    try {

        const response = await fetch(
            `https://meme-api.com/gimme/${subreddit}`
        );


        const data =
            await response.json();


        if (!data || !data.url) {

            return new EmbedBuilder()

                .setColor("#ff0000")

                .setDescription(
                    "❌ Failed to fetch meme."
                );

        }


        if (data.nsfw) {

            return new EmbedBuilder()

                .setColor("#ff0000")

                .setDescription(
                    "❌ NSFW meme blocked."
                );

        }



        return new EmbedBuilder()

            .setColor("Random")

            .setAuthor({

                name:
                    data.title,

                url:
                    data.postLink

            })


            .setImage(
                data.url
            )


            .setFooter({

                text:
                    `👍 ${data.ups || 0}`

            });



    } catch(err) {


        console.error(
            "Meme API error:",
            err
        );


        return new EmbedBuilder()

            .setColor("#ff0000")

            .setDescription(
                "❌ Meme API unavailable."
            );

    }

}



module.exports = {

    name: "meme",

    category: "fun",

    description: "Get a random meme.",


    run: async (client, message, args) => {


        const category = args[0];


        const button =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            "regen_meme"
                        )

                        .setEmoji("🔁")

                        .setStyle(
                            ButtonStyle.Secondary
                        )

                );



        const embed =
            await getRandomMeme(category);



        const msg =
            await message.channel.send({

                embeds: [
                    embed
                ],

                components: [
                    button
                ]

            });



        const collector =
            msg.createMessageComponentCollector({

                time: 60000,

                max: 20

            });



        collector.on(
            "collect",
            async interaction => {


                if (
                    interaction.customId !== "regen_meme"
                )
                    return;



                if (
                    interaction.user.id !== message.author.id
                ) {

                    return interaction.reply({

                        content:
                            "❌ Only the person who used the command can refresh this meme.",

                        ephemeral:true

                    });

                }



                await interaction.deferUpdate();


                const newEmbed =
                    await getRandomMeme(category);



                await msg.edit({

                    embeds:[
                        newEmbed
                    ]

                });


            }
        );



        collector.on(
            "end",
            async () => {


                button.components[0]
                    .setDisabled(true);



                await msg.edit({

                    components:[
                        button
                    ]

                }).catch(()=>{});


            }
        );


    }

};