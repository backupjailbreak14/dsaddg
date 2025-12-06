require("dotenv").config();

module.exports = {
    name: "ssu",
    category: "extra",
    description: "Announces a server startup.",
    usage: "ssu",
    permissions: ["MANAGE_MESSAGES"],
    timeout: 1800000, // 30 minutes (GLOBAL cooldown!)

    run: async (client, message) => {
        const channelID = process.env.eventchannel;

        if (!channelID) {
            return message.restSend({ content: "❌ No `eventchannel` set." });
        }

        const eventChannel = message.guild.channels.cache.get(channelID);
        if (!eventChannel) {
            return message.restSend({ content: "❌ Event channel not found in this server." });
        }

        const text =
            "||@here||\n" +
            `There is a server startup at Moscow being hosted by <@${message.author.id}>.\n` +
            `Come on down to take over the border or defend it!\n` +
            `https://www.roblox.com/games/14971567467/City-of-Moscow`;

        try {
            await eventChannel.send(text);

            // Delete the user's command message
            message.delete().catch(() => {});

        } catch (err) {
            console.error("SSU send error:", err);
            return message.restSend({ content: "❌ Failed to send SSU message." });
        }
    }
};
