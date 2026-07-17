const Medal = require("../models/Medal");
const GetAwardInfo = require("./getAwardInfo");
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



    const awardInfo =
        GetAwardInfo(
            cleanAward
        );






    let data =
        await Medal.findOne({

            userId

        });






    if (!data) {


        data =
            new Medal({

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
                awardInfo.name.toLowerCase()

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
                awardInfo.name,



            category:
                awardInfo.category,



            count:
                1,



            source:
                "manual",



            reason,



            awardedBy,



            awardedAt:
                new Date()



        });



    }







    await data.save();



    return awardInfo.name;



}







module.exports = addAward;