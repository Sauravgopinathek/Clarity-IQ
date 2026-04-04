import { spawn } from 'node:child_process'
import process from 'node:process'

const [, , mode = 'web'] = process.argv

const commandSets = {
  web: [
    ['npm', ['run', 'dev:backend']],
    ['npm', ['run', 'dev:web']],
    ['npm', ['run', 'dev:electron:web']],
  ],
  app: [
    ['npm', ['run', 'dev:backend']],
    ['npm', ['run', 'dev:desktop']],
  ],
  'app-electron': [
    ['npm', ['run', 'dev']],
    ['npm', ['run', 'electron:start']],
  ],
}

const commands = commandSets[mode]

if (!commands) {
  console.error(`Unknown dev mode: ${mode}`)
  process.exit(1)
}

const children = []
let shuttingDown = false

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return
  }

  shuttingDown = true

  for (const child of children) {
    if (!child.killed) {
      child.kill()
    }
  }

  setTimeout(() => {
    process.exit(exitCode)
  }, 200)
}

for (const [command, args] of commands) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  })

  children.push(child)

  child.on('exit', (code) => {
    shutdown(code ?? 0)
  })
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
