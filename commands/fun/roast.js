const { EmbedBuilder } = require("discord.js");
const roasts = require("../../JSON/roast.json");

module.exports = {
    name: "roast",
    description: "Roasts people",
    usage: "[username | nickname | mention | ID]",

    run: async (client, message, args) => {

        // Get target
        const member =
            message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]) ||
            message.guild.members.cache.find(r =>
                r.user.username.toLowerCase() === args.join(" ").toLowerCase()
            ) ||
            message.guild.members.cache.find(r =>
                r.displayName.toLowerCase() === args.join(" ").toLowerCase()
            );

        // Pick a random roast line
        const roast = roasts.roast[Math.floor(Math.random() * roasts.roast.length)];

        // No argument → user tries to roast themselves
        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setAuthor({
                    name: message.guild.name,
                    iconURL: message.guild.iconURL()
                })
                .setDescription("Do you really want to roast **yourself**?! 💀")
                .setFooter({
                    text: message.member.displayName,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }

        // If invalid user provided
        if (!member) {
            return message.channel.send("❌ Cannot find that user.");
        }

        // Roast the target
        const embed = new EmbedBuilder()
            .setColor("Random")
            .setAuthor({
                name: member.displayName,
                iconURL: member.user.displayAvatarURL()
            })
            .setDescription(roast)
            .setFooter({ text: "Get roasted 🤪" })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};
