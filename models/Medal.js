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

            trelloCardId: {
                type: String,
                unique: true
            },

            name: {
                type: String,
                required: true
            },

            category: {
                type: String,
                default: "other"
            },

            reason: {
                type: String,
                default: null
            },

            awardedBy: {

                id: {
                    type: String
                },

                username: {
                    type: String
                }

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