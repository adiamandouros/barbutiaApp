import { Players } from "./dbmodel.mjs";
import { Op } from 'sequelize';

export async function searchForPlayersInDB(searchTerm) {
    try {
        const players = await Players.findAll({
            where: {
                [Op.or]: [
                    { name: {[Op.like]: `%${searchTerm}%` }},
                    { surname: {[Op.like]: `%${searchTerm}%` }},
                    { nickname: {[Op.like]: `%${searchTerm}%` }}
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

function parseBasketakiName(basketakiName) {
    const nameParts = basketakiName.trim().split(/\s+/);
    
    if (nameParts.length === 0) {
        return { name: 'Άγνωστος', surname: 'Παίκτης' };
    } else if (nameParts.length === 1) {
        return { name: nameParts[0], surname: '' };
    } else if (nameParts.length === 2) {
        // "Surname Firstname" format
        return { name: nameParts[1], surname: nameParts[0] };
    } else {
        // Multiple parts: first part as surname, last part as name
        return { 
            name: nameParts[nameParts.length - 1], 
            surname: nameParts[0] 
        };
    }
}

export async function updateAllPlayerStatsInDB(playerStats) {
    const transaction = await Players.sequelize.transaction()
    try {
        // Process each player stat to add parsed name and surname for new players
        const processedPlayerStats = playerStats.map(playerStat => {
            const parsedName = parseBasketakiName(playerStat.basketakiName);
            
            return {
                ...playerStat,
                name: playerStat.name || parsedName.name,
                surname: playerStat.surname || parsedName.surname,
                nickname: playerStat.nickname || ''
            };
        });

        await Players.bulkCreate(processedPlayerStats, { updateOnDuplicate:
            [ 'matches', 'mvpAwards', 'points', 'pointsAvg', 'rebounds', 'reboundsAvg', 'assists', 'assistsAvg', 'steals', 'stealsAvg', 'blocks', 'blocksAvg', 'turnovers', 'turnoversAvg', 'freeThrowsPercentage', 'twoPointsPercentage', 'threePointsPercentage' ] },
            {transaction})
        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}