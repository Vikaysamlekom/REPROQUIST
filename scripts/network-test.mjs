/**
 * Verifikasi pemisahan aset (code splitting):
 *   - Halaman beranda TIDAK mengunduh chunk three.js
 *   - Halaman detail organ MENGUNDUH chunk three.js (lazy)
 *   - Seluruh request jaringan berhasil (tidak ada 404)
 *
 * Pemakaian: node scripts/network-test.mjs [base-url]
 */
import { spawn } from 'node:child_process'
import { rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = process.argv[2] || 'http://localhost:4173'
const PORT = 9355
const PROFILE = join(tmpdir(), `rq-nt-${randomUUID()}`)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []
const ok = (name, pass, detail = '') => {
  results.push({ name, pass })
  console.log(`${pass ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`)
}

const chrome = spawn(
  CHROME,
  ['--headless=new', '--disable-gpu', '--no-sandbox', '--window-size=1440,1000',
   `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`, 'about:blank'],
  { stdio: 'ignore' },
)

let ws
try {
  let targets = null
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      targets = await res.json()
      if (targets.length) break
    } catch { /* tunggu */ }
    await sleep(250)
  }
  if (!targets?.length) throw new Error('CDP tidak tersedia')

  const page = targets.find((t) => t.type === 'page')
  ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })

  let seq = 0
  const pending = new Map()
  let requests = []
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
      return
    }
    if (msg.method === 'Network.requestWillBeSent') {
      requests.push({ url: msg.params.request.url, type: msg.params.type })
    }
    if (msg.method === 'Network.responseReceived') {
      const r = msg.params.response
      if (r.status >= 400) requests.push({ url: r.url, status: r.status, failed: true })
    }
    if (msg.method === 'Network.loadingFailed') {
      requests.push({ url: msg.params.errorText, failed: true })
    }
  }
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq
      pending.set(id, { resolve, reject })
      ws.send(JSON.stringify({ id, method, params }))
    })

  await send('Network.enable')
  await send('Page.enable')
  await send('Runtime.enable')

  const gotoAndSettle = async (path) => {
    requests = []
    await send('Page.navigate', { url: BASE + path })
    await sleep(5000)
    return requests
  }

  // ---------- 1. Beranda: three.js TIDAK boleh terunduh ----------
  console.log('\n--- 1. Beranda (performa awal) ---')
  const home = await gotoAndSettle('/')
  const homeJs = home.filter((r) => /\.js(\?|$)/.test(r.url) && !r.failed)
  const homeThree = home.filter((r) => /OrganViewer|three/i.test(r.url))
  const homeFailed = home.filter((r) => r.failed)

  ok('Beranda memuat entry JS utama', homeJs.length >= 1, `${homeJs.length} file JS`)
  ok('Beranda TIDAK mengunduh chunk three.js/OrganViewer', homeThree.length === 0,
    homeThree.map((r) => r.url.split('/').pop()).join(', ') || 'bersih')
  ok('Beranda tanpa request gagal', homeFailed.length === 0,
    homeFailed.map((r) => `${r.url} (${r.status ?? r.failed})`).join(', '))

  // ---------- 2. Detail organ: three.js HARUS terunduh ----------
  console.log('\n--- 2. Detail organ (lazy loading) ---')
  const organ = await gotoAndSettle('/organ/ovarium')
  const organThree = organ.filter((r) => /OrganViewer-.*\.js/.test(r.url))
  const organFailed = organ.filter((r) => r.failed)
  const organJs = organ.filter((r) => /\.js(\?|$)/.test(r.url) && !r.failed)

  ok('Detail organ mengunduh chunk OrganViewer (lazy)', organThree.length >= 1,
    organThree.map((r) => r.url.split('/').pop()).join(', '))
  ok('Detail organ: seluruh request JS berhasil', organJs.length > 0 && organFailed.length === 0,
    organFailed.map((r) => `${r.url} (${r.status ?? r.failed})`).join(', '))

  // ---------- 3. Cek semua route: tidak ada 404 ----------
  console.log('\n--- 3. Seluruh route (anti-404) ---')
  const ROUTES = ['/', '/dashboard', '/materi', '/organ/perempuan', '/organ/laki-laki',
    '/organ/ovarium', '/organ/tuba-falopi', '/organ/rahim', '/organ/vagina', '/organ/testis',
    '/organ/skrotum', '/organ/penis', '/organ-explorer', '/kebersihan', '/kuis', '/tantangan',
    '/refleksi', '/halaman-tidak-ada']
  const bad = []
  for (const route of ROUTES) {
    const res = await fetch(BASE + route)
    if (res.status !== 200) bad.push(`${route}=${res.status}`)
  }
  ok('Semua route mengembalikan 200 (termasuk fallback SPA)', bad.length === 0, bad.join(', '))

  const failed = results.filter((r) => !r.pass)
  console.log(`\n=== RINGKASAN: ${results.length - failed.length}/${results.length} lulus ===`)
  process.exitCode = failed.length ? 1 : 0
} catch (err) {
  console.error('GAGAL:', err.message)
  process.exitCode = 1
} finally {
  try { ws?.close() } catch { /* abaikan */ }
  try { chrome.kill() } catch { /* abaikan */ }
  await sleep(500)
  try { rmSync(PROFILE, { recursive: true, force: true }) } catch { /* abaikan */ }
}
