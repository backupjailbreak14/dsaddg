const fs = require("fs");
const path = require("path");

module.exports = {
	name: "reboot",
	category: "owner",

	run: async (client, message) => {
		if (message.author.id !== "704331555853697074") {
			return message.channel.send("❌ You cannot use this command!");
		}

		await message.channel.send("🔄 Rebooting bot...");

		// Store channelId in correct format used by recovery system
		const data = { channelId: message.channel.id };

		fs.writeFileSync(
			path.join(__dirname, "../../utils/reboot.json"),
			JSON.stringify(data, null, 2),
			"utf8"
		);

		setTimeout(() => process.exit(0), 500);
	}
};
