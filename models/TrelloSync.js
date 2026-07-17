const mongoose = require("mongoose");


const TrelloSyncSchema = new mongoose.Schema({


    lastSync: {

        type: Date,

        default: Date.now

    },


    syncedCards: {

        type: Number,

        default: 0

    },


    status: {

        type: String,

        enum: [

            "unknown",

            "success",

            "failed"

        ],

        default: "unknown"

    },


    error: {

        type: String,

        default: null

    },


    startedBy: {

        type: String,

        default: "automatic"

    }


}, {


    timestamps: true

});



module.exports = mongoose.model(

    "TrelloSync",

    TrelloSyncSchema

);