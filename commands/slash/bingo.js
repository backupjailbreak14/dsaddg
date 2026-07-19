const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


const BingoGame =
    require("../../models/BingoGame");


const {
    generateBingoCard,
    getCardLayout
} = require("../../utils/bingoGenerator");


const config =
    require("../../config/bingoConfig");




// =================================
// BINGO COMMAND
// =================================

const bingoCommand = {


    data:

        new SlashCommandBuilder()

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





        // =================================
        // START BINGO
        // =================================

        if(command === "start") {



            





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
                ]

            });





            // Send organizer card privately

            await interaction.followUp({

                embeds:[

                    new EmbedBuilder()

                    .setTitle(
                        "🎱 Your Bingo Card"
                    )

                    .setDescription(
            `
            This card belongs to you.

            Click numbers to mark them.
            `
                    )

                    .setColor("#3498db")

                ],

                components:

                createCardButtons(

                    organizerCard,

                    ["FREE"]

                ),

                ephemeral:true

            });



            await interaction.followUp({

                embeds:[

                    new EmbedBuilder()

                    .setTitle(
                        "🎱 Bingo Claim"
                    )

                    .setDescription(
            `
            When you have a winning line:

            Press the button below to claim bingo.
            `
                    )

                    .setColor("#FFD700")

                ],

                components:[

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

                ],

                ephemeral:true

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

Drawing the first number...
`
                    )

                    .setColor("#00ff00");





                await interaction.editReply({

                    embeds:[
                        startEmbed
                    ]

                });





                const bingoMessage = await interaction.fetchReply();

                interaction.client.bingoMessage = bingoMessage;


                startDrawing(

                    client,

                    interaction,

                    game._id

                );



            },30000);





            return;

        }

        // =================================
        // JOIN BINGO
        // =================================

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





            await interaction.reply({

                embeds:[

                    new EmbedBuilder()

                    .setTitle(
                        "🎱 Your Bingo Card"
                    )

                    .setDescription(
            `
            You joined the bingo game!

            Click numbers to mark them.
            `
                    )

                    .setColor("#3498db")

                ],

                components:

                createCardButtons(

                    card,

                    ["FREE"]

                ),

                ephemeral:true

            });



            await interaction.followUp({

                embeds:[

                    new EmbedBuilder()

                    .setTitle(
                        "🎱 Bingo Claim"
                    )

                    .setDescription(
            `
            Press the button when you have bingo.
            `
                    )

                    .setColor("#FFD700")

                ],

                components:[

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

                ],

                ephemeral:true

            });


        }







        // =================================
        // STOP BINGO
        // =================================

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
        // START NUMBER DRAWING
        // =================================

        async function startDrawing(

        client,

        interaction,

        gameId

        ) {


        const channel =
        interaction.channel;


        const bingoMessage =
            interaction.client.bingoMessage;


        let interval = null;





            const drawNumber = async()=>{

                const game =
                    await BingoGame.findById(gameId);

                if(!game) {

                    clearInterval(interval);
                    return;

                }

                if(game.checkingClaim) {
                    return;
                }


                if(game.drawnNumbers.length >= config.MAX_NUMBER) {

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


                game.currentNumber = number;

                game.drawnNumbers.push(number);


                await game.save();


                const embed =
                    new EmbedBuilder()

                    .setTitle("🎱 Bingo Game")

                    .setDescription(
            `
            ## Current Number

            # **${number}**

            Players:

            **${game.players.length}**

            Use your bingo card to mark numbers.

            Press **🎱 BINGO** when you have a winning line.
            `
                    )

                    .setColor("#FFD700");


                await bingoMessage.edit({

                    embeds:[embed]

                });


            };


            // HIER BUITEN DE FUNCTIE
            await drawNumber();


            interval = setInterval(
                drawNumber,
                config.DRAW_INTERVAL
            );

            interaction.client.bingoInterval = interval;

            
            }


// =================================
// CREATE BINGO CARD BUTTONS
// =================================

function createCardButtons(

    card,

    marked

) {


    const buttons = [];


    const layout =
        getCardLayout(card).slice(0,25);





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


        } else {


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

                    ? ButtonStyle.Success

                    : ButtonStyle.Secondary

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







    return rows;


}








// =================================
// MARK BINGO NUMBER
// =================================

async function markNumber(interaction) {


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
            "❌ You are not playing bingo.",

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





    if(player.marked.includes(number)) {


        player.marked =

            player.marked.filter(

                n =>

                n !== number

            );


    } else {


        player.marked.push(number);


    }





    await game.save();





    return interaction.update({

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


    if(!player) {

        return interaction.reply({
            content:
            "❌ You are not playing bingo.",
            ephemeral:true
        });

    }



    // PAUSE GAME

    game.checkingClaim = true;

    await game.save();

    if (interaction.client.bingoInterval) {

        clearInterval(
            interaction.client.bingoInterval
        );

        interaction.client.bingoInterval = null;

    }



    const channel =
        interaction.client.channels.cache.get(
            game.channelId
        );



    const checkMessage =
        await channel.send({

            embeds:[

                new EmbedBuilder()

                .setTitle("🎱 Bingo Claim")

                .setDescription(
                    `${interaction.user} pressed bingo!\n\n` +
                    `🧐 Slatoer is checking the card...`
                )

                .setColor("#FFD700")

            ]

        });



    // WAIT 10 SECONDS

    await new Promise(
        resolve =>
        setTimeout(resolve,10000)
    );




    // CHECK CARD

    const hasBingo =
        checkBingo(player);




    if(!hasBingo) {


        const updatedGame =
            await BingoGame.findOne({

                active:true

            });


        if (updatedGame) {

            updatedGame.checkingClaim = false;

            await updatedGame.save();


            startDrawing(
                interaction.client,
                interaction,
                updatedGame._id
            );

        }



        await checkMessage.edit({

            embeds:[

                new EmbedBuilder()

                .setTitle("❌ No Bingo")

                .setDescription(
                    `${interaction.user} does not have bingo.\n\n` +
                    `🎱 Continuing game...`
                )

                .setColor("#FF0000")

            ]

        });



        return interaction.reply({

            content:
            "❌ Your bingo claim was invalid.",

            ephemeral:true

        });


    }




    // WINNER


    await checkMessage.edit({

        embeds:[

            new EmbedBuilder()

            .setTitle("🎉 Bingo Valid!")

            .setDescription(
                `${interaction.user} has a valid bingo card!`
            )

            .setColor("#00FF00")

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


    } catch(error) {

        console.log(
            "Role error:",
            error.message
        );

    }





    await channel.send({

        embeds:[

            new EmbedBuilder()

            .setTitle(
                "🏆 Bingo Winner!"
            )

            .setDescription(
                `${interaction.user} won the bingo event!`
            )

            .setColor("#FFD700")

        ]

    });





    await BingoGame.deleteMany({

        active:true

    });





    return interaction.reply({

        content:
        "🎉 Congratulations! You won bingo!",

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









// =================================
// EXPORT
// =================================

module.exports = {


    ...bingoCommand,


    markNumber,


    claimBingo

};