import { readdirSync, readFileSync, readlinkSync } from 'fs'
import { join } from 'path'
import { setTimeout as sleep } from 'timers/promises'

// Stops old copies of this app, the same way Wayhop does (its server/processes.js).
// The hosting account may run 100 threads at once, all its apps together, and each
// Node app takes about 11. Copies left running after restarts filled it twice, and
// past the limit nothing new can start, not even a shell.
//
// LiteSpeed runs each app as a process named "lsnode:<app folder>", so the copies of
// this app are the lsnode processes in its folder. Two may run at once for a while
// (a restart, or one more under load). One STALE_MS older than the newest is left
// over from before a restart. Only the newest copy stops any, so two copies never
// stop each other, and other apps' copies are left alone.

const STALE_MS = 10 * 60 * 1000 // 10 minutes
const GUARD_EVERY_MS = 5 * 60 * 1000 // 5 minutes
// SIGTERM, then SIGKILL for a copy still running this much later
const STOP_WAIT_MS = 10 * 1000 // 10 seconds

const LSNODE = /^lsnode:/
// /proc counts start times in these ticks on every Linux
const USER_HZ = 100

// Reads /proc rather than running ps, because that starts no process and so works
// even when the account is at its limit
export function readProcesses(procDir = '/proc') {
    const bootTime = Number(/^btime (\d+)$/m.exec(readFileSync(join(procDir, 'stat'), 'utf8'))?.[1] ?? 0)
    const processes = []
    for (const name of readdirSync(procDir)) {
        if (!/^\d+$/.test(name)) continue
        const dir = join(procDir, name)
        try {
            const status = readFileSync(join(dir, 'status'), 'utf8')
            const field = key => Number(new RegExp(`^${key}:\\s+(\\d+)`, 'm').exec(status)?.[1])
            // The fields after the command name in brackets (which may hold spaces
            // and brackets itself), from the 3rd. The start time is the 22nd.
            const stat = readFileSync(join(dir, 'stat'), 'utf8')
            const startTicks = Number(stat.slice(stat.lastIndexOf(')') + 2).split(' ')[19])
            let cwd = null
            try { cwd = readlinkSync(join(dir, 'cwd')) } catch { /* another user's */ }
            processes.push({
                pid: Number(name),
                ppid: field('PPid'),
                uid: field('Uid'),
                started: (bootTime + startTicks / USER_HZ) * 1000,
                cmd: readFileSync(join(dir, 'cmdline'), 'utf8').split('\0').join(' ').trim(),
                cwd
            })
        } catch { /* ended while being read */ }
    }
    return processes
}

const appDir = p => (p.cwd ?? p.cmd.replace(LSNODE, '')).replace(/(.)\/+$/, '$1')

// The copies of the app in the same folder as process `pid`, oldest first. An lsnode
// process started by an lsnode process is part of that copy, not a copy of its own.
function copiesOfApp(processes, uid, pid) {
    const lsnode = processes.filter(p => p.uid === uid && LSNODE.test(p.cmd))
    const self = lsnode.find(p => p.pid === pid)
    if (!self) return []
    const ids = new Set(lsnode.map(p => p.pid))
    return lsnode
        .filter(p => !ids.has(p.ppid) && appDir(p) === appDir(self))
        .sort((a, b) => a.started - b.started)
}

// Checks each copy by pid and start time before SIGKILL, so a new process given the
// same pid is left alone
async function stopProcesses(copies, { procDir, kill, wait }) {
    const send = (pid, signal) => { try { kill(pid, signal) } catch { /* already gone */ } }
    for (const copy of copies) send(copy.pid, 'SIGTERM')
    await sleep(wait)
    const running = readProcesses(procDir)
    for (const copy of copies) {
        if (running.some(p => p.pid === copy.pid && p.started === copy.started)) send(copy.pid, 'SIGKILL')
    }
}

export function createProcessGuard({
    procDir = '/proc',
    uid = process.getuid?.() ?? -1,
    pid = process.pid,
    kill = (pid, signal) => process.kill(pid, signal),
    wait = STOP_WAIT_MS,
    staleMs = STALE_MS,
    log = console.warn
} = {}) {
    // Returns the pids it stopped
    async function tidy() {
        const copies = copiesOfApp(readProcesses(procDir), uid, pid)
        const newest = copies.at(-1)
        if (newest?.pid !== pid) return []
        const stale = copies.filter(copy => newest.started - copy.started >= staleMs)
        if (stale.length === 0) return []
        log(`Process guard: stopping ${stale.length} old copies of this app: ` +
            stale.map(copy => `${copy.pid} (started ${new Date(copy.started).toISOString()})`).join(', '))
        await stopProcesses(stale, { procDir, kill, wait })
        return stale.map(copy => copy.pid)
    }

    function start() {
        const run = () => tidy().catch(err => log(`Process guard: ${err.message}`))
        run()
        setInterval(run, GUARD_EVERY_MS).unref()
    }

    return { tidy, start }
}
