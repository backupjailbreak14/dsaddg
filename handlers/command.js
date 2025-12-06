const glob = require("fast-glob");
const { resolve } = require("path");

module.exports = async (client) => {
		const files = await glob(`${__dirname}/../commands/**/*.js`);

		for (const file of files) {
				try {
						const command = require(resolve(file));

						if (!command.name) {
								console.log(`❌ Missing name in file: ${file}`);
								continue;
						}

						if (typeof command.run !== "function") {
								console.log(`❌ Missing run() in: ${command.name}`);
								continue;
						}

						// Save command
						client.commands.set(command.name, command);

						// Aliases
						if (command.aliases && Array.isArray(command.aliases)) {
								command.aliases.forEach(alias =>
										client.aliases.set(alias, command.name)
								);
						}

						console.log(`✔ Loaded command: ${command.name}`);

				} catch (err) {
						console.log(`❌ Error loading command at: ${file}`);
						console.error(err);
				}
		}
};
