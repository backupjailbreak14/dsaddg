const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { OWNER_ID } = require("../../config");

const blacklistPath = path.join(__dirname, "../../data/blacklist.json");

// ---------- helpers ----------
function readBlacklist() {
  if (!fs.existsSync(blacklistPath)) return {};
  return JSON.parse(fs.readFileSync(blacklistPath, "utf8"));
}

function writeBlacklist(data) {
  fs.writeFileSync(blacklistPath, JSON.stringify(data, null, 2));
}

function resolveUser(message, arg) {
  if (!arg) return null;
  return (
    message.mentions.users.first() ||
    message.client.users.cache.get(arg)
  );
}

// ---------- command ----------
module.exports = {
  name: "unblacklist",
  category: "owner",

  run: async (client, message, args) => {
    if (message.author.id !== OWNER_ID) return;

    const user = resolveUser(message, args[0]);
    if (!user) {
      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("⚠️ Invalid usage")
        .setDescription("**Usage:** `.unblacklist @user` or `.unblacklist userID`");

      return message.channel.send({ embeds: [embed] });
    }

    const blacklist = readBlacklist();

    if (!blacklist[user.id]) {
      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("⚠️ Not blacklisted")
        .setDescription(`${user.tag} is not blacklisted.`);

      return message.channel.send({ embeds: [embed] });
    }

    delete blacklist[user.id];
    writeBlacklist(blacklist);

    // Auto DM
    try {
      await user.send("✅ **You have been unblacklisted and can use the bot again.**");
    } catch {}

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
