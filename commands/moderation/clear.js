module.exports = {
		name: "clear",
		aliases: ["purge"],
		category: "moderation",
		description: "Delete messages in bulk.",
		usage: "clear <amount>",
		permissions: ["MANAGE_MESSAGES"],

		run: async (client, message, args) => {

				// ✅ Delete the user's command message
				message.delete().catch(() => {});

				const amount = parseInt(args[0]);

				if (!amount || amount < 1 || amount > 100) {
						return message.channel.send({
								content: "❌ Choose a number between **1** and **100**."
						}).then(msg => {
								setTimeout(() => msg.delete().catch(() => {}), 5000);
						});
				}

				try {
						await message.channel.bulkDelete(amount, true);

						// Send confirmation → auto delete
						return message.channel.send({
								content: `🧹 Purged **${amount}** messages.`
						}).then(msg => {
								setTimeout(() => msg.delete().catch(() => {}), 5000);
						});

				} catch (err) {
						console.error("Bulk delete failed:", err);

						return message.channel.send({
								content: "❌ I couldn't delete messages here."
						}).then(msg => {
								setTimeout(() => msg.delete().catch(() => {}), 5000);
						});
				}
		}
};
