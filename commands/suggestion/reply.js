    const Suggestion = require("../../models/Suggestion");

module.exports = {
    name: "reply",
    category: "suggestion",
    description: "Reply to a suggestion",
    usage: "reply <id> <approve/deny> <message>",
    permissions: ["MANAGE_GUILD"],

    run: async (client, message, args) => {
        const id = args[0];
        if (!id) {
            return message.restSend("❌ Please provide a suggestion ID.");
        }

        const action = args[1];
        if (!["approve", "deny"].includes(action)) {
            return message.restSend("❌ Use `approve` or `deny`.");
        }

        const replyMessage = args.slice(2).join(" ");
        if (!replyMessage) {
            return message.restSend("❌ Please provide a reply message.");
        }

        // 🔍 Find suggestion in MongoDB
        const suggestion = await Suggestion.findOne({
            guildId: message.guild.id,
            id: id
        });

        if (!suggestion) {
            return message.restSend("❌ Suggestion not found.");
        }

        // 🔄 Update suggestion
        suggestion.status = action === "approve" ? "approved" : "denied";
        suggestion.reply = replyMessage;
        suggestion.staff = message.author.id;

        await suggestion.save();

        return message.restSend(
            `✅ Suggestion **${id}** has been **${action}**.`
        );
    }
};