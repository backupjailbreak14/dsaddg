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
        default: "unknown"
    },

    error: {
        type: String,
        default: null
    }

});


module.exports = mongoose.model(
    "TrelloSync",
    TrelloSyncSchema
);