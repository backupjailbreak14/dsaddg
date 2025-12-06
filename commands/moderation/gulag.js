const fs = require("fs");
const path = require("path");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");

const STORAGE = path.join(__dirname, "../../utils/gulag.json");

const GULAG_ROLE = "1155599155343925298";
const GULAG_CHANNEL = "1446895095059058729";

// 🔥 Originele afbeeldingen zoals jij ze had
const ARREST_IMAGE =
  "https://media.discordapp.net/attachments/853304828386344970/1446898430675910827/content.png?ex=6935a8ab&is=6934572b&hm=1ac4a8b446ddaac76b8c4ebdf293971438c95374ab603ff7804ffe778bc46615&=&format=webp&quality=lossless&width=982&height=552";

const FOOTER_ICON =
  "https://cdn.discordapp.com/attachments/853304828386344970/1004445845405577347/USSRRound-1.png?ex=69351557&is=6933c3d7&hm=e517308a274fcccf5ee054cceb572b34352729880e3f733679334ad212155f69&";

module.exports = {
    name: "gulag",
    category: "moderation",
    description: "Sends a user to the gulag.",
    usage: "gulag @user | gulag <userID>",
    permissions: ["MANAGE_ROLES"],

    run: async (client, message, args) => {

        // ------------------------------
        // 🔍 USER VIA MENTION OF VIA ID
        // ------------------------------
        let target = message.mentions.members.first();

        if (!target && args[0]) {
            // probeer ID lookup
            try {
                target = await message.guild.members.fetch(args[0]);
            } catch (err) {
                return message.restSend("❌ Invalid user ID.");
            }
        }

        if (!target) {
            return message.restSend("❌ Mention a user or provide a valid user ID.");
        }

        // ------------------------------
        // 🔥 ADMIN PROTECTIE
        // ------------------------------
        if (target.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.restSend("❌ You cannot gulag an administrator.");
        }

        if (target.id === message.author.id) {
            return message.restSend("❌ You cannot gulag yourself.");
        }

        // ------------------------------
        // 📁 LOAD & SAVE ROLE DATABASE
        // ------------------------------
        let db = {};
        if (fs.existsSync(STORAGE)) db = JSON.parse(fs.readFileSync(STORAGE));

        // save zijn oude rollen
        db[target.id] = target.roles.cache.map(r => r.id);
        fs.writeFileSync(STORAGE, JSON.stringify(db, null, 2));

        // ------------------------------
        // 🔥 ROLLEN VERWIJDEREN + GULAG ROLE GEVEN
        // ------------------------------
        await target.roles.set([]);
        await target.roles.add(GULAG_ROLE);

        // ------------------------------
        // 📌 EMBEDS ZENDEN IN CMD CHANNEL
        // ------------------------------
        const embed1 = new EmbedBuilder()
            .setImage(ARREST_IMAGE)
            .setColor("#8b0000");

        const embed2 = new EmbedBuilder()
            .setColor("#8b0000")
            .setAuthor({ name: "User imprisoned." })
            .setDescription(
                `**<@${target.id}> has been sent to the gulag.**\n` +
                `Glory to the Soviet Union.`
            )
            .setFooter({ text: "Gulag Management", iconURL: FOOTER_ICON });

        await message.channel.send({ embeds: [embed1, embed2] });

        // ------------------------------
        // 📌 KORT GULAG BERICHT IN GULAG CHANNEL
        // ------------------------------
        const gulagChannel = message.guild.channels.cache.get(GULAG_CHANNEL);
        if (gulagChannel) {
            await gulagChannel.send(`🔒 <@${target.id}> has been imprisoned.`);
        }

        // klaar
        return;
    }
};
