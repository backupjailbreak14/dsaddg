const { EmbedBuilder } = require("discord.js");
const QuizStats = require("../models/QuizStats");

// ========================
// SOLO END FIXED
// ========================
async function endSolo(interaction, stats, score, streak, wrong) {

    stats.gamesPlayed += 1;

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
`⭐ Score: ${score}
🔥 Streak: ${streak}
❌ Wrong: ${wrong}`
                )
        ],
        components: []
    });
}

// ========================
// DUEL END FIXED (IMPORTANT)
// ========================
async function endDuel(interaction, players, scores) {

    const p1 = players[0];
    const p2 = players[1];

    const p1Score = scores[p1.id];
    const p2Score = scores[p2.id];

    const winnerId =
        p1Score > p2Score ? p1.id :
        p2Score > p1Score ? p2.id :
        null;

    const winnerName =
        winnerId ? players.find(p => p.id === winnerId).username : "Draw";

    const p1Stats = await QuizStats.findOne({ userId: p1.id });
    const p2Stats = await QuizStats.findOne({ userId: p2.id });

    if (p1Stats) {
        p1Stats.gamesPlayed += 1;
        p1Stats.totalPoints += p1Score;

        if (winnerId === p1.id) p1Stats.wins++;
        else if (winnerId) p1Stats.losses++;

        await p1Stats.save();
    }

    if (p2Stats) {
        p2Stats.gamesPlayed += 1;
        p2Stats.totalPoints += p2Score;

        if (winnerId === p2.id) p2Stats.wins++;
        else if (winnerId) p2Stats.losses++;

        await p2Stats.save();
    }

    await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setTitle("🏆 Duel Finished")
                .setColor("Green")
                .setDescription(
`📊 ${p1.username}: ${p1Score}
📊 ${p2.username}: ${p2Score}

🏆 Winner: **${winnerName}**`
                )
        ],
        components: []
    });
}

module.exports = {
    endSolo,
    endDuel
};