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
                default: null
            },

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
                default: 1,
                min: 1
            },

            reason: {
                type: String,
                default: null
            },

            awardedBy: {

                id: {
                    type: String,
                    default: "Trello"
                },

                username: {
                    type: String,
                    default: "Trello Sync"
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