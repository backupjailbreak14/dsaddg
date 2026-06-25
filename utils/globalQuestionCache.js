const usedQuestionsGlobal = new Set();

function isUsed(questionId) {
    return usedQuestionsGlobal.has(questionId);
}

function markUsed(questionId) {
    usedQuestionsGlobal.add(questionId);
}

function resetCache() {
    usedQuestionsGlobal.clear();
}

module.exports = {
    isUsed,
    markUsed,
    resetCache
};