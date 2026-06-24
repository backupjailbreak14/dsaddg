const mongoose = require("mongoose");

module.exports = mongoose.model(
    "MedalLog",
    new mongoose.Schema({

        executorId: String,
        executorUsername: String,

        recipients: [
            {
                id: String,
                username: String
            }
        ],

        medals: [
            {
                name: String,
                count: Number
            }
        ],

        reason: String,

        createdAt: {
            type: Date,
            default: Date.now
        }

    })
);