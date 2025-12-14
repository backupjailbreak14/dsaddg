const fs = require("fs");
const path = require("path");

const BLACKLIST_PATH = path.join(__dirname, "../../data/blacklist.json");
const OWNER_ID = "704331555853697074";

module.exports = {
  name: "blacklist",
  category: "owner",
  description: "Blacklist a user from using the bot",
  usage: ".blacklist @user <reason>",

  run: async (client, message, args) => {
    if (message.author.id !== OWNER_ID) {
      return message.reply("❌ Only the owner can use this command.");
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply("Usage: .blacklist @user <reason>");
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    let blacklist = {};
    try {
      blacklist = JSON.parse(fs.readFileSync(BLACKLIST_PATH, "utf8"));
    } catch {}

    blacklist[user.id] = reason;

    fs.writeFileSync(BLACKLIST_PATH, JSON.stringify(blacklist, null, 2));

    return message.reply(
      `⛔ **${user.tag}** has been blacklisted.\n**Reason:** ${reason}`
    );
  }
};
