import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { assetUrl } from '../tools/assetUrl.mjs'

const views = readdirSync('views', { recursive: true }).filter(f => f.endsWith('.hbs')).map(f => join('views', f))
const sources = [...views, 'content/css/main.css', 'content/js/yolk.js', 'content/js/photos.js', 'model/matchController.mjs', 'routes.mjs']

test('every /content URL in the source points to a file', () => {
    const missing = []
    for (const source of sources) {
        for (const [, url] of readFileSync(source, 'utf8').matchAll(/["'(]\/content\/([^"')?{]+)/g)) {
            // A URL with a player's jersey in it stops at the {{
            if (!url.endsWith('/') && !existsSync(join('content', url))) missing.push(`${source}: ${url}`)
        }
    }
    assert.deepEqual(missing, [])
})

test('nothing still uses the addresses from before /content', () => {
    const old = []
    for (const source of sources) {
        for (const line of readFileSync(source, 'utf8').split('\n')) {
            if (/["'(]\/(css|js|imgs|fonts|sounds)\//.test(line) || line.includes('barbutia.fans/content')) old.push(`${source}: ${line.trim()}`)
        }
    }
    assert.deepEqual(old, [])
})

test('assetUrl gives a /content URL with the file\'s hash', () => {
    assert.match(assetUrl('css/main.css'), /^\/content\/css\/main\.css\?v=[0-9a-f]{8}$/)
    assert.notEqual(assetUrl('css/main.css').split('?')[1], assetUrl('css/roster.css').split('?')[1])
})
