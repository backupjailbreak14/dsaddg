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
    let wrong = 0;
    let used = new Set();
    let gameOver = false;

    let activeCollector = null;

    let stats = await QuizStats.findOneAndUpdate(
        { userId: interaction.user.id },
        { $setOnInsert: { username: interaction.user.username } },
        { upsert: true, new: true }
    );

    async function sendQuestion() {

        if (gameOver) return;

        let raw;
        let tries = 0;

        do {
            raw = getRandomQuestion(used);
            tries++;
        } while (!raw && tries < 10);

        if (!raw) {
            gameOver = true;
            return endSolo(interaction, stats, score, streak, wrong);
        }

        const question = shuffleQuestion(raw);

        const row = new ActionRowBuilder();

        question.answers.forEach((a, i) => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`solo_${i}`)
                    .setLabel(a)
                    .setStyle(ButtonStyle.Primary)
            );
        });

        const embed = new EmbedBuilder()
            .setTitle("🇷🇺 Solo Mode")
            .setColor("#D4AF37")
            .setDescription(
`
❓ ${question.question}

⭐ Score: ${score}
🔥 Streak: ${streak}
❌ Wrong: ${wrong}
`
            );

        const msg = await interaction.editReply({
            embeds: [embed],
            components: [row]
        });

        if (activeCollector) activeCollector.stop();

        activeCollector = msg.createMessageComponentCollector({
            time: 60000
        });

        activeCollector.on("collect", async i => {

            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: "❌ Not your game",
                    ephemeral: true
                });
            }

            const selected = Number(i.customId.split("_")[1]);
            const answer = question.answers[selected];

            used.add(question.question);

            const correct = answer === question.correctAnswer;

            if (correct) {

                score++;
                streak++;

                await i.update({
                    content: "✅ Correct!",
                    embeds: [],
                    components: []
                });

                activeCollector.stop();
                setTimeout(sendQuestion, 1000);

            } else {

                wrong++;
                streak = 0;

                await i.update({
                    content: `❌ Wrong! Correct answer: **${question.correctAnswer}**`,
                    embeds: [],
                    components: []
                });

                gameOver = true;

                activeCollector.stop();
                await endSolo(interaction, stats, score, streak, wrong);
            }
        });
    }

    sendQuestion();
}

async function endSolo(interaction, stats, score, streak, wrong) {

    stats.gamesPlayed += 1;

    // 🔥 FIXED LOGGING (correct + clean)
    stats.questionsAnswered += score + wrong;
    stats.correctAnswers += score;
    stats.wrongAnswers += wrong;
    stats.totalPoints += score;

    if (streak > stats.bestStreak) {
        stats.bestStreak = streak;
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
⭐ Score: ${score}
🔥 Best streak: ${streak}
❌ Wrong answers: ${wrong}
`
                )
        ],
        components: []
    });
}

module.exports = soloMode;