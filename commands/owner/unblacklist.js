const fs = require("fs");
const path = require("path");

const BLACKLIST_PATH = path.join(__dirname, "../../data/blacklist.json");
const OWNER_ID = "704331555853697074";

module.exports = {
  name: "unblacklist",
  category: "owner",
  description: "Remove a user from the blacklist",
  usage: ".unblacklist @user",

  run: async (client, message, args) => {
    if (message.author.id !== OWNER_ID) {
      return message.reply("❌ Only the owner can use this command.");
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply("Usage: .unblacklist @user");
    }

    let blacklist = {};
    try {
      blacklist = JSON.parse(fs.readFileSync(BLACKLIST_PATH, "utf8"));
    } catch {}

    if (!blacklist[user.id]) {
      return message.reply("⚠️ That user is not blacklisted.");
    }

    delete blacklist[user.id];

    fs.writeFileSync(BLACKLIST_PATH, JSON.stringify(blacklist, null, 2));

    return message.reply(`✅ **${user.tag}** has been unblacklisted.`);
  }
};
