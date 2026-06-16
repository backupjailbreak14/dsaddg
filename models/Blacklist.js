const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    reason: { type: String, default: "No reason provided" }
});

module.exports = mongoose.model("Blacklist", blacklistSchema);