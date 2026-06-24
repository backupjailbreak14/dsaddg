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


            count: {
                type: Number,
                default: 1
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
                    type: String,
                    required: true
                },


                username: {
                    type: String,
                    required: true
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