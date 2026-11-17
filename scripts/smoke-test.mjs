/**
 * Uji runtime browser untuk REPRODUKSI QUEST via Chrome DevTools Protocol.
 * Menangkap error console + memeriksa scene 3D benar-benar terisi.
 *
 * Pemakaian: node scripts/smoke-test.mjs [url]
 */
import { spawn } from 'node:child_process'
import { rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL_UNDER_TEST = process.argv[2] || 'http://localhost:4173/organ/ovarium'
const PORT = 9333
const PROFILE = join(tmpdir(), `rq-cdp-${randomUUID()}`)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    // Ukuran jendela bisa diatur lewat env: RQ_WIDTH / RQ_HEIGHT
    `--window-size=${process.env.RQ_WIDTH || 1440},${process.env.RQ_HEIGHT || 1000}`,
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
)

try {
  // Tunggu endpoint CDP siap
  let targets = null
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      targets = await res.json()
      if (targets.length) break
    } catch {
      /* server belum siap */
    }
    await sleep(250)
  }
  if (!targets?.length) throw new Error('CDP endpoint tidak tersedia')

  const page = targets.find((t) => t.type === 'page')
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.onopen = res
    ws.onerror = rej
  })

  let seq = 0
  const pending = new Map()
  const logs = []

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
      return
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = (msg.params.args || [])
        .map((a) => a.value ?? a.description ?? JSON.stringify(a.preview ?? ''))
        .join(' ')
      logs.push({ type: msg.params.type, text })
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails
      logs.push({
        type: 'exception',
        text: `${d.text} ${d.exception?.description ?? ''}`,
      })
    }
    if (msg.method === 'Log.entryAdded') {
      logs.push({ type: msg.params.entry.level, text: msg.params.entry.text })
    }
  }

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq
      pending.set(id, { resolve, reject })
      ws.send(JSON.stringify({ id, method, params }))
    })

  await send('Runtime.enable')
  await send('Log.enable')
  await send('Page.enable')
  await send('Page.navigate', { url: URL_UNDER_TEST })

  // Beri waktu React & viewer 3D merender
  await sleep(6000)

  // Ekspresi probe bisa diganti lewat argumen ketiga
  const customExpr = process.argv[3]
  const probe = await send('Runtime.evaluate', {
    expression: customExpr
      ? `(${customExpr})()`
      : `(() => {
      const canvas = document.querySelector('canvas')
      const gl = canvas ? (canvas.getContext('webgl2') || canvas.getContext('webgl')) : null
      // Scene 3D: baca dari canvas -> context -> tidak langsung; cek lewat portal Html
      const htmlPortal = canvas && canvas.parentElement
        ? canvas.parentElement.innerText.trim().slice(0, 300) : '(no canvas)'
      return JSON.stringify({
        title: document.title,
        canvasCount: document.querySelectorAll('canvas').length,
        canvasSize: canvas ? [canvas.width, canvas.height] : null,
        hasWebGL: Boolean(gl),
        portalText: htmlPortal,
        rootChildren: document.getElementById('root')?.children.length ?? 0,
        bodyText: document.body.innerText.slice(0, 160),
      })
    })()`,
    awaitPromise: true,
    returnByValue: true,
  })

  console.log('=== PROBE ===')
  console.log(probe.result.value)
  console.log('=== CONSOLE LOGS ===')
  if (!logs.length) console.log('(tidak ada pesan)')
  for (const l of logs) console.log(`[${l.type}] ${l.text}`)

  // Screenshot waktu-nyata (menangkap WebGL + animasi rAF)
  const shot = await send('Page.captureScreenshot', { format: 'png' })
  const { writeFileSync } = await import('node:fs')
  const out = process.env.RQ_SHOT || join(tmpdir(), 'rq-cdp-shot.png')
  writeFileSync(out, Buffer.from(shot.data, 'base64'))
  console.log(`=== SCREENSHOT ===\n${out}`)

  ws.close()
} catch (err) {
  console.error('GAGAL:', err.message)
  process.exitCode = 1
} finally {
  try {
    rmSync(PROFILE, { recursive: true, force: true })
  } catch {
    /* abaikan */
  }
  chrome.kill()
}
