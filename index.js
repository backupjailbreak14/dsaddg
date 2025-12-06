require("dotenv").config();

// ----------------------
// KEEP-ALIVE (Render & Replit)
// ----------------------
const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Bot is running."));

// Render gebruikt automatisch process.env.PORT
// Replit gebruikt vaak 3000 → daarom fallback
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`🌐 Webserver online on port ${PORT}`));

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

// Client + intents
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
// Helper: restSend (oude commands blijven werken)
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
          console.log(`❌ Ongeldige command: ${full}`);
          continue;
        }

        client.commands.set(cmd.name, cmd);

        if (Array.isArray(cmd.aliases)) {
          cmd.aliases.forEach(a => client.aliases.set(a, cmd.name));
        }

        console.log(`✔ Loaded command: ${cmd.name}`);
      } catch (err) {
        console.log(`❌ Error loading command: ${full}`);
        console.error(err);
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
        "https://cdn.discordapp.com/attachments/853304828386344970/1446904919880892496/image.png"
      ]
    }
  ],
  [
    "627856226721595392",
    {
      name: "Spiderman",
      content: "do not ping spiderman",
      files: [
        "https://media.discordapp.net/attachments/853304828386344970/1446905885388570664/image.png"
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
        "https://media.discordapp.net/attachments/853304828386344970/1446898430675910827/content.png"
      ]
    }
  ],
  [
    "414780486880067604",
    {
      name: "Darth",
      content: "real.",
      files: [
        "https://media.discordapp.net/attachments/1123600251203358858/1187744438236229703/Screenshot.jpg"
      ]
    }
  ]
]);

// ----------------------
// EXTRA TRIGGERS
// ----------------------
const specialTriggers = {
  "6787he4uvaw085g6": "Happy Birthday to him 🎉",
  "hesywg22zj2zbuuej": "Happy Birthday boss <@704331555853697074> 🎉",
  "test": "do not test me.",
  "<@846438881485389855>": "<@846438881485389855> get pinged",
  "<@332431665005854720>": "🇷🇴"
};

// ----------------------
// PERMISSION MAP
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

// ----------------------
// MESSAGE HANDLER
// ----------------------
client.on("messageCreate", async (message) => {
  console.log("🔥 MESSAGE CREATE FIRED:", message.content);
  if (message.author.bot) return;

  attachRestSend(message);

  // --- Handle Ping Responses ---
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

  // --- Handle Special Triggers ---
  if (specialTriggers[message.content]) {
    return message.restSend(specialTriggers[message.content]);
  }

  // -------------------------
  // COMMAND HANDLER
  // -------------------------
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
  const cmdName = args.shift()?.toLowerCase();
  if (!cmdName) return;

  let cmd =
    client.commands.get(cmdName) ||
    client.commands.get(client.aliases.get(cmdName));

  if (!cmd) return;

  // PERMISSIONS
  if (cmd.permissions && Array.isArray(cmd.permissions)) {
    const needed = cmd.permissions.map(p => PermissionMap[p]).filter(Boolean);
    if (needed.length && !message.member.permissions.has(needed)) {
      return message.restSend(`❌ You need **${cmd.permissions.join(", ")}** to use this command.`);
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
      return message.restSend(`⏳ Please wait **${sec}s** before using \`${cmd.name}\` again.`);
    }
    client.cooldowns.set(key, now);
  }

  // RUN COMMAND
  try {
    await cmd.run(client, message, args);
  } catch (err) {
    console.error("❌ Command error:", err);
    message.restSend("⚠️ An error occurred running that command.");
  }
});

// ----------------------
// READY EVENT
// ----------------------
client.on("ready", () => {
  console.log(`TOKEN IS LOADED & BOT IS READY: ${client.user.tag}`);

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
});

console.log("🔥 REGISTERING EVENT LOADER...");
require("./handlers/event.js")(client);
console.log("🔥 FINISHED REGISTERING EVENTS");

// ----------------------
// LOGIN
// ----------------------
client.login(BOT_TOKEN)
  .then(() => console.log(`[BOT] Logged in with prefix "${client.prefix}"`))
  .catch(err => console.error("Login failed:", err));

