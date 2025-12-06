const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "8ball",
    category: "extra",
    description: "Answers your question with an 8ball reply.",
    usage: "8ball <question>",

    run: async (client, message, args) => {

        if (args.length === 0) {
            return message.restSend({
                content: "❌ Usage: `.8ball <question>`"
            });
        }

        const responses = [
            // Images (Yes)
            "https://cdn.discordapp.com/attachments/872042171631562803/872056581951483945/yes.png",
            "https://cdn.discordapp.com/attachments/872042171631562803/872056518571331625/isCertain.png",
            "https://cdn.discordapp.com/attachments/872042171631562803/872056508639232010/decidedlySo.png",
            "https://cdn.discordapp.com/attachments/872042171631562803/872056575215415336/withoutDoubt.png",
            "https://cdn.discordapp.com/attachments/872042171631562803/872056490125565952/yesDefinitely.png",

            // Text
            "You may rely on it.",

            // Images (Likely)
            "https://cdn.discordapp.com/attachments/872042171631562803/872056555225366558/seeYes.png",
            "https://cdn.discordapp.com/attachments/872042171631562803/872056520299413504/mostLikely.png",
            "https://cdn.discordapp.com/attachments/872042171631562803/872056527614259220/outlookGood.png",
            "https://cdn.discordapp.com/attachments/872042171631562803/872056560157880320/signsYes.png",

            // Neutral
            "https://cdn.discordapp.com/attachments/872042171631562803/872056543661654086/replyHazy.png",
            "https://cdn.discordapp.com/attachments/872042171631562803/872056492398886942/askLater.png",
            "https://cdn.discordapp.com/attachments/872042171631562803/872056495246831616/betterLater.png",
            "https://cdn.discordapp.com/attachments/872042171631562803/872056536711696404/predictLater.png",
            "https://cdn.discordapp.com/attachments/872042171631562803/872056504369446972/concentrateLater.png",

            // No
            "https://cdn.discordapp.com/attachments/872042171631562803/872056506751795230/countNo.png",
            "https://cdn.discordapp.com/attachments/872042171631562803/872056550229946378/replyNo.png",
            "https://cdn.discordapp.com/attachments/872042171631562803/872056565052604456/sourcesNo.png",
            "https://cdn.discordapp.com/attachments/872042171631562803/872056521889050674/outlookBad.png",
            "https://cdn.discordapp.com/attachments/872042171631562803/872056569964146698/veryDoubtful.png",
        ];

        const result = responses[Math.floor(Math.random() * responses.length)];

        const question = args.join(" ");

        const embed = new EmbedBuilder()
            .setTitle("🎱 8ball Result")
            .addFields(
                { name: "❓ Question", value: question },
                { name: "🎯 Answer", value: typeof result === "string" && !result.startsWith("http") ? result : "See image below:" }
            )
            .setColor("#2b2d31");

        // If result is an image link → attach it
        if (result.startsWith("https://")) {
            embed.setImage(result);
        }

        return message.restSend({ embeds: [embed] });
    }
};
