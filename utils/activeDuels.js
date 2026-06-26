const activeDuels = new Map();


function isInDuel(userId) {

    return activeDuels.has(userId);

}


function addDuel(user1, user2) {

    const duelId = Date.now();

    activeDuels.set(user1, duelId);
    activeDuels.set(user2, duelId);

}


function removeDuel(user1, user2) {

    activeDuels.delete(user1);
    activeDuels.delete(user2);

}


function clearDuel(userId) {

    const duelId = activeDuels.get(userId);

    if (!duelId) return;

    for (const [playerId, id] of activeDuels) {

        if (id === duelId) {

            activeDuels.delete(playerId);

        }

    }

}


module.exports = {
    isInDuel,
    addDuel,
    removeDuel,
    clearDuel
};