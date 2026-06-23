const awards =
    require("./awards");


module.exports = function(name) {


    for (
        const [category, list]
        of Object.entries(awards)
    ) {


        if (list.includes(name)) {

            return category;

        }

    }


    return "other";

};