const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "rolecheck",
    category: "extra",
    description: "Shows information about a specific role.",
    usage: "rolecheck <@role | ID | name>",

    run: async (client, message, args) => {

        if (!args[0]) {
            return message.channel.send("❌ **Please enter a role!**");
        }

        const role =
            message.mentions.roles.first() ||
            message.guild.roles.cache.get(args[0]) ||
            message.guild.roles.cache.find(r =>
                r.name.toLowerCase() === args.join(" ").toLowerCase()
            );

        if (!role) {
            return message.channel.send("❌ **Please enter a valid role!**");
        }

        const status = role.mentionable ? "Yes" : "No";

        const embed = new EmbedBuilder()
            .setColor(role.hexColor || "#2F3136")
            .setTitle(`Role Info: [ ${role.name} ]`)
            .setThumbnail(message.guild.iconURL())
            .addFields(
                { name: "🆔 ID", value: `\`${role.id}\``, inline: true },
                { name: "📛 Name", value: role.name, inline: true },
                { name: "🎨 Hex Color", value: role.hexColor, inline: true },
                { name: "👥 Members", value: `${role.members.size}`, inline: true },
                { name: "📌 Position", value: `${role.position}`, inline: true },
                { name: "🔔 Mentionable", value: status, inline: true }
            )
            .setFooter({
                text: `Requested by ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }
};
