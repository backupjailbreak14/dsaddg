const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
		name: "kick",
		category: "moderation",

		run: async (client, message, args) => {
				// Only YOU can use this command
				if (message.author.id !== "704331555853697074") {
						return message.channel.send("❌ You are not allowed to use this command.");
				}

				// Must mention a user
				if (!args[0]) {
						return message.channel.send("❌ Please mention a user to kick.");
				}

				// Find the member
				const member =
						message.mentions.members.first() ||
						message.guild.members.cache.get(args[0]);

				if (!member) {
						return message.channel.send("❌ Cannot find that user.");
				}

				// Check if bot can kick them (role hierarchy)
				if (!member.kickable) {
						return message.channel.send("❌ I cannot kick this user (role too high or missing permissions).");
				}

				try {
						await member.kick();

						const embed = new EmbedBuilder()
								.setTitle("👢 Member Kicked")
								.setColor("#ff3333")
								.setDescription(`${member.user.tag} has been kicked.`)
								.setThumbnail(member.user.displayAvatarURL())
								.setFooter({ text: `Kicked by ${message.author.tag}` })
								.setTimestamp();

						return message.channel.send({ embeds: [embed] });

				} catch (err) {
						console.error(err);
						return message.channel.send("❌ Failed to kick the user.");
				}
		}
};
