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

// 🔧 resolve @mention OF userID
function resolveUser(client, message, arg) {
  return (
    message.mentions.users.first() ||
    client.users.cache.get(arg)
  );
}

module.exports = {
  name: "blacklist",
  category: "owner",

  async run(client, message, args) {
    if (message.author.id !== OWNER_ID) return;

    const blacklist = readBlacklist();

    // ======================
    // USAGE EMBED (ONVERANDERD)
    // ======================
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor("#8b0000")
        .setAuthor({
          name: "USSR Blacklist",
          iconURL: client.user.displayAvatarURL()
        })
        .setDescription(
          "**Usage:**\n" +
          "```\n.blacklist @user <reason>\n.blacklist list\n```"
        )
        .setFooter({ text: "Blacklist management" })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    // ======================
    // .blacklist list
    // ======================
    if (args[0] === "list") {
      const entries = Object.entries(blacklist);

      if (!entries.length) {
        const embed = new EmbedBuilder()
          .setColor("Green")
          .setDescription("✅ **The blacklist is currently empty.**")
          .setTimestamp();

        return message.reply({ embeds: [embed] });
      }

      const description = entries
        .map(
          ([id, reason], i) =>
            `**${i + 1}.** <@${id}>\n📝 *${reason}*`
        )
        .join("\n\n");

      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("⛔ Blacklisted Users")
        .setDescription(description)
        .setFooter({ text: `Total blacklisted: ${entries.length}` })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    // ======================
    // .blacklist @user | userID reason
    // ======================
    const target = resolveUser(client, message, args[0]);

    if (!target) {
      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setDescription(
          "⚠️ **Invalid usage**\n```\n.blacklist @user <reason>\n```"
        );

      return message.reply({ embeds: [embed] });
    }

    const reason = args.slice(1).join(" ") || "No reason provided";
    blacklist[target.id] = reason;
    writeBlacklist(blacklist);

    // ======================
    // AUTO DM (EMBED)
    // ======================
    try {
      const dmEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("⛔ You have been blacklisted")
        .setDescription("You are no longer allowed to use the bot.")
        .addFields({ name: "Reason", value: reason })
        .setTimestamp();

      await target.send({ embeds: [dmEmbed] });
    } catch {
      // DM closed → ignore
    }

    // ======================
    // CONFIRM EMBED (ONVERANDERD)
    // ======================
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("⛔ User Blacklisted")
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "User", value: target.tag ?? `<@${target.id}>`, inline: true },
        { name: "ID", value: target.id, inline: true },
        { name: "Reason", value: reason }
      )
      .setFooter({ text: `Blacklisted by ${message.author.tag}` })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
