import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { after, test } from 'node:test'
import { createProcessGuard, readProcesses } from '../tools/processGuard.mjs'

const UID = 1000
const BOOT = 1_700_000_000
const MINUTE_TICKS = 60 * 100
const tmp = mkdtempSync(join(tmpdir(), 'process-guard-'))
after(() => rmSync(tmp, { recursive: true, force: true }))

// A /proc folder holding the given processes. `minutes` is when each started,
// counted from boot.
let folders = 0
function fakeProc(processes) {
    const procDir = join(tmp, String(folders++))
    mkdirSync(procDir)
    writeFileSync(join(procDir, 'stat'), `cpu 0 0 0\nbtime ${BOOT}\n`)
    for (const { pid, ppid = 1, uid = UID, minutes = 0, cmd, cwd } of processes) {
        const dir = join(procDir, String(pid))
        mkdirSync(dir)
        writeFileSync(join(dir, 'status'), `Name:\tnode\nPPid:\t${ppid}\nUid:\t${uid}\t${uid}\t${uid}\t${uid}\n`)
        const after = Array(19).fill(0)
        after[19] = minutes * MINUTE_TICKS
        writeFileSync(join(dir, 'stat'), `${pid} (lsnode:/a (b)) ${after.join(' ')} 0\n`)
        writeFileSync(join(dir, 'cmdline'), cmd.replaceAll(' ', '\0') + '\0')
        if (cwd) symlinkSync(cwd, join(dir, 'cwd'))
    }
    return procDir
}

function guardFor(procDir, pid) {
    const signals = []
    const guard = createProcessGuard({
        procDir, pid, uid: UID, wait: 0, log: () => {},
        kill: (target, signal) => signals.push([target, signal])
    })
    return { guard, signals }
}

const bar = '/home/u/barbutia'

test('the newest copy stops a copy 10 minutes older, and SIGKILLs it if it stays', async () => {
    const procDir = fakeProc([
        { pid: 10, minutes: 0, cmd: `lsnode:${bar}/`, cwd: bar },
        { pid: 20, minutes: 30, cmd: `lsnode:${bar}/`, cwd: bar }
    ])
    const { guard, signals } = guardFor(procDir, 20)
    assert.deepEqual(await guard.tidy(), [10])
    assert.deepEqual(signals, [[10, 'SIGTERM'], [10, 'SIGKILL']])
})

test('a copy that is not the newest stops nothing', async () => {
    const procDir = fakeProc([
        { pid: 10, minutes: 0, cmd: `lsnode:${bar}/`, cwd: bar },
        { pid: 20, minutes: 30, cmd: `lsnode:${bar}/`, cwd: bar }
    ])
    assert.deepEqual(await guardFor(procDir, 10).guard.tidy(), [])
})

test('a copy under 10 minutes older is left running', async () => {
    const procDir = fakeProc([
        { pid: 10, minutes: 25, cmd: `lsnode:${bar}/`, cwd: bar },
        { pid: 20, minutes: 30, cmd: `lsnode:${bar}/`, cwd: bar }
    ])
    assert.deepEqual(await guardFor(procDir, 20).guard.tidy(), [])
})

test('other apps, other users and plain node processes are left alone', async () => {
    const procDir = fakeProc([
        { pid: 10, minutes: 0, cmd: 'lsnode:/home/u/wayhop/', cwd: '/home/u/wayhop' },
        { pid: 11, minutes: 0, uid: 1001, cmd: `lsnode:${bar}/`, cwd: bar },
        { pid: 12, minutes: 0, cmd: 'node app.mjs', cwd: bar },
        { pid: 20, minutes: 30, cmd: `lsnode:${bar}/`, cwd: bar }
    ])
    assert.deepEqual(await guardFor(procDir, 20).guard.tidy(), [])
})

test('an lsnode process started by a copy is not a copy of its own', async () => {
    const procDir = fakeProc([
        { pid: 10, minutes: 0, cmd: `lsnode:${bar}/`, cwd: bar },
        { pid: 20, ppid: 10, minutes: 30, cmd: `lsnode:${bar}/`, cwd: bar }
    ])
    assert.deepEqual(await guardFor(procDir, 10).guard.tidy(), [])
})

test('off the host, where this process is not lsnode, it stops nothing', async () => {
    const procDir = fakeProc([
        { pid: 10, minutes: 0, cmd: `lsnode:${bar}/`, cwd: bar },
        { pid: 20, minutes: 30, cmd: 'node app.mjs', cwd: bar }
    ])
    assert.deepEqual(await guardFor(procDir, 20).guard.tidy(), [])
})

test('folders are told apart by name where cwd cannot be read', async () => {
    const procDir = fakeProc([
        { pid: 10, minutes: 0, cmd: `lsnode:${bar}/` },
        { pid: 11, minutes: 0, cmd: 'lsnode:/home/u/wayhop/' },
        { pid: 20, minutes: 30, cmd: `lsnode:${bar}/` }
    ])
    assert.deepEqual(await guardFor(procDir, 20).guard.tidy(), [10])
})

// Real processes named the way LiteSpeed names them
function startCopy(cwd) {
    const script = `process.title = 'lsnode:' + process.cwd(); process.send('up'); setInterval(() => {}, 1000)`
    const copy = spawn(process.execPath, ['-e', script, 'x'.repeat(500)], { cwd, stdio: ['ignore', 'ignore', 'ignore', 'ipc'] })
    const exited = new Promise(resolve => copy.once('exit', (code, signal) => resolve(signal)))
    return new Promise(resolve => copy.once('message', () => resolve({ copy, exited })))
}

test('reads real processes from /proc and really stops the old copy', { skip: process.platform !== 'linux' }, async () => {
    const dir = realpathSync(mkdtempSync(join(tmp, 'app-')))
    const old = await startCopy(dir)
    await sleep(100) // /proc counts start times in hundredths of a second
    const newest = await startCopy(dir)
    try {
        const shown = readProcesses().find(p => p.pid === newest.copy.pid)
        assert.match(shown.cmd, /^lsnode:/)
        assert.equal(shown.cwd, dir)

        const guard = createProcessGuard({ pid: newest.copy.pid, staleMs: 50, wait: 200, log: () => {} })
        assert.deepEqual(await guard.tidy(), [old.copy.pid])
        assert.equal(await old.exited, 'SIGTERM')
        assert.equal(newest.copy.exitCode, null)
        assert.equal(newest.copy.signalCode, null)
    } finally {
        old.copy.kill('SIGKILL')
        newest.copy.kill('SIGKILL')
        await newest.exited
    }
})
