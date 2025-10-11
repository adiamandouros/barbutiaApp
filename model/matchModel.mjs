import { FutureMatch, CompletedMatch, NextMatch } from './dbmodel.mjs'

export async function addFutureMatchToDB(match) {
    const transaction = await FutureMatch.sequelize.transaction()
    try {
        if (!match)
            throw new Error("No match given!")

        let testMatch = await FutureMatch.findOne({ where: { teamName: match.teamName, isHome:match.isHome, league:match.league }, transaction })

        if (testMatch)
            // throw new Error("There is already a match with the same date!")
            await FutureMatch.update({ date: match.date, place: match.place }, { where: { teamName: match.teamName, isHome:match.isHome, league:match.league }, transaction })
        else
            testMatch = await FutureMatch.upsert({ teamName: match.teamName, teamLogo: match.teamLogo, date: match.date, place: match.place, isHome: match.isHome, league: match.league }, {transaction})
        await transaction.commit()
        return testMatch
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
    const transaction = await FutureMatch.sequelize.transaction()
    try {
        if (!match)
            throw new Error("No match given!")

        let testMatch = await CompletedMatch.findOne({ where: { date: match.date, teamName: match.teamName, isHome: match.isHome}, transaction })

        if (!testMatch){
            console.log("The match {}{}{} was not found in the database, inserting it.", match.teamName, match.date, match.isHome)
            testMatch = await CompletedMatch.upsert({ teamName: match.teamName, teamLogo: match.teamLogo, league: match.league, date: match.date, place: match.place, homeTeamScore: match.homeTeamScore, awayTeamScore: match.awayTeamScore, isWin: match.win, isHome: match.isHome }, {transaction})
            console.log(testMatch)
        }else{
            console.log("The match {}{}{} was found in the database, updating it.", match.teamName, match.date, match.isHome)
            testMatch = await CompletedMatch.update({
                teamName: match.teamName,
                teamLogo: match.teamLogo,
                league: match.league,
                date: match.date,
                place: match.place,
                homeTeamScore: match.homeTeamScore,
                awayTeamScore: match.awayTeamScore,
                isWin: match.win,
                isHome: match.isHome
            }, { where: { date: match.date, teamName: match.teamName, isHome: match.isHome, league: match.league }, transaction })
        }
        await transaction.commit()
        return testMatch
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