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

    .setDescription(
        "Bingo game commands"
    )


    .addSubcommand(sub =>

        sub

            .setName("start")

            .setDescription(
                "Start a bingo event"
            )

    )


    .addSubcommand(sub =>

        sub

            .setName("join")

            .setDescription(
                "Join the bingo event"
            )

    )


    .addSubcommand(sub =>

        sub

            .setName("stop")

            .setDescription(
                "Stop the bingo event"
            )

    ),







async run(client, interaction) {


const command =
    interaction.options.getSubcommand();





// ==========================
// START BINGO
// ==========================


if (command === "start") {



    if (

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






    const existing =

        await BingoGame.findOne({

            active:true

        });





    if (existing) {


        return interaction.reply({

            content:
            "❌ A bingo game is already running.",

            ephemeral:true

        });


    }






    await BingoGame.create({

        active:true,

        channelId:
        interaction.channel.id,


        startedBy:
        interaction.user.id,


        registrationOpen:true,


        drawnNumbers:[],


        players:[],


        claims:[],


        checkingClaim:false,


        paused:false

    });






    await interaction.reply({

        embeds:[

            new EmbedBuilder()

            .setTitle(
                "🎱 Bingo Registration Open!"
            )

            .setDescription(

`
A new bingo event is starting!

Players have **30 seconds** to join.

Use:

\`/bingo join\`

After registration closes the game will begin automatically.

Good luck!

`

            )

            .setColor(
                "#3498db"
            )

        ]

    });







    // Registration timer

    setTimeout(async()=>{



        const game =

            await BingoGame.findOne({

                active:true

            });





        if (!game)
            return;





        game.registrationOpen =
            false;


        await game.save();






        interaction.channel.send({

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

First number will be drawn soon!

`

                )

                .setColor(
                    "#00FF00"
                )

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


if (command === "join") {



    const game =

        await BingoGame.findOne({

            active:true

        });





    if (!game) {


        return interaction.reply({

            content:
            "❌ There is no active bingo event.",

            ephemeral:true

        });


    }






    if (!game.registrationOpen) {


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






    if (alreadyJoined) {


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





    await sendCard(

        interaction,

        card

    );





    return;

}
    // =====================================
    // STOP BINGO
    // =====================================


    if (command === "stop") {



        const game =

            await BingoGame.findOne({

                active:true

            });





        if (!game) {


            return interaction.reply({

                content:
                "❌ There is no active bingo event.",

                ephemeral:true

            });


        }






        // Only the bingo creator can stop the game

        if (

            game.startedBy !== interaction.user.id

        ) {


            return interaction.reply({

                content:
                "❌ Only the bingo starter can stop the game.",

                ephemeral:true

            });


        }






        await BingoGame.deleteMany({

            active:true

        });






        return interaction.reply(

            "🛑 Bingo event stopped."

        );


    }



    }

    };











    // =====================================
    // NUMBER DRAW SYSTEM
    // =====================================


    async function startDrawing(client, channel) {



    const interval = setInterval(async()=>{





        const game =

            await BingoGame.findOne({

                active:true

            });





        if (!game) {


            clearInterval(interval);

            return;


        }






        // Pause drawing during bingo verification

        if (game.paused) {

            return;

        }








        // Finish automatically when all numbers are drawn

        if (

            game.drawnNumbers.length >= config.MAX_NUMBER

        ) {



            clearInterval(interval);


            await finishGame(

                client,

                channel,

                game

            );


            return;


        }







        let number;






        do {


            number =

            Math.floor(

                Math.random() * config.MAX_NUMBER

            ) + 1;



        }


        while (

            game.drawnNumbers.includes(number)

        );








        game.currentNumber = number;


        game.drawnNumbers.push(number);



        await game.save();







        channel.send({

            embeds:[

                new EmbedBuilder()

                .setTitle(
                    "🎱 Bingo Number"
                )

                .setDescription(

    `
    # ${number}

    Check your personal bingo card!

    `

                )

                .setColor(
                    "#FFD700"
                )

            ]

        });






    }, config.DRAW_INTERVAL);



    }











    // =====================================
    // SEND PERSONAL BINGO CARD
    // =====================================


    async function sendCard(

    interaction,

    card

    ){



    const rows = createCardButtons(

        card,

        []

    );





    await interaction.reply({

        embeds:[

            new EmbedBuilder()

            .setTitle(
                "🎱 Your Bingo Card"
            )

            .setDescription(

    `
    This card belongs only to you.

    Mark numbers manually.

    The bot will NOT tell you if a number is correct.

    Click again to remove a mark.

    When you think you have bingo press 🎱 BINGO.

    `

            )

            .setColor(
                "#3498db"
            )

        ],


        components:rows,


        ephemeral:true


    });






    const message =

        await interaction.fetchReply();







    const collector =

    message.createMessageComponentCollector({

        time:3600000

    });







    collector.on("collect", async i=>{






    if (i.customId === "bingo_claim") {


        await claimBingo(i);

        return;

    }






    if (

        !i.customId.startsWith("bingo_")

    )

    return;







    const number =

    Number(

        i.customId.replace(

            "bingo_",

            ""

        )

    );







    const game =

    await BingoGame.findOne({

        active:true

    });







    if (!game)

    return;








    const player =

    game.players.find(

        p =>

        p.userId === i.user.id

    );








    if (!player)

    return;








    // Prevent marking too many numbers

    if (

        !player.marked.includes(number)

        &&

        player.marked.length >= game.drawnNumbers.length

    ) {



        return i.reply({

            content:
            "❌ You cannot mark more numbers than numbers drawn.",

            ephemeral:true

        });


    }









    // Toggle mark

    if (

        player.marked.includes(number)

    ) {



        player.marked =

        player.marked.filter(

            n => n !== number

        );



    }

    else {


        player.marked.push(number);


    }







    await game.save();







    await refreshCard(

        i,

        player.card,

        player.marked

    );







    });





    }











    // =====================================
    // CREATE BUTTONS
    // =====================================


    function createCardButtons(

    card,

    marked

    ){



    const layout =

    getCardLayout(card);





    const buttons=[];






    for (const number of layout) {



        if (number === "FREE") {



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







    const rows=[];






    for (

    let i=0;

    i<buttons.length;

    i+=5

    ){



    rows.push(

        new ActionRowBuilder()

        .addComponents(

            buttons.slice(

                i,

                i+5

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






    return rows;



    }

// =====================================
// REFRESH PERSONAL CARD
// =====================================


async function refreshCard(

interaction,

card,

marked

){


await interaction.update({

    components:

    createCardButtons(

        card,

        marked

    )

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





if (!game)

return;






// Prevent multiple people claiming at the same time

if (game.checkingClaim) {



    return interaction.reply({

        content:
        "⏳ Someone is already being checked for bingo.",

        ephemeral:true

    });


}







const player =

game.players.find(

    p =>

    p.userId === interaction.user.id

);






if (!player)

return;







game.checkingClaim = true;

game.paused = true;







game.claims.push({

    userId:

    interaction.user.id

});







await game.save();







const channel =

interaction.client.channels.cache.get(

    game.channelId

);







channel.send(

`

🎱 **Bingo claim!**

${interaction.user} thinks they have bingo.

Checking result...

`

);









setTimeout(async()=>{






const updatedGame =

await BingoGame.findOne({

    active:true

});






if (!updatedGame)

return;







// Check all claims in order

for (

const claim of updatedGame.claims

) {






const claimant =

updatedGame.players.find(

p =>

p.userId === claim.userId

);






if (

checkBingo(claimant)

) {





const member =

await interaction.guild.members.fetch(

claim.userId

);







await member.roles.add(

config.EVENT_WINNER_ROLE_ID

);








channel.send(

`

🎉 **BINGO!**

Congratulations ${member}!

You won the bingo event 🏆

`

);







await BingoGame.deleteMany({

    active:true

});







return;



}





}







// No winner

updatedGame.checkingClaim = false;

updatedGame.paused = false;

updatedGame.claims = [];





await updatedGame.save();






channel.send(

`

❌ No valid bingo found.

The game continues!

`

);







}, config.CLAIM_CHECK_TIME);



}











// =====================================
// CHECK BINGO
// =====================================


function checkBingo(player){



if (!player)

return false;






const layout =

getCardLayout(

    player.card

);






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


[4,9,14,19,24]


];







return lines.some(

line =>

line.every(

index => {


const value =

layout[index];



// FREE space is always valid

if (

value === "FREE"

)

return true;





return player.marked.includes(

    value

);



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



const winners=[];






for (const player of game.players){



if (

checkBingo(player)

){


winners.push(

player.userId

);


}



}







if (winners.length === 0){



channel.send(

`

🎱 **Bingo finished!**

All numbers have been drawn.

No winners this time.

`

);



}

else {



for (const id of winners){



try {



const member =

await channel.guild.members.fetch(

id

);





await member.roles.add(

config.EVENT_WINNER_ROLE_ID

);





}

catch(error){



console.log(

error.message

);



}



}






channel.send({

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





}







await BingoGame.deleteMany({

active:true

});



}