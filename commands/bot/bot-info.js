const { EmbedBuilder } = require("discord.js");
const os = require("os");

module.exports = {
		name: "bot-info",
		category: "bot",

		run: async (client, message, args) => {

				const embed = new EmbedBuilder()
						.setThumbnail(client.user.displayAvatarURL())
						.setTitle("🤖 Bot Stats")
						.setColor("#000000")
						.addFields(
								{
										name: "🌐 Servers",
										value: `Serving **${client.guilds.cache.size}** servers.`,
										inline: true
								},
								{
										name: "📺 Channels",
										value: `Serving **${client.channels.cache.size}** channels.`,
										inline: true
								},
								{
										name: "👥 Cached Users",
										value: `${client.users.cache.size} users`,
										inline: true
								},
								{
										name: "⏳ Ping",
										value: `${Math.round(client.ws.ping)}ms`,
										inline: true
								},
								{
										name: "📅 Bot Created",
										value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:D>`,
										inline: true
								},
								{
										name: "🖥️ Host Hardware",
										value: `CPU Cores: **${os.cpus().length}**`,
										inline: true
								}
						)
						.setFooter({
								text: `Requested by ${message.author.tag}`,
								iconURL: message.author.displayAvatarURL()
						});

				return message.channel.send({ embeds: [embed] });
		}
};
