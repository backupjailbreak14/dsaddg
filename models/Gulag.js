const mongoose = require("mongoose");

const gulagSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    roles: { type: [String], default: [] }
});

module.exports = mongoose.model("Gulag", gulagSchema);