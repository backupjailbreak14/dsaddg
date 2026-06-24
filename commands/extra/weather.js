const {
  EmbedBuilder
} = require("discord.js");


const API_KEY =
  process.env.WEATHERSTACK_KEY;



module.exports = {

  name: "weather",

  category: "utility",

  description: "Get weather information.",

  usage: "weather <city>",


  run: async (client, message, args) => {


      const place =
          args.join(" ");



      if (!place) {

          return message.restSend(
              "❌ Please provide a city."
          );

      }



      const response =
          await getWeather(place);



      if (typeof response === "string") {

          return message.restSend(
              response
          );

      }



      return message.channel.send(
          response
      );


  }


};





async function getWeather(place) {


  try {


      const url =
          `http://api.weatherstack.com/current?access_key=${API_KEY}&query=${encodeURIComponent(place)}`;



      const res =
          await fetch(url);



      const json =
          await res.json();




      if (!json.request) {


          return `❌ No city found matching \`${place}\``;


      }




      const current =
          json.current;


      const location =
          json.location;



      const embed =

          new EmbedBuilder()


              .setTitle(
                  "🌤️ Weather Information"
              )


              .setColor(
                  "#00bfff"
              )


              .setThumbnail(
                  current.weather_icons?.[0]
              )


              .addFields(

                  {
                      name:
                          "🏙️ City",

                      value:
                          location.name || "Unknown",

                      inline:true
                  },


                  {
                      name:
                          "🌍 Country",

                      value:
                          location.country || "Unknown",

                      inline:true
                  },


                  {
                      name:
                          "📍 Region",

                      value:
                          location.region || "Unknown",

                      inline:true
                  },


                  {
                      name:
                          "☁️ Condition",

                      value:
                          current.weather_descriptions?.[0] || "Unknown",

                      inline:true
                  },


                  {
                      name:
                          "🌡️ Temperature",

                      value:
                          `${current.temperature}°C`,

                      inline:true
                  },


                  {
                      name:
                          "💧 Humidity",

                      value:
                          `${current.humidity}%`,

                      inline:true
                  },


                  {
                      name:
                          "💨 Wind",

                      value:
                          `${current.wind_speed} km/h ${current.wind_dir}`,

                      inline:true
                  },


                  {
                      name:
                          "🌧️ Rain",

                      value:
                          `${current.precip} mm`,

                      inline:true
                  },


                  {
                      name:
                          "👁️ Visibility",

                      value:
                          `${current.visibility} km`,

                      inline:true
                  },


                  {
                      name:
                          "☀️ UV Index",

                      value:
                          `${current.uv_index}`,

                      inline:true
                  },


                  {
                      name:
                          "🕒 Local Time",

                      value:
                          location.localtime || "Unknown",

                      inline:true
                  }

              )


              .setFooter({

                  text:
                      `Last checked: ${current.observation_time} GMT`

              })


              .setTimestamp();



      return {

          embeds:[
              embed
          ]

      };



  } catch(err) {


      console.error(
          "Weather API error:",
          err
      );


      return "❌ Weather service unavailable.";

  }


}