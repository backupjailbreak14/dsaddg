const storage = require("../../utils/suggestions");

module.exports = {
    name: "reply",
    category: "suggestion",
    description: "Reply to a suggestion",
    usage: "reply <id> <approve/deny> <message>",
    permissions: ["MANAGE_GUILD"],

    run: async (client, message, args) => {
        const id = args[0];
        if (!id) {
            return message.restSend({
                content: "❌ Please provide a suggestion ID."
            });
        }

        const action = args[1];
        if (!["approve", "deny"].includes(action)) {
            return message.restSend({
                content: "❌ Use `approve` or `deny`."
            });
        }

        const replyMessage = args.slice(2).join(" ");
        if (!replyMessage) {
            return message.restSend({
                content: "❌ Please provide a reply message."
            });
        }

        const guildData = storage.getGuild(message.guild.id);

        if (
            !guildData ||
            !guildData.suggests ||
            !Array.isArray(guildData.suggests)
        ) {
            return message.restSend({
                content: "❌ No suggestions stored for this guild."
            });
        }

        const suggestion = guildData.suggests.find(s => s.id == id);

        if (!suggestion) {
            return message.restSend({
                content: "❌ Suggestion not found."
            });
        }

        storage.updateSuggestion(message.guild.id, id, {
            status: action === "approve" ? "approved" : "denied",
            reply: replyMessage,
            staff: message.author.id
        });

        return message.restSend({
            content: `✅ Suggestion **${id}** has been **${action}**.`
        });
    }
};
