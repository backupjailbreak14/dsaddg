const {
    EmbedBuilder
} = require("discord.js");

const Suggestion =
    require("../../models/Suggestion");


module.exports = {

    name: "reply",

    category: "suggestion",

    description: "Reply to a suggestion",

    usage:
        "reply <messageId> <approve/deny> <message>",

    permissions:
        [
            "MANAGE_GUILD"
        ],


    run: async (client, message, args) => {


        const messageId =
            args[0];


        if (!messageId) {

            return message.restSend(
                "❌ Please provide the suggestion message ID."
            );

        }



        const action =
            args[1];



        if (
            !["approve", "deny"].includes(action)
        ) {

            return message.restSend(
                "❌ Use `approve` or `deny`."
            );

        }



        const replyMessage =
            args.slice(2).join(" ");



        if (!replyMessage) {

            return message.restSend(
                "❌ Please provide a reply message."
            );

        }





        // Find suggestion by Discord message ID

        const suggestion =

            await Suggestion.findOne({

                guildId:
                    message.guild.id,

                messageId:
                    messageId

            });





        if (!suggestion) {

            return message.restSend(
                "❌ Suggestion not found."
            );

        }





        // Update database

        suggestion.status =

            action === "approve"
            ? "approved"
            : "denied";


        suggestion.reply =
            replyMessage;


        suggestion.staff =
            message.author.id;



        await suggestion.save();






        // Get original suggestion embed

        const channel =
            message.guild.channels.cache.get(
                suggestion.channelId
            );


        if (!channel) {

            return message.restSend(
                "❌ Suggestion channel not found."
            );

        }





        const suggestionMsg =

            await channel.messages.fetch(
                messageId
            ).catch(() => null);




        if (!suggestionMsg) {

            return message.restSend(
                "❌ Original suggestion message not found."
            );

        }





        const oldEmbed =
            suggestionMsg.embeds[0];




        const embed =

            EmbedBuilder.from(oldEmbed)

                .setColor(
                    action === "approve"
                    ? "#00ff00"
                    : "#ff0000"
                )

                .addFields(

                    {
                        name:
                            "Status",

                        value:
                            action === "approve"
                            ? "✅ Approved"
                            : "❌ Denied"

                    },

                    {
                        name:
                            "Staff Reply",

                        value:
                            replyMessage

                    },

                    {
                        name:
                            "Reviewed by",

                        value:
                            `<@${message.author.id}>`

                    }

                );





        await suggestionMsg.edit({

            embeds:
            [
                embed
            ]

        });






        return message.restSend(
            `✅ Suggestion **${messageId}** has been **${action}**.`
        );

    }

};