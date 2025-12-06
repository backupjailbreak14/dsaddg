const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
		name: "bans",
		category: "extra",
		description: "Shows how many users are banned in the server.",

		run: async (client, message) => {

				// Check bot permissions
				if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
						return message.restSend({
								content: "❌ I need the **Ban Members** permission to view the ban list."
						});
				}

				try {
						const bans = await message.guild.bans.fetch();

						return message.restSend({
								content: `😳 This server has **${bans.size}** bans! What happened here 💀`
						});

				} catch (err) {
						console.error("BAN FETCH ERROR:", err);

						return message.restSend({
								content: "❌ I couldn't fetch the ban list."
						});
				}
		}
};
