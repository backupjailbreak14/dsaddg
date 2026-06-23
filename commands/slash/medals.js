const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");


const Medal =
  require("../../models/Medal");



module.exports = {


  data: new SlashCommandBuilder()

      .setName("medals")

      .setDescription(
          "View medals of a user"
      )


      .addStringOption(option =>

          option
              .setName("user")
              .setDescription(
                  "User mention or Discord ID (optional)"
              )

      ),





  async run(client, interaction) {



      await interaction.deferReply();






      // =====================
      // GET TARGET USER
      // =====================


      const input =

          interaction.options.getString(
              "user"
          );



      let targetId;





      if (input) {


          // Check permission when viewing others

          if (

              !interaction.member.permissions.has(
                  PermissionFlagsBits.ManageRoles
              )

              &&

              interaction.user.id !== process.env.OWNER_ID

          ) {


              return interaction.editReply(
                  "❌ You cannot view other users' medals."
              );


          }





          targetId =

              input.replace(
                  /\D/g,
                  ""
              );





          if (!targetId) {


              return interaction.editReply(
                  "❌ Invalid user ID."
              );


          }



      } else {


          targetId =
              interaction.user.id;


      }







      // =====================
      // FIND MEDALS
      // =====================


      const data =

          await Medal.findOne({

              userId:
                  targetId

          });







      if (!data || data.medals.length === 0) {


          return interaction.editReply(
              "❌ This user has no medals."
          );


      }







      // =====================
      // USERNAME
      // =====================


      let username =
          data.username;





      if (!username) {


          try {


              const user =
                  await client.users.fetch(
                      targetId
                  );


              username =
                  user.username;



          } catch {


              username =
                  "Unknown User";


          }


      }








      // =====================
      // BUILD MEDAL LIST
      // =====================


      const medalText =

          data.medals

              .map(medal => {


                  let text =
`
🏅 **${medal.name}**

Category:
${medal.category || "Unknown"}

Reason:
${medal.reason || "No reason provided"}

Awarded by:
${medal.awardedBy?.username || "Unknown"}

Date:
<t:${Math.floor(
  new Date(
      medal.awardedAt
  ).getTime() / 1000
)}:d>
`;


                  return text;


              })

              .join("\n");







      const embed =

          new EmbedBuilder()



              .setTitle(
                  "🏅 Medal Record"
              )



              .setColor(
                  "#D4AF37"
              )



              .setDescription(
`
**User**
${username}

**User ID**
${targetId}

**Total Medals**
${data.medals.length}
`
              )



              .addFields({

                  name:
                      "Awards",

                  value:

                      medalText.length > 1024

                      ?

                      medalText.substring(
                          0,
                          1021
                      ) + "..."

                      :

                      medalText


              })



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