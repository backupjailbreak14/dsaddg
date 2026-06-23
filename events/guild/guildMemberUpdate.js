const Gulag = require("../../models/Gulag");

const GULAG_ROLE = "1155599155343925298";

module.exports = async (client, oldMember, newMember) => {

    try {

        const gulagData = await Gulag.findOne({
            userId: newMember.id
        });

        if (!gulagData) return;

        const shouldHaveOnlyGulag = newMember.roles.cache.filter(
            role =>
                role.id !== newMember.guild.id &&
                role.id !== GULAG_ROLE
        );

        const missingGulag =
            !newMember.roles.cache.has(
                GULAG_ROLE
            );

        if (
            missingGulag ||
            shouldHaveOnlyGulag.size > 0
        ) {

            console.log(
                `🔒 Re-applying Gulag to ${newMember.user.tag}`
            );

            await newMember.roles.set([
                GULAG_ROLE
            ]);

        }

    } catch (err) {

        console.error(
            "❌ Gulag enforcement error:",
            err
        );

    }

};