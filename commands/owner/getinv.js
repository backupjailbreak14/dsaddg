const { ChannelType } = require("discord.js");
const owners = ["704331555853697074"];

module.exports = {
    name: "getinv",
    category: "owner",
    description: "Get an invite link for a server the bot is in.",
    usage: "getinv <guildID>",

    run: async (client, message, args) => {
        if (!owners.includes(message.author.id)) {
            return message.restSend({ content: "❌ This command is owner-only." });
        }

        const id = args[0];
        if (!id) return message.restSend({ content: "❌ Provide a guild ID." });

        const guild = client.guilds.cache.get(id);
        if (!guild) {
            return message.restSend({
                content: "❌ The bot is not in that server."
            });
        }

        try {
            const channel = guild.channels.cache
                .filter(c => c.type === ChannelType.GuildText)
                .first();

            if (!channel) {
                return message.restSend({
                    content: "❌ No text channels found to create an invite."
                });
            }

            const invite = await channel.createInvite({
                maxAge: 3600,
                maxUses: 1
            });

            return message.restSend({
                content: `🔗 **Invite created:**\nhttps://discord.gg/${invite.code}`
            });
        } catch (err) {
            console.error(err);
            return message.restSend({ content: "❌ Failed to create invite." });
        }
    }
};
