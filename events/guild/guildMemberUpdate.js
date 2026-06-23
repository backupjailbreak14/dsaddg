const Gulag = require("../../models/Gulag");

const GULAG_ROLE = "1155599155343925298";

module.exports = async (client, oldMember, newMember) => {

    try {

        const gulagData = await Gulag.findOne({
            userId: newMember.id
        });

        if (!gulagData) return;

        // Heeft iemand extra rollen gekregen?
        const roles = newMember.roles.cache.filter(
            role =>
                role.id !== newMember.guild.id &&
                role.id !== GULAG_ROLE
        );

        if (roles.size > 0) {

            console.log(
                `🔒 Removing unauthorized roles from ${newMember.user.tag}`
            );

            await newMember.roles.set([
                GULAG_ROLE
            ]);
        }

    } catch (err) {

        console.error(
            "❌ Gulag role enforcement error:",
            err
        );

    }

};