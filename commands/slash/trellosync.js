const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const {
  syncTrelloAwards
} = require("../../utils/trelloAwardSync");


module.exports = {

  data: new SlashCommandBuilder()

      .setName("trellosync")

      .setDescription(
          "Manually sync awards from Trello"
      ),


  async run(client, interaction) {


      if (
          interaction.user.id !== process.env.ownerID
      ) {

          return interaction.reply({

              content:
                  "❌ You cannot use this command.",

              ephemeral:
                  true

          });

      }


      await interaction.deferReply({

          ephemeral:
              true

      });


      try {


          await syncTrelloAwards(

              client,

              interaction.guild.id

          );


          await interaction.editReply({

              content:
                  "✅ Trello awards sync completed."

          });


      }
      catch(error) {


          console.error(
              error
          );


          await interaction.editReply({

              content:
                  `❌ Trello sync failed:\n${error.message}`

          });

      }

  }

};