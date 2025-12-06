require("dotenv").config();

// ----------------------
// TIMESTAMPED LOGGING
// ----------------------
function ts() {
  return new Date().toISOString().replace("T", " ").split(".")[0];
}
function log(...args) {
  console.log(`[${ts()}]`, ...args);
}
function logError(...args) {
  console.error(`[${ts()}]`, ...args);
}

// ----------------------
// KEEP-ALIVE (Render & Replit)
// ----------------------
const express = require("express");
const app = express();

// uptime tracking
let botOnlineSince = null;

app.get("/", (req, res) => res.send("Bot is running."));

// /status → JSON status + uptime
app.get("/status", (req, res) => {
  if (!client || !client.user) {
    return res.json({
      online: false,
      message: "Bot is not connected to Discord"
    });
  }

  const uptimeMs = Date.now() - botOnlineSince;

  res.json({
    online: true,
    bot: client.user.tag,
    uptime_ms: uptimeMs,
    uptime_readable: msToReadable(uptimeMs),
    guilds: client.guilds.cache.size,
    users: client.users.cache.size,
    status: client.user.presence?.status || "unknown"
  });
});

function msToReadable(ms) {
  const sec = Math.floor(ms / 1000);
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h ${m % 60}m ${sec % 60}s`;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => log(`🌐 Webserver online on port ${PORT}`));

// ----------------------
// DISCORD CLIENT (v14)
// ----------------------
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  PermissionsBitField
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const BOT_TOKEN = process.env.BOT_TOKEN;
const PREFIX = process.env.PREFIX || ".";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// Collections
client.prefix = PREFIX;
client.commands = new Collection();
client.aliases = new Collection();
client.cooldowns = new Collection();
client.snipes = new Collection();

// ----------------------------------------------------
// restSend helper
// ----------------------------------------------------
function attachRestSend(msg) {
  if (msg.restSend) return;

  msg.restSend = (payload) => {
    if (typeof payload === "string") {
      return msg.channel.send({ content: payload });
    }
    return msg.channel.send(payload);
  };
}

// ----------------------
// COMMAND LOADER
// ----------------------
function loadCommands(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) loadCommands(full);
    else if (entry.isFile() && entry.name.endsWith(".js")) {
      try {
        const cmd = require(full);
        if (!cmd.name || typeof cmd.run !== "function") {
          log(`❌ Invalid command: ${full}`);
          continue;
        }

        client.commands.set(cmd.name, cmd);

        if (Array.isArray(cmd.aliases)) {
          cmd.aliases.forEach((a) => client.aliases.set(a, cmd.name));
        }

        log(`✔ Loaded command: ${cmd.name}`);
      } catch (err) {
        log(`❌ Error loading command: ${full}`);
        logError(err);
      }
    }
  }
}

loadCommands(path.join(__dirname, "commands"));

// ----------------------
// SNIPE EVENT
// ----------------------
client.on("messageDelete", (msg) => {
  client.snipes.set(msg.channel.id, {
    content: msg.content,
    author: msg.author?.id || null,
    image: msg.attachments.first() || null
  });
});

// ----------------------
// PING RESPONSES
// ----------------------
const pingResponses = new Map([
  [
    "585176547929882634",
    {
      name: "Glorious Shaoqi",
      content: "Do not ping the glorious s_haoqi",
      files: [
        "https://media.discordapp.net/attachments/853304828386344970/1446904919880892496/image.png?ex=6935aeb7&is=69345d37&hm=cfdad40c02409e23fc540db10bd286362c6b014e96210de310640fb36707f829&=&format=webp&quality=lossless&width=822&height=593"
      ]
    }
  ],
  [
    "627856226721595392",
    {
      name: "Spiderman",
      content: "do not ping spiderman",
      files: [
        "https://media.discordapp.net/attachments/853304828386344970/1446905885388570664/image.png?ex=6935af9d&is=69345e1d&hm=a3691b6eb2ec03115ffeaf60c3e1eb24eb05966919f78032666e753ddb0c84f7&=&format=webp&quality=lossless&width=1118&height=552"
      ]
    }
  ],
  [
    "32856278653366900289",
    {
      name: "The Premier",
      content: "Do not ping the Premier",
      files: [
        "https://cdn.discordapp.com/attachments/1062445517990273095/1083093499886436362/GettyImages-541320861-1024x683.png"
      ]
    }
  ],
  [
    "711961910073098322",
    {
      name: "Fat Bear King",
      content: "do not ping our fat bear king",
      files: [
        "https://media.discordapp.net/attachments/853304828386344970/1446898430675910827/content.png?ex=6935a8ab&is=6934572b&hm=1ac4a8b446ddaac76b8c4ebdf293971438c95374ab603ff7804ffe778bc46615&=&format=webp&quality=lossless&width=982&height=552"
      ]
    }
  ],
  [
    "414780486880067604",
    {
      name: "Darth",
      content: "real.",
      files: [
        "https://media.discordapp.net/attachments/1123600251203358858/1187744438236229703/Screenshot_20230813_183543_Discord.jpg?ex=69357d35&is=69342bb5&hm=13cc2a927abea1f5c5f0940d7c877a428afac927176b797ca84f18b926ab1660&=&format=webp&width=501&height=656"
      ]
    }
  ]
]);

// ----------------------
// TRIGGERS
// ----------------------
const specialTriggers = {
  "6787he4uvaw085g6": "Happy Birthday to him 🎉",
  "hesywg22zj2zbuuej": "Happy Birthday boss <@704331555853697074> 🎉",
  test: "do not test me.",
  "<@846438881485389855>": "<@846438881485389855> get pinged",
  "<@332431665005854720>": "🇷🇴"
};

// ----------------------
// PERMISSIONS
// ----------------------
const PermissionMap = {
  BAN_MEMBERS: PermissionsBitField.Flags.BanMembers,
  KICK_MEMBERS: PermissionsBitField.Flags.KickMembers,
  MANAGE_MESSAGES: PermissionsBitField.Flags.ManageMessages,
  MANAGE_GUILD: PermissionsBitField.Flags.ManageGuild,
  MANAGE_ROLES: PermissionsBitField.Flags.ManageRoles,
  MANAGE_CHANNELS: PermissionsBitField.Flags.ManageChannels,
  ADMINISTRATOR: PermissionsBitField.Flags.Administrator
};

  // PING RESPONSES
  if (!message.content.startsWith(PREFIX) && message.mentions.users.size === 1) {
    const id = message.mentions.users.first().id;

    if (pingResponses.has(id)) {
      const data = pingResponses.get(id);
      return message.restSend({
        content: data.content,
        files: data.files
      });
    }
  }

  // TRIGGERS
  if (specialTriggers[message.content]) {
    return message.restSend(specialTriggers[message.content]);
  }

  // COMMAND HANDLER
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
  const cmdName = args.shift()?.toLowerCase();
  if (!cmdName) return;

  let cmd =
    client.commands.get(cmdName) ||
    client.commands.get(client.aliases.get(cmdName));

  if (!cmd) return;

  // PERMISSION CHECK
  if (cmd.permissions && Array.isArray(cmd.permissions)) {
    const needed = cmd.permissions.map((p) => PermissionMap[p]).filter(Boolean);
    if (needed.length && !message.member.permissions.has(needed)) {
      return message.restSend(
        `❌ You need **${cmd.permissions.join(", ")}** to use this command.`
      );
    }
  }

  // COOLDOWN
  const now = Date.now();
  const key = `${cmd.name}-${message.author.id}`;
  const timeout = cmd.timeout || 0;

  if (timeout > 0) {
    const last = client.cooldowns.get(key) || 0;
    const diff = now - last;
    if (diff < timeout) {
      const sec = Math.ceil((timeout - diff) / 1000);
      return message.restSend(
        `⏳ Please wait **${sec}s** before using \`${cmd.name}\` again.`
      );
    }
    client.cooldowns.set(key, now);
  }

  // EXECUTE COMMAND
  try {
    await cmd.run(client, message, args);
  } catch (err) {
    logError("❌ Command error:", err);
    message.restSend("⚠️ An error occurred running that command.");
  }
});

// ----------------------
// READY EVENT + REBOOT RECOVERY
// ----------------------
client.on("ready", async () => {
  botOnlineSince = Date.now();
  log(`TOKEN IS LOADED & BOT IS READY: ${client.user.tag}`);

  const statuses = [
    "watching bear king plan raids",
    "preparing for a purge",
    "waiting for kyerra",
    "waiting for war",
    "watching over ikiller to stop aa",
    ".help"
  ];

  setInterval(() => {
    const s = statuses[Math.floor(Math.random() * statuses.length)];
    client.user.setPresence({ activities: [{ name: s }], status: "online" });
  }, 5000);

  client.user.setUsername("USSR").catch(() => {});

  // ---- AUTO RESTART RECOVERY ----
  const rebootFile = path.join(__dirname, "utils", "reboot.json");

  try {
    if (fs.existsSync(rebootFile)) {
      const raw = fs.readFileSync(rebootFile, "utf8");
      const data = JSON.parse(raw || "{}");

      if (data.channelId) {
        const ch = client.channels.cache.get(data.channelId);

        if (ch && ch.send) {
          await ch.send("✅ Bot rebooted and is back online.");
        }

        data.channelId = null; // prevent repeat messages
        fs.writeFileSync(rebootFile, JSON.stringify(data, null, 2), "utf8");
      }
    }
  } catch (err) {
    logError("Reboot recovery error:", err);
  }
});

log("🔥 REGISTERING EVENT LOADER...");
require("./handlers/event.js")(client);
log("🔥 FINISHED REGISTERING EVENTS");

// ----------------------
// LOGIN
// ----------------------
client
  .login(BOT_TOKEN)
  .then(() => log(`[BOT] Logged in with prefix "${client.prefix}"`))
  .catch((err) => logError("Login failed:", err));
