const { EmbedBuilder } = require("discord.js");
const db = require("../../utils/database");
const { OWNER_ID } = require("../../config");

module.exports = {
  name: "unblacklist",
  category: "owner",

  async run(client, message, args) {
    if (message.author.id !== OWNER_ID) return;

    const user =
      message.mentions.users.first() ||
      await client.users.fetch(args[0]).catch(() => null);

    if (!user) {
      return message.reply("⚠️ Usage: `.unblacklist @user|id`");
    }

    const row = db
      .prepare("SELECT * FROM blacklist WHERE user_id = ?")
      .get(user.id);

    if (!row) {
      return message.reply("⚠️ This user is not blacklisted.");
    }

    db.prepare("DELETE FROM blacklist WHERE user_id = ?").run(user.id);

    try {
      await user.send("✅ You have been unblacklisted.");
    } catch {}

    message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setTitle("✅ User Unblacklisted")
          .addFields(
            { name: "User", value: user.tag, inline: true },
            { name: "ID", value: user.id, inline: true }
          )
      ]
    });
  }
};
