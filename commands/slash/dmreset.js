const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const DmCooldown =
    require("../../models/DmCooldown");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("dmreset")

        .setDescription(
            "Reset the global DM cooldown"
        ),



    async run(client, interaction) {


        // ----------------------
        // OWNER CHECK
        // ----------------------

        if (
            interaction.user.id !==
            process.env.ownerID
        ) {

            const embed = new EmbedBuilder()

                .setTitle("🔄 Global DM Cooldown Reset")

                .setDescription(
            `The global DM cooldown has been reset successfully.`
                )

                .addFields(
                    {
                        name: "Reset by",
                        value: `${interaction.user} (${interaction.user.id})`
                    },
                    {
                        name: "New Usage",
                        value: "0/2"
                    },
                    {
                        name: "Next Reset",
                        value:
            `<t:${Math.floor(
            cooldown.resetAt.getTime() / 1000
            )}:R>`
                    }
                )
                .setColor("#D4AF37")
                .setFooter({
                    text: "USSR Management",
                    iconURL: interaction.client.user.displayAvatarURL()
                })

                .setTimestamp();


            return interaction.editReply({
                embeds: [embed]
            });

        }



        // ----------------------
        // RESET COOLDOWN
        // ----------------------

        let cooldown =
            await DmCooldown.findOne({
                name: "global"
            });



        if (!cooldown) {


            return interaction.reply({
                content:
                    "ℹ️ No cooldown exists.",
                ephemeral: true
            });

        }



        cooldown.uses = 0;


        cooldown.resetAt =
            new Date(
                Date.now()
                +
                7 * 24 * 60 * 60 * 1000
            );



        await cooldown.save();



        return interaction.reply(
`✅ Global DM cooldown has been reset.

Used:
${cooldown.uses}/2

Next reset:
<t:${Math.floor(
cooldown.resetAt.getTime() / 1000
)}:R>`
        );


    }

};