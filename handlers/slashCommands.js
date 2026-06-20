const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");


module.exports = async (client) => {


    const commands = [];


    const folder =
        path.join(__dirname, "../commands/slash");


    const files =
        fs.readdirSync(folder);



    for (const file of files) {


        const command =
            require(`${folder}/${file}`);


        if (command.slash) {

            commands.push(
                command.slash.toJSON()
            );

        }

    }



    const rest = new REST({
        version:"10"
    }).setToken(process.env.BOT_TOKEN);



    try {


        await rest.put(

            Routes.applicationCommands(
                client.user.id
            ),

            {
                body: commands
            }

        );


        console.log(
            "✅ Slash commands registered"
        );


    } catch(err) {


        console.error(
            "Slash registration error:",
            err
        );

    }

};