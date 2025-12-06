const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "announce",
    aliases: ["announcement"],
    category: "moderation",
    description: "Send an announcement to a chosen channel.",
    usage: "announce #channel <message>",

    run: async (client, message, args) => {

        // Delete the user's command message
        message.delete().catch(() => {});

        // Permission check
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.channel.send("❌ Insufficient permissions.").then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 4000);
            });
        }

        // Detect channel
        const channel = message.mentions.channels.first();
        if (!channel) {
            return message.channel.send("❌ Usage: `announce #channel <text>`")
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 4000));
        }

        // Extract announcement text
        const announce = args.slice(1).join(" ");
        if (!announce) {
            return message.channel.send("❌ Please specify what you want to announce.")
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 4000));
        }

        // Create embed
        const embed = new EmbedBuilder()
            .setTitle("<:ussr:1325477652240531538> Announcement <:ussr:1325477652240531538>")
            .setDescription(announce)
            .setColor("Random")
                .setThumbnail("https://media.discordapp.net/attachments/853304828386344970/1004445845405577347/USSRRound-1.png?ex=6935be17&is=69346c97&hm=b7b8452e669bc94610fbe4b0d88089aaad294428e8f280bfbbc04a654662478f&=&format=webp&quality=lossless")
            .setFooter({
                text: `Soviet Union Administration`,
                iconURL: "https://cdn.discordapp.com/attachments/853304828386344970/1004445845405577347/USSRRound-1.png?ex=69351557&is=6933c3d7&hm=e517308a274fcccf5ee054cceb572b34352729880e3f733679334ad212155f69&"
            })
            .setTimestamp();

        // Send announcement
        await channel.send({ embeds: [embed] });

        // Send ping + delete
        channel.send("<@851474853855756318>")
            .then(m => setTimeout(() => m.delete().catch(() => {}), 1000));

    }
};
