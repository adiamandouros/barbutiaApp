import { FutureMatch, CompletedMatch, NextMatch } from './dbmodel.mjs'

export async function addFutureMatchToDB(match) {
    try {
        if (!match)
            throw new Error("No match given!")

        let testMatch = await FutureMatch.findOne({ where: { teamName: match.teamName, isHome:match.isHome, league:match.league } })

        if (testMatch)
            // throw new Error("There is already a match with the same date!")
            FutureMatch.update({ date: match.date, place: match.place }, { where: { teamName: match.teamName, isHome:match.isHome, league:match.league } })
        else
            testMatch = await FutureMatch.create({ teamName: match.teamName, teamLogo: match.teamLogo, date: match.date, place: match.place, isHome: match.isHome, league: match.league })
        return testMatch
    } catch (error) {
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

export async function addCompletedMatchToDB(match) {
    try {
        if (!match)
            throw new Error("No match given!")

        let testMatch = await CompletedMatch.findOne({ where: { date: match.date, teamName: match.teamName} })

        if (!testMatch)
            // throw new Error("There is already a match with the same date!")
            testMatch = await CompletedMatch.create({ teamName: match.teamName, teamLogo: match.teamLogo, league: match.league, date: match.date, place: match.place, homeTeamScore: match.homeTeamScore, awayTeamScore: match.awayTeamScore, isWin: match.win, isHome: match.isHome })
        else
            testMatch = await CompletedMatch.update({ article: match.article }, { where: { date: match.date, teamName: match.teamName } })    
        return testMatch
    } catch (error) {
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

export async function cleanFutureMatches() {
    try {
        const futureMatches = await FutureMatch.destroy({ where: {}, truncate: true })
    }catch(error) {
        throw error
    }
}

export async function updateNextMatchInDB(match) {
    try {
        if (!match)
            throw new Error("No match given!")

        // Try to find the first row
        let nextMatch = await NextMatch.findOne();

        if (nextMatch) {
            // Update the row with new data
            await nextMatch.update({
                teamName: match.teamName,
                teamLogo: match.teamLogo,
                date: match.date,
                place: match.place,
                isHome: match.isHome,
                league: match.league
            });
        } else {
            // Create the row if it doesn't exist
            nextMatch = await NextMatch.create({
                teamName: match.teamName,
                teamLogo: match.teamLogo,
                date: match.date,
                place: match.place,
                isHome: match.isHome,
                league: match.league
            });
        }

        return nextMatch;
    } catch (error) {
        throw error;
    }
}