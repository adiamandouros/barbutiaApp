import assert from 'node:assert/strict'
import { mock, test } from 'node:test'

const HOUR = 60 * 60 * 1000

// Stands in for the database, which dbmodel.mjs connects to as soon as it's imported
let storedMatches = []
let tableCleared = false
const FutureMatch = {
    sequelize: { transaction: async () => ({ commit: async () => {}, rollback: async () => {} }) },
    findAll: async () => storedMatches,
    destroy: async () => { tableCleared = true },
    bulkCreate: async () => {}
}
mock.module(new URL('../model/dbmodel.mjs', import.meta.url).href, {
    namedExports: { FutureMatch, CompletedMatch: {}, NextMatch: {} }
})
const { updateAllFutureMatchesInDB } = await import('../model/matchModel.mjs')

const match = (teamName, date, calendarEventId) => ({
    teamName, date, calendarEventId, league: 'Master', isHome: true, place: 'Court'
})

test('a played match that left the schedule keeps its calendar event', async () => {
    storedMatches = [match('Played', new Date(Date.now() - 3 * HOUR), 'played-event')]
    const { deletedEventIds } = await updateAllFutureMatchesInDB([])
    assert.deepEqual(deletedEventIds, [])
})

test('an upcoming match that left the schedule loses its calendar event', async () => {
    const date = new Date(Date.now() + 3 * HOUR)
    storedMatches = [match('Cancelled', date, 'cancelled-event')]
    const { deletedEventIds } = await updateAllFutureMatchesInDB([match('Other', date)])
    assert.deepEqual(deletedEventIds, ['cancelled-event'])
})

test('an empty scrape changes nothing while upcoming matches are stored', async () => {
    tableCleared = false
    storedMatches = [
        match('Played', new Date(Date.now() - 3 * HOUR), 'played-event'),
        match('Upcoming', new Date(Date.now() + 3 * HOUR), 'upcoming-event')
    ]
    const diff = await updateAllFutureMatchesInDB([])
    assert.equal(tableCleared, false)
    assert.deepEqual(diff, { newMatches: [], updatedMatches: [], unchangedMatches: [], deletedEventIds: [] })
})

test('an empty scrape clears the table once every stored match has been played', async () => {
    tableCleared = false
    storedMatches = [match('Played', new Date(Date.now() - 3 * HOUR), 'played-event')]
    const { deletedEventIds } = await updateAllFutureMatchesInDB([])
    assert.equal(tableCleared, true)
    assert.deepEqual(deletedEventIds, [])
})

test('a match without a date that left the schedule loses its calendar event', async () => {
    storedMatches = [match('Undated', null, 'undated-event')]
    const { deletedEventIds } = await updateAllFutureMatchesInDB([])
    assert.deepEqual(deletedEventIds, ['undated-event'])
})

test('a match still on the schedule keeps its calendar event', async () => {
    const date = new Date(Date.now() + 3 * HOUR)
    storedMatches = [match('Staying', date, 'staying-event')]
    const { deletedEventIds, unchangedMatches } = await updateAllFutureMatchesInDB([match('Staying', date)])
    assert.deepEqual(deletedEventIds, [])
    assert.equal(unchangedMatches[0].calendarEventId, 'staying-event')
})
