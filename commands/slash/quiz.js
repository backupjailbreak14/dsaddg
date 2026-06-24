const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");


const questions =
  require("../../data/sovietQuiz");


const QuizStats =
  require("../../models/QuizStats");



module.exports = {


  data: new SlashCommandBuilder()

      .setName("quiz")

      .setDescription(
          "Play the Soviet Union quiz"
      ),




  async run(client, interaction) {


      const question =
          questions[
              Math.floor(
                  Math.random() * questions.length
              )
          ];



      const buttons =
          new ActionRowBuilder();



      question.answers.forEach(
          (answer, index) => {


              buttons.addComponents(

                  new ButtonBuilder()

                      .setCustomId(
                          `quiz_${index}`
                      )

                      .setLabel(
                          answer
                      )

                      .setStyle(
                          ButtonStyle.Primary
                      )

              );


          }
      );





      const embed =

          new EmbedBuilder()

              .setTitle(
                  "🇷🇺 Soviet Union Quiz"
              )

              .setColor(
                  "#D4AF37"
              )

              .setDescription(

`
**Category**
${question.category}


**Question**

${question.question}
`

              )

              .setFooter({

                  text:
                  "USSR Quiz"

              });






      const message =

          await interaction.reply({

              embeds:
              [
                  embed
              ],

              components:
              [
                  buttons
              ],

              fetchReply: true

          });







      const collector =

          message.createMessageComponentCollector({

              time:
              30000

          });






      collector.on(

          "collect",

          async i => {



              if (

                  i.user.id !== interaction.user.id

              ) {


                  return i.reply({

                      content:
                      "❌ This quiz is not for you.",

                      ephemeral:true

                  });


              }





              const selected =

                  Number(

                      i.customId.replace(
                          "quiz_",
                          ""
                      )

                  );






              const correct =

                  selected === question.correct;






              let data =

                  await QuizStats.findOne({

                      userId:
                      interaction.user.id

                  });






              if (!data) {


                  data =

                      new QuizStats({

                          userId:
                          interaction.user.id,


                          username:
                          interaction.user.username

                      });


              }






              data.username =
                  interaction.user.username;



              data.gamesPlayed += 1;

              data.questionsAnswered += 1;



              if (correct) {


                  data.correctAnswers += 1;

                  data.totalPoints += 1;


              }

              else {


                  data.wrongAnswers += 1;


              }




              data.lastPlayed =
                  new Date();





              await data.save();






              const resultEmbed =

                  new EmbedBuilder()

                      .setTitle(

                          correct

                          ?

                          "✅ Correct!"

                          :

                          "❌ Wrong!"

                      )


                      .setColor(

                          correct

                          ?

                          "Green"

                          :

                          "Red"

                      )


                      .setDescription(

`
**Question**

${question.question}


**Correct answer**

${question.answers[question.correct]}


**Your answer**

${question.answers[selected]}


⭐ Points earned: ${correct ? "1" : "0"}
`

                      );






              await i.update({

                  embeds:
                  [
                      resultEmbed
                  ],

                  components:
                  []

              });





              collector.stop();


          }

      );



  }


};