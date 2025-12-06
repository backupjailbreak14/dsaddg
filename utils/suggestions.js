const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/suggestions.json");

// Load file
function load() {
    if (!fs.existsSync(filePath)) {
        return { guilds: {} };
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// Save file
function save(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Get guild data
function getGuild(guildId) {
    const data = load();
    if (!data.guilds[guildId]) {
        data.guilds[guildId] = { suggests: [], channel: null };
        save(data);
    }
    return data.guilds[guildId];
}

// Set suggestion channel
function setChannel(guildId, channelId) {
    const data = load();
    if (!data.guilds[guildId]) data.guilds[guildId] = { suggests: [], channel: null };

    data.guilds[guildId].channel = channelId;
    save(data);
}

// Add new suggestion
function addSuggestion(guildId, suggestion) {
    const data = load();
    if (!data.guilds[guildId]) data.guilds[guildId] = { suggests: [], channel: null };

    data.guilds[guildId].suggests.push(suggestion);
    save(data);
}

// Modify existing suggestion
function updateSuggestion(guildId, id, updates) {
    const data = load();
    const guild = data.guilds[guildId];

    if (!guild) return false;

    const index = guild.suggests.findIndex(s => s.id === id);
    if (index === -1) return false;

    guild.suggests[index] = { ...guild.suggests[index], ...updates };
    save(data);
    return true;
}

module.exports = {
    getGuild,
    setChannel,
    addSuggestion,
    updateSuggestion
};
