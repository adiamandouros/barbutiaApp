import {getAllPlayersFromDB, searchForPlayersInDB} from "./playersModel.mjs";

export const getRoster = async (req, res, next) => {
    try {
        const roster = await getAllPlayersFromDB()
        req.roster = roster.map(p => p.toJSON())
        next()
    }catch(err) {
        console.error(err)
        next(err)
    }
}

export const searchPlayers = async (req, res) => {
    try {
        const searchTerm = req.query.search.toLowerCase();
        const allPlayers = await searchForPlayersInDB(searchTerm)
        req.foundPlayers = allPlayers.map(p => p.toJSON())
    }catch(err) {
        console.error(err)
    }
}