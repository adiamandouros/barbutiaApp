import { PageScraper } from './PageScraper.mjs';
import * as cheerio from 'cheerio';
import { addFutureMatchToDB, addCompletedMatchToDB } from './model/matchModel.mjs'

export const scrapeFutureMatches = async (req, res, next) => {
    const upcomingMatchesURL = "https://www.basketaki.com/teams/barboutia/schedule"
    const futurePageScraper= new PageScraper(upcomingMatchesURL)
    const futureMatchesArray = [] //not an object, to cooperate with handlebars
    
    try{
        await futurePageScraper.initialize()
        const data = await futurePageScraper.getData()
        const $ = data!=null ? await cheerio.load(data) : null

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

        return futureMatchesArray;

    }catch(err){
        console.error("No proper data fetch")
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
            if(isHome){
                match.homeTeamScore = match.score[0]
                match.awayTeamScore = match.score[1]
            }else{
                match.homeTeamScore = match.score[1]
                match.awayTeamScore = match.score[0]
            }

            addCompletedMatchToDB(match)
            matchHistoryArray.push(match)
        })
        
        return matchHistoryArray;

    }catch(err){
        console.error("No proper data fetch")
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