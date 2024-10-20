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
    // const upcomingMatchesURL = "asdf"
    const ourLogo = "https://basketaki-web.b-cdn.net/teams/barboutia.png"
    const pageScraper= new PageScraper(upcomingMatchesURL)
    const nextGame = [] //not an object, to cooperate with handlebars
    
    try{
        await pageScraper.fetchData()
        const data = await pageScraper.getData()
        const $ = data!=null ? await cheerio.load(data) : null

        //Basketaki td names are stupid.
        const match = $("tbody tr").first()
        const teamName = $(match).find('.team-meta__name').text().trim()
        const teamLogo = $(match).find('.team-meta__logo a img').attr('src').trim()
        const date = $(match).find('td:nth-child(2)').text().trim()
        const place = $(match).find('.team-result__assists').text().trim()
        const isHome = (match).find('.team-result__status').text().trim()==="Home" ? true : false
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

router.get("/matches", (req, res) => {
    res.render("matches", {subtitle: pageSubtitle.getSubtitle(), scripts: scripts, matches:true})
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