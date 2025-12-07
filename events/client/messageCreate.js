module.exports = async (client, message) => {

    // Prevent duplicate registrations
    if (client._messageCreateLoaded) return;
    client._messageCreateLoaded = true;

    // Ignore bot messages
    if (message.author.bot) return;

    // Ensure restSend helper exists
    if (!message.restSend) {
        message.restSend = (payload) => {
            if (typeof payload === "string") {
                return message.channel.send({ content: payload });
            }
            return message.channel.send(payload);
        };
    }

    const PREFIX = client.prefix;

    // PING RESPONSES
    if (!message.content.startsWith(PREFIX) && message.mentions.users.size === 1) {
        const id = message.mentions.users.first().id;

        if (client.pingResponses?.has(id)) {
            const data = client.pingResponses.get(id);
            return message.restSend({
                content: data.content,
                files: data.files
            });
        }
    }

    // SPECIAL TRIGGERS
    if (client.specialTriggers?.[message.content]) {
        return message.restSend(client.specialTriggers[message.content]);
    }

    // COMMAND HANDLER
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
    const cmdName = args.shift()?.toLowerCase();
    if (!cmdName) return;

    let cmd =
        client.commands.get(cmdName) ||
        client.commands.get(client.aliases.get(cmdName));

    if (!cmd) return;

    // PERMISSION CHECK
    if (cmd.permissions && Array.isArray(cmd.permissions)) {
        const needed = cmd.permissions
            .map((p) => client.permissionMap[p])
            .filter(Boolean);

        if (needed.length && !message.member.permissions.has(needed)) {
            return message.restSend(
                `❌ You need **${cmd.permissions.join(", ")}** to use this command.`
            );
        }
    }

    // COOLDOWN
    const now = Date.now();
    const key = `${cmd.name}-${message.author.id}`;
    const timeout = cmd.timeout || 0;

    if (timeout > 0) {
        const last = client.cooldowns.get(key) || 0;
        const diff = now - last;
        if (diff < timeout) {
            const sec = Math.ceil((timeout - diff) / 1000);
            return message.restSend(
                `⏳ Please wait **${sec}s** before using \`${cmd.name}\` again.`
            );
        }
        client.cooldowns.set(key, now);
    }

    // EXECUTE COMMAND
    try {
        await cmd.run(client, message, args);
    } catch (err) {
        console.error("❌ Command error:", err);
        message.restSend("⚠️ An error occurred while running that command.");
    }
};
