const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");


const Medal =
  require("../../models/Medal");



module.exports = {


  data: new SlashCommandBuilder()

      .setName("medalleaderboard")

      .setDescription(
          "View the medal leaderboard"
      ),





  async run(client, interaction) {



      await interaction.deferReply();







      const users =

          await Medal.find({});






      if (!users || users.length === 0) {


          return interaction.editReply(
              "❌ No medals have been awarded yet."
          );


      }







      const leaderboard =

          users

              .map(user => ({

                  userId:
                      user.userId,


                  username:
                      user.username || "Unknown User",


                  count:
                      user.medals.length

              }))


              .sort(

                  (a, b) =>

                      b.count - a.count

              )

              .slice(0, 10);









      const medals = [

          "🥇",

          "🥈",

          "🥉",

          "🏅",

          "🏅",

          "🏅",

          "🏅",

          "🏅",

          "🏅",

          "🏅"

      ];






      const description =


          leaderboard

              .map((user, index) =>

`
${medals[index]} **${user.username}**

Medals:
**${user.count}**

ID:
${user.userId}
`

              )

              .join("\n");









      const embed =

          new EmbedBuilder()



              .setTitle(
                  "🏆 Medal Leaderboard"
              )



              .setColor(
                  "#D4AF37"
              )



              .setDescription(

                  description.length > 4096

                  ?

                  description.substring(
                      0,
                      4093
                  ) + "..."

                  :

                  description

              )



              .setFooter({

                  text:
                      "USSR Management",

                  iconURL:
                      client.user.displayAvatarURL()

              })



              .setTimestamp();








      return interaction.editReply({

          embeds:
              [
                  embed
              ]

      });



  }


};