const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const QuizStats = require("../../models/QuizStats");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("leaderboard")
      .setDescription("Show top Soviet Quiz players"),

  async run(client, interaction) {

      const top = await QuizStats.find()
          .sort({ totalPoints: -1 })
          .limit(10);

      const embed = new EmbedBuilder()
          .setTitle("🏆 Quiz Leaderboard")
          .setColor("#D4AF37");

      let desc = "";

      top.forEach((user, i) => {

          const wins = user.wins || 0;
          const losses = user.losses || 0;
          const points = user.totalPoints || 0;

          const total = wins + losses;

          const winrate = total === 0
              ? 0
              : ((wins / total) * 100).toFixed(1);

          desc +=
`${i + 1}. **${user.username}**
⭐ Points: ${points}
🏆 Wins: ${wins}
📊 Winrate: ${winrate}%

`;
      });

      embed.setDescription(desc || "No data yet.");

      await interaction.reply({ embeds: [embed] });
  }
};