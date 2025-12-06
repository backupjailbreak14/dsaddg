const { readdirSync, existsSync } = require("fs");
const path = require("path");

module.exports = (client) => {

		const load = (dir) => {

				// Bouw correct pad
				const folderPath = path.join(__dirname, "..", "events", dir);

				console.log("➡ Loading events for:", dir);
				console.log("➡ folderPath =", folderPath);
				console.log("➡ exists =", existsSync(folderPath));

				// Skip als folder niet bestaat
				if (!existsSync(folderPath)) {
						console.warn(`⚠️ Skipping missing events folder: ${folderPath}`);
						return;
				}

				// Lees alle JS-bestanden in de map
				const events = readdirSync(folderPath).filter(f => f.endsWith(".js"));

				for (const file of events) {
						const filePath = path.join(folderPath, file);
						const evt = require(filePath);

						let eventName = file.split(".")[0];

						// Fix voor Discord.js v14 ready event rename
						if (eventName === "ready") eventName = "clientReady";

						console.log(`✔ Loaded event: ${dir}/${eventName}`);

						client.on(eventName, evt.bind(null, client));
				}
		};

		// Laad client + guild events
		["client", "guild"].forEach(load);
};
