const { EmbedBuilder } = require("discord.js");

module.exports = {
		name: "help",
		aliases: ["h"],
		category: "info",
		description: "Shows all commands or details about one command.",
		usage: "[command]",

		run: async (client, message, args) => {

				// USER ASKED FOR SPECIFIC COMMAND
				if (args[0]) {
						return sendCommandInfo(client, message, args[0]);
				}

				// SHOW ALL COMMANDS
				return sendAllCommands(client, message);
		}
};


function sendAllCommands(client, message) {

		// Build a list of categories automatically
		const categories = {};

		client.commands.forEach(cmd => {
				const cat = cmd.category || "other";
				if (!categories[cat]) categories[cat] = [];
				categories[cat].push(cmd.name);
		});

		const embed = new EmbedBuilder()
				.setTitle("📚 Command List")
				.setColor("#ff6b6b")
				.setThumbnail(message.client.user.displayAvatarURL())
				.setFooter({ text: `Total commands: ${client.commands.size}` });

		let description = "";

		// Format categories
		for (const cat in categories) {
				description += `**${cat.toUpperCase()}** (${categories[cat].length})\n`;
				description += categories[cat].map(c => `• \`${c}\``).join("  ");
				description += "\n\n";
		}

		embed.setDescription(description);

		return message.channel.send({ embeds: [embed] });
}



function sendCommandInfo(client, message, input) {

		const cmd = client.commands.get(input.toLowerCase()) ||
								client.commands.get(client.aliases.get(input.toLowerCase()));

		const embed = new EmbedBuilder()
				.setColor("#ff6b6b")
				.setThumbnail(message.client.user.displayAvatarURL());

		if (!cmd)
				return message.channel.send({
						embeds: [embed.setDescription(`❌ No command named **${input}** found.`)]
				});

		let info = `**Name:** ${cmd.name}`;

		if (cmd.aliases?.length)
				info += `\n**Aliases:** ${cmd.aliases.map(a => `\`${a}\``).join(", ")}`;

		if (cmd.category)
				info += `\n**Category:** ${cmd.category}`;

		if (cmd.description)
				info += `\n**Description:** ${cmd.description}`;

		if (cmd.usage)
				info += `\n**Usage:** \`${cmd.usage}\``;

		embed.setDescription(info);

		return message.channel.send({ embeds: [embed] });
}
