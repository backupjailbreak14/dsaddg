const {
  EmbedBuilder
} = require("discord.js");


module.exports = {

  name: "howgay",

  category: "fun",

  description: "Show how gay someone is.",

  usage: "howgay <user>",


  run: async (client, message, args) => {


      const member =

          message.mentions.members.first()

          ||

          message.guild.members.cache.get(args[0])

          ||

          message.member;



      const result =
          Math.floor(Math.random() * 101);



      const embed =

          new EmbedBuilder()


              .setColor("#ff69b4")


              .setTitle(
                  "🏳️‍🌈 Gay Machine"
              )


              .setDescription(

                  `${member.user.username} is **${result}%** gay 🏳️‍🌈`

              )


              .setFooter({

                  text:
                      `Requested by ${message.author.username}`

              })


              .setTimestamp();



      return message.channel.send({

          embeds: [
              embed
          ]

      });


  }

};