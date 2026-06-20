const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const DmCooldown =
    require("../../models/DmCooldown");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("dm")

        .setDescription(
            "Send a direct message to users or roles"
        )


        .addStringOption(option =>
            option
                .setName("message")
                .setDescription(
                    "Message content"
                )
                .setRequired(true)
        )


        // Users (maximum 30)
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

        .addUserOption(option =>
            option
                .setName("user3")
                .setDescription("Third user")
        )

        .addUserOption(option =>
            option
                .setName("user4")
                .setDescription("Fourth user")
        )

        .addUserOption(option =>
            option
                .setName("user5")
                .setDescription("Fifth user")
        )

        .addUserOption(option =>
            option
                .setName("user6")
                .setDescription("Sixth user")
        )

        .addUserOption(option =>
            option
                .setName("user7")
                .setDescription("Seventh user")
        )

        .addUserOption(option =>
            option
                .setName("user8")
                .setDescription("Eighth user")
        )

        .addUserOption(option =>
            option
                .setName("user9")
                .setDescription("Ninth user")
        )

        .addUserOption(option =>
            option
                .setName("user10")
                .setDescription("Tenth user")
        )

        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription(
                    "Role to DM"
                )
        ),



    async run(client, interaction) {


        await interaction.deferReply();



        // ----------------------
        // GLOBAL COOLDOWN CHECK
        // ----------------------

        let cooldown =
            await DmCooldown.findOne({
                name: "global"
            });


        const now = new Date();



        if (!cooldown) {

            cooldown =
                await DmCooldown.create({

                    name: "global",

                    uses: 0,

                    resetAt:
                        new Date(
                            Date.now()
                            +
                            7 * 24 * 60 * 60 * 1000
                        )

                });

        }



        if (now > cooldown.resetAt) {


            cooldown.uses = 0;


            cooldown.resetAt =
                new Date(
                    Date.now()
                    +
                    7 * 24 * 60 * 60 * 1000
                );


            await cooldown.save();

        }



    if (
        cooldown.uses >= 2 &&
        interaction.user.id !== process.env.OWNER_ID
    ) {

        return interaction.editReply(
    `❌ Global DM limit reached.

    This command can only be used 2 times per week.

    Used:
    ${cooldown.uses}/2

    Reset:
    <t:${Math.floor(
    cooldown.resetAt.getTime() / 1000
    )}:R>`
        );

    }



        // ----------------------
        // GET MESSAGE DATA
        // ----------------------

        const header = "MESSAGE FROM CENTRAL COMMITTEE";


        const content =
            interaction.options.getString(
                "message"
            );


        let users = [];



        // ----------------------
        // ADD INDIVIDUAL USERS
        // ----------------------

        for (
            let i = 1;
            i <= 30;
            i++
        ) {

            const user =
                interaction.options.getUser(
                    `user${i}`
                );


            if (user) {

                users.push(user);

            }

        }

        // ----------------------
        // ADD ROLE MEMBERS
        // ----------------------

        const role =
            interaction.options.getRole(
                "role"
            );


        if (role) {


            const members =
                await interaction.guild.members.fetch();



            members.forEach(member => {


                if (
                    member.roles.cache.has(
                        role.id
                    )
                ) {

                    users.push(
                        member.user
                    );

                }


            });

        }



        // ----------------------
        // REMOVE DUPLICATES
        // ----------------------

        users =
            [
                ...new Map(
                    users.map(user =>
                        [
                            user.id,
                            user
                        ]
                    )
                ).values()
            ];



        // ----------------------
        // CHECK RECIPIENTS
        // ----------------------

        if (users.length === 0) {


            return interaction.editReply(
                "❌ You must select at least one user or role."
            );

        }



        // ----------------------
        // SAVE COOLDOWN USAGE
        // BEFORE SENDING
        // ----------------------

        cooldown.uses++;

        await cooldown.save();



        let success = 0;

        let failed = 0;



        // ----------------------
        // SEND DMS
        // ----------------------

        for (const user of users) {


            try {


await user.send(
`# ${header}

-# Message directed by ${interaction.user.username}

${content}`
);


                success++;


            } catch(error) {


                failed++;

            }



            // Random delay between 10-15 seconds

            await new Promise(resolve =>

                setTimeout(
                    resolve,

                    Math.floor(
                        Math.random() * 5000
                    ) + 10000

                )

            );

        }



        // ----------------------
        // COOLDOWN INFORMATION
        // ----------------------

        const remaining =
            2 - cooldown.uses;



        const embed = new EmbedBuilder()

            .setTitle("✅ DM Sent Successfully")

            .setDescription(
        `**Recipients**
        ${users.length}

        **Successful**
        ${success}

        **Failed**
        ${failed}`
            )

            .addFields(
                {
                    name: "Message",
                    value: content.length > 1024
                        ? content.substring(0, 1021) + "..."
                        : content
                },
                {
                    name: "Global DM Cooldown",
                    value:
        `Used: **${cooldown.uses}/2**

        Remaining: **${remaining} use(s)**

        Reset:
        <t:${Math.floor(
        cooldown.resetAt.getTime() / 1000
        )}:R>`
                }
            )

            .setFooter({
                text: "USSR Management",
                iconURL: interaction.client.user.displayAvatarURL()
            })

            .setTimestamp();


        return interaction.editReply({
            embeds: [embed]
        });


            }

        };