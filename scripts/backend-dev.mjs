import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '..')
const backendDir = path.join(rootDir, 'packages', 'backend')
const tscPath = path.join(rootDir, 'node_modules', 'typescript', 'bin', 'tsc')
const distDir = path.join(backendDir, 'dist')
const distEntry = path.join(distDir, 'index.js')

let serverProcess
let compilerProcess
let distWatcher
let shuttingDown = false
let restartTimer
let restartInFlight = false

function killChild(child) {
  return new Promise((resolve) => {
    if (!child || child.killed) {
      resolve()
      return
    }

    child.once('exit', () => resolve())
    child.kill()

    setTimeout(() => {
      resolve()
    }, 1000)
  })
}

async function restartServer() {
  if (restartInFlight || shuttingDown || !fs.existsSync(distEntry)) {
    return
  }

  restartInFlight = true
  await killChild(serverProcess)

  if (shuttingDown) {
    restartInFlight = false
    return
  }

  serverProcess = spawn(process.execPath, ['dist/index.js'], {
    cwd: backendDir,
    stdio: 'inherit',
    env: process.env,
  })

  serverProcess.on('exit', (code) => {
    if (!shuttingDown && code && code !== 0) {
      console.error(`Failed running 'dist/index.js'`)
    }
  })

  restartInFlight = false
}

function queueRestart() {
  clearTimeout(restartTimer)
  restartTimer = setTimeout(() => {
    restartServer().catch((error) => {
      console.error(error)
      shutdown(1)
    })
  }, 150)
}

async function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return
  }

  shuttingDown = true
  clearTimeout(restartTimer)

  if (distWatcher) {
    distWatcher.close()
  }

  await Promise.all([killChild(serverProcess), killChild(compilerProcess)])
  process.exit(exitCode)
}

const initialCompile = spawn(
  process.execPath,
  [tscPath, '-p', 'tsconfig.json', '--noCheck'],
  {
    cwd: backendDir,
    stdio: 'inherit',
    env: process.env,
  },
)

initialCompile.on('exit', async (code) => {
  if (code !== 0) {
    await shutdown(code ?? 1)
    return
  }

  await restartServer()

  if (fs.existsSync(distDir)) {
    distWatcher = fs.watch(distDir, { recursive: true }, (_eventType, filename) => {
      if (filename && filename.toString().endsWith('.js')) {
        queueRestart()
      }
    })
  }

  compilerProcess = spawn(
    process.execPath,
    [tscPath, '-w', '-p', 'tsconfig.json', '--preserveWatchOutput', '--noCheck'],
    {
      cwd: backendDir,
      stdio: 'inherit',
      env: process.env,
    },
  )

  compilerProcess.on('exit', async (watchCode) => {
    if (!shuttingDown && watchCode && watchCode !== 0) {
      await shutdown(watchCode)
    }
  })
})

process.on('SIGINT', () => {
  shutdown(0).catch(() => process.exit(1))
})

process.on('SIGTERM', () => {
  shutdown(0).catch(() => process.exit(1))
})
