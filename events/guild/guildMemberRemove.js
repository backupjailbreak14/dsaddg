const {
  EmbedBuilder
} = require("discord.js");

const Gulag =
  require("../../models/Gulag");
const FOOTER_ICON =
    "https://cdn.discordapp.com/attachments/853304828386344970/1004445845405577347/USSRRound-1.png";
const LOG_CHANNEL =
  "1494009494152155207";

module.exports = async (client, member) => {

  try {

      const gulagData =
          await Gulag.findOne({
              userId: member.id
          });

      if (!gulagData) {
          return;
      }

      const channel =
          member.guild.channels.cache.get(
              LOG_CHANNEL
          );

      if (!channel) {
          return;
      }

      const embed =
          new EmbedBuilder()

              .setColor("#8B0000")

              .setTitle("🚨 Gulag Escape Attempt")

              .setDescription(
                  `**${member.user.tag}** left the server while in the Gulag.`
              )

              .addFields(
                  {
                      name: "User",
                      value: `<@${member.id}>`
                  },
                  {
                      name: "User ID",
                      value: member.id
                  }
              )

              .setFooter({ text: "Gulag Management", iconURL: FOOTER_ICON })
              .setTimestamp();

      await channel.send({
          embeds: [embed]
      });

  } catch (err) {

      console.error(
          "Gulag leave log error:",
          err
      );

  }

};