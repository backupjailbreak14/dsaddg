const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../json.sqlite.json");

function loadDB() {
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({}), "utf8");
    }
    const raw = fs.readFileSync(dbPath);
    return JSON.parse(raw);
}

function saveDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
}

module.exports = {
    get(key) {
        const db = loadDB();
        return db[key];
    },
    set(key, value) {
        const db = loadDB();
        db[key] = value;
        saveDB(db);
        return true;
    },
    delete(key) {
        const db = loadDB();
        delete db[key];
        saveDB(db);
        return true;
    }
};
