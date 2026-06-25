const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const { getRandomQuestion } = require("../utils/questionPool");
const shuffleQuestion = require("../utils/shuffleQuestion");
const QuizStats = require("../models/QuizStats");
const { removeDuel } = require("../utils/activeDuels");

async function duelMode(interaction, opponent) {

    const players = [
        interaction.user,
        opponent
    ];

    let turn = 0;

    let scores = {
        [players[0].id]: 0,
        [players[1].id]: 0
    };

    let used = new Set();

    let questionCount = 0;

    // 5 questions per player
    const maxQuestions = 10;

    let activeCollector = null;

    async function sendQuestion() {

        if (questionCount >= maxQuestions) {

            return endDuel(
                interaction,
                players,
                scores
            );

        }

        const currentPlayer =
            players[turn];

        let raw;
        let tries = 0;

        do {

            raw = getRandomQuestion(used);

            tries++;

        } while (
            !raw &&
            tries < 10
        );

        if (!raw) {

            return endDuel(
                interaction,
                players,
                scores
            );

        }

        const question =
            shuffleQuestion(raw);

        const row =
            new ActionRowBuilder();

        question.answers.forEach((answer, index) => {

            row.addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        `duel_${index}`
                    )

                    .setLabel(answer)

                    .setStyle(
                        ButtonStyle.Primary
                    )

            );

        });

        const embed =
            new EmbedBuilder()

                .setTitle(
                    "⚔️ Soviet Quiz Duel"
                )

                .setColor(
                    "#D4AF37"
                )

                .setDescription(
`
👤 **Turn**
${currentPlayer.username}

📂 **Category**
${question.category}

❓ **Question**
${question.question}

📊 **Score**

${players[0].username}: ${scores[players[0].id]}
${players[1].username}: ${scores[players[1].id]}

🔢 **Question**
${questionCount + 1}/${maxQuestions}

⏱️ **Time**
15 seconds
`
                );

        const message =
            await interaction.editReply({

                embeds: [
                    embed
                ],

                components: [
                    row
                ]

            });

        if (activeCollector) {

            activeCollector.stop();

        }

        activeCollector =
            message.createMessageComponentCollector({

                time: 15000

            });
        activeCollector.on(
            "collect",
            async i => {

                if (
                    i.user.id !== currentPlayer.id
                ) {

                    return i.reply({

                        content:
                        "❌ Not your turn.",

                        ephemeral: true

                    });

                }

                const selected =
                    Number(
                        i.customId.split("_")[1]
                    );

                const answer =
                    question.answers[selected];

                used.add(
                    question.question
                );

                const correct =
                    answer === question.correctAnswer;

                if (correct) {

                    scores[currentPlayer.id]++;

                }

                questionCount++;

                turn =
                    turn === 0
                    ? 1
                    : 0;

                await i.update({

                    content:
                        correct
                            ? "✅ Correct!"
                            : `❌ Wrong! Correct answer: **${question.correctAnswer}**`,

                    embeds: [],

                    components: []

                });

                activeCollector.stop("answered");

                setTimeout(
                    sendQuestion,
                    1500
                );

            }
        );

        activeCollector.on(
            "end",
            async (_, reason) => {

                if (reason !== "time") return;

                used.add(
                    question.question
                );

                questionCount++;

                turn =
                    turn === 0
                    ? 1
                    : 0;

                await interaction.editReply({

                    embeds: [

                        new EmbedBuilder()

                            .setTitle(
                                "⏰ Time's Up!"
                            )

                            .setColor(
                                "Orange"
                            )

                            .setDescription(
        `
        👤 **${currentPlayer.username}** did not answer in time.

        📂 **Category**
        ${question.category}

        ❓ **Question**
        ${question.question}

        ✅ **Correct Answer**
        ${question.correctAnswer}
        `
                            )

                    ],

                    components: []

                });

                setTimeout(
                    sendQuestion,
                    2000
                );

            }
        );

        }

        sendQuestion();

        }

async function endDuel(
    interaction,
    players,
    scores
) {

    const p1 =
        players[0];

    const p2 =
        players[1];

    const p1Score =
        scores[p1.id];

    const p2Score =
        scores[p2.id];

    let winnerId = null;


    if (
        p1Score > p2Score
    ) {

        winnerId = p1.id;

    }

    else if (
        p2Score > p1Score
    ) {

        winnerId = p2.id;

    }


    const winner =
        winnerId
            ? players.find(
                p => p.id === winnerId
            ).username
            : "Draw";


    // Update database statistics

    const p1Stats =
        await QuizStats.findOneAndUpdate(

            {
                userId: p1.id
            },

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

            {
                userId: p2.id
            },

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

    removeDuel(
        p1.id,
        p2.id
    );



    await interaction.editReply({

        embeds: [

            new EmbedBuilder()

                .setTitle(
                    "🏆 Duel Finished"
                )

                .setColor(
                    "Green"
                )

                .setDescription(
`
⚔️ **Final Score**

${p1.username}
⭐ ${p1Score}


${p2.username}
⭐ ${p2Score}


🏆 **Winner**
${winner}
`
                )

        ],

        components: []

    });

}


module.exports = duelMode;