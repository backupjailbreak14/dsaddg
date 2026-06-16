const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema({
  guildId: String,
  channelId: String
});

module.exports = mongoose.model("SuggestionChannel", guildSchema);