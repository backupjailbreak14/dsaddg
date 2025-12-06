module.exports = {
		name: "emojify",
		aliases: ["emoji"],
		category: "fun",
		description: "Converts your text into emojis.",
		timeout: 10000,
		usage: "emojify <text>",

		run: async (client, message, args) => {

				if (!args[0]) {
						return message.restSend("❌ Please provide text to emojify.");
				}

				const specialChars = {
						'0': ':zero:',
						'1': ':one:',
						'2': ':two:',
						'3': ':three:',
						'4': ':four:',
						'5': ':five:',
						'6': ':six:',
						'7': ':seven:',
						'8': ':eight:',
						'9': ':nine:',
						'#': ':hash:',
						'*': ':asterisk:',
						'?': ':grey_question:',
						'!': ':grey_exclamation:',
						' ': '   '
				};

				const emojified = args
						.join(" ")
						.toLowerCase()
						.split("")
						.map(letter => {
								if (/[a-z]/.test(letter)) {
										return `:regional_indicator_${letter}: `;
								} else if (specialChars[letter]) {
										return `${specialChars[letter]} `;
								}
								return letter;
						})
						.join("");

				// Discord max message size
				if (emojified.length > 2000) {
						return message.restSend("❌ The emojified message exceeds **2000 characters**.");
				}

				return message.restSend(emojified);
		}
};
