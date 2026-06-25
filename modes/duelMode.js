const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const { getRandomQuestion } = require("../utils/questionPool");
const shuffleQuestion = require("../utils/shuffleQuestion");
const QuizStats = require("../models/QuizStats");

async function duelMode(interaction, opponent) {

    const players = [interaction.user, opponent];

    let turn = 0;

    let scores = {
        [players[0].id]: 0,
        [players[1].id]: 0
    };

    let used = new Set();
    let count = 0;
    const max = 10;

    let activeCollector = null;
    let locked = false;

    async function sendQuestion() {

        if (count >= max) return endDuel(interaction, players, scores);

        const current = players[turn];

        let raw;
        let tries = 0;

        do {
            raw = getRandomQuestion(used);
            tries++;
        } while (!raw && tries < 10);

        if (!raw) return endDuel(interaction, players, scores);

        const question = shuffleQuestion(raw);

        const row = new ActionRowBuilder();

        question.answers.forEach((a, i) => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`duel_${i}`)
                    .setLabel(a)
                    .setStyle(ButtonStyle.Primary)
            );
        });

        const embed = new EmbedBuilder()
            .setTitle("⚔️ Duel Mode")
            .setColor("#D4AF37")
            .setDescription(
`
👤 Turn: **${current.username}**

❓ ${question.question}

📊 ${players[0].username}: ${scores[players[0].id]}
📊 ${players[1].username}: ${scores[players[1].id]}
`
            );

        const msg = await interaction.editReply({
            embeds: [embed],
            components: [row]
        });

        if (activeCollector) activeCollector.stop();

        locked = false;

        activeCollector = msg.createMessageComponentCollector({
            time: 30000
        });

        activeCollector.on("collect", async i => {

            // 🔥 ANTI CHEAT 1: wrong user
            if (i.user.id !== current.id) {
                return i.reply({
                    content: "❌ Not your turn",
                    ephemeral: true
                });
            }

            // 🔥 ANTI CHEAT 2: double click / spam
            if (locked) return;
            locked = true;

            const selected = Number(i.customId.split("_")[1]);
            const answer = question.answers[selected];

            used.add(question.question);

            const correct = answer === question.correctAnswer;

            if (correct) {
                scores[current.id]++;
            }

            turn = 1 - turn;
            count++;

            await i.update({
                content: correct ? "✅ Correct!" : "❌ Wrong!",
                embeds: [],
                components: []
            });

            activeCollector.stop();
            setTimeout(sendQuestion, 1000);
        });

        activeCollector.on("end", () => {
            locked = false;
        });
    }

    sendQuestion();
}

async function endDuel(interaction, players, scores) {

    const p1 = players[0];
    const p2 = players[1];

    const p1Score = scores[p1.id];
    const p2Score = scores[p2.id];

    const winnerId =
        p1Score > p2Score ? p1.id :
        p2Score > p1Score ? p2.id :
        null;

    const winner =
        winnerId ? players.find(p => p.id === winnerId).username : "Draw";

    // 🔥 DATABASE UPDATE (SAFE ANTI-CHEAT VERSION)

    const p1Stats = await QuizStats.findOne({ userId: p1.id });
    const p2Stats = await QuizStats.findOne({ userId: p2.id });

    if (p1Stats) {
        p1Stats.gamesPlayed += 1;
        p1Stats.totalPoints += p1Score;

        if (winnerId === p1.id) p1Stats.wins++;
        else if (winnerId) p1Stats.losses++;

        p1Stats.lastPlayed = new Date();

        await p1Stats.save();
    }

    if (p2Stats) {
        p2Stats.gamesPlayed += 1;
        p2Stats.totalPoints += p2Score;

        if (winnerId === p2.id) p2Stats.wins++;
        else if (winnerId) p2Stats.losses++;

        p2Stats.lastPlayed = new Date();

        await p2Stats.save();
    }

    await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setTitle("🏆 Duel Finished")
                .setColor("Green")
                .setDescription(
`
${p1.username}: ${p1Score}
${p2.username}: ${p2Score}

🏆 Winner: **${winner}**
`
                )
        ],
        components: []
    });
}

module.exports = duelMode;