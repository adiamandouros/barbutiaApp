import { FutureMatch, CompletedMatch, NextMatch, Standings, Players } from './dbmodel.mjs'

//Future Matches
export async function updateAllFutureMatchesInDB(matchesArray) {
    const transaction = await FutureMatch.sequelize.transaction()
    try {
        const futureMatches = await getAllCompletedMatchesFromDB()

        if (futureMatches.length !== 0){
            await cleanFutureMatches()
        }

        await FutureMatch.bulkCreate(matchesArray, { updateOnDuplicate:
            ['teamLogo', 'date', 'place', 'isHome', 'league'] },
            {transaction})
        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

export async function getAllFutureMatchesFromDB() {
    try {
        const matches = await FutureMatch.findAll({order: [['date', 'ASC']]})
        return matches
    } catch (error) {
        throw error
    }
}

export async function cleanFutureMatches() {
    const transaction = await FutureMatch.sequelize.transaction()
    try {
        await FutureMatch.destroy({ where: {}, truncate: true }, {transaction})
        await transaction.commit()
    }catch(error) {
        await transaction.rollback()
        throw error
    }
}

//Next Match
export async function getNextMatchFromDB() {
    try {
        const match = await NextMatch.findOne({ })
        return match
    } catch (error) {
        throw error
    }
}

export async function getCurrentNextMatchFromDB() {
    try {
        const match = await FutureMatch.findOne({ order: [['date', 'ASC']] })
        return match
    } catch (error) {
        throw error
    }
}

export async function updateNextMatchInDB(match) {
    const transaction = await NextMatch.sequelize.transaction()
    try {
        if (!match)
            throw new Error("No match given!")

        // Try to find the first row
        let nextMatch = await NextMatch.findOne({transaction});

        if (nextMatch) {
            await nextMatch.destroy()
            nextMatch = await NextMatch.create({
                teamName: match.teamName,
                teamLogo: match.teamLogo,
                date: match.date,
                place: match.place,
                isHome: match.isHome,
                league: match.league
            }, {transaction});
        } else {
            // Create the row if it doesn't exist
            nextMatch = await NextMatch.create({
                teamName: match.teamName,
                teamLogo: match.teamLogo,
                date: match.date,
                place: match.place,
                isHome: match.isHome,
                league: match.league
            }, {transaction});
        }
        await transaction.commit()
        return nextMatch;
    } catch (error) {
        await transaction.rollback()
        throw error;
    }
}

//Completed Matches
export async function updateAllCompletedMatchesInDB(matchesArray) {
    const transaction = await CompletedMatch.sequelize.transaction()
    try {
        await CompletedMatch.bulkCreate(matchesArray, { updateOnDuplicate:
            ['teamName', 'teamLogo', 'league', 'date', 'place', 'homeTeamScore', 'awayTeamScore', 'isWin', 'isHome', 'article'] },
            {transaction})
        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

export async function getAllCompletedMatchesFromDB() {
    try {
        const matches = await CompletedMatch.findAll({order: [['date', 'DESC']]})
        return matches
    } catch (error) {
        throw error
    }
}

//Standings
export async function updateAllStandingsInDB(standingsArray) {
    const transaction = await Standings.sequelize.transaction()
    try {
        await Standings.bulkCreate(standingsArray, { updateOnDuplicate:
            [ 'position', 'points', 'gamesPlayed', 'wins', 'losses', 'pointsFor', 'pointsAgainst', 'pointsDiff' ] },
            {transaction})
        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

export async function getAllStandingsFromDB() {
    try {
        const standings = await Standings.findAll({order: [['position', 'ASC']]})
        return standings
    } catch (error) {
        throw error
    }
}

//Roster
export async function getAllPlayersFromDB() {
    try {
        const players = await Players.findAll({order: [['jersey', 'ASC']]})
        return players
    } catch (error) {
        throw error
    }
}

export async function updateAllPlayerStatsInDB(playerStats) {
    const transaction = await Standings.sequelize.transaction()
    try {
        await Players.bulkCreate(playerStats, { updateOnDuplicate:
            [ 'matches', 'mvpAwards', 'points', 'pointsAvg', 'rebounds', 'reboundsAvg', 'assists', 'assistsAvg', 'steals', 'stealsAvg', 'blocks', 'blocksAvg', 'turnovers', 'turnoversAvg', 'freeThrowsPercentage', 'twoPointsPercentage', 'threePointsPercentage' ] },
            {transaction})
        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}