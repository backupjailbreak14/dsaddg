const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const DmCooldown =
    require("../../models/DmCooldown");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("dmreset")
        
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageRoles
        )

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

            return interaction.reply({
                content:
                    "❌ Only the bot owner can use this command.",
                ephemeral: true
            });

        }


        // ----------------------
        // GET COOLDOWN
        // ----------------------

        let cooldown =
            await DmCooldown.findOne({
                name: "global"
            });


        if (!cooldown) {

            cooldown =
                await DmCooldown.create({

                    name: "global",

                    uses: 0,

                    resetAt:
                        new Date(
                            Date.now()
                            +
                            7 * 24 * 60 * 60 * 1000
                        )

                });

        }


        // ----------------------
        // RESET COOLDOWN
        // ----------------------

        cooldown.uses = 0;

        cooldown.resetAt =
            new Date(
                Date.now()
                +
                7 * 24 * 60 * 60 * 1000
            );

        await cooldown.save();


        // ----------------------
        // EMBED
        // ----------------------

        const embed = new EmbedBuilder()

            .setTitle(
                "🔄 Global DM Cooldown Reset"
            )

            .setColor("#D4AF37")

            .addFields(
                {
                    name: "Reset By",
                    value:
                        `${interaction.user} (${interaction.user.id})`
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

            .setFooter({
                text: "USSR Management",
                iconURL:
                    interaction.client.user.displayAvatarURL()
            })

            .setTimestamp();


        return interaction.reply({
            embeds: [embed]
        });


    }

};