const fs = require("fs");
const path = require("path");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");

const STORAGE = path.join(__dirname, "../../utils/gulag.json");

// IDs
const GULAG_ROLE = "1155599155343925298";
const GULAG_CHANNEL = "1446895095059058729";

// Footer icon
const FOOTER_ICON =
    "https://cdn.discordapp.com/attachments/853304828386344970/1004445845405577347/USSRRound-1.png?ex=69351557&is=6933c3d7&hm=e517308a274fcccf5ee054cceb572b34352729880e3f733679334ad212155f69&";

module.exports = {
    name: "release",
    category: "moderation",
    description: "Releases a user from the gulag and restores their old roles.",
    usage: "release @user | release <userID>",
    permissions: ["MANAGE_ROLES"],

    run: async (client, message, args) => {

        // ------------------------------
        // 🔍 USER VIA MENTION OF VIA ID
        // ------------------------------
        let target = message.mentions.members.first();

        if (!target && args[0]) {
            try {
                target = await message.guild.members.fetch(args[0]);
            } catch (err) {
                return message.restSend("❌ Invalid user ID.");
            }
        }

        if (!target)
            return message.restSend("❌ Mention someone or provide a valid user ID.");

        // ------------------------------
        // ❌ Admin protectie
        // ------------------------------
        if (target.permissions.has(PermissionsBitField.Flags.Administrator))
            return message.restSend("❌ You cannot release an administrator.");

        // ------------------------------
        // 📁 DATABASE LADEN
        // ------------------------------
        if (!fs.existsSync(STORAGE))
            return message.restSend("❌ No gulag data file found.");

        const db = JSON.parse(fs.readFileSync(STORAGE));

        if (!db[target.id])
            return message.restSend("❌ This user is not stored in the gulag records.");

        const oldRoles = db[target.id];

        // ------------------------------
        // 🔥 REMOVE GULAG ROLE
        // ------------------------------
        await target.roles.remove(GULAG_ROLE).catch(() => {});

        // ------------------------------
        // ♻️ RESTORE OLD ROLES
        // ------------------------------
        try {
            await target.roles.set(oldRoles);
        } catch (err) {
            console.log("Role error:", err);
            return message.restSend("⚠️ Could not restore some roles (missing permissions?).");
        }

        // Remove from DB
        delete db[target.id];
        fs.writeFileSync(STORAGE, JSON.stringify(db, null, 2));

        // ------------------------------
        // 📢 Stuur embed naar gulag channel
        // ------------------------------
        const gulagChannel = message.guild.channels.cache.get(GULAG_CHANNEL);

        const embed = new EmbedBuilder()
            .setColor("#228b22")
            .setAuthor({ name: "User released." })
            .setDescription(
                `**<@${target.id}> has been released from the gulag.**\n` +
                `May they serve the Soviet Union better this time.`
            )
            .setFooter({ text: "Gulag Management", iconURL: FOOTER_ICON });

        if (gulagChannel) {
            await gulagChannel.send({ embeds: [embed] });
        }

        return;
    }
};
