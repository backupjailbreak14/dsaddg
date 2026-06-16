const { EmbedBuilder } = require("discord.js");
const Blacklist = require("../../models/Blacklist");
const { OWNER_ID } = require("../../config");

function resolveUser(client, message, arg) {
    return (
        message.mentions.users.first() ||
        client.users.cache.get(arg) ||
        null
    );
}

module.exports = {
    name: "unblacklist",
    category: "owner",

    async run(client, message, args) {
        if (message.author.id !== OWNER_ID) return;

        if (!args.length) {
            return message.reply("⚠️ Usage: .unblacklist @user");
        }

        let target = resolveUser(client, message, args[0]);

        const userId = target ? target.id : args[0];

        const entry = await Blacklist.findOne({ userId });

        if (!entry) {
            return message.reply("⚠️ User is not blacklisted.");
        }

        await Blacklist.deleteOne({ userId });

        // DM
        if (target) {
            try {
                await target.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Green")
                            .setTitle("✅ Unblacklisted")
                            .setDescription("You can use the bot again.")
                    ]
                });
            } catch {}
        }

        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("✅ Unblacklisted")
                    .addFields(
                        { name: "User", value: `<@${userId}>`, inline: true },
                        { name: "ID", value: userId, inline: true }
                    )
            ]
        });
    }
};