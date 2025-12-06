const { EmbedBuilder } = require("discord.js");
const storage = require("../../utils/suggestions");

module.exports = {
    name: "suggest",
    category: "suggestion",
    usage: "suggest <your idea>",

    run: async (client, message, args) => {
        const text = args.join(" ");
        if (!text) {
            return message.restSend("❌ Please provide a suggestion.");
        }

        const guildId = message.guild.id;
        const channelId = storage.getSuggestionChannel(guildId);

        if (!channelId) {
            return message.restSend(
                "❌ No suggestion channel set. Use `setsuggest` first."
            );
        }

        const channel = message.guild.channels.cache.get(channelId);
        if (!channel) {
            return message.restSend("❌ Suggestion channel not found.");
        }

        const suggestObj = {
            id: Date.now().toString(),
            author: message.author.id,
            text: text,
            status: "pending"
        };

        storage.addSuggestion(guildId, suggestObj);

        const embed = new EmbedBuilder()
            .setColor("#00bfff")
            .setTitle("📨 New Suggestion")
            .setDescription(text)
            .addFields({ name: "Author", value: `<@${message.author.id}>` })
            .setFooter({ text: `ID: ${suggestObj.id}` });

        await channel.send({ embeds: [embed] });

        return message.restSend("✅ Your suggestion has been sent!");
    }
};
