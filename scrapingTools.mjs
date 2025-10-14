import { PageScraper } from './PageScraper.mjs';
import * as cheerio from 'cheerio';
import { shouldUpdateFutureMatches, shouldUpdateCompletedMatches, shouldUpdateStandings } from './model/updateLimiter.mjs';
import { getNextMatchFromDB, getCurrentNextMatchFromDB, updateNextMatchInDB, updateAllCompletedMatchesInDB, updateAllFutureMatchesInDB, updateAllStandingsInDB } from './model/matchModel.mjs'

export const scrapeFutureMatches = async (req, res, next) => {
    if (!shouldUpdateFutureMatches()) {
        console.log("Skipping future matches scraping due to update limiter.");
        if (next) next();
        return null;
    }
    const upcomingMatchesURL = "https://www.basketaki.com/teams/barboutia/schedule"
    const futurePageScraper= new PageScraper(upcomingMatchesURL)
    const futureMatchesArray = [] //not an object, to cooperate with handlebars
    
    try{
        await futurePageScraper.initialize()
        const data = await futurePageScraper.getData()
        const $ = data!=null ? await cheerio.load(data) : null
        const currentNextMatch = await getNextMatchFromDB()

        //Basketaki td names are stupid.
        const matches = $("tbody tr").each((index, row) => {
            const match = {};

            const teamName = $(row).find('.team-meta__name').text().trim()
            const teamLogo = $(row).find('.team-meta__logo a img').attr('src').trim()
            const date = $(row).find('td:nth-child(2)').text().trim()
            if(date==="-") return //Skip matches without a date
            const place = $(row).find('.team-result__assists').text().trim()
            const league = $(row).find('.team-result__points').text().trim()
            const isHome = $(row).find('.team-result__status').text().trim()==="Home" ? true : false
            match.date = parseDMYHM(date)
            match.league = league
            match.isHome = isHome
            match.teamName = teamName
            match.teamLogo = teamLogo
            match.place = place

            futureMatchesArray.push(match)
        })
        await updateAllFutureMatchesInDB(futureMatchesArray)
        
        // Check if the next match has changed
        const newNextMatch = await getCurrentNextMatchFromDB()
        if (newNextMatch && (!currentNextMatch || (currentNextMatch.teamName !== newNextMatch.teamName || currentNextMatch.date.getTime() !== newNextMatch.date.getTime() || currentNextMatch.isHome !== newNextMatch.isHome || currentNextMatch.league !== newNextMatch.league))) {
            // There is a new next match, update it in the NextMatch table
            await updateNextMatchInDB(newNextMatch)
        }
        next()
        return futureMatchesArray;
        

    }catch(err){
        console.error("ERROR DURING FUTURE MATCH SCRAPING AND DB INSERTION!!!")
        console.error(err)
        if (next) next(err);

        return null;
    }
}

export const scrapeCompletedMatches = async (req, res, next) => {
    if (!shouldUpdateCompletedMatches()) {
        console.log("Skipping completed matches scraping due to update limiter.");
        if (next) next();
        return null;
    }
    const matchHistoryURL = "https://www.basketaki.com/teams/barboutia/results"
    const historyPageScraper= new PageScraper(matchHistoryURL)
    const matchHistoryArray = []

    try{
        await historyPageScraper.initialize()
        const data = await historyPageScraper.getData()
        const $ = data!=null ? await cheerio.load(data) : null

        //Basketaki td names are stupid.
        const matches = $("tbody tr").each((index, row) => {
            const match = {};

            const teamName = $(row).find('.team-meta__name').text().trim()
            const teamLogo = $(row).find('.team-meta__logo a img').attr('src').trim()
            const date = $(row).find('td:nth-child(1)').text().trim()
            const article = $(row).find('td:nth-child(8) a').attr('href').trim()
            const league = $(row).find('.team-result__points').text().trim()
            const result = $(row).find('td:nth-child(3)').text().trim()
            const score = $(row).find('td:nth-child(4)').text().trim()
            const isHome = $(row).find('.team-result__status').text().trim()==="Home" ? true : false
            const place = $(row).find('.team-result__assists').text().trim()
            match.teamName = teamName
            match.teamLogo = teamLogo
            match.league = league
            match.date = toISODate(date)
            match.article = "https://www.basketaki.com" + article
            match.score = score.split(' - ').map(s => s.trim())
            match.isHome = isHome
            match.place = place
            match.isWin = result ==='W' ? true : false;
            match.homeTeamScore = match.score[0]
            match.awayTeamScore = match.score[1]

            matchHistoryArray.push(match)
        })
        await updateAllCompletedMatchesInDB(matchHistoryArray)
        if (next) next()
        return matchHistoryArray;

    }catch(err){
        console.error("ERROR DURING COMPLETED MATCH SCRAPING AND DB INSERTION!!!")
        console.error(err)
        if (next) next(err);
        return null;
    }
}

function toISODate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
}

function parseDMYHM(dateTimeStr) {
    // Expects "DD/MM/YYYY HH:MM"
    const [datePart, timePart] = dateTimeStr.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
}

export const scrapeStandings = async (req, res, next) => {
    if (!shouldUpdateStandings()) {
        console.log("Skipping standings scraping due to update limiter.");
        // if (next) next();
        return null;
    }
    const standingsURL = "https://www.basketaki.com/teams/barboutia/standings"
    const standingsPageScraper= new PageScraper(standingsURL)
    const standingsArray = []

    try{
        await standingsPageScraper.initialize()
        const data = await standingsPageScraper.getData()
        const $ = data!=null ? await cheerio.load(data) : null

        //Basketaki td names are stupid.
        const leagueTable = $("tbody").eq(1) //The second table is the league standings
        const standings = $(leagueTable).find("tr").each((index, row) => {
            const team = {};

            const position = $(row).find('.team-standings__pos ').text().trim()
            const teamName = $(row).find('.team-meta__name').text().trim()
            const teamLogo = $(row).find('.team-meta__logo img').attr('src').trim()
            const points = $(row).find('.team-standings__gb').eq(0).text().trim()
            const gamesPlayed = $(row).find('.team-standings__gb').eq(1).text().trim()
            const wins = $(row).find('.team-standings__win').text().trim()
            const losses = $(row).find('.team-standings__lose').text().trim()
            const pointsFor = $(row).find('.team-standings__home').text().trim()
            const pointsAgainst = $(row).find('.team-standings__road').text().trim()
            const pointsDiff = $(row).find('.team-standings__diff').text().trim()

            team.position = position
            team.teamName = teamName
            team.teamLogo = teamLogo
            team.gamesPlayed = gamesPlayed
            team.wins = wins
            team.losses = losses
            team.pointsFor = pointsFor
            team.pointsAgainst = pointsAgainst
            team.pointsDiff = pointsDiff
            team.points = points

            standingsArray.push(team)
            // console.log(team)
        })

        await updateAllStandingsInDB(standingsArray)
        req.standingsArray = standingsArray
        // if(next) next()
        return null

    }catch(err){
        console.error("ERROR DURING STANDINGS SCRAPING AND DB INSERTION!!!")
        console.error(err)
        next(err)
    }
}