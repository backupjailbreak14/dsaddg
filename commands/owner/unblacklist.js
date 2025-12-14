const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { OWNER_ID } = require("../config");

const blacklistPath = path.join(__dirname, "../data/blacklist.json");

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

  run: async (client, message) => {
    if (message.author.id !== OWNER_ID) return;

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply("Usage: `.unblacklist @user`");
    }

    const blacklist = readBlacklist();

    if (!blacklist[user.id]) {
      return message.reply("⚠️ This user is not blacklisted.");
    }

    delete blacklist[user.id];
    writeBlacklist(blacklist);

    // Auto DM
    try {
      await user.send("✅ **You have been unblacklisted and can use the bot again.**");
    } catch {
      // DM closed, ignore
    }

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
