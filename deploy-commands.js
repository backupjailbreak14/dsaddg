require("dotenv").config();

const {
    REST,
    Routes
} = require("discord.js");

const fs = require("fs");
const path = require("path");


const commands = [];


// ----------------------
// LOAD SLASH COMMANDS
// ----------------------

function loadCommands(dir) {

    const files = fs.readdirSync(dir, {
        withFileTypes: true
    });


    for (const file of files) {

        const fullPath = path.join(
            dir,
            file.name
        );


        if (file.isDirectory()) {

            loadCommands(fullPath);

        } 
        else if (
            file.name.endsWith(".js")
        ) {

            const command = require(fullPath);


            if (command.data) {

                commands.push(
                    command.data.toJSON()
                );

                console.log(
                    `Loaded slash command: ${command.data.name}`
                );

            }

        }

    }

}


loadCommands(
    path.join(__dirname, "commands", "slash")
);



// ----------------------
// REGISTER
// ----------------------

const rest = new REST({
    version: "10"
}).setToken(
    process.env.BOT_TOKEN
);



(async () => {

    try {

        console.log(
            `Registering ${commands.length} slash commands...`
        );


        await rest.put(

            Routes.applicationGuildCommands(

                process.env.CLIENT_ID,

                process.env.GUILD_ID

            ),

            {
                body: commands
            }

        );


        console.log(
            "✅ Slash commands registered."
        );


    } catch(err) {

        console.error(err);

    }

})();