import { Players } from "./dbmodel.mjs";
import { Op } from 'sequelize';

export async function searchForPlayersInDB(searchTerm) {
    try {
        const players = await Players.findAll({
            where: {
                [Op.or]: [
                    { name: {[Op.like]: `%${searchTerm}%` }},
                    { surname: {[Op.like]: `%${searchTerm}%` }}
                ]
            }})
        
            return players
        } catch (error) {
        throw error
    }
}

export async function getAllPlayersFromDB() {
    try {
        const players = await Players.findAll({order: [['jersey', 'ASC']]})
        return players
    } catch (error) {
        throw error
    }
}

export async function updateAllPlayerStatsInDB(playerStats) {
    const transaction = await Players.sequelize.transaction()
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