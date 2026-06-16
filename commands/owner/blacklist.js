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
    name: "blacklist",
    category: "owner",

    async run(client, message, args) {
        if (message.author.id !== OWNER_ID) return;

        if (!args.length) {
            const embed = new EmbedBuilder()
                .setColor("#8b0000")
                .setAuthor({
                    name: "USSR Bot Blacklist",
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(
                    "**Usage:**\n```\n.blacklist @user <reason>\n.blacklist <userID>\n.blacklist list\n```"
                )
                .setFooter({ text: "Blacklist management" })
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        // ----------------------
        // LIST
        // ----------------------
        if (args[0] === "list") {
            const list = await Blacklist.find();

            if (!list.length) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Green")
                            .setDescription("✅ Blacklist is empty.")
                    ]
                });
            }

            const description = list
                .map((b, i) => `**${i + 1}.** <@${b.userId}>\n📝 *${b.reason}*`)
                .join("\n\n");

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("⛔ Blacklisted Users")
                        .setDescription(description)
                        .setFooter({ text: `Total: ${list.length}` })
                ]
            });
        }

        // ----------------------
        // USER RESOLVE
        // ----------------------
        let target = resolveUser(client, message, args[0]);

        if (!target && /^\d{17,20}$/.test(args[0])) {
            try {
                target = await client.users.fetch(args[0]);
            } catch {
                target = null;
            }
        }

        const userId = target ? target.id : args[0];

        if (!/^\d{17,20}$/.test(userId)) {
            return message.reply("⚠️ Invalid user ID.");
        }

        const reason = args.slice(1).join(" ") || "No reason provided";

        // ----------------------
        // SAVE TO MONGO
        // ----------------------
        await Blacklist.findOneAndUpdate(
            { userId },
            { userId, reason },
            { upsert: true }
        );

        // ----------------------
        // DM USER
        // ----------------------
        if (target) {
            try {
                await target.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Red")
                            .setTitle("⛔ Blacklisted")
                            .setDescription("You can no longer use this bot.")
                            .addFields({ name: "Reason", value: reason })
                    ]
                });
            } catch {}
        }

        // ----------------------
        // CONFIRM
        // ----------------------
        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("⛔ User Blacklisted")
                    .addFields(
                        { name: "User", value: `<@${userId}>`, inline: true },
                        { name: "ID", value: userId, inline: true },
                        { name: "Reason", value: reason }
                    )
                    .setFooter({ text: `By ${message.author.tag}` })
            ]
        });
    }
};