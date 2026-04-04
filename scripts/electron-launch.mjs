import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const scriptDir = path.dirname(fileURLToPath(import.meta.url))

const [, , mode = 'desktop'] = process.argv
const isWeb = mode === 'web'
const port = isWeb ? 4173 : 5173
const rendererUrl = `http://localhost:${port}`
const rootDir = path.resolve(scriptDir, '..')
const desktopDir = path.join(rootDir, 'packages', 'desktop')
const waitScript = path.join(rootDir, 'scripts', 'wait-for-port.mjs')
const electronBinary = require('electron')

const waitProcess = spawn(
  process.execPath,
  [waitScript, String(port), '30000'],
  {
    cwd: rootDir,
    stdio: 'inherit',
  },
)

waitProcess.on('exit', (code) => {
  if (code !== 0) {
    process.exit(code ?? 1)
  }

  const child = spawn(electronBinary, ['.'], {
    cwd: desktopDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      ELECTRON_RENDERER_URL: rendererUrl,
    },
  })

  child.on('exit', (childCode) => {
    process.exit(childCode ?? 0)
  })
})
