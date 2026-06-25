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



function getRandomQuestion(used = new Set(), stats = null) {

    const alreadyUsed = new Set([
        ...used,
        ...(stats?.usedQuestions || [])
    ]);

    const available = questions.filter(
        q => !alreadyUsed.has(q.question)
    );

    if (available.length === 0) {

        // Reset wanneer alle vragen ooit gebruikt zijn
        if (stats) {
            stats.usedQuestions = [];
        }

        return questions[
            Math.floor(Math.random() * questions.length)
        ];
    }

    const random =
        available[
            Math.floor(Math.random() * available.length)
        ];


    if (stats) {

        stats.usedQuestions.push(
            random.question
        );

        stats.save();

    }


    used.add(random.question);

    return random;
}



module.exports = {
    getRandomQuestion
};