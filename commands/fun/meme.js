const { EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    name: "meme",
    category: "fun",
    description: "Sends a random meme from Reddit",
    usage: "meme",

    run: async (client, message, args) => {
        try {
            // Fetch a random meme
            const response = await fetch("https://meme-api.com/gimme");
            const data = await response.json();

            if (!data || !data.url) {
                return message.restSend("❌ Could not fetch a meme right now. Try again later.");
            }

            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle(`From r/${data.subreddit}`)
                .setURL(data.postLink)
                .setImage(data.url)
                .setFooter({ text: "Powered by meme-api.com" });

            return message.restSend({ embeds: [embed] });

        } catch (err) {
            console.error("Meme API error:", err);
            return message.restSend("❌ Failed to fetch meme.");
        }
    }
};
