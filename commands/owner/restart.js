const fs = require("fs");
const path = require("path");

module.exports = {
		name: "reboot",
		category: "owner",

		run: async (client, message) => {
				// Owner check
				if (message.author.id !== "704331555853697074") {
						return message.channel.send("❌ You cannot use this command!");
				}

				// Prevent double execution (Render/Replit sometimes fires messageCreate twice)
				if (client.isRebooting) return;
				client.isRebooting = true;

				await message.channel.send("🔄 Rebooting bot...");

				// Save the reboot channel so the bot can confirm after restart
				const data = { channel: message.channel.id };

				fs.writeFileSync(
						path.join(__dirname, "../../utils/reboot.json"),
						JSON.stringify(data, null, 2),
						"utf8"
				);

				console.log("🔄 Safe restart triggered...");

				// Replit/Render-safe exit (no backup folder spam)
				process.exitCode = 0;
				return process.exit();
		}
};
