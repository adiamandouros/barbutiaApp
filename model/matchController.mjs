import { getAllFutureMatchesFromDB, getAllCompletedMatchesFromDB, getNextMatchFromDB, searchCompletedMatchesInDB } from "./matchModel.mjs";
import { cache } from "./cache.mjs";

export const getNextMatch = async (req, res, next) => {
    try {
        const cached = cache.get('nextMatch');
        if (cached) {
            req.nextGame = cached;
            if (next) next();
            return cached;
        }

        const nextMatch = await getNextMatchFromDB()
        const court = await nextMatch.getCourt()
        const ourTeam = "Μπαρμπούτια"
        const ourLogo = "/imgs/logo-transparent.png"
        const nextGame = []
        // req.nextGame = []
        if(nextMatch.isHome){
            nextGame.teams = {
                team1: ourTeam,
                team1Logo: ourLogo,
                team2: nextMatch.teamName,
                team2Logo: nextMatch.teamLogo
            }
        }else{
            nextGame.teams = {
                team1: nextMatch.teamName,
                team1Logo: nextMatch.teamLogo,
                team2: ourTeam,
                team2Logo: ourLogo
            }
        }
        
        nextGame.place = nextMatch.place
        nextGame.isHome = nextMatch.isHome
        nextGame.league = nextMatch.league
        nextGame.placeLink = court.link

        const date = new Date(nextMatch.date)
        nextGame.date = new Intl.DateTimeFormat('el-GR', { 
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date)
        
        if (next){
            req.nextGame = nextGame
            req.nextGame.push(1) //So handlebars will know the array is not []
            cache.set('nextMatch', req.nextGame);
            next()
        }
        return nextGame
    }catch(err) {
        console.error(err)
        if (next) next(err)
    }
}

export const getFutureMatches = async (req, res, next) => {
    try {
        const cached = cache.get('futureMatches');
        if (cached) {
            req.futureMatches = cached;
            next();
            return;
        }

        console.log('🔍 Getting future matches for display...');
        const futureMatches = await getAllFutureMatchesFromDB();
        
        if (!futureMatches || futureMatches.length === 0) {
            console.log('⚠️ No future matches found, setting empty array');
            req.futureMatches = [];
            next();
            return;
        }
        
        const ourLogo = "/imgs/logo-transparent.png";
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
        console.log(`✅ Processed ${req.futureMatches.length} future matches for display`);
        cache.set('futureMatches', req.futureMatches);
        next();
    }catch(err) {
        console.error('❌ Error in getFutureMatches:', err.message);
        // Set empty array to prevent template errors
        req.futureMatches = [];
        // Don't crash the route - continue with empty data
        next();
    }
}

export const getCompletedMatches = async (req, res, next) => {
    try {
        const cached = cache.get('completedMatches');
        if (cached) {
            req.matchHistoryArray = cached;
            next();
            return;
        }

        console.log('🔍 Getting completed matches for display...');
        const completedMatchesResponse = await getAllCompletedMatchesFromDB();
        
        if (!completedMatchesResponse || completedMatchesResponse.length === 0) {
            console.log('⚠️ No completed matches found, setting empty array');
            req.matchHistoryArray = [];
            next();
            return;
        }
        
        const completedMatches = completedMatchesResponse.map(match => match.toJSON());
        req.matchHistoryArray = completedMatches.map(match => massageCompletedMatchData(match));
        console.log(`✅ Processed ${req.matchHistoryArray.length} completed matches for display`);
        cache.set('completedMatches', req.matchHistoryArray);
        next();
    }catch(err) {
        console.error('❌ Error in getCompletedMatches:', err.message);
        // Set empty array to prevent template errors
        req.matchHistoryArray = [];
        // Don't crash the route - continue with empty data
        next();
    }
}

export const searchMatches = async (req, res) => {
    try{
        const foundMatches = await searchCompletedMatchesInDB(req.query.search)
        req.foundMatches = foundMatches.map(match => massageCompletedMatchData(match.toJSON()))
    }catch(err){
        console.error(err)
    }
}

function massageCompletedMatchData(match) {
    const ourLogo = "/imgs/logo-transparent.png"
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
}