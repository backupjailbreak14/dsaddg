const mongoose = require("mongoose");

const suggestionSchema = new mongoose.Schema({

    guildId: String,

    id: String,

    messageId: String,

    author: String,

    text: String,

    status: {
        type: String,
        default: "pending"
    },

    reply: String,

    staff: String

});


module.exports = mongoose.model(
    "Suggestion",
    suggestionSchema
);