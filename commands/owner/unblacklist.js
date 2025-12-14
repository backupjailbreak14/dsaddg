const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { OWNER_ID } = require("../../config");

const blacklistPath = path.join(__dirname, "../../data/blacklist.json");

function readBlacklist() {
  if (!fs.existsSync(blacklistPath)) return {};
  return JSON.parse(fs.readFileSync(blacklistPath, "utf8"));
}

function writeBlacklist(data) {
  fs.writeFileSync(blacklistPath, JSON.stringify(data, null, 2));
}

function resolveUser(client, message, arg) {
  return (
    message.mentions.users.first() ||
    client.users.cache.get(arg) ||
    null
  );
}

module.exports = {
  name: "unblacklist",
  category: "owner",

  async run(client, message, args) {
    if (message.author.id !== OWNER_ID) return;

    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setDescription(
          "⚠️ **Usage:**\n```\n.unblacklist @user\n.unblacklist <userID>\n```"
        );

      return message.reply({ embeds: [embed] });
    }

    const user = resolveUser(client, message, args[0]);
    const userId = user ? user.id : args[0];

    const blacklist = readBlacklist();

    if (!blacklist[userId]) {
      const embed = new EmbedBuilder()
        .setColor("Yellow")
        .setDescription("⚠️ **This user is not blacklisted.**");

      return message.reply({ embeds: [embed] });
    }

    delete blacklist[userId];
    writeBlacklist(blacklist);

    // ======================
    // AUTO DM
    // ======================
    if (user) {
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("✅ You have been unblacklisted")
          .setDescription("You can now use the bot again.")
          .setTimestamp();

        await user.send({ embeds: [dmEmbed] });
      } catch {
        // DM closed → ignore
      }
    }

    // ======================
    // CONFIRM EMBED
    // ======================
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("✅ User Unblacklisted")
      .setThumbnail(
        user?.displayAvatarURL({ dynamic: true }) || null
      )
      .addFields(
        {
          name: "User",
          value: user ? user.tag : `Unknown user (${userId})`,
          inline: true
        },
        {
          name: "ID",
          value: userId,
          inline: true
        }
      )
      .setFooter({ text: `Unblacklisted by ${message.author.tag}` })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
