// models/Reboot.js
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  channelId: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Reboot", schema);