const {
    PermissionFlagsBits
} = require("discord.js");

const Filter = require("bad-words");

const filter = new Filter();


// Normalize text to catch bypass attempts
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[@4]/g, "a")
        .replace(/[!1]/g, "i")
        .replace(/\$/g, "s")
        .replace(/\*/g, "")
        .replace(/0/g, "o")
        .replace(/\./g, "")
        .replace(/-/g, "");
}


module.exports = {
    name: "sudo",
    description: "Creates a webhook to impersonate someone.",
    usage: "sudo <user> <message>",
    category: "fun",
    permissions: ["MANAGE_WEBHOOKS"],
    args: true,
    cooldown: 5,


    run: async (client, message, args) => {


        // User permission check
        if (!message.member.permissions.has(PermissionFlagsBits.ManageWebhooks)) {
            return message.restSend(
                "❌ You need **MANAGE_WEBHOOKS** to use this command."
            );
        }


        // Bot permission check
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageWebhooks)) {
            return message.restSend(
                "❌ I need **MANAGE_WEBHOOKS** permission to create webhooks."
            );
        }


        // Delete command message
        message.delete().catch(() => {});


        // Get target user
        const user =
            message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]);


        if (!user) {
            return message.restSend(
                "❌ Please mention a user to impersonate."
            );
        }


        // Get webhook message content
        const text = args.slice(1).join(" ");


        if (!text) {
            return message.restSend(
                "❌ Please provide a message."
            );
        }


        // Block @everyone and @here
        if (
            text.includes("@everyone") ||
            text.includes("@here")
        ) {
            return message.restSend(
                "❌ You cannot use @everyone or @here with sudo."
            );
        }


        // Check profanity
        const cleanedText = normalizeText(text);

        if (filter.isProfane(cleanedText)) {
            return message.restSend(
                "❌ This message contains inappropriate language."
            );
        }


        try {

            // Create webhook
            const webhook = await message.channel.createWebhook({
                name: user.displayName,
                avatar: user.user.displayAvatarURL({
                    dynamic: true
                })
            });


            // Send message as webhook
            await webhook.send({
                content: text
            });


            // Delete webhook after use
            await webhook.delete().catch(() => {});


        } catch (err) {

            console.error(err);

            return message.restSend(
                "⚠️ Failed to create or send with webhook."
            );

        }
    }
};