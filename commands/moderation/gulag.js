const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const Gulag = require("../../models/gulag");

const GULAG_ROLE = "1155599155343925298";
const GULAG_CHANNEL = "1446895095059058729";

const ARREST_IMAGE =
  "https://media.discordapp.net/attachments/853304828386344970/1446898430675910827/content.png";

const FOOTER_ICON =
  "https://cdn.discordapp.com/attachments/853304828386344970/1004445845405577347/USSRRound-1.png";

module.exports = {
    name: "gulag",
    category: "moderation",

    run: async (client, message, args) => {

        let target = message.mentions.members.first();

        if (!target && args[0]) {
            try {
                target = await message.guild.members.fetch(args[0]);
            } catch {
                return message.restSend("❌ Invalid user.");
            }
        }

        if (!target) {
            return message.restSend("❌ Mention a user or provide ID.");
        }

        if (target.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.restSend("❌ You cannot gulag an admin.");
        }

        if (target.id === message.author.id) {
            return message.restSend("❌ You cannot gulag yourself.");
        }

        // ------------------------------
        // 🔥 SAVE ROLES IN MONGODB
        // ------------------------------
        await Gulag.findOneAndUpdate(
            { userId: target.id },
            {
                userId: target.id,
                roles: target.roles.cache.map(r => r.id)
            },
            { upsert: true, new: true }
        );

        // ------------------------------
        // 🔥 REMOVE ROLES + ADD GULAG ROLE
        // ------------------------------
        await target.roles.set([]);
        await target.roles.add(GULAG_ROLE);

        // ------------------------------
        // EMBEDS
        // ------------------------------
        const embed1 = new EmbedBuilder()
            .setImage(ARREST_IMAGE)
            .setColor("#8b0000");

        const embed2 = new EmbedBuilder()
            .setColor("#8b0000")
            .setAuthor({ name: "User imprisoned." })
            .setDescription(
                `**<@${target.id}> has been sent to the gulag.**`
            )
            .setFooter({ text: "Gulag System", iconURL: FOOTER_ICON });

        await message.channel.send({ embeds: [embed1, embed2] });

        const gulagChannel = message.guild.channels.cache.get(GULAG_CHANNEL);
        if (gulagChannel) {
            gulagChannel.send(`🔒 <@${target.id}> has been imprisoned.`);
        }
    }
};