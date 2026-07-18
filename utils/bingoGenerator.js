// =====================================
// BINGO NUMBER GENERATOR
// =====================================


function getRandomNumbers(min, max, amount) {

    const numbers = [];


    while(numbers.length < amount) {

        const number =
            Math.floor(
                Math.random() * (max - min + 1)
            ) + min;


        if(!numbers.includes(number)) {

            numbers.push(number);

        }

    }


    return numbers.sort(
        (a, b) => a - b
    );

}





// =====================================
// GENERATE BINGO CARD
// =====================================


function generateBingoCard() {


    const B = getRandomNumbers(
        1,
        15,
        5
    );


    const I = getRandomNumbers(
        16,
        30,
        5
    );


    // N column has only 4 numbers because center is FREE
    const N = getRandomNumbers(
        31,
        45,
        4
    );


    const G = getRandomNumbers(
        46,
        60,
        5
    );


    const O = getRandomNumbers(
        61,
        75,
        5
    );




    return [

        // Row 1
        B[0],
        I[0],
        N[0],
        G[0],
        O[0],


        // Row 2
        B[1],
        I[1],
        N[1],
        G[1],
        O[1],


        // Row 3 (FREE center)
        B[2],
        I[2],
        "FREE",
        G[2],
        O[2],


        // Row 4
        B[3],
        I[3],
        N[2],
        G[3],
        O[3],


        // Row 5
        B[4],
        I[4],
        N[3],
        G[4],
        O[4]

    ];

}





// =====================================
// GET CARD BUTTON LAYOUT
// =====================================


function getCardLayout(card) {


    return card;


}





module.exports = {

    generateBingoCard,

    getCardLayout

};