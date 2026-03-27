import {getAllStandingsFromDB} from "./standingsModel.mjs";
import { cache } from "./cache.mjs";

export const getStandings = async (req, res, next) => {
    try {
        const cached = cache.get('standings');
        if (cached) {
            req.standingsTable = cached;
            next();
            return;
        }

        const standings = await getAllStandingsFromDB()
        req.standingsTable = standings.map(s => s.toJSON())
        cache.set('standings', req.standingsTable);
        next()
    }catch(err) {
        console.error(err)
        next(err)
    }
}