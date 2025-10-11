import { PageScraper } from './PageScraper.mjs';
import * as cheerio from 'cheerio';
import { addFutureMatchToDB, addCompletedMatchToDB, getNextMatchFromDB, getCurrentNextMatchFromDB, updateNextMatchInDB } from './model/matchModel.mjs'

export const scrapeFutureMatches = async (req, res, next) => {
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

            addFutureMatchToDB(match)
            futureMatchesArray.push(match)
        })

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
            match.win = result ==='W' ? true : false;
            match.homeTeamScore = match.score[0]
            match.awayTeamScore = match.score[1]

            addCompletedMatchToDB(match)
            matchHistoryArray.push(match)
        })

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
    const standingsURL = "https://www.basketaki.com/teams/barboutia/standings"
    const standingsPageScraper= new PageScraper(standingsURL)
    const standingsArray = []

    try{
        await standingsPageScraper.initialize()
        const data = await standingsPageScraper.getData()
        const $ = data!=null ? await cheerio.load(data) : null

        //Basketaki td names are stupid.
        const standings = $("tbody tr").each((index, row) => {
            const team = {};

            const position = $(row).find('td:nth-child(1)').text().trim()
            const teamName = $(row).find('.team-meta__name').text().trim()
            const teamLogo = $(row).find('.team-meta__logo a img').attr('src').trim()
            const gamesPlayed = $(row).find('td:nth-child(3)').text().trim()
            const wins = $(row).find('td:nth-child(4)').text().trim()
            const losses = $(row).find('td:nth-child(5)').text().trim()
            const pointsFor = $(row).find('td:nth-child(6)').text().trim()
            const pointsAgainst = $(row).find('td:nth-child(7)').text().trim()
            const pointsDiff = $(row).find('td:nth-child(8)').text().trim()
            const points = $(row).find('td:nth-child(9)').text().trim()

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
        })

        req.standingsArray = standingsArray
        next()

    }catch(err){
        console.error("ERROR DURING STANDINGS SCRAPING AND DB INSERTION!!!")
        console.error(err)
        next(err)
    }
}