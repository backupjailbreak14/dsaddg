const fetch = require("node-fetch");

class RestPatch {
    constructor(token) {
        this.token = token;
        this.api = "https://discord.com/api/v10";
    }

    async sendMessage(channelID, payload) {
        const res = await fetch(`${this.api}/channels/${channelID}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${this.token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            console.error(`REST Send Error ${res.status}:`, await res.text());
            throw new Error("REST send failure");
        }

        return res.json();
    }

    async editMessage(channelID, messageID, payload) {
        const res = await fetch(`${this.api}/channels/${channelID}/messages/${messageID}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${this.token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            console.error(`REST Edit Error ${res.status}:`, await res.text());
            throw new Error("REST edit failure");
        }

        return res.json();
    }
}

module.exports = RestPatch;
