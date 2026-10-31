import { createHash } from 'crypto'
import { readFileSync } from 'fs'

// LiteSpeed serves /content itself and browsers keep those files for 7 days, whatever
// Express says. The hash in the URL changes with the file, so a deploy reaches them at once.
const contentDir = new URL('../content/', import.meta.url)
const urls = new Map()

export function assetUrl(file) {
    if (!urls.has(file)) {
        const hash = createHash('md5').update(readFileSync(new URL(file, contentDir))).digest('hex').slice(0, 8)
        urls.set(file, `/content/${file}?v=${hash}`)
    }
    return urls.get(file)
}
