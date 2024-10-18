import express from 'express'
import { body, validationResult } from 'express-validator'
import { PageSubtitle } from './pageSubtitle.mjs'

const router = express.Router()
const pageSubtitle= new PageSubtitle()
const scripts = [{script: 'js/yolk.js'}]

router.get("/", (req, res) => {
    res.render("index", {subtitle: pageSubtitle.getSubtitle(), scripts: scripts, index:true})
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