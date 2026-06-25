const mongoose = require("mongoose");

const QuizStatsSchema = new mongoose.Schema({

    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },

    gamesPlayed: { type: Number, default: 0 },
    questionsAnswered: { type: Number, default: 0 },

    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },

    totalPoints: { type: Number, default: 0 },

    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },

    usedQuestions: { type: [String], default: [] },

    bestStreak: { type: Number, default: 0 },

    lastPlayed: { type: Date, default: null },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("QuizStats", QuizStatsSchema);