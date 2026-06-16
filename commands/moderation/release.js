const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const Gulag = require("../../models/Gulag");

// IDs
const GULAG_ROLE = "1155599155343925298";
const GULAG_CHANNEL = "1446895095059058729";

const FOOTER_ICON =
    "https://cdn.discordapp.com/attachments/853304828386344970/1004445845405577347/USSRRound-1.png";

module.exports = {
    name: "release",
    category: "moderation",
    description: "Releases a user from the gulag and restores their old roles.",

    run: async (client, message, args) => {

        // ------------------------------
        // USER RESOLVE
        // ------------------------------
        let target = message.mentions.members.first();

        if (!target && args[0]) {
            try {
                target = await message.guild.members.fetch(args[0]);
            } catch {
                return message.restSend("❌ Invalid user ID.");
            }
        }

        if (!target)
            return message.restSend("❌ Mention someone or provide a valid user ID.");

        // ------------------------------
        // ADMIN PROTECT
        // ------------------------------
        if (target.permissions.has(PermissionsBitField.Flags.Administrator))
            return message.restSend("❌ You cannot release an administrator.");

        // ------------------------------
        // LOAD FROM MONGODB
        // ------------------------------
        const data = await Gulag.findOne({ userId: target.id });

        if (!data)
            return message.restSend("❌ This user is not in the gulag database.");

        const oldRoles = data.roles;

        // ------------------------------
        // REMOVE GULAG ROLE
        // ------------------------------
        await target.roles.remove(GULAG_ROLE).catch(() => {});

        // ------------------------------
        // RESTORE OLD ROLES
        // ------------------------------
        try {
            await target.roles.set(oldRoles);
        } catch (err) {
            console.log("Role restore error:", err);
            return message.restSend("⚠️ Could not restore some roles (missing permissions?).");
        }

        // ------------------------------
        // DELETE FROM DB
        // ------------------------------
        await Gulag.deleteOne({ userId: target.id });

        // ------------------------------
        // EMBED LOG
        // ------------------------------
        const gulagChannel = message.guild.channels.cache.get(GULAG_CHANNEL);

        const embed = new EmbedBuilder()
            .setColor("#228b22")
            .setAuthor({ name: "User released." })
            .setDescription(
                `**<@${target.id}> has been released from the gulag.**\n` +
                `May they serve the Soviet Union better this time.`
            )
            .setFooter({ text: "Gulag System", iconURL: FOOTER_ICON });

        if (gulagChannel) {
            await gulagChannel.send({ embeds: [embed] });
        }

        return;
    }
};