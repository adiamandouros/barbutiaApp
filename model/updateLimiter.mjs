let lastFutureMatchUpdate = 0;
let lastCompletedMatchUpdate = 0;
let lastStandingsUpdate = 0;
let lastPlayerStatsUpdate = 0;
const UPDATE_INTERVAL = 2 * 60 * 1000; // 2 minutes in ms

export function shouldUpdateFutureMatches() {
    const now = Date.now();
    if (now - lastFutureMatchUpdate > UPDATE_INTERVAL) {
        lastFutureMatchUpdate = now;
        return true;
    }
    return false;
}

export function shouldUpdateCompletedMatches() {
    const now = Date.now();
    if (now - lastCompletedMatchUpdate > UPDATE_INTERVAL) {
        lastCompletedMatchUpdate = now;
        return true;
    }
    return false;
}

export function shouldUpdateStandings() {
    const now = Date.now();
    if (now - lastStandingsUpdate > UPDATE_INTERVAL) {
        lastStandingsUpdate = now;
        return true;
    }
    return false;
}

export function shouldUpdatePlayerStats() {
    const now = Date.now();
    if (now - lastPlayerStatsUpdate > UPDATE_INTERVAL) {
        lastPlayerStatsUpdate = now;
        return true;
    }
    return false;
}