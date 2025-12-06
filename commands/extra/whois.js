const { EmbedBuilder } = require("discord.js");

module.exports = {
		name: "whois",
		category: "extra",
		description: "Shows info about a user.",

		run: async (client, message, args) => {

				const user =
						message.mentions.members.first() ||
						message.guild.members.cache.get(args[0]) ||
						message.member;

				// --- SAFE PRESENCE ACCESS ---
				const presence = user.presence ?? {}; // if null, becomes {}
				const statusRaw = presence.status ?? "offline";

				let status;
				switch (statusRaw) {
						case "online":
								status = "🟢 Online";
								break;
						case "dnd":
								status = "⛔ Do Not Disturb";
								break;
						case "idle":
								status = "🌙 Idle";
								break;
						default:
								status = "⚫ Offline";
				}

				// Safe activity check
				const activity =
						presence.activities?.[0]?.name || "Not playing anything";

				const embed = new EmbedBuilder()
						.setTitle(`${user.user.username}'s Profile`)
						.setColor("#f3f3f3")
						.setThumbnail(user.user.displayAvatarURL({ size: 512 }))
						.addFields(
								{
										name: "👤 Username",
										value: user.user.username,
										inline: true
								},
								{
										name: "#️⃣ Discriminator",
										value: `#${user.user.discriminator}`,
										inline: true
								},
								{
										name: "🆔 User ID",
										value: user.user.id
								},
								{
										name: "📡 Status",
										value: status,
										inline: true
								},
								{
										name: "🎮 Activity",
										value: activity,
										inline: true
								},
								{
										name: "🖼 Avatar",
										value: `[Click here](${user.user.displayAvatarURL({ size: 512 })})`
								},
								{
										name: "📅 Account Created",
										value: user.user.createdAt.toLocaleDateString("en-US"),
										inline: true
								},
								{
										name: "📅 Joined Server",
										value: user.joinedAt.toLocaleDateString("en-US"),
										inline: true
								},
								{
										name: "🎭 Roles",
										value:
												user.roles.cache
														.filter((r) => r.id !== message.guild.id)
														.map((role) => role.toString())
														.join(", ") || "No roles",
										inline: false
								}
						)
						.setFooter({
								text: `Requested by ${message.author.tag}`,
								iconURL: message.author.displayAvatarURL()
						})
						.setTimestamp();

				return message.channel.send({ embeds: [embed] });
		}
};
