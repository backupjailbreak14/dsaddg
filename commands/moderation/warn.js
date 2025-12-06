const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "warn",
    category: "moderation",

    run: async (client, message, args) => {
        // Permission check
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const errEmbed = new EmbedBuilder()
                .setTitle("❌ Permission Error")
                .setDescription("You don't have permission to use this command.")
                .setColor("Red");

            return message.channel.send({ embeds: [errEmbed] });
        }

        // Target user
        const member =
            message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]);

        if (!member) {
            return message.reply("❌ Please mention a valid member.");
        }

        // Reason
        const reason = args.slice(1).join(" ") || "(No reason provided)";

        // DM the user
        try {
            await member.send(
                `⚠️ You have been **warned** in **${message.guild.name}** by **${message.author.tag}**.\n**Reason:** ${reason}`
            );
        } catch (err) {
            message.channel.send(`⚠️ Couldn't DM the user: ${err.message}`);
        }

        // Create embed report
        const embed = new EmbedBuilder()
            .setTitle("⚠️ User Warned")
            .setColor("#ffcc00")
            .addFields(
                {
                    name: "User",
                    value: `<@${member.id}>`,
                    inline: true
                },
                {
                    name: "Moderator",
                    value: `${message.author}`,
                    inline: true
                },
                {
                    name: "Reason",
                    value: `\`${reason}\``
                },
                {
                    name: "Action",
                    value: "`Warn`"
                }
            )
            .setTimestamp();

        // Send confirmation
        return message.channel.send({ embeds: [embed] });
    }
};
