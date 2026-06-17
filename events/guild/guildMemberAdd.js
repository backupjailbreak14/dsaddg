const Gulag = require("../../models/Gulag");

const GULAG_ROLE = "1155599155343925298";

module.exports = async (client, member) => {

  try {

    const data = await Gulag.findOne({
      userId: member.id
    });


    // User was never in gulag
    if (!data) {
      return;
    }


    console.log(
      `🔒 Restoring gulag for ${member.user.tag}`
    );


    // Wait for autoroles/bots to finish
    setTimeout(async () => {

      try {

        // Remove all roles except @everyone
        const rolesToRemove = member.roles.cache.filter(
          role => role.id !== member.guild.id
        );


        if (rolesToRemove.size > 0) {
          await member.roles.remove(rolesToRemove);
        }


        // Give gulag role
        await member.roles.add(GULAG_ROLE);


        console.log(
          `✅ ${member.user.tag} was returned to gulag`
        );


      } catch (err) {

        console.error(
          "❌ Failed to restore gulag:",
          err
        );

      }

    }, 5000);


  } catch (err) {

    console.error(
      "❌ Gulag check error:",
      err
    );

  }

};