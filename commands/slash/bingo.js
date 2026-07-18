const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");

const BingoGame = require("../../models/BingoGame");

const {
    generateBingoCard,
    getCardLayout
} = require("../../utils/bingoGenerator");

const config = require("../../config/bingoConfig");


const bingoCommand = {

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



        // =========================
        // START BINGO
        // =========================


        if(command === "start") {


            if(
                !interaction.member.permissions.has(
                    PermissionFlagsBits.ManageGuild
                )
            ) {

                return interaction.reply({

                    content:
                    "❌ You cannot start bingo.",

                    ephemeral:true

                });

            }



            const existingGame =
                await BingoGame.findOne({

                    active:true

                });



            if(existingGame) {

                return interaction.reply({

                    content:
                    "❌ A bingo game is already running.",

                    ephemeral:true

                });

            }



            const organizerCard =
                generateBingoCard();



            const game =
                await BingoGame.create({

                    active:true,

                    channelId:
                    interaction.channel.id,


                    startedBy:
                    interaction.user.id,


                    registrationOpen:true,


                    currentNumber:null,


                    drawnNumbers:[],


                    checkingClaim:false,


                    players:[

                        {

                            userId:
                            interaction.user.id,


                            card:
                            organizerCard,


                            marked:[]

                        }

                    ],


                    claims:[]

                });




            const embed =
                new EmbedBuilder()

                .setTitle(
                    "🎱 Bingo Registration Open!"
                )

                .setDescription(
`
A new bingo event has started!

Registration closes in **30 seconds**.

Use:

\`/bingo join\`

to join the game.

Players:

${interaction.user}
`
                )

                .setColor("#3498db");




            await interaction.reply({

                embeds:[
                    embed
                ],

                components:[

                    new ActionRowBuilder()

                    .addComponents(

                        new ButtonBuilder()

                        .setCustomId(
                            "bingo_status"
                        )

                        .setLabel(
                            "Players: 1"
                        )

                        .setStyle(
                            ButtonStyle.Secondary
                        )

                        .setDisabled(true)

                    )

                ]

            });




            setTimeout(async()=>{


                const currentGame =
                    await BingoGame.findOne({

                        active:true

                    });



                if(!currentGame)
                    return;



                currentGame.registrationOpen =
                    false;



                await currentGame.save();




                const startEmbed =
                    new EmbedBuilder()

                    .setTitle(
                        "🎱 Bingo Starting!"
                    )

                    .setDescription(
`
Registration closed.

Players:

**${currentGame.players.length}**

The first number will appear soon.
`
                    )

                    .setColor("#00ff00");




                await interaction.editReply({

                    embeds:[
                        startEmbed
                    ]

                });



                startDrawing(

                    client,

                    interaction,

                    game._id

                );



            },30000);




            return;

        }
        // =========================
        // JOIN BINGO
        // =========================


        if(command === "join") {


            const game =
                await BingoGame.findOne({

                    active:true

                });



            if(!game) {

                return interaction.reply({

                    content:
                    "❌ There is no active bingo game.",

                    ephemeral:true

                });

            }



            if(!game.registrationOpen) {

                return interaction.reply({

                    content:
                    "❌ Registration is closed.",

                    ephemeral:true

                });

            }




            const alreadyJoined =
                game.players.find(

                    player =>
                    player.userId === interaction.user.id

                );



            if(alreadyJoined) {

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




            return interaction.reply({

                content:

                `✅ ${interaction.user} joined bingo!`

            });


        }






        // =========================
        // STOP BINGO
        // =========================


        if(command === "stop") {


            const game =
                await BingoGame.findOne({

                    active:true

                });



            if(!game) {

                return interaction.reply({

                    content:
                    "❌ There is no active bingo game.",

                    ephemeral:true

                });

            }




            if(
                game.startedBy !== interaction.user.id
            ) {

                return interaction.reply({

                    content:
                    "❌ Only the organizer can stop bingo.",

                    ephemeral:true

                });

            }




            await BingoGame.deleteMany({

                active:true

            });



            return interaction.reply({

                content:
                "🛑 Bingo stopped."

            });


        }



        }

        };





        // =================================
        // NUMBER DRAW SYSTEM
        // =================================


        async function startDrawing(

        client,

        interaction,

        gameId

        ) {


        const channel =
        interaction.channel;



        let bingoMessage = null;




        const interval =
        setInterval(async()=>{


            const game =
                await BingoGame.findById(gameId);




            if(!game) {

                clearInterval(interval);

                return;

            }




            if(game.checkingClaim)
                return;




            if(
                game.drawnNumbers.length >= config.MAX_NUMBER
            ) {


                clearInterval(interval);


                await finishGame(

                    channel,

                    game

                );


                return;

            }





            let number;




            do {


                number =
                    Math.floor(

                        Math.random() *
                        config.MAX_NUMBER

                    ) + 1;



            }

            while(

                game.drawnNumbers.includes(number)

            );





            game.currentNumber =
                number;



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


        Click the button below to open your bingo card.
        `
                )

                .setColor("#FFD700")

                .setFooter({

                    text:
                    `Numbers drawn: ${game.drawnNumbers.length}/${config.MAX_NUMBER}`

                });





            const buttonRow =

                new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                    .setCustomId(
                        "open_bingo_card"
                    )

                    .setLabel(
                        "🎱 Open My Card"
                    )

                    .setStyle(
                        ButtonStyle.Primary
                    )

                );






            if(!bingoMessage) {


                bingoMessage =
                    await channel.send({

                        embeds:[
                            embed
                        ],

                        components:[
                            buttonRow
                        ]

                    });



            }

            else {


                await bingoMessage.edit({

                    embeds:[
                        embed
                    ],

                    components:[
                        buttonRow
                    ]

                });


            }




        }, config.DRAW_INTERVAL);



        }
// =================================
// OPEN PRIVATE BINGO CARD
// =================================

async function openBingoCard(interaction) {


    const game =
        await BingoGame.findOne({

            active:true

        });



    if(!game) {

        return interaction.reply({

            content:
            "❌ Bingo game is no longer active.",

            ephemeral:true

        });

    }




    const player =
        game.players.find(

            p =>
            p.userId === interaction.user.id

        );




    if(!player) {

        return interaction.reply({

            content:
            "❌ You are not part of this bingo game.",

            ephemeral:true

        });

    }





    const rows =
        createCardButtons(

            player.card,

            player.marked

        );




    await interaction.reply({

        embeds:[

            new EmbedBuilder()

            .setTitle(
                "🎱 Your Bingo Card"
            )

            .setDescription(
`
This card belongs to you.

Click numbers to mark them.

Press BINGO when you have a winning line.
`
            )

            .setColor("#3498db")

        ],

        components:rows,

        ephemeral:true

    });


}





// =================================
// CREATE CARD BUTTONS
// =================================

function createCardButtons(

    card,

    marked

) {


    const buttons = [];



    const layout =
        getCardLayout(card);




    for(const number of layout) {


        if(number === "FREE") {


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

        else {


            buttons.push(

                new ButtonBuilder()

                .setCustomId(
                    `bingo_${number}`
                )

                .setLabel(
                    String(number)
                )

                .setStyle(

                    marked.includes(number)

                    ?

                    ButtonStyle.Success

                    :

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
    ) {


        const row =
            new ActionRowBuilder();



        row.addComponents(

            buttons.slice(
                i,
                i + 5
            )

        );



        rows.push(row);


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



    return rows;


}







// =================================
// MARK NUMBER
// =================================

async function markNumber(interaction) {


    const game =
        await BingoGame.findOne({

            active:true

        });



    if(!game)
        return;



    const player =
        game.players.find(

            p =>
            p.userId === interaction.user.id

        );



    if(!player) {

        return interaction.reply({

            content:
            "❌ You are not playing.",

            ephemeral:true

        });

    }




    const number =
        Number(

            interaction.customId.replace(

                "bingo_",

                ""

            )

        );




    if(
        player.marked.includes(number)
    ) {


        player.marked =
            player.marked.filter(

                n =>
                n !== number

            );


    }

    else {


        player.marked.push(number);


    }




    await game.save();



    await interaction.update({

        components:

        createCardButtons(

            player.card,

            player.marked

        )

    });


}







// =================================
// CLAIM BINGO
// =================================

async function claimBingo(interaction) {


    const game =
        await BingoGame.findOne({

            active:true

        });



    if(!game)
        return;



    const player =
        game.players.find(

            p =>
            p.userId === interaction.user.id

        );




    if(
        !checkBingo(player)
    ) {


        return interaction.reply({

            content:
            "❌ You do not have bingo.",

            ephemeral:true

        });


    }





    game.checkingClaim = true;


    await game.save();





    const channel =
        interaction.client.channels.cache.get(

            game.channelId

        );




    await channel.send({

        embeds:[

            new EmbedBuilder()

            .setTitle(
                "🎉 Bingo Winner!"
            )

            .setDescription(

                `${interaction.user} won bingo!`

            )

            .setColor("#FFD700")

        ]

    });




    try {


        const member =
            await channel.guild.members.fetch(

                interaction.user.id

            );



        await member.roles.add(

            config.EVENT_WINNER_ROLE_ID

        );


    }

    catch(error) {

        console.log(error.message);

    }





    await BingoGame.deleteMany({

        active:true

    });



    await interaction.reply({

        content:
        "🎉 Congratulations! You won bingo.",

        ephemeral:true

    });


}







// =================================
// CHECK BINGO
// =================================

function checkBingo(player) {


    if(!player)
        return false;



    const lines = [


        [0,1,2,3,4],

        [5,6,7,8,9],

        [10,11,12,13,14],

        [15,16,17,18,19],

        [20,21,22,23,24],


        [0,5,10,15,20],

        [1,6,11,16,21],

        [2,7,12,17,22],

        [3,8,13,18,23],

        [4,9,14,19,24],


        [0,6,12,18,24],

        [4,8,12,16,20]


    ];




    return lines.some(

        line =>

        line.every(

            index => {


                const value =
                    player.card[index];



                if(value === "FREE")
                    return true;



                return player.marked.includes(value);


            }

        )

    );


}







// =================================
// FINISH GAME
// =================================

async function finishGame(

    channel,

    game

) {


    await channel.send({

        content:

        "🎱 Bingo finished. No more numbers."

    });



    await BingoGame.deleteMany({

        active:true

    });


}
        module.exports = {

            ...bingoCommand,

            openBingoCard,

            markNumber,

            claimBingo

        };