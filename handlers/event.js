// handlers/event.js
const { readdirSync, existsSync } = require("fs");
const path = require("path");

module.exports = (client) => {
	const load = (dir) => {
		// Build correct path: /events/client or /events/guild
		const folderPath = path.join(__dirname, "..", "events", dir);

		console.log("➡ Loading events for:", dir);
		console.log("➡ folderPath =", folderPath);
		console.log("➡ exists =", existsSync(folderPath));

		// Skip if folder does not exist
		if (!existsSync(folderPath)) {
			console.warn(`⚠️ Skipping missing events folder: ${folderPath}`);
			return;
		}

		// Read all .js files in the folder
		const events = readdirSync(folderPath).filter((f) => f.endsWith(".js"));

		for (const file of events) {
			let eventName = file.split(".")[0];

			// Skip messageCreate, it is handled manually in index.js
			if (eventName === "messageCreate") {
				console.log("⛔ Skipping messageCreate (handled manually in index.js)");
				continue;
			}

			// Discord.js v14+ ready → clientReady
			if (eventName === "ready") eventName = "clientReady";

			const filePath = path.join(folderPath, file);
			const evt = require(filePath);

			console.log(`✔ Loaded event: ${dir}/${eventName}`);
			client.on(eventName, evt.bind(null, client));
		}
	};

	// Load client + guild events
	["client", "guild"].forEach(load);
};
