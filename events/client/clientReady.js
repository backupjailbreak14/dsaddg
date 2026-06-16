const Reboot = require("../../models/Reboot");

module.exports = {
		name: "clientReady",
		once: true,

		async execute(client) {

				const botStatus = [
						"watching bear king plan raids",
						"preparing for a purge",
						"waiting for vyborg",
						"waiting for war",
						"watching over ikiller to stop aa",
						".help"
				];


				console.log(`Hello ${client.user.username} is now online!`);

				client.user.setUsername("USSR").catch(() => {});


				// ============================================
				// 🔁 REBOOT RECOVERY
				// ============================================

				try {

						console.log("🔍 Checking reboot recovery...");

						const data = await Reboot.findOne();

						console.log("🔍 Reboot data:", data);


						if (data) {

								const channel = await client.channels
										.fetch(data.channelId)
										.catch(() => null);


								if (channel) {

										await channel.send(
												"🔁 **Bot has successfully rebooted!**"
										);

										console.log("✅ Reboot message sent.");

								} else {

										console.log("❌ Could not find reboot channel.");

								}


								await Reboot.deleteMany();

								console.log("🗑️ Reboot database cleared.");

						} else {

								console.log("ℹ️ No reboot found.");

						}


				} catch (err) {

						console.error(
								"⚠️ Reboot recovery error:",
								err
						);

				}



				// ============================================
				// 🔄 ROTATING STATUS
				// ============================================

				setInterval(() => {

						const status =
								botStatus[
										Math.floor(
												Math.random() * botStatus.length
										)
								];


						client.user.setPresence({

								activities: [
										{
												name: status,
												type: 0
										}
								],

								status: "online"

						});


				}, 5000);

		}
};