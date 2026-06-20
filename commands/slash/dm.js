const {
    SlashCommandBuilder
} = require("discord.js");

module.exports = {
    name: "dm",

    data: new SlashCommandBuilder()
        .setName("dm")
        .setDescription("Send a DM to a user")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to DM")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("Message to send")
                .setRequired(true)
        ),

    async run(client, interaction) {

        const user = interaction.options.getUser("user");
        const message = interaction.options.getString("message");

        try {

            await user.send(message);

            await interaction.reply({
                content: "✅ DM sent.",
                ephemeral: true
            });

        } catch(err) {

            console.error(err);

            await interaction.reply({
                content: "❌ Could not send DM.",
                ephemeral: true
            });

        }
    }
};