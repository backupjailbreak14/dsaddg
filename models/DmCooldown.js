const mongoose = require("mongoose");


const dmCooldownSchema = new mongoose.Schema({

    name: {
        type: String,
        default: "global"
    },

    uses: {
        type: Number,
        default: 0
    },

    resetAt: {
        type: Date,
        required: true
    }

});


module.exports = mongoose.model(
    "DmCooldown",
    dmCooldownSchema
);