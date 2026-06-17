const { EmbedBuilder } = require("discord.js");

module.exports = {
	name: "role",
	category: "moderation",

	run: async (client, message, args) => {

		// Delete command message
		message.delete().catch(() => {});

		// Only owner can use this command
		if (message.author.id !== "704331555853697074") {
			return message.channel.send("❌ You cannot use this command.");
		}

		// Usage: .role <user> <role>
		if (!args[0] || !args[1]) {
			return message.channel.send(
				"❌ Incorrect usage: `.role <user> <role>`"
			);
		}

		try {

			// Get target member
			const member =
				message.mentions.members.first() ||
				message.guild.members.cache.get(args[0]);

			if (!member) {
				return message.channel.send("❌ User not found.");
			}


			// Search role by ID, exact name, or starting name
			const roleInput = args.slice(1).join(" ").toLowerCase();

			const role = message.guild.roles.cache.find(
				r =>
					r.id === args[1] ||
					r.name.toLowerCase() === roleInput ||
					r.name.toLowerCase().startsWith(roleInput)
			);


			if (!role) {
				return message.channel.send("❌ That role does not exist.");
			}


			// Toggle role
			if (member.roles.cache.has(role.id)) {

				// Remove role
				await member.roles.remove(role);


				const embed = new EmbedBuilder()
					.setTitle("Role Removed")
					.setColor("#FF5555")
					.setThumbnail(
						member.user.displayAvatarURL({ dynamic: true })
					)
					.setDescription(
						`${message.author} has removed **${role.name}** from ${member.user}.`
					)
					.setTimestamp();


				return message.channel.send({
					embeds: [embed]
				});


			} else {

				// Add role
				await member.roles.add(role);


				const embed = new EmbedBuilder()
					.setTitle("Role Added")
					.setColor("#00FF99")
					.setThumbnail(
						member.user.displayAvatarURL({ dynamic: true })
					)
					.setDescription(
						`${message.author} has given **${role.name}** to ${member.user}.`
					)
					.setTimestamp();


				return message.channel.send({
					embeds: [embed]
				});
			}


		} catch (err) {

			console.error(err);

			return message.channel.send(
				"❌ Something went wrong. Check if the role exists and if the bot has permission."
			);
		}
	}
};