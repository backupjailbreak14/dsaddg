const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
		name: "role",
		category: "moderation",

		run: async (client, message, args) => {
				// Delete command message
				message.delete().catch(() => {});

				// Only YOU can use this command
				if (message.author.id !== "704331555853697074") {
						return message.channel.send("❌ You cannot use this command.");
				}

				// Must provide: user + role
				if (!args[0] || !args[1]) {
						return message.channel.send("❌ Incorrect usage: `.role <user> <role>`");
				}

				try {
						// Get the target user
						const member =
								message.mentions.members.first() ||
								message.guild.members.cache.get(args[0]);

						if (!member) {
								return message.channel.send("❌ User not found.");
						}

						// Find role by name or ID
						const role =
								message.guild.roles.cache.find(
										r =>
												r.id === args[1] ||
												r.name.toLowerCase() === args.slice(1).join(" ").toLowerCase()
								);

						if (!role) {
								return message.channel.send("❌ That role does not exist.");
						}

						// Check if they already have the role
						if (member.roles.cache.has(role.id)) {
								return message.channel.send("❌ User already has that role.");
						}

						// Add the role
						await member.roles.add(role);

						// Build embed
						const embed = new EmbedBuilder()
								.setTitle(`Role Added`)
								.setColor("#00FF99")
								.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
								.setDescription(
										`${message.author} has given **${role.name}** to ${member.user}.`
								)
								.setTimestamp();

						return message.channel.send({ embeds: [embed] });

				} catch (err) {
						console.error(err);
						return message.channel.send("❌ Something went wrong. Does the role exist?");
				}
		}
};
