module.exports = {
		name: "ping",
		category: "info",
		description: "Returns the bot latency.",
		usage: "ping",
		permissions: [],

		run: async (client, message) => {
				const msg = await message.restSend({ content: "Pinging..." });

				const botPing = msg.createdTimestamp - message.createdTimestamp;
				const apiPing = client.ws.ping;

				return msg.edit(
						`🏓 **Pong!**\n` +
						`Bot Latency: **${botPing}ms**\n` +
						`API Latency: **${apiPing}ms**`
				);
		}
};
