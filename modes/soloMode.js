const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const { getRandomQuestion } = require("../utils/questionPool");
const shuffleQuestion = require("../utils/shuffleQuestion");
const QuizStats = require("../models/QuizStats");

async function soloMode(interaction) {

    let score = 0;
    let bestScore = 0;

    let used = new Set();
    let gameOver = false;

    let activeCollector = null;

    let stats = await QuizStats.findOneAndUpdate(
        {
            userId: interaction.user.id
        },
        {
            $setOnInsert: {
                username: interaction.user.username
            }
        },
        {
            upsert: true,
            new: true
        }
    );

    async function sendQuestion() {

        if (gameOver) return;

        let raw;
        let tries = 0;

        do {

            raw = getRandomQuestion(
                used,
                stats
            );

            tries++;

        } while (!raw && tries < 10);

        if (!raw) {

            gameOver = true;

            return endSolo(
                interaction,
                stats,
                score,
                bestScore,
                null
            );

        }

        const question = shuffleQuestion(raw);

        const row = new ActionRowBuilder();

        question.answers.forEach((answer, index) => {

            row.addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        `solo_${index}`
                    )

                    .setLabel(answer)

                    .setStyle(
                        ButtonStyle.Primary
                    )

            );

        });

        const embed = new EmbedBuilder()

            .setTitle(
                "<:flag_su:1205892640361422891> Soviet Quiz - Solo"
            )

            .setColor(
                "#D4AF37"
            )

            .setDescription(
`
📂 **Category**
${question.category}

❓ **Question**
${question.question}

⭐ Score: ${score}

⏱️ Time limit: **15 seconds**
`
            );

        const message = await interaction.editReply({

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
                    i.user.id !== interaction.user.id
                ) {

                    return i.reply({

                        content:
                        "❌ This is not your quiz.",

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

                if (
                    answer === question.correctAnswer
                ) {

                    score++;

                    if (score > bestScore) {

                        bestScore = score;

                    }

                    await i.update({

                        content: "✅ Correct!",

                        embeds: [],

                        components: []

                    });

                    activeCollector.stop();

                    setTimeout(
                        sendQuestion,
                        1000
                    );

                } else {


                    gameOver = true;

                    activeCollector.stop();

                    await endSolo(
                        interaction,
                        stats,
                        score,
                        bestScore,
                        question
                    );

                }

            }
        );

        activeCollector.on(
            "end",
            async (_, reason) => {

                if (
                    reason === "time" &&
                    !gameOver
                ) {

                    gameOver = true;

                    await interaction.editReply({

                        embeds: [

                            new EmbedBuilder()

                                .setTitle(
                                    "⏰ Time's Up"
                                )

                                .setColor(
                                    "Orange"
                                )

                                .setDescription(
        `
        📂 **Category**
        ${question.category}

        ❓ **Question**
        ${question.question}

        ✅ **Correct Answer**
        ${question.correctAnswer}


        ⭐ Final Score
        ${score}

        You did not answer within **15 seconds**.
        `
                                )

                        ],

                        components: []

                    });


                    await endSolo(
                        interaction,
                        stats,
                        score,
                        bestScore,
                        question
                    );

                }

            }
        );

    }

    sendQuestion();
}

    async function endSolo(
        interaction,
        stats,
        score,
        bestScore,
        question
    ) {

        stats.gamesPlayed += 1;

        stats.questionsAnswered += score + 1;

        stats.correctAnswers += score;

        stats.wrongAnswers += 1;

        stats.totalPoints += score;


        if (
            bestScore > stats.bestStreak
        ) {

            stats.bestStreak = bestScore;

        }


        stats.lastPlayed = new Date();


        await stats.save();


        await interaction.editReply({

            embeds: [

                new EmbedBuilder()

                    .setTitle(
                        "❌ Game Over"
                    )

                    .setColor(
                        "Red"
                    )

                    .setDescription(
    `
    📂 **Category**
    ${question?.category ?? "Unknown"}

    ❓ **Question**
    ${question?.question ?? "Unknown"}

    ✅ **Correct Answer**
    ${question?.correctAnswer ?? "Unknown"}


    ⭐ Final Score
    ${score}
    `
                    )

            ],

            components: []

        });

    }

module.exports = soloMode;