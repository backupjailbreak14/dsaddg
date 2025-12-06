module.exports = {
		name: "serverinfo",
		category: "extra",
		description: "Shows server info.",
		usage: "serverinfo",
		permissions: [],

		run: async (client, message) => {
				const guild = message.guild;

				const info =
						"**📡 Server Information**\n" +
						`• **Name:** ${guild.name}\n` +
						`• **ID:** ${guild.id}\n` +
						`• **Members:** ${guild.memberCount}\n` +
						`• **Owner:** <@${guild.ownerId}>\n` +
						`• **Created:** ${guild.createdAt.toDateString()}`;

				message.restSend({ content: info });
		}
};
