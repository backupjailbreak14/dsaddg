const {
    SlashCommandBuilder
} = require("discord.js");


module.exports = {

    data: new SlashCommandBuilder()
        .setName("dm")
        .setDescription("Send a direct message to users or roles")

        .addStringOption(option =>
            option
                .setName("header")
                .setDescription("Message header")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("Message content")
                .setRequired(true)
        )

        .addUserOption(option =>
            option
                .setName("user1")
                .setDescription("First user")
        )

        .addUserOption(option =>
            option
                .setName("user2")
                .setDescription("Second user")
        )

        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Role to DM")
        ),


    async run(client, interaction) {


        await interaction.deferReply({
            ephemeral: true
        });


        const header =
            interaction.options.getString("header");


        const content =
            interaction.options.getString("message");


        let users = [];


        // USERS
        const user1 =
            interaction.options.getUser("user1");

        const user2 =
            interaction.options.getUser("user2");


        if (user1)
            users.push(user1);


        if (user2)
            users.push(user2);



        // ROLE
        const role =
            interaction.options.getRole("role");


        if (role) {


            const members =
                await interaction.guild.members.fetch();


            const roleMembers =
                members.filter(member =>
                    member.roles.cache.has(role.id)
                );


            if (roleMembers.size > 30) {

                return interaction.editReply(
                    "❌ This role contains more than 30 members."
                );

            }


            roleMembers.forEach(member => {

                users.push(member.user);

            });

        }



        // remove duplicates

        users =
            [...new Map(
                users.map(user =>
                    [user.id,user]
                )
            ).values()];



        if (users.length === 0) {

            return interaction.editReply(
                "❌ No users selected."
            );

        }



        if (users.length > 30) {

            return interaction.editReply(
                "❌ Total recipients cannot exceed 30 users."
            );

        }



        let success = 0;
        let failed = 0;



        for (const user of users) {


            try {


                await user.send(
`# ${header}

-# Message directed by ${interaction.user.username}

${content}`
                );


                success++;


            } catch(err) {


                failed++;


            }


            // 10-15 second delay

            await new Promise(resolve =>
                setTimeout(
                    resolve,
                    Math.floor(
                        Math.random()*5000
                    ) + 10000
                )
            );

        }



        return interaction.editReply(
`✅ Message sent.

Recipients: ${users.length}
Successful: ${success}
Failed: ${failed}

Header: ${header}`
        );


    }

};