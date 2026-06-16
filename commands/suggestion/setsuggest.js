const { ChannelType } = require("discord.js");
const SuggestConfig = require("../../models/SuggestionConfig");

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

        await SuggestConfig.findOneAndUpdate(
            { guildId: message.guild.id },
            { channelId: channel.id },
            { upsert: true, new: true }
        );

        return message.restSend(
            `✅ Suggestion channel set to <#${channel.id}>`
        );
    }
};