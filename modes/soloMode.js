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
    let streak = 0;
    let bestStreak = 0;

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
                bestStreak,
                wrong,
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

                    streak++;

                    if (
                        streak > bestStreak
                    ) {

                        bestStreak = streak;

                    }

                    await i.update({

                        content:
                        "✅ Correct!",

                        embeds: [],

                        components: []

                    });

                    activeCollector.stop();

                    setTimeout(
                        sendQuestion,
                        1000
                    );

                } else {

                    wrong++;

                    streak = 0;

                    gameOver = true;

                    activeCollector.stop();

                    await endSolo(

                        interaction,

                        stats,

                        score,

                        bestStreak,

                        wrong,

                        question

                    );

                }

            }
        );

        activeCollector.on(
            "end",
            async (collected, reason) => {

                // Player did not answer within the time limit
                if (
                    reason === "time" &&
                    collected.size === 0 &&
                    !gameOver
                ) {

                    wrong++;

                    streak = 0;

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

✅ **Correct answer**
${question.correctAnswer}

You did not answer within **15 seconds**.
`
                                )

                        ],

                        components: []

                    });

                    setTimeout(async () => {

                        await endSolo(

                            interaction,

                            stats,

                            score,

                            bestStreak,


                            question

                        );

                    }, 2000);

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
    question
) {

    stats.gamesPlayed += 1;

    stats.questionsAnswered +=
        score + wrong;

    stats.correctAnswers +=
        score;

    stats.wrongAnswers += 1;

    stats.totalPoints +=
        score;

    if (
        bestStreak > stats.bestStreak
    ) {

        stats.bestStreak =
            bestStreak;

    }

    stats.lastPlayed =
        new Date();

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

✅ **Correct answer**
${question?.correctAnswer ?? "Unknown"}

⭐ **Final score**
${score}

🔥 **Best streak**
${bestStreak}

❌ **Wrong answers**
${wrong}
`
                )

        ],

        components: []

    });

}

module.exports = soloMode;