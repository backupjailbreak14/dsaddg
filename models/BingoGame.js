const mongoose = require("mongoose");


const BingoGameSchema = new mongoose.Schema({


    active: {

        type: Boolean,

        default: false

    },


    channelId: {

        type: String,

        required: true

    },


    startedBy: {

        type: String,

        required: true

    },


    registrationOpen: {

        type: Boolean,

        default: false

    },


    currentNumber: {

        type: Number,

        default: null

    },


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


            card: [
                mongoose.Schema.Types.Mixed
            ],


            marked: [

                {

                    type: Number

                }

            ]

        }

    ],



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



    checkingClaim: {

        type: Boolean,

        default: false

    },


    paused: {

        type: Boolean,

        default: false

    },


    createdAt: {

        type: Date,

        default: Date.now

    }


});



module.exports = mongoose.model(
    "BingoGame",
    BingoGameSchema
);