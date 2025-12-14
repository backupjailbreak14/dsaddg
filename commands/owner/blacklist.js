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
  name: "blacklist",
  category: "owner",

  run: async (client, message, args) => {
    if (message.author.id !== OWNER_ID) return;

    const blacklist = readBlacklist();

    // ----------------------
    // .blacklist list
    // ----------------------
    if (args[0] === "list") {
      const entries = Object.entries(blacklist);

      if (entries.length === 0) {
        const embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("✅ Blacklist")
          .setDescription("Blacklist is empty.")
          .setTimestamp();

        return message.channel.send({ embeds: [embed] });
      }

      const desc = entries
        .map(
          ([id, reason], i) =>
            `**${i + 1}.** <@${id}> (\`${id}\`)\n📝 ${reason}`
        )
        .join("\n\n");

      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("⛔ Blacklisted Users")
        .setDescription(desc)
        .setFooter({ text: `Total: ${entries.length}` })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    // ----------------------
    // .blacklist <user|id> <reason>
    // ----------------------
    const user = resolveUser(message, args[0]);

    if (!user) {
      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("⚠️ Invalid usage")
        .setDescription(
          "**Usage:**\n" +
          "`.blacklist @user <reason>`\n" +
          "`.blacklist userID <reason>`\n" +
          "`.blacklist list`"
        );

      return message.channel.send({ embeds: [embed] });
    }

    const reason = args.slice(1).join(" ") || "No reason provided";
    blacklist[user.id] = reason;
    writeBlacklist(blacklist);

    // Auto DM
    try {
      await user.send(
        `⛔ **You have been blacklisted from using the bot.**\n\n**Reason:** ${reason}`
      );
    } catch {}

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("⛔ User Blacklisted")
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "User", value: `${user.tag}`, inline: true },
        { name: "ID", value: user.id, inline: true },
        { name: "Reason", value: reason }
      )
      .setFooter({ text: `Blacklisted by ${message.author.tag}` })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
