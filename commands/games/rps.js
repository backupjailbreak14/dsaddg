const { 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require("discord.js");

module.exports = {
  name: "rps",
  category: "fun",
  description: "Challenge another user to a Rock Paper Scissors match.",
  usage: "rps @user",
  permissions: [],

  run: async (client, message, args) => {

      const opponent = message.mentions.users.first();
      if (!opponent) {
          return message.reply("You must mention a user to challenge.");
      }

      if (opponent.id === message.author.id) {
          return message.reply("You cannot play against yourself.");
      }

      // Create accept/deny buttons
      const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
              .setCustomId("rps_accept")
              .setLabel("Accept")
              .setStyle(ButtonStyle.Success),

          new ButtonBuilder()
              .setCustomId("rps_decline")
              .setLabel("Decline")
              .setStyle(ButtonStyle.Danger),
      );

      const embed = new EmbedBuilder()
          .setTitle("🪨 Rock Paper Scissors ✂️")
          .setDescription(
              `${opponent}, you have been challenged by **${message.author.username}**!\n\n` +
              `Click **Accept** or **Decline**.`
          )
          .setColor("Blue");

      const gameMessage = await message.channel.send({
          embeds: [embed],
          components: [row]
      });

      // Prepare game storage
      if (!client.rpsGames) client.rpsGames = new Map();

      client.rpsGames.set(gameMessage.id, {
          challenger: message.author.id,
          opponent: opponent.id,
          choices: {},    // { userId: "rock" }
          stage: "pending"
      });
  }
};
