import express from 'express'
import path from 'path'
import compression from 'compression'
import { engine } from 'express-handlebars'
import { router } from './routes.mjs'
import { BarBotE } from './tools/BarBotE.mjs'
import { getNextMatch } from './model/matchController.mjs'

const app = express()

app.use(compression())

app.engine('hbs', engine({extname: ".hbs"}))
app.set('view engine', 'hbs')

// Player images: 30 days, not immutable (photos may change between seasons)
app.use('/imgs/players', express.static(path.join('content', 'imgs', 'players'), {
    maxAge: '30d',
    etag: true,
    lastModified: true
}))

// Logo, backgrounds, and all other static images: 30 days, immutable
app.use('/imgs', express.static(path.join('content', 'imgs'), {
    maxAge: '30d',
    immutable: true,
    etag: true,
    lastModified: true
}))

// Font: 30 days, immutable (filename encodes variant; update filename if font changes)
app.use('/fonts', express.static(path.join('content', 'fonts'), {
    maxAge: '30d',
    immutable: true,
    etag: true,
    lastModified: true
}))

// Sound effects: 30 days (not immutable - file contents could be swapped)
app.use('/sounds', express.static(path.join('content', 'sounds'), {
    maxAge: '30d',
    etag: true,
    lastModified: true,
    immutable: true
}))

// Everything else in content (CSS, JS, favicons, etc.)
app.use(express.static("content"))

//middleware gia na diavazei to request body
app.use(express.urlencoded({extended: false}))

app.use("/", router)

app.use((req, res) => {
    res.redirect("/")
})

app.use((err, req, res, next) => {
    console.log(err.stack)
    res.render("error", { message: err.message })
})

const barBot = new BarBotE()
export default barBot

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log("App has started in port " + PORT))
