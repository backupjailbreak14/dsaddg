function getRandomNumbers(min, max, amount) {


    const numbers = [];


    while (numbers.length < amount) {


        const number =

            Math.floor(

                Math.random() * (max - min + 1)

            ) + min;




        if (!numbers.includes(number)) {


            numbers.push(number);


        }


    }


    return numbers.sort(

        (a, b) => a - b

    );


}







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

        B[0], I[0], N[0], G[0], O[0],

        B[1], I[1], N[1], G[1], O[1],

        B[2], I[2], N[2], G[2], O[2],

        B[3], I[3], N[3], G[3], O[3],

        B[4], I[4], N[4], G[4], O[4]

    ];


}







function getCardLayout(card) {


    return [


        card[0],
        card[1],
        card[2],
        card[3],
        card[4],



        card[5],
        card[6],
        card[7],
        card[8],
        card[9],



        card[10],
        card[11],
        "FREE",
        card[12],
        card[13],



        card[14],
        card[15],
        card[16],
        card[17],
        card[18],



        card[19],
        card[20],
        card[21],
        card[22],
        card[23]

    ];


}






module.exports = {

    generateBingoCard,

    getCardLayout

};