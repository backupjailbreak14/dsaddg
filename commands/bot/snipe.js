const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "snipe",
    category: "bot",
    description: "Shows the latest deleted message from this channel.",

    run: async (client, message, args) => {

        const msg = client.snipes.get(message.channel.id);

        if (!msg) {
            return message.channel.send("❌ Could not find any recently deleted message.");
        }

        const embed = new EmbedBuilder()
            .setTitle("🕵️ Sniped Deleted Message")
            .addFields(
                { name: "📍 Channel", value: `<#${message.channel.id}>`, inline: true },
                { name: "👤 Author", value: `<@${msg.author}>`, inline: true },
                { 
                    name: "💬 Content", 
                    value: msg.content ? `\`\`\`\n${msg.content}\`\`\`` : "*No text content*", 
                    inline: false 
                }
            )
            .setColor("Random")
            .setTimestamp()
            .setFooter({
                text: `Requested by ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL()
            });

        // If the deleted message had an image
        if (msg.image) embed.setImage(msg.image.url ?? msg.image);

        return message.channel.send({ embeds: [embed] });
    }
};
