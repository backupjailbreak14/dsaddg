const { readdirSync, existsSync } = require("fs");
const path = require("path");

module.exports = (client) => {

		const load = (dir) => {
				const folderPath = path.join(__dirname, "..", "events", dir);

				console.log("➡ Loading events for:", dir);
				console.log("➡ folderPath =", folderPath);
				console.log("➡ exists =", existsSync(folderPath));

				if (!existsSync(folderPath)) {
						console.warn(`⚠️ Skipping missing events folder: ${folderPath}`);
						return;
				}

				const events = readdirSync(folderPath).filter(f => f.endsWith(".js"));

				for (const file of events) {

						let eventName = file.split(".")[0];

						// ❌ BLOCK messageCreate to prevent duplicate handler
						if (eventName === "messageCreate") {
								console.log("⛔ Skipping messageCreate (handled manually in index.js)");
								continue;
						}

						// Fix ready rename in Discord.js v14+
						if (eventName === "ready") eventName = "clientReady";

						const filePath = path.join(folderPath, file);
						const evt = require(filePath);

						console.log(`✔ Loaded event: ${dir}/${eventName}`);
						client.on(eventName, evt.bind(null, client));
				}
		};

		["client", "guild"].forEach(load);
};
