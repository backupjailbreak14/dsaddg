const sovietHistory = require("../data/sovietHistory");
const sovietMilitary = require("../data/sovietMilitary");
const sovietLeaders = require("../data/sovietLeaders");
const sovietSpace = require("../data/sovietSpace");
const sovietColdWar = require("../data/sovietColdWar");
const sovietGeography = require("../data/sovietGeography");
const sovietCulture = require("../data/sovietCulture");
const sovietAwards = require("../data/sovietAwards");
const sovietEconomy = require("../data/sovietEconomy");


const questions = [

    ...sovietHistory,
    ...sovietMilitary,
    ...sovietLeaders,
    ...sovietSpace,
    ...sovietColdWar,
    ...sovietGeography,
    ...sovietCulture,
    ...sovietAwards,
    ...sovietEconomy

];



function getRandomQuestion(used = new Set()) {

    const available = questions.filter(
        q => !used.has(q.question)
    );


    if (available.length === 0) {
        return null;
    }


    const random =
        available[
            Math.floor(
                Math.random() * available.length
            )
        ];


    used.add(random.question);


    return random;
}



module.exports = {
    getRandomQuestion
};