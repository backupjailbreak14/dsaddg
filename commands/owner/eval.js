// Array containing the Discord User IDs of the bot owners
const owners = ["704331555853697074"];
const { inspect } = require("util");

module.exports = {
		name: "eval",
		category: "owner",
		description: "Execute JavaScript code (bot owner only).",
		usage: "eval <code>",

		run: async (client, message, args) => {
				// 1. Check if the message author is a verified bot owner
				if (!owners.includes(message.author.id)) {
						return message.restSend({ content: "❌ This command is owner-only." });
				}

				// 2. Ensure code arguments were provided
				const code = args.join(" ");
				if (!code) return message.restSend({ content: "❌ Provide code to evaluate." });

				try {
						// 3. Execute the code and handle promises if the code is asynchronous
						let evaluated = eval(code);
						if (evaluated instanceof Promise) evaluated = await evaluated;

						// 4. Convert objects to readable text strings (depth 0 prevents infinite loops on deep objects)
						let result = typeof evaluated !== "string" ? inspect(evaluated, { depth: 0 }) : evaluated;

						// 5. Dynamic protection layer: Automatically redact ALL environment variables and client token
						const secretsToRedact = new Set([client.token]);

						// Automatically grab every single value from your Render dashboard (process.env)
						for (const key in process.env) {
								if (process.env[key]) {
										secretsToRedact.add(process.env[key]);
								}
						}

						// Loop through the dynamically built list and mask them
						for (const secret of secretsToRedact) {
								if (secret && secret.trim() !== "") {
										// Escape special regex characters in the secret value to avoid code crashes
										const secretRegex = new RegExp(secret.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), "gi");
										result = result.replace(secretRegex, "[REDACTED]");
								}
						}

						// 6. Enforce Discord's 2000 character message limit safety buffer
						if (result.length > 1500) {
								result = result.slice(0, 1500) + "\n...and more characters truncated.";
						}

						return message.restSend({ 
								content: `📥 **Input:**\n\`\`\`js\n${code}\n\`\`\`\n📤 **Output:**\n\`\`\`js\n${result}\n\`\`\`` 
						});

				} catch (err) {
						// 7. Sanitize error stack traces to guarantee secrets are never leaked during runtime errors
						let errorString = err.stack || err.toString();

						const secretsToRedact = new Set([client.token]);
						for (const key in process.env) {
								if (process.env[key]) secretsToRedact.add(process.env[key]);
						}

						for (const secret of secretsToRedact) {
								if (secret && secret.trim() !== "") {
										const secretRegex = new RegExp(secret.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), "gi");
										errorString = errorString.replace(secretRegex, "[REDACTED]");
								}
						}

						return message.restSend({ content: `❌ **Error:**\n\`\`\`js\n${errorString}\n\`\`\`` });
				}
		}
};
