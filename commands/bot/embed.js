const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "embed",
    category: "bot",
    description: "Creates a custom embed.",
    usage: "embed <title> | <description> | <color> | <image URL>",
    permissions: ["MANAGE_MESSAGES"],

    run: async (client, message, args) => {
        const input = args.join(" ");

        if (!input) {
            return message.restSend({
                content: "❌ Please provide at least a title.\nFormat: `title | description | color | image`"
            });
        }

        const parts = input.split("|").map(p => p.trim());

        const title = parts[0] || "Untitled";
        let desc = parts[1];
        const color = parts[2] || "#00FFFF";
        const image = parts[3] || null;

        // Discord.js does NOT allow empty descriptions ("")
        if (!desc || desc.length < 1) {
            desc = " "; // a single space = valid
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(desc)
            .setFooter({ text: "Embed created by " + message.author.tag });

        // Validate image URL
        if (image && image.startsWith("http")) {
            embed.setImage(image);
        }

        try {
            await message.restSend({ embeds: [embed] });
        } catch (err) {
            console.error("Embed Error:", err);

            let errorMsg = "❌ Failed to send embed.";

            // Sapphire validation error: invalid color
            if (String(err).includes("color")) {
                errorMsg = "❌ Invalid color provided. Use HEX like `#FF0000` or color names.";
            }

            return message.restSend({ content: errorMsg });
        }
    }
};
