const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "../data/bot.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to connect to SQLite:", err);
  } else {
    console.log("✅ SQLite database connected");
  }
});

/* ======================
   TABLES
====================== */

db.serialize(() => {
  // BLACKLIST
  db.run(`
    CREATE TABLE IF NOT EXISTS blacklist (
      user_id TEXT PRIMARY KEY,
      reason TEXT,
      added_at INTEGER
    )
  `);

  // REBOOT
  db.run(`
    CREATE TABLE IF NOT EXISTS reboot (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      channel_id TEXT
    )
  `);

  // GULAG
  db.run(`
    CREATE TABLE IF NOT EXISTS gulag (
      user_id TEXT PRIMARY KEY,
      roles TEXT,
      added_at INTEGER
    )
  `);

  // SUGGESTIONS
  db.run(`
    CREATE TABLE IF NOT EXISTS suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT,
      author_id TEXT,
      content TEXT,
      created_at INTEGER
    )
  `);
});

module.exports = db;
