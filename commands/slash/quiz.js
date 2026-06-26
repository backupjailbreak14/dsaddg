const { SlashCommandBuilder } = require("discord.js");

const soloMode = require("../../modes/soloMode");
const duelMode = require("../../modes/duelMode");
const {
    isInDuel,
    addDuel,
    removeDuel
} = require("../../utils/activeDuels");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("quiz")
        .setDescription("Play Soviet Quiz")
        .addStringOption(option =>
            option.setName("mode")
                .setDescription("Game mode")
                .setRequired(true)
                .addChoices(
                    { name: "Solo", value: "solo" },
                    { name: "Duel", value: "duel" }
                )
        )
        .addUserOption(option =>
            option.setName("opponent")
                .setDescription("Opponent for duel mode")
                .setRequired(false)
        ),

    async run(client, interaction) {

        await interaction.deferReply();

        try {

            const mode = interaction.options.getString("mode");
            const opponent = interaction.options.getUser("opponent");

            // ❌ SELF DUEL CHECK
            if (mode === "duel") {

                if (!opponent) {
                    return interaction.editReply("❌ You must mention an opponent for duel mode!");
                }

                if (opponent.bot) {
                    return interaction.editReply("❌ You cannot duel a bot!");
                }

                if (opponent.id === interaction.user.id) {
                    return interaction.editReply("❌ You cannot duel yourself!");
                }
                if (
                    isInDuel(interaction.user.id) ||
                    isInDuel(opponent.id)
                ) {
                    return interaction.editReply(
                        "❌ One of the players is already in an active duel."
                    );
                }
            }

            // START MODES
            if (mode === "solo") {
                return soloMode(interaction);
            }

            if (mode === "duel") {

                const {
                    ActionRowBuilder,
                    ButtonBuilder,
                    ButtonStyle,
                    EmbedBuilder
                } = require("discord.js");


                const row = new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId("duel_accept")
                            .setLabel("✅ Accept")
                            .setStyle(ButtonStyle.Success),

                        new ButtonBuilder()
                            .setCustomId("duel_decline")
                            .setLabel("❌ Decline")
                            .setStyle(ButtonStyle.Danger)

                    );


                const embed = new EmbedBuilder()
                    .setTitle("⚔️ Soviet Quiz Duel Challenge")
                    .setColor("#D4AF37")
                    .setDescription(
            `
            ${interaction.user.username} challenged ${opponent.username} to a duel!

            ${opponent.username}, do you accept?
            `
                    );
                
                addDuel(
                    interaction.user.id,
                    opponent.id
                );


                await interaction.editReply({

                    embeds: [embed],
                    components: [row]

                });


                const collector =
                    interaction.channel.createMessageComponentCollector({

                        time: 30000

                    });


                collector.on("collect", async i => {


                    // Only opponent can respond
                    if (i.user.id !== opponent.id) {

                        return i.reply({

                            content: "❌ This challenge is not for you.",
                            ephemeral: true

                        });

                    }


                    if (i.customId === "duel_accept") {

                        collector.stop();

                        addDuel(
                            interaction.user.id,
                            opponent.id
                        );

                        await i.update({
                            content: "⚔️ Duel accepted!",
                            embeds: [],
                            components: []
                        });


                        duelMode(
                            interaction,
                            opponent
                        );

                    }


                    if (i.customId === "duel_decline") {


                        collector.stop();


                        removeDuel(
                            interaction.user.id,
                            opponent.id
                        );


                        await i.update({

                            content: "❌ Duel declined.",
                            embeds: [],
                            components: []

                        });

                    }


                });


                collector.on("end", async (_, reason) => {

                    if (reason === "time") {

                        removeDuel(
                            interaction.user.id,
                            opponent.id
                        );

                        await interaction.editReply({

                            content:
                            "⌛ Duel request expired.",

                            embeds: [],

                            components: []

                        });

                    }

                });

            }

        } catch (err) {

            console.error(err);

            return interaction.editReply(
                "❌ Something went wrong while starting the quiz."
            );
        }
    }
};