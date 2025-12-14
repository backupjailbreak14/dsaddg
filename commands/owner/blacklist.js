const { EmbedBuilder } = require("discord.js");
const db = require("../../utils/database");
const { OWNER_ID } = require("../../config");

module.exports = {
  name: "blacklist",
  category: "owner",

  async run(client, message, args) {
    if (message.author.id !== OWNER_ID) return;

    // .blacklist list
    if (args[0] === "list") {
      const rows = db
        .prepare("SELECT * FROM blacklist")
        .all();

      if (!rows.length) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setDescription("✅ **The blacklist is currently empty.**")
          ]
        });
      }

      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("⛔ Blacklisted Users")
        .setDescription(
          rows.map(
            (r, i) =>
              `**${i + 1}.** <@${r.user_id}>\n📝 *${r.reason}*`
          ).join("\n\n")
        )
        .setFooter({ text: `Total: ${rows.length}` })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    // mention of ID
    const user =
      message.mentions.users.first() ||
      await client.users.fetch(args[0]).catch(() => null);

    if (!user) {
      return message.reply("⚠️ Usage: `.blacklist @user|id <reason>`");
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    db.prepare(`
      INSERT OR REPLACE INTO blacklist
      (user_id, reason, added_by, created_at)
      VALUES (?, ?, ?, ?)
    `).run(user.id, reason, message.author.id, Date.now());

    // DM
    try {
      await user.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("⛔ You have been blacklisted")
            .addFields({ name: "Reason", value: reason })
        ]
      });
    } catch {}

    message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setTitle("⛔ User Blacklisted")
          .addFields(
            { name: "User", value: user.tag, inline: true },
            { name: "ID", value: user.id, inline: true },
            { name: "Reason", value: reason }
          )
      ]
    });
  }
};
