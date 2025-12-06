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

				// ============================================
				// 🔁 REBOOT MESSAGE HANDLER (FULLY FIXED)
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
										const channel = client.channels.cache.get(data.channel);

										if (channel) {
												channel.send("✅ **Bot rebooted and is now online again!**")
														.catch(() => {});
										} else {
												console.log("⚠️ Reboot channel not found in cache.");
										}

										// Reset file so message doesn’t send repeatedly
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
