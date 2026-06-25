const { EmbedBuilder } = require("discord.js");
const QuizStats = require("../models/QuizStats");


// ========================
// SOLO END
// ========================
async function endSolo(
    interaction,
    stats,
    score,
    bestStreak,
    wrong,
    lastQuestion
) {


    stats.gamesPlayed += 1;


    stats.questionsAnswered += score + wrong;


    stats.correctAnswers += score;


    stats.wrongAnswers += wrong;


    stats.totalPoints += score;



    if (bestStreak > stats.bestStreak) {

        stats.bestStreak = bestStreak;

    }



    stats.lastPlayed = new Date();



    await stats.save();



    await interaction.editReply({

        embeds: [

            new EmbedBuilder()

                .setTitle("❌ Game Over")

                .setColor("Red")

                .setDescription(

`
📂 Category:
${lastQuestion.category}


❓ Question:
${lastQuestion.question}


✅ Correct answer:
${lastQuestion.correctAnswer}


⭐ Score:
${score}


🔥 Best Streak:
${bestStreak}


❌ Wrong:
${wrong}
`

                )

        ],

        components: []

    });

}




// ========================
// DUEL END
// ========================
async function endDuel(
    interaction,
    players,
    scores
) {


    const p1 = players[0];

    const p2 = players[1];



    const p1Score =
        scores[p1.id];


    const p2Score =
        scores[p2.id];



    const winnerId =

        p1Score > p2Score

        ? p1.id

        :

        p2Score > p1Score

        ? p2.id

        :

        null;



    const winnerName =

        winnerId

        ? players.find(
            p => p.id === winnerId
        ).username

        :

        "Draw";




    // Maak stats automatisch aan
    const p1Stats =
        await QuizStats.findOneAndUpdate(

            { userId: p1.id },

            {
                $setOnInsert: {
                    username: p1.username
                }
            },

            {
                upsert: true,
                new: true
            }

        );



    const p2Stats =
        await QuizStats.findOneAndUpdate(

            { userId: p2.id },

            {
                $setOnInsert: {
                    username: p2.username
                }
            },

            {
                upsert: true,
                new: true
            }

        );





    p1Stats.gamesPlayed++;
    p2Stats.gamesPlayed++;



    p1Stats.totalPoints += p1Score;
    p2Stats.totalPoints += p2Score;



    if (winnerId === p1.id) {

        p1Stats.wins++;

        p2Stats.losses++;

    }


    else if (winnerId === p2.id) {

        p2Stats.wins++;

        p1Stats.losses++;

    }



    p1Stats.lastPlayed = new Date();

    p2Stats.lastPlayed = new Date();



    await p1Stats.save();

    await p2Stats.save();




    await interaction.editReply({

        embeds: [

            new EmbedBuilder()

                .setTitle("🏆 Duel Finished")

                .setColor("Green")

                .setDescription(

`
📊 ${p1.username}: ${p1Score}

📊 ${p2.username}: ${p2Score}


🏆 Winner:
**${winnerName}**
`

                )

        ],

        components: []

    });

}



module.exports = {
    endSolo,
    endDuel
};