const {
    SlashCommandBuilder
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
            process.env.OWNER_ID
        ) {

            return interaction.reply({
                content:
                    "❌ Only the bot owner can reset the DM cooldown.",
                ephemeral: false
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