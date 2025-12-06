const fs = require("fs");
const path = require("path");

module.exports = {
		name: "reboot",
		category: "owner",

		run: async (client, message) => {
				if (message.author.id !== "704331555853697074") {
						return message.channel.send("❌ You cannot use this command!");
				}

				await message.channel.send("🔄 Rebooting bot...");

				// Store the channel in the correct field
				const data = { channel: message.channel.id };

				fs.writeFileSync(
						path.join(__dirname, "../../utils/reboot.json"),
						JSON.stringify(data, null, 2),
						"utf8"
				);

				// ================================
				// 🔥 REPLIT-SAFE RESTART
				// ================================
				// No force-crash → avoids .git-backup spam
				console.log("🔄 Replit-safe restart initiated...");

				process.exitCode = 0; // Clean exit flag
				return process.exit(); // Safe shutdown for Replit
		}
};
