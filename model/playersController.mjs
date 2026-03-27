import {getAllPlayersFromDB, searchForPlayersInDB} from "./playersModel.mjs";
import { cache } from "./cache.mjs";

export const getRoster = async (req, res, next) => {
    try {
        const cached = cache.get('roster');
        if (cached) {
            req.roster = cached;
            next();
            return;
        }

        const roster = await getAllPlayersFromDB()
        req.roster = roster.map(p => p.toJSON())
        cache.set('roster', req.roster);
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