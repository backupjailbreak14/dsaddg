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

		// This event is triggered when the bot is fully ready (custom handler environment)
		client.on("clientReady", async () => {
				console.log(`[READY] ${client.user.username} is now online.`);

				// Attempt to change bot username (ignore if rate limited)
				client.user.setUsername("USSR").catch(() => {});

				// ===============================
				// 🔁 REBOOT RECOVERY HANDLER
				// ===============================
				const filePath = path.join(__dirname, "../../utils/reboot.json");

				try {
						if (fs.existsSync(filePath)) {
								const raw = fs.readFileSync(filePath, "utf8");
								const data = JSON.parse(raw);

								// Check if a reboot channel was stored
								if (data.channel) {
										let rebootChannel = null;

										// Fetch channel — cache may be empty after reboot
										try {
												rebootChannel = await client.channels.fetch(data.channel);
										} catch (err) {
												console.log("[WARN] Failed to fetch reboot channel:", err.message);
										}

										// Send confirmation message
										if (rebootChannel) {
												await rebootChannel.send("🔁 Bot has successfully restarted!");
										} else {
												console.log("[WARN] Reboot channel not found.");
										}

										// Reset JSON so it doesn't fire again
										fs.writeFileSync(
												filePath,
												JSON.stringify({ channel: null }, null, 2),
												"utf8"
										);

										console.log("[INFO] Reboot recovery executed.");
								}
						}
				} catch (err) {
						console.log("[ERROR] Failed to process reboot.json:", err);
				}

				// ===============================
				// 🔄 ROTATING STATUS
				// ===============================
				setInterval(() => {
						const status = botStatus[Math.floor(Math.random() * botStatus.length)];

						client.user.setPresence({
								activities: [{ name: status, type: 0 }],
								status: "online"
						});
				}, 5000);
		});
};
