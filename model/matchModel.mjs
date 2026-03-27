import { FutureMatch, CompletedMatch, NextMatch} from './dbmodel.mjs'
import { Op } from 'sequelize';

//Future Matches
export async function updateAllFutureMatchesInDB(matchesArray) {
    const transaction = await FutureMatch.sequelize.transaction()
    try {
        // Snapshot existing matches so we can carry over calendarEventIds and compute a diff
        const existingMatches = await FutureMatch.findAll({ transaction })
        const existingMap = new Map()
        for (const m of existingMatches) {
            const key = `${m.teamName}|${m.league}|${String(m.isHome)}`
            existingMap.set(key, { calendarEventId: m.calendarEventId, date: m.date, place: m.place })
        }

        // Classify each incoming match and carry over the stored calendarEventId
        const newMatches = []
        const updatedMatches = []

        for (const match of matchesArray) {
            const key = `${match.teamName}|${match.league}|${String(match.isHome)}`
            const existing = existingMap.get(key)
            if (existing) {
                match.calendarEventId = existing.calendarEventId
                if (existing.calendarEventId) {
                    const dateChanged = existing.date && match.date &&
                        existing.date.getTime() !== match.date.getTime()
                    const placeChanged = existing.place !== match.place
                    if (dateChanged || placeChanged) updatedMatches.push(match)
                }
                existingMap.delete(key)
            } else {
                newMatches.push(match)
            }
        }

        // Anything left in existingMap was removed from the scraped data
        const deletedEventIds = []
        for (const [, val] of existingMap) {
            if (val.calendarEventId) deletedEventIds.push(val.calendarEventId)
        }

        // Replace all rows in one transaction (DELETE supports rollback, TRUNCATE does not)
        await FutureMatch.destroy({ where: {}, transaction })
        await FutureMatch.bulkCreate(matchesArray, {
            updateOnDuplicate: ['teamLogo', 'date', 'place', 'isHome', 'league', 'calendarEventId'],
            transaction
        })

        await transaction.commit()
        return { newMatches, updatedMatches, deletedEventIds }
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

export async function saveFutureMatchCalendarEventId(teamName, league, isHome, calendarEventId) {
    await FutureMatch.update(
        { calendarEventId },
        { where: { teamName, league, isHome } }
    )
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

export async function searchCompletedMatchesInDB(searchTerm) {
    try {
        const matches = await CompletedMatch.findAll({
            where: { teamName: { [Op.like]: `%${searchTerm}%`}}
        })
        return matches
    } catch (error) {
        throw error
    }
}