const mongoose = require("mongoose");

const MedalSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true,
        unique: true
    },

    username: {
        type: String,
        required: true
    },

    medals: [

        {

            name: {
                type: String,
                required: true
            },

            category: {
                type: String,
                default: "other"
            },

            count: {
                type: Number,
                default: 1
            },

            source: {
                type: String,
                enum: [
                    "manual",
                    "trello"
                ],
                default: "manual"
            },

            trelloCardId: {
                type: String,
                default: null
            },

            reason: {
                type: String,
                default: null
            },


            awardedBy: {

                id: String,

                username: String

            },


            awardedAt: {

                type: Date,

                default: Date.now

            }

        }

    ]

});


module.exports = mongoose.model(
    "Medal",
    MedalSchema
);