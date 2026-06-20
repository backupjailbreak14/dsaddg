const mongoose = require("mongoose");

const DmLogSchema = new mongoose.Schema({

    commandUser: {
        id: String,
        username: String
    },

    recipients: [
        {
            id: String,
            username: String
        }
    ],

    role: {
        id: String,
        name: String
    },

    message: String,

    header: {
        type: String,
        default: "MESSAGE FROM CENTRAL COMMITTEE"
    },

    successful: Number,

    failed: Number,

    createdAt: {
        type: Date,
        default: Date.now
    }

});


module.exports = mongoose.model(
    "DmLog",
    DmLogSchema
);