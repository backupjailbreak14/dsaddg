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

		// ✔️ Discord.js v14/v15 = 'ready'
		client.on("ready", async () => {

				console.log(`Hello ${client.user.username} is now online!`);

				// Change bot name (safe fail)
				client.user.setUsername("USSR").catch(() => {});

				// ============================================
				// 🔁 REBOOT MESSAGE HANDLER (WITH FETCH)
				// ============================================
				const filePath = path.join(__dirname, "../../utils/reboot.json");

				try {
						if (fs.existsSync(filePath)) {
								const raw = fs.readFileSync(filePath, "utf8");

								let data = {};
								try {
										data = JSON.parse(raw);
								} catch {
										console.log("❌ reboot.json is corrupted — resetting file.");
								}

								if (data.channel) {
										let channel = null;

										// Fetch channel safely
										try {
												channel = await client.channels.fetch(data.channel);
										} catch {
												console.log("⚠️ Could not fetch reboot channel.");
										}

										if (channel) {
												channel.send("🔁 **Bot is succesvol opnieuw opgestart!**");
										} else {
												console.log("⚠️ Channel not found for reboot message.");
										}

										// Reset reboot.json so message is not sent again
										fs.writeFileSync(
												filePath,
												JSON.stringify({ channel: null }, null, 2),
												"utf8"
										);

										console.log("🔄 Reboot recovery executed.");
								}
						} else {
								console.log("ℹ️ reboot.json not found — skipping recovery.");
						}
				} catch (e) {
						console.log("⚠️ Error reading reboot.json:", e);
				}

				// ============================================
				// 🔄 ROTATING BOT STATUS
				// ============================================
				setInterval(() => {
						const status = botStatus[Math.floor(Math.random() * botStatus.length)];

						client.user.setPresence({
								activities: [{ name: status, type: 0 }],
								status: "online"
						});

				}, 5000);

		});
};
