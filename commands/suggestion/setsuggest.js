const { ChannelType } = require("discord.js");
const storage = require("../../utils/suggestions");

module.exports = {
    name: "setsuggest",
    category: "suggestion",
    usage: "setsuggest <#channel>",
    permissions: ["MANAGE_GUILD"],

    run: async (client, message, args) => {
        const channel = message.mentions.channels.first();

        if (!channel) {
            return message.restSend("❌ Please mention a text channel.");
        }

        if (channel.type !== ChannelType.GuildText) {
            return message.restSend("❌ Must be a text channel.");
        }

        storage.setSuggestionChannel(message.guild.id, channel.id);

        return message.restSend(
            `✅ Suggestion channel set to <#${channel.id}>`
        );
    }
};
