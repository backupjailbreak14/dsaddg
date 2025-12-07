const fs = require("fs");
const path = require("path");

module.exports = (client) => {
		const commandsPath = path.join(__dirname, "..", "commands");

		// Recursively load commands
		function load(dir) {
				const files = fs.readdirSync(dir, { withFileTypes: true });

				for (const file of files) {
						const fullPath = path.join(dir, file.name);

						// Folder → load recursively
						if (file.isDirectory()) {
								load(fullPath);
								continue;
						}

						// Skip non-JS files
						if (!file.name.endsWith(".js")) continue;

						try {
								const command = require(fullPath);

								if (!command.name) {
										console.log(`❌ Missing name in: ${fullPath}`);
										continue;
								}

								if (typeof command.run !== "function") {
										console.log(`❌ Missing run() in: ${command.name}`);
										continue;
								}

								// Register command
								client.commands.set(command.name, command);

								// Register aliases
								if (Array.isArray(command.aliases)) {
										command.aliases.forEach((alias) =>
												client.aliases.set(alias, command.name)
										);
								}

								console.log(`✔ Loaded command: ${command.name}`);

						} catch (err) {
								console.log(`❌ Error loading command: ${fullPath}`);
								console.error(err);
						}
				}
		}

		load(commandsPath);
};
