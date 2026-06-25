function shuffleArray(array) {

    const arr = [...array];


    for (let i = arr.length - 1; i > 0; i--) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [arr[i], arr[j]] =
            [arr[j], arr[i]];

    }


    return arr;

}



function shuffleQuestion(question) {


    const answers =
        shuffleArray([

            question.correctAnswer,

            ...(question.wrongAnswers || [])

        ]);



    return {

        category:
            question.category || "Unknown",


        question:
            question.question,


        answers,


        correctAnswer:
            question.correctAnswer

    };

}



module.exports = shuffleQuestion;