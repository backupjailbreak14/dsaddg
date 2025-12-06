require("dotenv").config();

module.exports = (client) => {
    const prompt = process.openStdin();

    client.on("ready", () => {
        console.log("[CONSOLE] Console input activated.");
        console.log("[CONSOLE] Type a message below and press ENTER to send it.");

        prompt.on("data", data => {
            const text = data.toString().trim();
            if (!text) return;

            const channelID = process.env.eventchannel;
            if (!channelID) return console.log("[CONSOLE] No eventchannel in .env");

            const channel = client.channels.cache.get(channelID);
            if (!channel) return console.log("[CONSOLE] Invalid channel: " + channelID);

            channel.send(text)
                .catch(err => console.log("[CONSOLE SEND ERROR]:", err.message));
        });
    });
};
