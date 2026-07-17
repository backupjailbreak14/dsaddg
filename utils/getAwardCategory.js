const awards = require("./awardCategories");

function normalize(text) {

    return text
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

}


function getAwardInfo(name) {

    const search =
        normalize(name);


    for (const [category, list] of Object.entries(awards)) {

        for (const award of list) {

            if (
                normalize(award) === search
            ) {

                return {
                    name: award,
                    category: category
                };

            }

        }

    }


    return {
        name: name
            .toLowerCase()
            .replace(/\b\w/g, char =>
                char.toUpperCase()
            ),

        category: "other"
    };

}


module.exports = getAwardInfo;