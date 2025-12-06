const {
    PermissionFlagsBits,
    WebhookClient
} = require("discord.js");

module.exports = {
    name: "sudo",
    description: "Creates a webhook to impersonate someone.",
    usage: "sudo <user> <message>",
    category: "fun",
    permissions: ["MANAGE_WEBHOOKS"],
    args: true,
    cooldown: 5,

    run: async (client, message, args) => {

        // USER permission check
        if (!message.member.permissions.has(PermissionFlagsBits.ManageWebhooks)) {
            return message.restSend(
                "❌ You need **MANAGE_WEBHOOKS** to use this command."
            );
        }

        // BOT permission check
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageWebhooks)) {
            return message.restSend(
                "❌ I need **MANAGE_WEBHOOKS** permission to create webhooks."
            );
        }

        // Delete the command message (ignore failure)
        message.delete().catch(() => {});

        // Get target user
        const user =
            message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]);

        if (!user) {
            return message.restSend("❌ Please mention a user to impersonate.");
        }

        const text = args.slice(1).join(" ");
        if (!text) return message.restSend("❌ Please provide a message.");

        try {
            // Create webhook
            const webhook = await message.channel.createWebhook({
                name: user.displayName,
                avatar: user.user.displayAvatarURL({ dynamic: true })
            });

            // Send message as webhook
            await webhook.send({
                content: text
            });

            // Remove webhook
            await webhook.delete().catch(() => {});
        } catch (err) {
            console.error(err);
            return message.restSend("⚠️ Failed to create or send with webhook.");
        }
    }
};
