import assert from 'node:assert/strict'
import { after, before, beforeEach, mock, test } from 'node:test'
import { setTimeout as sleep } from 'node:timers/promises'
import express from 'express'
import { engine } from 'express-handlebars'
import { assetUrl } from '../tools/assetUrl.mjs'

const moduleUrl = path => new URL(path, import.meta.url).href

// The scrapers behave like the real ones: all but the last call next()
let scrapersRun = []
const scraper = (name, callsNext = true) => (req, res, next) => {
    scrapersRun.push(name)
    if (callsNext) next()
}
mock.module(moduleUrl('../tools/scraping/scrapingTools.mjs'), {
    namedExports: {
        scrapeFutureMatches: scraper('future'),
        scrapeCompletedMatches: scraper('completed'),
        scrapeStandings: scraper('standings'),
        scrapePlayerStats: scraper('players', false)
    }
})

// The pages' data, without the database
const load = key => (req, res, next) => { req[key] = []; next() }
mock.module(moduleUrl('../model/matchController.mjs'), {
    namedExports: {
        getNextMatch: load('nextGame'),
        getFutureMatches: load('futureMatches'),
        getCompletedMatches: load('matchHistoryArray'),
        searchMatches: async () => {}
    }
})
mock.module(moduleUrl('../model/standingsController.mjs'), { namedExports: { getStandings: load('standingsTable') } })
mock.module(moduleUrl('../model/playersController.mjs'), { namedExports: { getRoster: load('roster'), searchPlayers: async () => {} } })
const { router } = await import('../routes.mjs')

let server, base, errors
before(async () => {
    const app = express()
    app.engine('hbs', engine({ extname: '.hbs', helpers: { asset: assetUrl } }))
    app.set('view engine', 'hbs')
    app.use('/content', express.static('content'))
    app.use('/', router)
    app.use((req, res) => res.redirect('/'))
    app.use((err, req, res, next) => { errors.push(err); next(err) })
    await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve) })
    base = `http://127.0.0.1:${server.address().port}`
})
after(() => server.close())
beforeEach(() => {
    scrapersRun = []
    errors = []
})

const get = path => fetch(base + path, { redirect: 'manual', signal: AbortSignal.timeout(2000) })

for (const path of ['/', '/roster', '/matches', '/standings', '/synthimata', '/photos', '/videos']) {
    test(`${path} responds and then runs every scraper`, async () => {
        const response = await get(path)
        assert.equal(response.status, 200)
        await response.text()
        await sleep(20) // anything running on past the last scraper shows up here
        assert.deepEqual(scrapersRun, ['future', 'completed', 'standings', 'players'])
        assert.deepEqual(errors, [])
    })
}

test('/api/BAR answers and runs every scraper', async () => {
    const response = await get('/api/BAR')
    assert.equal(await response.text(), 'BUTIA')
    await sleep(20)
    assert.deepEqual(scrapersRun, ['future', 'completed', 'standings', 'players'])
    assert.deepEqual(errors, [])
})

test('every /content file a page links to is served', async () => {
    for (const path of ['/', '/roster', '/standings', '/photos']) {
        const html = await (await get(path)).text()
        const urls = [...html.matchAll(/(?:href|src)="(\/content\/[^"]+)"/g)].map(([, url]) => url)
        assert.ok(urls.length > 0)
        for (const url of urls) {
            assert.equal((await get(url)).status, 200, url)
        }
    }
})

test('a page\'s CSS and JS carry their hash', async () => {
    const html = await (await get('/roster')).text()
    for (const file of ['css/main.css', 'css/main.min.css', 'css/roster.css', 'js/yolk.js']) {
        assert.ok(html.includes(assetUrl(file)), file)
    }
})
