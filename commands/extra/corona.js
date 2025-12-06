const fetch = require("node-fetch");

module.exports = {
		name: "corona",
		category: "extra",
		description: "Shows global COVID statistics.",
		usage: "corona",
		permissions: [],

		run: async (client, message) => {
				try {
						const res = await fetch("https://disease.sh/v3/covid-19/all");
						const data = await res.json();

						if (!data || data.cases === undefined) {
								return message.restSend({ content: "❌ Could not fetch COVID data." });
						}

						const reply =
								"**🌍 Global COVID-19 Stats**\n" +
								`• **Cases:** ${data.cases.toLocaleString()}\n` +
								`• **Deaths:** ${data.deaths.toLocaleString()}\n` +
								`• **Recovered:** ${data.recovered.toLocaleString()}\n` +
								`• **Active:** ${data.active.toLocaleString()}`;

						message.restSend({ content: reply });

				} catch (err) {
						console.error(err);
						message.restSend({ content: "❌ Error fetching COVID data." });
				}
		}
};
