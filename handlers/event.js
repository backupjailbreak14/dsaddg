const { readdirSync, existsSync } = require("fs");
const path = require("path");

module.exports = (client) => {

		const load = (dir) => {
				const folderPath = path.join(__dirname, dir);

				console.log("➡ Loading handlers for:", dir);
				console.log("➡ folderPath =", folderPath);
				console.log("➡ exists =", existsSync(folderPath));

				if (!existsSync(folderPath)) {
						console.warn(`⚠️ Skipping missing handler folder: ${folderPath}`);
						return;
				}

				const files = readdirSync(folderPath).filter(f => f.endsWith(".js"));

				for (const file of files) {

						// 🚫 Prevent duplicate messageCreate listener
						// console.js contains messageCreate
						if (file === "console.js") {
								console.log("⛔ Skipping console.js (duplicate messageCreate listener)");
								continue;
						}

						const filePath = path.join(folderPath, file);
						const handler = require(filePath);

						if (typeof handler === "function") {
								console.log(`✔ Loaded handler: ${dir}/${file}`);
								handler(client);
						}
				}
		};

		// Load handlers from this folder
		load(".");
};
