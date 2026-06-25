const { SlashCommandBuilder } = require("discord.js");

const soloMode = require("../../modes/soloMode");
const duelMode = require("../../modes/duelMode");

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
            }

            // START MODES
            if (mode === "solo") {
                return soloMode(interaction);
            }

            if (mode === "duel") {
                return duelMode(interaction, opponent);
            }

        } catch (err) {

            console.error(err);

            return interaction.editReply(
                "❌ Something went wrong while starting the quiz."
            );
        }
    }
};