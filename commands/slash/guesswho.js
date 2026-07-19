const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");


const questions =
    require("../../utils/guessWhoQuestions");




// =================================
// GUESS WHO COMMAND
// =================================

const guessWhoCommand = {


    data:

        new SlashCommandBuilder()

        .setName("guesswho")

        .setDescription(
            "Guess the word using emojis"
        ),





    async run(client, interaction) {



        const usedQuestions = [];

        const scores = {};

        let gameRunning = true;




        const firstQuestion =

            getRandomQuestion(
                usedQuestions
            );





        await interaction.reply({

            embeds:[

                createQuestionEmbed(
                    firstQuestion
                )

            ]

        });





        while(gameRunning) {



            const question =

                usedQuestions.length === 1

                ? firstQuestion

                :

                getRandomQuestion(
                    usedQuestions
                );





            await interaction.editReply({

                embeds:[

                    createQuestionEmbed(
                        question
                    )

                ]

            });





            const answer =

                await collectAnswer(

                    interaction,

                    question

                );





            // Nobody answered correctly

            if(!answer) {


                gameRunning = false;


                await interaction.editReply({

                    embeds:[

                        createGameOverEmbed(
                            scores,
                            question
                        )

                    ]

                });


                break;


            }





            const userId =

                answer.author.id;





            // Add player only after correct answer

            if(!scores[userId]) {


                scores[userId] = {


                    username:
                    answer.author.username,


                    points:0


                };


            }





            scores[userId].points++;





            await interaction.editReply({

                embeds:[

                    createLeaderboardEmbed(
                        scores
                    )

                ]

            });





            await wait(5000);



        }



    }


};







// =================================
// GET RANDOM QUESTION
// =================================

function getRandomQuestion(
    usedQuestions
) {


    let question;


    do {


        question =

            questions[

                Math.floor(
                    Math.random() *
                    questions.length
                )

            ];



    }

    while(

        usedQuestions.includes(question)

    );





    usedQuestions.push(question);



    return question;


}







// =================================
// CREATE QUESTION EMBED
// =================================

function createQuestionEmbed(
    question
) {


    return new EmbedBuilder()

    .setTitle(
        "🤔 Guess Who?"
    )

    .setDescription(
`
Guess the word:

${question.emojis}


⏳ You have **30 seconds**
`
    )

    .setColor("#9b59b6");


}







// =================================
// COLLECT ANSWER
// =================================

function collectAnswer(

    interaction,

    question

) {


    return new Promise(resolve => {



        let solved = false;





        const collector =

            interaction.channel.createMessageCollector({

                time:30000,


                filter:

                message =>

                !message.author.bot


            });






        collector.on(

            "collect",

            message => {



                if(solved)
                    return;





                const answer =

                    message.content

                    .toLowerCase()

                    .trim();





                const correctAnswer =

                    question.answer

                    .toLowerCase()

                    .trim();





                if(

                    answer === correctAnswer

                ) {


                    solved = true;



                    collector.stop();



                    resolve(message);


                }



            }

        );






        collector.on(

            "end",

            () => {


                if(!solved) {


                    resolve(null);


                }


            }

        );



    });


}







// =================================
// CREATE LEADERBOARD EMBED
// =================================

function createLeaderboardEmbed(
    scores
) {


    const leaderboard =

        Object.values(scores)

        .sort(

            (a,b) =>

            b.points - a.points

        )

        .map(

            (player,index) =>

`
${index + 1}. **${player.username}** - ${player.points} point(s)
`

        )

        .join("");





    return new EmbedBuilder()

    .setTitle(
        "🏆 Guess Who Leaderboard"
    )

    .setDescription(
`
${leaderboard}

⏳ Next question in 5 seconds...
`
    )

    .setColor("#FFD700");


}







// =================================
// CREATE GAME OVER EMBED
// =================================

function createGameOverEmbed(

    scores,

    question

) {


    const leaderboard =

        Object.values(scores)

        .sort(

            (a,b) =>

            b.points - a.points

        )

        .map(

            (player,index) =>

`
${index + 1}. **${player.username}** - ${player.points} point(s)
`

        )

        .join("");





    return new EmbedBuilder()

    .setTitle(
        "🏁 Guess Who Game Over!"
    )

    .setDescription(
`
Final Score:

${leaderboard || "Nobody scored."}


The answer was:

**${question.answer}**
`
    )

    .setColor("#FF0000");


}







// =================================
// WAIT FUNCTION
// =================================

function wait(ms) {


    return new Promise(

        resolve =>

        setTimeout(resolve, ms)

    );


}







// =================================
// EXPORT
// =================================

module.exports = {


    ...guessWhoCommand


};