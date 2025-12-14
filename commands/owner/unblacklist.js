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

module.exports = {
  name: "unblacklist",
  category: "owner",

  async run(client, message) {
    if (message.author.id !== OWNER_ID) return;

    const user = message.mentions.users.first();
    if (!user) {
      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setDescription(
          "⚠️ **Usage:**\n```\n.unblacklist @user\n```"
        );

      return message.reply({ embeds: [embed] });
    }

    const blacklist = readBlacklist();

    if (!blacklist[user.id]) {
      const embed = new EmbedBuilder()
        .setColor("Yellow")
        .setDescription("⚠️ **This user is not blacklisted.**");

      return message.reply({ embeds: [embed] });
    }

    delete blacklist[user.id];
    writeBlacklist(blacklist);

    // ======================
    // AUTO DM
    // ======================
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

    // ======================
    // CONFIRM EMBED
    // ======================
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("✅ User Unblacklisted")
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "User", value: user.tag, inline: true },
        { name: "ID", value: user.id, inline: true }
      )
      .setFooter({ text: `Unblacklisted by ${message.author.tag}` })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
