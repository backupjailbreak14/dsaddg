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

				// Store channel ID where reboot was used
				const data = { channel: message.channel.id };
				fs.writeFileSync(
						path.join(__dirname, "../../utils/reboot.json"),
						JSON.stringify(data, null, 2)
				);

				// Delay so the message sends
				setTimeout(() => process.exit(0), 500);
		}
};
