import { Standings } from "./dbmodel.mjs";

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