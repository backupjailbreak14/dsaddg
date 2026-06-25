const activeDuels = new Set();

function isInDuel(userId) {
    return activeDuels.has(userId);
}

function addDuel(user1, user2) {
    activeDuels.add(user1);
    activeDuels.add(user2);
}

function removeDuel(user1, user2) {
    activeDuels.delete(user1);
    activeDuels.delete(user2);
}

module.exports = {
    isInDuel,
    addDuel,
    removeDuel
};