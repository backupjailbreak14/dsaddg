module.exports = {
    name: "clapify",
    aliases: ["clap"],
    category: "fun",
    description: "Adds 👏 emojis between the words or characters of your text.",
    usage: "clapify <text>",
    timeout: 10000,

    run: async (client, message, args) => {

        if (!args[0]) {
            return message.restSend("❌ Please provide text to clapify.");
        }

        const txt = args.join(" ");

        let result;

        // If text contains spaces → clap between words
        if (/\s/.test(txt)) {
            result = args.join(" 👏 ");
        } else {
            // No spaces → clap between each character
            result = txt.split("").join(" 👏 ");
        }

        return message.restSend(`${result} 👏`);
    }
};
