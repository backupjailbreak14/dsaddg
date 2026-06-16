const { EmbedBuilder } = require("discord.js");
const Suggestion = require("../../models/Suggestion");
const SuggestConfig = require("../../models/SuggestionConfig");

module.exports = {
  name: "suggest",
  category: "suggestion",

  run: async (client, message, args) => {
    const text = args.join(" ");
    if (!text) return message.restSend("❌ Please provide a suggestion.");

    const guildId = message.guild.id;

    const config = await SuggestConfig.findOne({ guildId });
    if (!config) {
      return message.restSend("❌ No suggestion channel set. Use `setsuggest` first.");
    }

    const channel = message.guild.channels.cache.get(config.channelId);
    if (!channel) return message.restSend("❌ Suggestion channel not found.");

    const suggestion = new Suggestion({
      guildId,
      id: Date.now().toString(),
      author: message.author.id,
      text,
      status: "pending"
    });

    await suggestion.save();

    const embed = new EmbedBuilder()
      .setColor("#00bfff")
      .setTitle("📨 New Suggestion")
      .setDescription(text)
      .addFields({ name: "Author", value: `<@${message.author.id}>` })
      .setFooter({ text: `ID: ${suggestion.id}` });

    await channel.send({ embeds: [embed] });

    return message.restSend("✅ Your suggestion has been sent!");
  }
};