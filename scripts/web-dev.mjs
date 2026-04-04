import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import http from 'node:http'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '..')
const webDir = path.join(rootDir, 'packages', 'web')
const outDir = path.join(webDir, '.dev')
const publicDir = path.join(webDir, 'public')
const srcEntry = path.join(webDir, 'src', 'main.tsx')
const htmlPath = path.join(webDir, 'index.html')
const requireFromWeb = createRequire(path.join(webDir, 'package.json'))
const esbuild = requireFromWeb('esbuild')
const port = 4173

await fs.promises.mkdir(outDir, { recursive: true })

const ctx = await esbuild.context({
  entryPoints: [srcEntry],
  bundle: true,
  outdir: outDir,
  entryNames: 'main',
  assetNames: 'assets/[name]-[hash]',
  sourcemap: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  jsx: 'automatic',
  loader: {
    '.png': 'file',
    '.svg': 'file',
  },
})

await ctx.watch()
await ctx.rebuild()

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
  }

  return contentTypes[ext] || 'application/octet-stream'
}

async function serveFile(filePath, res) {
  try {
    const data = await fs.promises.readFile(filePath)
    res.writeHead(200, { 'Content-Type': getContentType(filePath) })
    res.end(data)
  } catch {
    res.writeHead(404)
    res.end('Not found')
  }
}

const server = http.createServer(async (req, res) => {
  const urlPath = req.url?.split('?')[0] || '/'
  const normalizedPath = urlPath === '/' ? '/index.html' : urlPath

  if (normalizedPath === '/index.html') {
    const template = await fs.promises.readFile(htmlPath, 'utf8')
    const html = template
      .replace(
        '<script type="module" src="/src/main.tsx"></script>',
        '<link rel="stylesheet" href="/main.css" />\n    <script type="module" src="/main.js"></script>',
      )
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(html)
    return
  }

  const publicFile = path.join(publicDir, normalizedPath.replace(/^\//, ''))
  if (fs.existsSync(publicFile) && fs.statSync(publicFile).isFile()) {
    await serveFile(publicFile, res)
    return
  }

  const builtFile = path.join(outDir, normalizedPath.replace(/^\//, ''))
  if (fs.existsSync(builtFile) && fs.statSync(builtFile).isFile()) {
    await serveFile(builtFile, res)
    return
  }

  res.writeHead(404)
  res.end('Not found')
})

server.listen(port, '127.0.0.1', () => {
  console.log(`ClarityIQ web dev server listening on http://localhost:${port}`)
})

function shutdown() {
  server.close(() => {
    ctx.dispose().finally(() => process.exit(0))
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
