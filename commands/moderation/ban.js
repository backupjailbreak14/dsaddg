const { EmbedBuilder } = require("discord.js");

module.exports = {
	name: "ban",
	category: "moderation",

	run: async (client, message, args) => {
		// Only YOU can use this command
		if (message.author.id !== "704331555853697074") {
			return message.channel.send({
				content: "❌ You are not allowed to use this command."
			});
		}

		if (!args[0]) {
			return message.channel.send({
				content: "❌ Please mention a user or provide an ID!"
			});
		}

		const target = args[0];
		const reason = args.slice(1).join(" ") || "No Reason Given";

		let member = null;

		try {
			member =
				message.mentions.members.first() ||
				await message.guild.members.fetch(target);
		} catch {
			member = null;
		}

		try {
			// User is in server
			if (member) {
				if (!member.bannable) {
					return message.channel.send({
						content: "❌ I can't ban this user (missing permissions or role too high)."
					});
				}

				await member.ban({ reason });

				const embed = new EmbedBuilder()
					.setTitle("🔨 Member Banned")
					.setColor("Red")
					.addFields(
						{ name: "User", value: member.user.tag, inline: true },
						{ name: "ID", value: member.id, inline: true },
						{ name: "Reason", value: reason }
					)
					.setFooter({
						text: `Banned by ${message.author.tag}`,
						iconURL: message.author.displayAvatarURL()
					});

				return message.channel.send({ embeds: [embed] });
			}

			// User not in server → ban by ID
			await message.guild.bans.create(target, { reason });

			const embed = new EmbedBuilder()
				.setTitle("🔨 User Banned")
				.setColor("Red")
				.addFields(
					{ name: "ID", value: target, inline: true },
					{ name: "Reason", value: reason }
				)
				.setFooter({
					text: `Banned by ${message.author.tag}`,
					iconURL: message.author.displayAvatarURL()
				});

			return message.channel.send({ embeds: [embed] });

		} catch (err) {
			console.error(err);

			return message.channel.send({
				content: "❌ Failed to ban the user. Check the ID and my permissions."
			});
		}
	}
};