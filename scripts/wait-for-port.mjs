import net from 'node:net'

const [, , portArg, timeoutArg = '30000'] = process.argv

if (!portArg) {
  console.error('Usage: node scripts/wait-for-port.mjs <port> [timeoutMs]')
  process.exit(1)
}

const port = Number(portArg)
const timeoutMs = Number(timeoutArg)
const startedAt = Date.now()
const hosts = ['127.0.0.1', '::1', 'localhost']

function tryHost(index = 0) {
  const host = hosts[index]
  const socket = net.createConnection({ port, host })

  socket.on('connect', () => {
    socket.end()
    process.exit(0)
  })

  socket.on('error', () => {
    socket.destroy()

    if (index < hosts.length - 1) {
      tryHost(index + 1)
      return
    }

    if (Date.now() - startedAt >= timeoutMs) {
      console.error(`Timed out waiting for port ${port}`)
      process.exit(1)
    }

    setTimeout(() => tryHost(0), 500)
  })
}

tryHost()
