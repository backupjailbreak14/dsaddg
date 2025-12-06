const ms = require("ms");

module.exports = {
    name: "hack",
    category: "fun",
    description: "Fake-hack someone for fun.",
    usage: "hack @user",

    run: async (client, message, args) => {
        if (!args[0]) {
            return message.restSend("❌ Slow down! Who are we hacking?");
        }

        const target = message.mentions.members.first();
        if (!target) {
            return message.restSend("❌ Please mention a valid user to hack.");
        }

        // Send initial message
        let msg = await message.restSend(`💻 Hacking **${target.displayName}**...`);

        // Animated hacking sequence
        const steps = [
            { delay: "1s",  text: `🔍 Finding **${target.displayName}**'s email & password...` },
            { delay: "6s",  text: `📧 Email: **${target.displayName}@hotmail.com**\n🔑 Password: ••••••••` },
            { delay: "9s",  text: "🌐 Searching for connected accounts..." },
            { delay: "15s", text: "🛠 Launching secondary attack..." },
            { delay: "21s", text: "🏦 Accessing bank account..." },
            { delay: "28s", text: "💰 Bank account breached successfully!" },
            { delay: "31s", text: "📡 Collecting sensitive data..." },
            { delay: "38s", text: "🕵️ Selling information on the black market..." },
            { delay: "41s", text: `✅ Finished hacking **${target.displayName}**!` }
        ];

        for (const step of steps) {
            setTimeout(() => {
                msg.edit(step.text).catch(() => {});
            }, ms(step.delay));
        }
    }
};
