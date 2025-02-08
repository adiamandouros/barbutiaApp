import { Match } from './dbmodel.mjs'

async function addMatch(match) {
    try {
        if (!match)
            throw new Error("No match given!")

        let testMatch = await Match.findOne({ where: { date: match.date} })

        if (testMatch)
            throw new Error("There is already a match with the same date!")

        testMatch = await Match.create({ homeTeamName: match.homeTeamName, awayTeamName: match.awayTeamName, date: match.date, place: match.place, homeTeamScore: match.homeTeamScore, awayTeamScore: match.awayTeamScore, isHome: match.isHome, league: match.league })
        return testMatch
    } catch (error) {
        throw error
    }
}

export { addMatch }