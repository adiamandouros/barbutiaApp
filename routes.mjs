import express from 'express'
import { body, validationResult } from 'express-validator'
import { PageSubtitle } from './pageSubtitle.mjs'
import { PageScraper } from './PageScraper.mjs'
import * as cheerio from 'cheerio';

const router = express.Router()
const pageSubtitle= new PageSubtitle()
const scripts = [{script: 'js/yolk.js'}]

router.get("/", async (req, res) => {
    const upcomingMatchesURL = "https://www.basketaki.com/teams/barboutia/schedule"
    const ourLogo = "/imgs/logo-transparent.png"
    const pageScraper= new PageScraper(upcomingMatchesURL)
    const nextGame = [] //not an object, to cooperate with handlebars
    
    try{
        await pageScraper.initialize()
        const data = await pageScraper.getData()
        const $ = data!=null ? await cheerio.load(data) : null

        //Basketaki td names are stupid.
        const match = $("tbody tr").first()
        const teamName = $(match).find('.team-meta__name').text().trim()
        const teamLogo = $(match).find('.team-meta__logo a img').attr('src').trim()
        const date = $(match).find('td:nth-child(2)').text().trim()
        const place = $(match).find('.team-result__assists').text().trim()
        const isHome = $(match).find('.team-result__status').text().trim()==="Home" ? true : false
        nextGame.place = place
        nextGame.date = date

        if (isHome){
            nextGame.teams = {
                team1: "Μπαρμπούτια",
                team1Logo: ourLogo,
                team2 : teamName,
                team2Logo: teamLogo
            }
        }else{
            nextGame.teams = {
                team1: teamName,
                team1Logo: teamLogo,
                team2 : "Μπαρμπούτια",
                team2Logo: ourLogo
            }
        }

        nextGame.push(1) //So handlebars will know the array is not []
    }catch(err){
        console.error("No proper data fetch")
        console.error(err)
    }

    res.render("index", {subtitle: pageSubtitle.getSubtitle(), scripts: scripts, nextGame: nextGame, index:true})
})

router.get("/roster", async (req,res) => {
    res.render("roster", {subtitle: pageSubtitle.getSubtitle(), scripts: scripts, roster:true})
})

router.get("/matches", async(req, res) => {

    const upcomingMatchesURL = "https://www.basketaki.com/teams/barboutia/schedule"
    const ourLogo = "/imgs/logo-transparent.png"
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
            const place = $(row).find('.team-result__assists').text().trim()
            const league = $(row).find('.team-result__points').text().trim()
            const isHome = $(row).find('.team-result__status').text().trim()==="Home" ? true : false
            match.date = date
            match.place = place
            match.league = league

            console.log(date)
            console.log(teamName)
            console.log(teamLogo)
            console.log(place)

            if (isHome){
                match.teams = {
                    team1: "Μπαρμπούτια",
                    team1Logo: ourLogo,
                    team2 : teamName,
                    team2Logo: teamLogo
                }
            }else{
                match.teams = {
                    team1: teamName,
                    team1Logo: teamLogo,
                    team2 : "Μπαρμπούτια",
                    team2Logo: ourLogo
                }
            }
            futureMatchesArray.push(match)
        })

        console.log(futureMatchesArray)

        // matchesArray.push(1) //So handlebars will know the array is not []
    }catch(err){
        console.error("No proper data fetch")
        console.error(err)
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
            match.date = date
            match.article = "https://www.basketaki.com" + article
            match.league = league
            match.score = score
            match.win = result ==='W' ? true : false;

            if (isHome){
                match.teams = {
                    team1: "Μπαρμπούτια",
                    team1Logo: ourLogo,
                    team2 : teamName,
                    team2Logo: teamLogo
                }
            }else{
                match.teams = {
                    team1: teamName,
                    team1Logo: teamLogo,
                    team2 : "Μπαρμπούτια",
                    team2Logo: ourLogo
                }
            }
            matchHistoryArray.push(match)
        })

        console.log(matchHistoryArray)

        // matchesArray.push(1) //So handlebars will know the array is not []
    }catch(err){
        console.error("No proper data fetch")
        console.error(err)
    }

    res.render("matches", {subtitle: pageSubtitle.getSubtitle(), scripts: scripts, nextMatches: futureMatchesArray, previousMatches:matchHistoryArray, matches:true})
})

router.get("/standings", (req, res) => {
    res.render("standings", {subtitle: pageSubtitle.getSubtitle(), scripts: scripts, standings:true})
})

router.get("/synthimata", (req, res) => {
    res.render("synthimata", {subtitle: pageSubtitle.getSubtitle(), scripts: scripts, content:true})
})

router.get("/photos", (req, res) => {
    // scripts.push({ script: 'js/photos.js' })
    res.render("photos", {subtitle: pageSubtitle.getSubtitle(), scripts: scripts, content:true})
})

router.get("/videos", (req, res) => {
    res.render("videos", {subtitle: pageSubtitle.getSubtitle(), scripts: scripts, content:true})
})

export {router}