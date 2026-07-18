const mongoose = require("mongoose");


const BingoGameSchema = new mongoose.Schema({


    active: {

        type: Boolean,

        default: false

    },



    channelId: {

        type: String,

        default: null

    },



    startedBy: {

        type: String,

        default: null

    },



    // Allows players to join only during registration period

    registrationOpen: {

        type: Boolean,

        default: false

    },



    // Current public bingo number

    currentNumber: {

        type: Number,

        default: null

    },



    // All numbers that have already been drawn

    drawnNumbers: [

        {

            type: Number

        }

    ],



    players: [

        {


            userId: {

                type: String,

                required: true

            },



            // Personal bingo card

            card: [

                Number

            ],



            // Numbers the player marked

            marked: [

                Number

            ]

        }

    ],




    // Stops new claims while one is being checked

    checkingClaim: {

        type: Boolean,

        default: false

    },



    // Pauses number drawing during bingo verification

    paused: {

        type: Boolean,

        default: false

    },

    // Stores all bingo claims during the checking period

    claims: [

        {

            userId: {

                type: String,

                required: true

            },


            claimedAt: {

                type: Date,

                default: Date.now

            }

        }

    ],

    createdAt: {

        type: Date,

        default: Date.now

    }


});



module.exports =
mongoose.model(
    "BingoGame",
    BingoGameSchema
);