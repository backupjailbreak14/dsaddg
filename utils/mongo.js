const mongoose = require("mongoose");

module.exports = async () => {
  console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB error:", err);
  }
};