import express from 'express'
import { PageSubtitle } from './pageSubtitle.mjs'
import { scrapeFutureMatches, scrapeCompletedMatches, scrapeStandings, scrapePlayerStats } from './scrapingTools.mjs'
import { getNextMatch, getFutureMatches, getCompletedMatches, getStandings, getRoster } from './model/matchController.mjs'

const router = express.Router()
const pageSubtitle= new PageSubtitle()
const scripts = [{script: 'js/yolk.js'}]

router.get("/", getNextMatch, async (req, res, next) => {
    res.render("index", {subtitle: pageSubtitle.getSubtitle(), scripts: scripts, nextGame: req.nextGame, index:true})
    next()
}, scrapeFutureMatches, scrapeCompletedMatches, scrapeStandings, scrapePlayerStats)

// router.get("/", scrapePlayerStats)

router.get("/roster", getRoster, async (req,res) => {
    res.render("roster", {subtitle: pageSubtitle.getSubtitle(), scripts: scripts, players: req.roster, roster:true})
}, scrapeFutureMatches, scrapeCompletedMatches, scrapeStandings, scrapePlayerStats)

router.get("/matches", getFutureMatches, getCompletedMatches, async(req, res, next) => {
    res.render("matches", {subtitle: pageSubtitle.getSubtitle(), scripts: scripts, nextMatches: req.futureMatches, previousMatches:req.matchHistoryArray, matches:true})
    next()
}, scrapeFutureMatches, scrapeCompletedMatches, scrapeStandings, scrapePlayerStats)

router.get("/standings", getStandings, (req, res, next) => {
    res.render("standings", {subtitle: pageSubtitle.getSubtitle(), standingsTable: req.standingsTable, scripts: scripts, standings:true})
    next()
}, scrapeFutureMatches, scrapeCompletedMatches, scrapeStandings, scrapePlayerStats)

router.get("/synthimata", (req, res) => {
    res.render("synthimata", {subtitle: pageSubtitle.getSubtitle(), scripts: scripts, content:true})
}, scrapeFutureMatches, scrapeCompletedMatches, scrapeStandings, scrapePlayerStats)

router.get("/photos", (req, res) => {
    // scripts.push({ script: 'js/photos.js' })
    res.render("photos", {subtitle: pageSubtitle.getSubtitle(), scripts: scripts, content:true})
}, scrapeFutureMatches, scrapeCompletedMatches, scrapeStandings, scrapePlayerStats)

router.get("/videos", (req, res) => {
    res.render("videos", {subtitle: pageSubtitle.getSubtitle(), scripts: scripts, content:true})
}, scrapeFutureMatches, scrapeCompletedMatches, scrapeStandings, scrapePlayerStats)

//API routes for fetching data (if needed)
router.get("/api/nextmatch", getNextMatch, (req, res) => {
    res.json(req.nextGame)
})

router.get("/api/futurematches", getFutureMatches, (req, res) => {
    res.json(req.futureMatches)
})

router.get("/api/completedmatches", getCompletedMatches, (req, res) => {
    res.json(req.matchHistoryArray)
})

router.get("/api/standings", getStandings, (req, res) => {
    res.json(req.standingsTable)
})

router.get("/api/roster", getRoster, (req,res) => {
    res.json(req.roster)
})

router.get("/api/BAR", (req, res) => {
    res.send("BUTIA")
})

export {router}