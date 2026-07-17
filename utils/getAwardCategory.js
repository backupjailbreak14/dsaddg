const awards = require("./awards");



function normalize(text) {

    return text

        .toLowerCase()

        .replace(/["']/g, "")

        .replace(/\s+/g, " ")

        .trim();

}





function formatName(name) {

    return name

        .toLowerCase()

        .replace(/\b\w/g, char =>
            char.toUpperCase()
        )

        .replace(/\bIi\b/g, "II")

        .replace(/\bIii\b/g, "III")

        .replace(/\bIv\b/g, "IV")

        .replace(/\bV\b/g, "V");

}





function getAwardInfo(name) {


    const search =
        normalize(name);





    for (
        const [category, list]
        of Object.entries(awards)
    ) {



        for (
            const award
            of list
        ) {



            if (

                normalize(award)
                ===
                search

            ) {


                return {

                    name:
                        award,


                    category:
                        category

                };


            }


        }


    }






    // extra check zonder quotes

    for (
        const [category, list]
        of Object.entries(awards)
    ) {


        for (
            const award
            of list
        ) {



            if (

                normalize(award)
                .replace(/"/g,"")

                ===

                search.replace(/"/g,"")

            ) {


                return {

                    name:
                        award,


                    category:
                        category

                };


            }

        }

    }







    return {

        name:
            formatName(name),


        category:
            "other"

    };


}





module.exports = getAwardInfo;