// handlers/event.js
const { readdirSync, existsSync } = require("fs");
const path = require("path");

module.exports = (client) => {

	const load = (dir) => {

		const folderPath = path.join(
			__dirname,
			"..",
			"events",
			dir
		);

		console.log("➡ Loading events for:", dir);
		console.log("➡ folderPath =", folderPath);
		console.log("➡ exists =", existsSync(folderPath));


		if (!existsSync(folderPath)) {
			console.warn(
				`⚠️ Skipping missing events folder: ${folderPath}`
			);
			return;
		}


		const events = readdirSync(folderPath)
			.filter(f => f.endsWith(".js"));


		for (const file of events) {

			let eventName = file.split(".")[0];


			if (eventName === "messageCreate") {
				console.log(
					"⛔ Skipping messageCreate (handled manually in index.js)"
				);
				continue;
			}


			if (eventName === "ready") {
				eventName = "clientReady";
			}


			const filePath = path.join(
				folderPath,
				file
			);


			const evt = require(filePath);


			console.log(
				`✔ Loaded event: ${dir}/${eventName}`
			);

			console.log(
				`Binding event: ${eventName}`
			);


			client.on(
				eventName,
				evt.bind(null, client)
			);

		}

	};


	["client", "guild"].forEach(load);

};