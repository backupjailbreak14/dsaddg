const fs = require("fs");
const path = require("path");

module.exports = {
		name: "reboot",
		category: "owner",
		description: "Safely reboots the bot and sends a recovery message when back online.",

		run: async (client, message) => {
				if (message.author.id !== "704331555853697074") {
						return message.channel.send("❌ You cannot use this command!");
				}

				// Confirm reboot
				await message.channel.send("🔄 Rebooting bot...");

				// Save the channel ID so the bot can send a "bot restarted" message later
				const payload = {
						channelId: message.channel.id
				};

				try {
						fs.writeFileSync(
								path.join(__dirname, "../../utils/reboot.json"),
								JSON.stringify(payload, null, 2),
								"utf8"
						);
				} catch (err) {
						console.error("[REBOOT] Failed to write reboot.json:", err);
				}

				// Short delay to ensure message is sent
				setTimeout(() => process.exit(0), 500);
		}
};
