const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
		name: "unban",

		run: async (client, message, args) => {
				// Permission check
				if (!message.member.permissions.has(PermissionFlagsBits.BanMembers))
						return message.channel.send({
								content: "❌ You need the **BAN_MEMBERS** permission!"
						});

				if (!args[0])
						return message.channel.send({
								content: "❌ Please enter a user ID to unban!"
						});

				let member;

				try {
						member = await client.users.fetch(args[0]);
				} catch (e) {
						return message.channel.send({
								content: "❌ Invalid user ID!"
						});
				}

				const reason = args.slice(1).join(" ") || "No reason provided";

				const embed = new EmbedBuilder()
						.setFooter({
								text: `${message.author.tag} (${message.author.id})`,
								iconURL: message.author.displayAvatarURL()
						});

				try {
						const bans = await message.guild.bans.fetch();
						const bannedUser = bans.get(member.id);

						if (bannedUser) {
								embed
										.setTitle(`✅ Successfully unbanned ${bannedUser.user.tag}`)
										.setColor("Green")
										.addFields(
												{ name: "User ID", value: bannedUser.user.id, inline: true },
												{ name: "User Tag", value: bannedUser.user.tag, inline: true },
												{
														name: "Ban Reason",
														value: bannedUser.reason || "No reason",
														inline: false
												},
												{
														name: "Unban Reason",
														value: reason,
														inline: false
												}
										);

								await message.guild.members.unban(bannedUser.user.id, reason);

								return message.channel.send({ embeds: [embed] });
						} else {
								embed
										.setTitle(`❌ User ${member.tag} is not banned!`)
										.setColor("Red");

								return message.channel.send({ embeds: [embed] });
						}
				} catch (err) {
						console.error(err);
						return message.channel.send("❌ An error occurred while fetching bans.");
				}
		}
};
