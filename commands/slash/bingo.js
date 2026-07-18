const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");


const BingoGame =
    require("../../models/BingoGame");


const {
    generateBingoCard,
    getCardLayout
} = require("../../utils/bingoGenerator");


const config =
    require("../../config/bingoConfig");



module.exports = {

    data: new SlashCommandBuilder()

        .setName("bingo")

        .setDescription("Bingo game commands")


        .addSubcommand(sub =>
            sub
                .setName("start")
                .setDescription("Start a bingo event")
        )


        .addSubcommand(sub =>
            sub
                .setName("join")
                .setDescription("Join the bingo event")
        )


        .addSubcommand(sub =>
            sub
                .setName("stop")
                .setDescription("Stop the bingo event")
        ),



    async run(client, interaction) {


        const command =
            interaction.options.getSubcommand();



        // ==========================
        // START BINGO
        // ==========================


        if(command === "start"){


            if(
                !interaction.member.permissions.has(
                    PermissionFlagsBits.ManageGuild
                )
            ){

                return interaction.reply({

                    content:
                    "❌ You cannot start bingo.",

                    ephemeral:true

                });

            }




            const existing =
                await BingoGame.findOne({

                    active:true

                });



            if(existing){

                return interaction.reply({

                    content:
                    "❌ A bingo game is already running.",

                    ephemeral:true

                });

            }




            const starterCard =
                generateBingoCard();



            await BingoGame.create({

                active:true,

                channelId:
                interaction.channel.id,


                startedBy:
                interaction.user.id,


                registrationOpen:true,


                drawnNumbers:[],


                claims:[],


                checkingClaim:false,


                players:[

                    {

                        userId:
                        interaction.user.id,


                        card:
                        starterCard,


                        marked:[]

                    }

                ]

            });




            await interaction.reply({

                embeds:[

                    new EmbedBuilder()

                    .setTitle(
                        "🎱 Bingo Registration Open!"
                    )

                    .setDescription(
`
A new bingo event has started!

Players have **30 seconds** to join.

Use:

\`/bingo join\`

to receive your personal bingo card.

Current players:

${interaction.user}
`
                    )

                    .setColor("#3498db")

                ]

            });



            await sendCard(

                interaction,

                starterCard

            );

                        setTimeout(async()=>{


                            const game =
                                await BingoGame.findOne({

                                    active:true

                                });



                            if(!game)
                                return;



                            game.registrationOpen = false;


                            await game.save();




                            await interaction.channel.send({

                                embeds:[

                                    new EmbedBuilder()

                                    .setTitle(
                                        "🎱 Bingo Starting!"
                                    )

                                    .setDescription(
            `
            Registration closed.

            Players:

            **${game.players.length}**

            The first number will appear soon.
            `
                                    )

                                    .setColor("#00FF00")

                                ]

                            });





                            startDrawing(

                                client,

                                interaction.channel

                            );



                        },30000);





                        return;


                    }





                    // ==========================
                    // JOIN BINGO
                    // ==========================


                    if(command === "join"){



                        const game =
                            await BingoGame.findOne({

                                active:true

                            });





                        if(!game){

                            return interaction.reply({

                                content:
                                "❌ There is no active bingo event.",

                                ephemeral:true

                            });

                        }






                        if(!game.registrationOpen){


                            return interaction.reply({

                                content:
                                "❌ Registration is already closed.",

                                ephemeral:true

                            });

                        }





                        const alreadyJoined =

                            game.players.find(

                                player =>

                                player.userId === interaction.user.id

                            );





                        if(alreadyJoined){


                            return interaction.reply({

                                content:
                                "❌ You already joined bingo.",

                                ephemeral:true

                            });

                        }






                        const card =
                            generateBingoCard();






                        game.players.push({

                            userId:
                            interaction.user.id,


                            card,


                            marked:[]

                        });





                        await game.save();





                        // PUBLIC MESSAGE IN CHANNEL

                        await interaction.reply({

                            content:

                            `✅ ${interaction.user} joined bingo!`

                        });





                        // PRIVATE CARD

                        await sendCard(

                            interaction,

                            card

                        );




                        return;


                    }







                    // ==========================
                    // STOP BINGO
                    // ==========================


                    if(command === "stop"){



                        const game =
                            await BingoGame.findOne({

                                active:true

                            });





                        if(!game){


                            return interaction.reply({

                                content:
                                "❌ There is no active bingo event.",

                                ephemeral:true

                            });

                        }






                        if(

                            game.startedBy !== interaction.user.id

                        ){


                            return interaction.reply({

                                content:
                                "❌ Only the person who started bingo can stop it.",

                                ephemeral:true

                            });

                        }







                        await BingoGame.deleteMany({

                            active:true

                        });






                        return interaction.reply({

                            content:

                            "🛑 Bingo event stopped."

                        });


                    }


                }

            };


// =====================================
// NUMBER DRAW SYSTEM
// =====================================

async function startDrawing(

    client,

    channel

){


    let bingoMessage = null;



    const interval = setInterval(async()=>{


        const game =

            await BingoGame.findOne({

                active:true

            });




        if(!game){


            clearInterval(interval);

            return;


        }





        // Pause tijdens claim check

        if(game.checkingClaim)

            return;







        // Alle nummers op

        if(

            game.drawnNumbers.length >= config.MAX_NUMBER

        ){


            clearInterval(interval);


            await finishGame(

                client,

                channel,

                game

            );


            return;


        }






        let number;



        do{


            number =

                Math.floor(

                    Math.random() * config.MAX_NUMBER

                ) + 1;



        }

        while(

            game.drawnNumbers.includes(number)

        );






        game.currentNumber = number;


        game.drawnNumbers.push(number);



        await game.save();







        const embed =

            new EmbedBuilder()


            .setTitle(

                "🎱 Bingo Game"

            )


            .setDescription(

`
## Current Number

# **${number}**


Players:

**${game.players.length}**


Check your personal bingo card!
`

            )


            .setColor("#FFD700")


            .setFooter({

                text:

                `Numbers drawn: ${game.drawnNumbers.length}/${config.MAX_NUMBER}`

            });







        if(!bingoMessage){


            bingoMessage =

                await channel.send({

                    embeds:[embed]

                });


        }

        else{


            await bingoMessage.edit({

                embeds:[embed]

            });


        }





    }, config.DRAW_INTERVAL);


}







// =====================================
// SEND PERSONAL BINGO CARD
// =====================================


async function sendCard(

    interaction,

    card

){


    const buttons = [];



    const layout =

        getCardLayout(card);





    for(const number of layout){



        if(number === "FREE"){


            buttons.push(

                new ButtonBuilder()

                .setCustomId(

                    "free"

                )

                .setLabel(

                    "⭐"

                )

                .setStyle(

                    ButtonStyle.Success

                )

                .setDisabled(true)

            );


        }

        else{


            buttons.push(

                new ButtonBuilder()

                .setCustomId(

                    `bingo_${number}`

                )

                .setLabel(

                    String(number)

                )

                .setStyle(

                    ButtonStyle.Secondary

                )

            );


        }


    }





    const rows = [];





    for(

        let i = 0;

        i < buttons.length;

        i += 5

    ){


        rows.push(

            new ActionRowBuilder()

            .addComponents(

                buttons.slice(

                    i,

                    i + 5

                )

            )

        );


    }






    rows.push(

        new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()

            .setCustomId(

                "bingo_claim"

            )

            .setLabel(

                "🎱 BINGO"

            )

            .setStyle(

                ButtonStyle.Danger

            )

        )

    );





    const message =

        await interaction.followUp({


            embeds:[


                new EmbedBuilder()

                .setTitle(

                    "🎱 Your Bingo Card"

                )

                .setDescription(

`
This card belongs only to you.

Click numbers to mark them.

Click again to remove a mark.

⚠️ The bot checks only when you press BINGO.
`

                )

                .setColor("#3498db")


            ],



            components:rows,


            ephemeral:true,


            fetchReply:true


        });
        const collector =

            message.createMessageComponentCollector({

                time:3600000

            });





        collector.on(

            "collect",

            async i => {

                if(i.user.id !== interaction.user.id){

                    return i.reply({

                        content:
                        "❌ This is not your bingo card.",

                        ephemeral:true

                    });

                }

                const game =
                    await BingoGame.findOne({
                        active:true
                    });


                if(!game){

                    return i.reply({

                        content:
                        "❌ This bingo game has ended.",

                        ephemeral:true

                    });

                }




                





                const player =

                    game.players.find(

                        p =>

                        p.userId === i.user.id

                    );





                if(!player){

                    return i.reply({

                        content:
                        "❌ You are not part of this bingo game.",

                        ephemeral:true

                    });

                }






                // BINGO knop

                if(

                    i.customId === "bingo_claim"

                ){


                    await claimBingo(i);


                    return;


                }







                // Alleen bingo buttons

                if(

                    !i.customId.startsWith(

                        "bingo_"

                    )

                )

                    return;







                const number =

                    Number(

                        i.customId.replace(

                            "bingo_",

                            ""

                        )

                    );








                // Mark aan/uit

                if(

                    player.marked.includes(number)

                ){


                    player.marked =

                        player.marked.filter(

                            n => n !== number

                        );


                }

                else{


                    player.marked.push(number);


                }







                await game.save();







                await refreshCard(

                    i,

                    player.card,

                    player.marked

                );



            }


        );



    }







    // =====================================
    // REFRESH CARD BUTTONS
    // =====================================


    async function refreshCard(

        interaction,

        card,

        marked

    ){



        const layout =

            getCardLayout(card);





        const buttons = [];






        for(const number of layout){



            if(number === "FREE"){



                buttons.push(


                    new ButtonBuilder()

                    .setCustomId(

                        "free"

                    )

                    .setLabel(

                        "⭐"

                    )

                    .setStyle(

                        ButtonStyle.Success

                    )

                    .setDisabled(true)


                );



                continue;


            }







            const selected =

                marked.includes(number);








            buttons.push(


                new ButtonBuilder()

                .setCustomId(

                    `bingo_${number}`

                )

                .setLabel(

                    String(number)

                )

                .setStyle(


                    selected

                    ?

                    ButtonStyle.Success

                    :

                    ButtonStyle.Secondary


                )


            );



        }








        const rows = [];







        for(

            let i = 0;

            i < buttons.length;

            i += 5

        ){



            rows.push(


                new ActionRowBuilder()

                .addComponents(

                    buttons.slice(

                        i,

                        i + 5

                    )

                )


            );


        }








        rows.push(


            new ActionRowBuilder()

            .addComponents(


                new ButtonBuilder()

                .setCustomId(

                    "bingo_claim"

                )

                .setLabel(

                    "🎱 BINGO"

                )

                .setStyle(

                    ButtonStyle.Danger

                )


            )


        );







        await interaction.update({

            components:rows

        });


    }
// =====================================
// BINGO CLAIM SYSTEM
// =====================================

async function claimBingo(interaction){


    const game =

        await BingoGame.findOne({

            active:true

        });




    if(!game)

        return;






    const alreadyClaimed =

        game.claims.find(

            claim =>

            claim.userId === interaction.user.id

        );





    if(alreadyClaimed){


        return interaction.reply({

            content:

            "⚠️ You already claimed bingo.",

            ephemeral:true

        });


    }






    game.claims.push({

        userId:

        interaction.user.id

    });





    // pause drawing

    game.checkingClaim = true;



    await game.save();







    const channel =

        interaction.client.channels.cache.get(

            game.channelId

        );






    await channel.send({

        content:

`
🎱 **Bingo claim!**

${interaction.user} pressed BINGO.

Checking card...
`

    });







    setTimeout(async()=>{



        const updatedGame =

            await BingoGame.findOne({

                active:true

            });





        if(!updatedGame)

            return;






        const winners = [];






        for(const claim of updatedGame.claims){



            const player =

                updatedGame.players.find(

                    p =>

                    p.userId === claim.userId

                );





            if(

                checkBingo(player)

            ){


                winners.push(

                    claim.userId

                );


            }


        }








        if(winners.length > 0){



            for(const id of winners){


                try{


                    const member =
                        await channel.guild.members.fetch(
                            id
                        );





                    await member.roles.add(

                        config.EVENT_WINNER_ROLE_ID

                    );



                }

                catch(error){


                    console.log(error.message);


                }


            }








            await channel.send({

                embeds:[


                    new EmbedBuilder()

                    .setTitle(

                        "🎉 Bingo Winners!"

                    )

                    .setDescription(

                        winners

                        .map(

                            id =>

                            `<@${id}>`

                        )

                        .join("\n")

                    )

                    .setColor(

                        "#FFD700"

                    )


                ]

            });








            await BingoGame.deleteMany({

                active:true

            });



            return;


        }









        // verkeerde bingo

        await channel.send({

            content:

`
❌ No valid bingo.

The game continues!
`

        });







        updatedGame.claims = [];

        updatedGame.checkingClaim = false;



        await updatedGame.save();






    }, config.CLAIM_CHECK_TIME);



}








// =====================================
// CHECK BINGO
// =====================================


function checkBingo(player){

    if(!player)
        return false;


    const lines = [

        // rows
        [0,1,2,3,4],
        [5,6,7,8,9],
        [10,11,12,13,14],
        [15,16,17,18,19],
        [20,21,22,23,24],

        // columns
        [0,5,10,15,20],
        [1,6,11,16,21],
        [2,7,12,17,22],
        [3,8,13,18,23],
        [4,9,14,19,24],

        // diagonals
        [0,6,12,18,24],
        [4,8,12,16,20]

    ];



    return lines.some(

        line =>

        line.every(

            index => {

                const value =
                    player.card[index];


                // FREE telt altijd mee
                if(value === "FREE")
                    return true;


                return player.marked.includes(value);

            }

        )

    );

}








// =====================================
// FINISH GAME
// =====================================


async function finishGame(

    client,

    channel,

    game

){



    const winners = [];





    for(const player of game.players){



        if(

            checkBingo(player)

        ){


            winners.push(

                player.userId

            );


        }


    }






    if(winners.length === 0){


        await channel.send({

            content:

`
🎱 Bingo finished!

No winners this time.
`

        });



    }

    else{



        for(const id of winners){



            try{


                const member =

                    await channel.guild.members.fetch(

                        id

                    );





                await member.roles.add(

                    config.EVENT_WINNER_ROLE_ID

                );


            }

            catch(error){


                console.log(error.message);


            }


        }






        await channel.send({

            embeds:[


                new EmbedBuilder()

                .setTitle(

                    "🎉 Final Bingo Winners!"

                )

                .setDescription(

                    winners

                    .map(

                        id =>

                        `<@${id}>`

                    )

                    .join("\n")

                )

                .setColor(

                    "#FFD700"

                )


            ]


        });



    }






    await BingoGame.deleteMany({

        active:true

    });



}