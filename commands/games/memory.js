const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const memoryGames =
  require("../../games/memoryGames");

module.exports = {

  data:
      new SlashCommandBuilder()

          .setName("memory")

          .setDescription(
              "Start a memory match game"
          )

          .addUserOption(option =>

              option

                  .setName("opponent")

                  .setDescription(
                      "Player to challenge"
                  )

                  .setRequired(true)

          ),

  async run(client, interaction) {

      const opponent =
          interaction.options.getUser(
              "opponent"
          );

      if (
          opponent.bot ||
          opponent.id === interaction.user.id
      ) {

          return interaction.reply({

              content:
                  "❌ Invalid opponent.",

              ephemeral: true

          });

      }

      const existingGame =
          [...memoryGames.values()]
              .find(game =>

                  game.player1 === interaction.user.id ||
                  game.player2 === interaction.user.id ||
                  game.player1 === opponent.id ||
                  game.player2 === opponent.id

              );

      if (existingGame) {

          return interaction.reply({

              content:
                  "❌ One of these players is already in a game.",

              ephemeral: true

          });

      }

      const guildEmojis =
          interaction.guild.emojis.cache
              .filter(e => e.available)
              .map(e => e);

      if (
          guildEmojis.length < 12
      ) {

          return interaction.reply({

              content:
                  "❌ The server must have at least 12 custom emojis.",

              ephemeral: true

          });

      }

      const selected =
          guildEmojis
              .sort(() => Math.random() - 0.5)
              .slice(0, 12);

      let cards = [];

      selected.forEach(emoji => {

          cards.push(emoji);
          cards.push(emoji);

      });

      cards =
          cards.sort(
              () => Math.random() - 0.5
          );

      const gameId =
          interaction.id;

      const game = {

          player1:
              interaction.user.id,

          player2:
              opponent.id,

          turn:
              interaction.user.id,

          board:
              cards,

          matched:
              [],

          revealed:
              [],

          scores: {

              [interaction.user.id]: 0,

              [opponent.id]: 0

          }

      };

      memoryGames.set(
          gameId,
          game
      );

      const createEmbed = () => {

          return new EmbedBuilder()

              .setTitle(
                  "🎮 Memory Match"
              )

              .setColor(
                  "#D4AF37"
              )

              .setDescription(

`👤 <@${game.player1}> — ${game.scores[game.player1]} points
👤 <@${game.player2}> — ${game.scores[game.player2]} points

🎯 Current Turn:
<@${game.turn}>

🏆 Matches Found:
${game.matched.length / 2}/12`

              );

      };

      const createBoard = () => {

          const rows = [];

          for (
              let row = 0;
              row < 5;
              row++
          ) {

              const actionRow =
                  new ActionRowBuilder();

              const start =
                  row * 5;

              const end =
                  Math.min(
                      start + 5,
                      24
                  );

              for (
                  let i = start;
                  i < end;
                  i++
              ) {

                  const button =
                      new ButtonBuilder()

                          .setCustomId(
                              `memory_${i}`
                          )

                          .setStyle(
                              ButtonStyle.Secondary
                          );

                  if (
                      game.matched.includes(i) ||
                      game.revealed.includes(i)
                  ) {

                      button
                          .setEmoji(
                              game.board[i].id
                          )
                          .setDisabled(true);

                  }
                  else {

                      button
                          .setLabel("?");

                  }

                  actionRow.addComponents(
                      button
                  );

              }

              rows.push(
                  actionRow
              );

          }

          return rows;

      };

      await interaction.reply({

          content:
              `${opponent}, Memory Match has started!`,

          embeds: [
              createEmbed()
          ],

          components:
              createBoard()

      });

      const message =
          await interaction.fetchReply();

      const collector =
          message.createMessageComponentCollector({

              time:
                  1000 * 60 * 15

          });

      collector.on(
          "collect",
          async i => {

              if (
                  i.user.id !== game.turn
              ) {

                  return i.reply({

                      content:
                          "❌ It is not your turn.",

                      ephemeral: true

                  });

              }

              const index =
                  parseInt(
                      i.customId.replace(
                          "memory_",
                          ""
                      )
                  );

              if (
                  game.revealed.includes(index) ||
                  game.matched.includes(index)
              ) {

                  return i.deferUpdate();

              }

              game.revealed.push(
                  index
              );

              if (
                  game.revealed.length % 2 === 1
              ) {

                  await i.update({

                      embeds: [
                          createEmbed()
                      ],

                      components:
                          createBoard()

                  });

                  return;

              }

              await i.update({

                  embeds: [
                      createEmbed()
                  ],

                  components:
                      createBoard()

              });

              const first =
                  game.revealed[
                      game.revealed.length - 2
                  ];

              const second =
                  game.revealed[
                      game.revealed.length - 1
                  ];

              const firstCard =
                  game.board[first];

              const secondCard =
                  game.board[second];

              if (
                  firstCard.id === secondCard.id
              ) {

                  game.matched.push(
                      first,
                      second
                  );

                  game.scores[
                      game.turn
                  ]++;

              }
              else {

                  await new Promise(resolve =>
                      setTimeout(
                          resolve,
                          1500
                      )
                  );

                  game.revealed =
                      game.revealed.filter(pos =>

                          pos !== first &&
                          pos !== second

                      );

                  game.turn =
                      game.turn === game.player1
                          ? game.player2
                          : game.player1;

              }

              if (
                  game.matched.length === 24
              ) {

                  collector.stop();

                  const score1 =
                      game.scores[
                          game.player1
                      ];

                  const score2 =
                      game.scores[
                          game.player2
                      ];

                  let winner;

                  if (score1 > score2) {

                      winner =
                          `<@${game.player1}>`;

                  }
                  else if (
                      score2 > score1
                  ) {

                      winner =
                          `<@${game.player2}>`;

                  }
                  else {

                      winner =
                          "🤝 Draw";

                  }

                  const endEmbed =
                      new EmbedBuilder()

                          .setTitle(
                              "🏆 Memory Match Finished"
                          )

                          .setColor(
                              "#00FF00"
                          )

                          .setDescription(

`👤 <@${game.player1}> — ${score1} points
👤 <@${game.player2}> — ${score2} points

Winner:
${winner}`

                          );

                  await message.edit({

                      embeds: [
                          endEmbed
                      ],

                      components: []

                  });

                  memoryGames.delete(
                      gameId
                  );

                  return;

              }

              await message.edit({

                  embeds: [
                      createEmbed()
                  ],

                  components:
                      createBoard()

              });

          }

      );

      collector.on(
          "end",
          async () => {

              memoryGames.delete(
                  gameId
              );

          }

      );

  }

};