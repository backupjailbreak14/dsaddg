const Reboot = require("../../models/Reboot");

module.exports = {
		name: "reboot",
		category: "owner",

		run: async (client, message) => {

				// Owner check
				if (message.author.id !== "704331555853697074") {
						return message.channel.send("❌ You cannot use this command!");
				}

				if (client.isRebooting) return;
				client.isRebooting = true;

				await message.channel.send("🔄 Rebooting bot...");

				try {
						// Save reboot state
						await Reboot.create({
								channelId: message.channel.id
						});

						console.log("🔄 Safe restart triggered...");

						// Give MongoDB time to save
						setTimeout(() => {
								process.exit(0);
						}, 1000);

				} catch (err) {
						console.error("❌ Failed to save reboot:", err);
						client.isRebooting = false;
				}
		}
};