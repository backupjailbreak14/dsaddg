const owners = ["704331555853697074"];

module.exports = {
		name: "eval",
		category: "owner",
		description: "Execute JavaScript code (bot owner only).",
		usage: "eval <code>",

		run: async (client, message, args) => {
				if (!owners.includes(message.author.id)) {
						return message.restSend({ content: "❌ This command is owner-only." });
				}

				const code = args.join(" ");
				if (!code) return message.restSend({ content: "❌ Provide code to evaluate." });

				try {
						let result = eval(code);
						if (typeof result !== "string") {
								result = require("util").inspect(result);
						}

						// Prevent token leaking
						result = result.replace(process.env.BOT_TOKEN, "[REDACTED]");

						return message.restSend({ content: `📥 **Input:**\n\`\`\`js\n${code}\n\`\`\`\n📤 **Output:**\n\`\`\`js\n${result}\n\`\`\`` });

				} catch (err) {
						return message.restSend({ content: `❌ **Error:**\n\`\`\`js\n${err}\n\`\`\`` });
				}
		}
};
