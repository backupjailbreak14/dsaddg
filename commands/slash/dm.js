const {
  SlashCommandBuilder,
  PermissionsBitField
} = require("discord.js");


module.exports = {

  name: "dm",

  slash: new SlashCommandBuilder()
      .setName("dm")
      .setDescription("Send a DM to a user.")

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


  run: async (client, interaction) => {


      if (
          !interaction.member.permissions.has(
              PermissionsBitField.Flags.ManageMessages
          )
      ) {

          return interaction.reply({
              content:
                  "❌ You need Manage Messages permission.",
              ephemeral: true
          });

      }


      const user =
          interaction.options.getUser("user");


      const message =
          interaction.options.getString("message");



      try {

          await user.send(
              `📩 **Message from ${interaction.user.tag}:**\n\n${message}`
          );


          return interaction.reply({
              content:
                  `✅ DM sent successfully!\n\n` +
                  `Recipient: ${user.tag}`,
              ephemeral:true
          });


      } catch(err) {


          return interaction.reply({
              content:
                  `❌ Could not DM ${user.tag}.\n` +
                  `They may have DMs disabled.`,
              ephemeral:true
          });


      }

  }

};