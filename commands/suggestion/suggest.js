const { EmbedBuilder } = require("discord.js");
const Suggestion = require("../../models/Suggestion");
const SuggestConfig = require("../../models/SuggestionConfig");

module.exports = {
    name: "suggest",
    category: "suggestion",
    description: "Submit a suggestion",

    run: async (client, message, args) => {

        const text = args.join(" ");

        if (!text) {
            return message.restSend(
                "❌ Please provide a suggestion."
            );
        }


        const guildId = message.guild.id;


        // =====================
        // GET SUGGESTION CHANNEL
        // =====================

        const config = await SuggestConfig.findOne({
            guildId
        });


        if (!config) {
            return message.restSend(
                "❌ No suggestion channel set. Use `setsuggest` first."
            );
        }



        const channel =
            message.guild.channels.cache.get(
                config.channelId
            );


        if (!channel) {
            return message.restSend(
                "❌ Suggestion channel not found."
            );
        }



        // =====================
        // CREATE ID
        // =====================

        const amount =
            await Suggestion.countDocuments({
                guildId
            });


        const suggestionId =
            (amount + 1).toString();



        // =====================
        // SAVE SUGGESTION
        // =====================

        const suggestion =
            new Suggestion({

                guildId,

                id:
                    suggestionId,

                author:
                    message.author.id,

                text,

                status:
                    "pending",

                reply:
                    null,

                staff:
                    null

            });



        await suggestion.save();




        // =====================
        // SEND EMBED
        // =====================

        const embed =
            new EmbedBuilder()

                .setColor("#00bfff")

                .setTitle(
                    "📨 New Suggestion"
                )

                .setDescription(
                    text
                )

                .addFields(

                    {
                        name:
                            "Author",

                        value:
                            `<@${message.author.id}>`

                    },

                    {
                        name:
                            "Status",

                        value:
                            "🟡 Pending"

                    }

                )

                .setFooter({

                    text:
                        `Suggestion ID: ${suggestion.id}`

                })

                .setTimestamp();




        await channel.send({
            embeds:
            [
                embed
            ]
        });



        return message.restSend(
            `✅ Your suggestion has been sent!\n**ID:** ${suggestion.id}`
        );


    }
};  