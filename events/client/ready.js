const fs = require("fs");
const path = require("path");

module.exports = (client) => {

		const botStatus = [
				"watching bear king plan raids",
				"preparing for a purge",
				"waiting for vyborg",
				"waiting for war",
				"watching over ikiller to stop aa",
				".help"
		];

		// ⚠️ DISCORD.JS v14/v15 → 'clientReady'
		client.on("clientReady", () => {

				console.log(`Hello ${client.user.username} is now online!`);

				// Change bot name (safe fail)
				client.user.setUsername("USSR").catch(() => {});

				// ==========================
				// 🔁 REBOOT MESSAGE HANDLER
				// ==========================
				const filePath = path.join(__dirname, "../../utils/reboot.json");

				try {
						const raw = fs.readFileSync(filePath);
						const data = JSON.parse(raw);

						if (data.channel) {
								const channel = client.channels.cache.get(data.channel);

								if (channel) {
										channel.send("✅ **Bot rebooted and is now online again!**");
								}

								// Clear JSON so it doesn't repeat
								fs.writeFileSync(filePath, JSON.stringify({ channel: null }, null, 2));
						}
				} catch (e) {
						console.log("Reboot file not found or unreadable.");
				}

				// ==========================
				// 🔄 ROTATING BOT STATUS
				// ==========================
				setInterval(() => {
						const status = botStatus[Math.floor(Math.random() * botStatus.length)];

						client.user.setPresence({
								activities: [{ name: status, type: 0 }],
								status: "online"
						});

				}, 5000);
		});
};
