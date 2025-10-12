import { getAllFutureMatchesFromDB, getAllCompletedMatchesFromDB, getNextMatchFromDB, getAllStandingsFromDB } from "./matchModel.mjs";

export const getNextMatch = async (req, res, next) => {
    try {
        const nextMatch = await getNextMatchFromDB()
        const court = await nextMatch.getCourt()
        // req.nextMatch = nextMatch ? nextMatch.toJSON() : null
        const ourTeam = "Μπαρμπούτια"
        const ourLogo = "/imgs/logo-transparent.png"
        req.nextGame = []
        if(nextMatch.isHome){
            req.nextGame.teams = {
                team1: ourTeam,
                team1Logo: ourLogo,
                team2: nextMatch.teamName,
                team2Logo: nextMatch.teamLogo
            }
        }else{
            req.nextGame.teams = {
                team1: nextMatch.teamName,
                team1Logo: nextMatch.teamLogo,
                team2: ourTeam,
                team2Logo: ourLogo
            }
        }
        
        req.nextGame.place = nextMatch.place
        req.nextGame.isHome = nextMatch.isHome
        req.nextGame.league = nextMatch.league
        req.nextGame.placeLink = court.link

        const date = new Date(nextMatch.date)
        req.nextGame.date = new Intl.DateTimeFormat('el-GR', { 
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date)
        req.nextGame.push(1) //So handlebars will know the array is not []
        next()
    }catch(err) {
        console.error(err)
        next(err)
    }
}

export const getFutureMatches = async (req, res, next) => {
    try {
        const futureMatches = await getAllFutureMatchesFromDB()
        const ourLogo = "/imgs/logo-transparent.png"
        req.futureMatches = await Promise.all(futureMatches.map(async match => {
            const court = await match.getCourt()
            const matchObj = match.toJSON()

            // console.log(match)
            const date = new Date(matchObj.date);
            matchObj.date = new Intl.DateTimeFormat('el-GR', { 
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(date);
             matchObj.teams = match.isHome
                ? {
                    team1: "Μπαρμπούτια",
                    team1Logo: ourLogo,
                    team2: match.teamName,
                    team2Logo: match.teamLogo
                }
                : {
                    team1: match.teamName,
                    team1Logo: match.teamLogo,
                    team2: "Μπαρμπούτια",
                    team2Logo: ourLogo
                };

            matchObj.placeLink = court ? court.link : null;
            return matchObj;
        }));
        next()
    }catch(err) {
        console.error(err)
        next(err)
    }
}

export const getCompletedMatches = async (req, res, next) => {
    try {
        const completedMatchesResponse = await getAllCompletedMatchesFromDB()
        const completedMatches = completedMatchesResponse.map(match => match.toJSON())
        const ourLogo = "/imgs/logo-transparent.png"
        req.matchHistoryArray = completedMatches.map(match => {
            // console.log(match)
            const date = new Date(match.date)
            match.date = new Intl.DateTimeFormat('el-GR', { 
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(date)
            if (match.isHome){
                match.teams = {
                    team1: "Μπαρμπούτια",
                    team1Logo: ourLogo,
                    team2 : match.teamName,
                    team2Logo: match.teamLogo,
                    team1Score: match.homeTeamScore,
                    team2Score: match.awayTeamScore
                }
            }else{
                match.teams = {
                    team1: match.teamName,
                    team1Logo: match.teamLogo,
                    team2 : "Μπαρμπούτια",
                    team2Logo: ourLogo,
                    team1Score: match.awayTeamScore,
                    team2Score: match.homeTeamScore
                }
            }
            match.score = match.homeTeamScore + " - " + match.awayTeamScore
            return match
        })
        next()
    }catch(err) {
        console.error(err)
        next(err)
    }
}

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