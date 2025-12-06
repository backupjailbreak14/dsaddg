module.exports = {
		name: "slowmode",
		category: "moderation",
		description: "Set slowmode for a channel.",
		usage: "slowmode <seconds>",
		permissions: ["MANAGE_CHANNELS"],

		run: async (client, message, args) => {
				const sec = parseInt(args[0]);
				if (!sec || sec < 0 || sec > 21600) {
						return message.restSend({
								content: "❌ Choose between **0–21600 seconds**."
						});
				}

				await message.channel.setRateLimitPerUser(sec);

				return message.restSend({
						content: `⏳ Slowmode set to **${sec} seconds**.`
				});
		}
};
