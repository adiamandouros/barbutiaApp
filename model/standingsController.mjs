import {getAllStandingsFromDB} from "./standingsModel.mjs";

export const getStandings = async (req, res, next) => {
    try {
        const standings = await getAllStandingsFromDB()
        req.standingsTable = standings.map(s => s.toJSON())
        next()
    }catch(err) {
        console.error(err)
        next(err)
    }
}