const Medal = require("../models/Medal");
const getAwardCategory = require("./getAwardCategory");
const awards = require("./awards");



function normalizeAward(name) {

    const found = [

        ...awards.titles,
        ...awards.orders,
        ...awards.medals,
        ...awards.badges

    ].find(

        award =>
            award.toLowerCase() === name.toLowerCase()

    );


    return found || name.trim();

}





async function addAward({

    userId,
    username,
    award,
    reason = null,
    awardedBy = {
        id: "System",
        username: "System"
    }

}) {


    const cleanAward =
        normalizeAward(award);




    let data =
        await Medal.findOne({

            userId

        });





    if (!data) {


        data = new Medal({

            userId,

            username,

            medals: []

        });


    }




    data.username =
        username;






    const existing =
        data.medals.find(

            medal =>

                medal.name.toLowerCase()
                ===
                cleanAward.toLowerCase()

                &&

                medal.source === "manual"

        );







    if (existing) {


        existing.count =
            (existing.count || 1) + 1;



        existing.reason =
            reason || existing.reason;



    }

    else {


        data.medals.push({

            name:
                cleanAward,


            count:
                1,


            category:
                getAwardCategory(
                    cleanAward
                ),



            source:
                "manual",



            reason,



            awardedBy,



            awardedAt:
                new Date()

        });


    }





    await data.save();



    return cleanAward;


}





module.exports = addAward;