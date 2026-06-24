const mongoose = require("mongoose");

const suggestionSchema = new mongoose.Schema({

    guildId: {
        type: String,
        required: true
    },

    id: {
        type: String,
        required: true
    },

    author: {
        type: String,
        required: true
    },

    text: {
        type: String,
        required: true
    },

    status: {
        type: String,
        default: "pending"
    },

    reply: {
        type: String,
        default: null
    },

    staff: {
        type: String,
        default: null
    }

});

module.exports = mongoose.model(
    "Suggestion",
    suggestionSchema
);