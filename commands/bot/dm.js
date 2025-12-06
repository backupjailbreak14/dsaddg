module.exports = {
    name: "dm",
    category: "bot",
    description: "Send a DM to a user.",
    usage: "dm <@user> <message>",
    permissions: ["MANAGE_MESSAGES"],

    run: async (client, message, args) => {
        const target = message.mentions.members.first();
        if (!target) {
            return message.restSend("❌ You must mention someone to DM.");
        }

        const msg = args.slice(1).join(" ");
        if (!msg) {
            return message.restSend("❌ You must provide a message.");
        }

        try {
            await target.send(`📩 **Message from ${message.author.tag}:**\n\n${msg}`);
            return message.restSend("✅ DM sent successfully!");
        } catch (err) {
            console.error(err);
            return message.restSend("❌ I couldn't DM that user.");
        }
    }
};
