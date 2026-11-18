/**
 * Uji integrasi 6 viewer model 3D interaktif berbasis HTML/Three.js.
 *
 * Memverifikasi untuk setiap organ:
 *   1. Halaman detail terbuka + iframe model 3D terpasang
 *   2. Viewer memakai THREE.js LOKAL (bukan CDN) dan canvas WebGL hidup
 *   3. Legenda bagian tubuh berisi tombol; klik -> penjelasan muncul
 *   4. Tombol Potongan / Label / Putar otomatis benar-benar berubah status
 *   5. Tombol zoom +/− tidak menimbulkan error
 *   6. Tidak ada error console/runtime (induk maupun iframe)
 *
 * Pemakaian: node scripts/html-model-test.mjs [baseURL]
 *   Contoh : node scripts/html-model-test.mjs http://localhost:4173
 *
 * Opsional: RQ_SHOT=/path/screenshot.png -> screenshot organ terakhir.
 * CATATAN: port CDP 9367 (jangan dijalankan bersamaan dengan skrip uji lain).
 */
import { spawn } from 'node:child_process'
import { rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = process.argv[2] || 'http://localhost:4173'
const PORT = 9367
const PROFILE = join(tmpdir(), `rq-html3d-${randomUUID()}`)
const ORGANS = ['tuba-falopi', 'rahim', 'vagina', 'testis', 'skrotum', 'penis']

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []
const ok = (name, pass, detail = '') => {
  results.push({ name, pass, detail })
  console.log(`${pass ? '\u2705' : '\u274c'} ${name}${detail ? ` \u2014 ${detail}` : ''}`)
}

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--no-sandbox',
    '--hide-scrollbars',
    '--window-size=1440,1000',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`,
    'about:blank',
  ],
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
    } catch {
      /* tunggu Chrome */
    }
    await sleep(250)
  }
  if (!targets?.length) throw new Error('CDP tidak tersedia')

  const page = targets.find((t) => t.type === 'page')
  ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.onopen = res
    ws.onerror = rej
  })

  let seq = 0
  const pending = new Map()
  const errors = []
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
      return
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails
      errors.push(`${d.text} ${d.exception?.description ?? ''}`)
    }
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      errors.push(msg.params.entry.text)
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      errors.push((msg.params.args || []).map((a) => a.value ?? a.description ?? '').join(' '))
    }
  }
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq
      pending.set(id, { resolve, reject })
      ws.send(JSON.stringify({ id, method, params }))
    })

  const evaljs = async (expression) => {
    const r = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    })
    if (r.exceptionDetails) {
      throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || ''))
    }
    return r.result.value
  }

  const goto = async (path) => {
    await send('Page.enable')
    await send('Runtime.enable')
    await send('Log.enable')
    await send('Page.navigate', { url: BASE + path })
    for (let i = 0; i < 50; i++) {
      await sleep(250)
      const ready = await evaljs(
        `Boolean(document.querySelector('main')) && document.title.includes('REPRODUKSI QUEST')`,
      ).catch(() => false)
      if (ready) return true
    }
    return false
  }

  for (const slug of ORGANS) {
    console.log(`\n--- Model 3D: ${slug} ---`)
    const opened = await goto(`/organ/${slug}`)
    ok(`[${slug}] Halaman detail terbuka`, opened)

    // Tunggu iframe + viewer siap
    let state = null
    for (let i = 0; i < 40; i++) {
      state = await evaljs(`(() => {
        const f = document.querySelector('iframe[src*="/models-3d/"]')
        const d = f && f.contentDocument
        return {
          src: f ? f.getAttribute('src') : null,
          ready: Boolean(d && d.readyState === 'complete'),
          canvas: d ? d.querySelectorAll('canvas').length : 0,
          legend: d ? d.querySelectorAll('#legend button').length : 0,
          hasThree: d ? typeof d.defaultView.THREE !== 'undefined' : false,
        }
      })()`).catch(() => ({}))
      if (state.ready && state.canvas && state.legend) break
      await sleep(250)
    }

    ok(`[${slug}] iframe model terpasang`, state.src === `/models-3d/${slug}.html`, `src=${state.src}`)
    ok(`[${slug}] Viewer siap (canvas + legend)`, Boolean(state.ready && state.canvas && state.legend),
      `canvas=${state.canvas}, legend=${state.legend}`)
    ok(`[${slug}] THREE.js termuat`, state.hasThree === true)

    const assets = await evaljs(`(() => {
      const w = document.querySelector('iframe').contentWindow
      const res = w.performance.getEntriesByType('resource').map((e) => e.name)
      return { local: res.some((n) => n.includes('/vendor/three-r128.min.js')),
               cdn: res.some((n) => n.includes('cdnjs')) }
    })()`).catch(() => ({}))
    ok(`[${slug}] Three.js lokal (offline)`, assets.local === true && assets.cdn !== true,
      `lokal=${assets.local}, cdn=${assets.cdn}`)

    const gl = await evaljs(`(() => {
      const c = document.querySelector('iframe').contentDocument.querySelector('canvas')
      const ctx = c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl')
      return { ok: Boolean(ctx), version: ctx ? ctx.getParameter(ctx.VERSION) : null, w: c.width, h: c.height }
    })()`).catch(() => ({}))
    ok(`[${slug}] Canvas WebGL hidup`, gl.ok === true && gl.w > 0 && gl.h > 0,
      `ctx=${gl.ok}, ${gl.w}x${gl.h}, ${gl.version || ''}`)

    // Bukti render: screenshot area canvas -> warna tidak boleh seragam
    const rect = await evaljs(`(() => {
      const f = document.querySelector('iframe')
      const r = f.getBoundingClientRect()
      const d = f.contentDocument.querySelector('canvas').getBoundingClientRect()
      return { x: Math.max(0, Math.round(r.left + d.left)),
               y: Math.max(0, Math.round(r.top + d.top)),
               width: Math.round(d.width), height: Math.round(d.height) }
    })()`)
    const snap = await send('Page.captureScreenshot', {
      format: 'png',
      clip: { ...rect, scale: 1 },
    })
    const pixels = await evaljs(`(async (b64) => {
      const img = new Image()
      img.src = 'data:image/png;base64,' + b64
      await img.decode()
      const c = document.createElement('canvas')
      c.width = img.width; c.height = img.height
      const x = c.getContext('2d')
      x.drawImage(img, 0, 0)
      const d = x.getImageData(0, 0, c.width, c.height).data
      const colors = new Set()
      let solid = 0, n = 0
      for (let i = 0; i < d.length; i += 4 * 53) {
        colors.add((d[i] >> 4) + ',' + (d[i + 1] >> 4) + ',' + (d[i + 2] >> 4))
        if (d[i] > 235 && d[i + 1] > 225 && d[i + 2] > 215) solid++
        n++
      }
      return { distinct: colors.size, solidRatio: solid / n, n }
    })(${JSON.stringify(snap.data)})`)
    ok(`[${slug}] Model benar-benar tergambar`, pixels.distinct >= 12 && pixels.solidRatio < 0.95,
      `warna=${pixels.distinct}, latar polos=${(pixels.solidRatio * 100).toFixed(0)}%`)

    // Klik legenda pertama -> penjelasan muncul
    const legend = await evaljs(`(async () => {
      const d = document.querySelector('iframe').contentDocument
      const b = d.querySelector('#legend button')
      if (!b) return { count: 0 }
      b.click()
      await new Promise((r) => setTimeout(r, 120))
      return { count: d.querySelectorAll('#legend button').length,
               info: (d.querySelector('#info')?.innerText || '').trim().length,
               pressed: b.getAttribute('aria-pressed') }
    })()`)
    ok(`[${slug}] Legenda interaktif`, legend.count >= 4 && legend.info > 20 && legend.pressed === 'true',
      `item=${legend.count}, info=${legend.info} karakter`)

    // Tombol toolbar
    const tools = await evaljs(`(async () => {
      const d = document.querySelector('iframe').contentDocument
      const press = (id) => d.getElementById(id)
      const before = { cut: press('bCut').getAttribute('aria-pressed'),
                       lab: press('bLab').getAttribute('aria-pressed'),
                       rot: press('bRot').getAttribute('aria-pressed') }
      press('bCut').click(); press('bLab').click(); press('bRot').click()
      press('bIn').click(); press('bOut').click()
      await new Promise((r) => setTimeout(r, 150))
      const after = { cut: press('bCut').getAttribute('aria-pressed'),
                      lab: press('bLab').getAttribute('aria-pressed'),
                      rot: press('bRot').getAttribute('aria-pressed') }
      return { before, after }
    })()`)
    ok(`[${slug}] Tombol Potongan/Label/Putar bekerja`,
      tools.before.cut !== tools.after.cut &&
      tools.before.lab !== tools.after.lab &&
      tools.before.rot !== tools.after.rot,
      `cut ${tools.before.cut}->${tools.after.cut}, lab ${tools.before.lab}->${tools.after.lab}, rot ${tools.before.rot}->${tools.after.rot}`)

    if (process.env.RQ_SHOT && slug === ORGANS[ORGANS.length - 1]) {
      const img = await send('Page.captureScreenshot', { format: 'png' })
      writeFileSync(process.env.RQ_SHOT, Buffer.from(img.data, 'base64'))
      console.log(`\u{1F4F7} ${process.env.RQ_SHOT}`)
    }
  }

  const realErrors = errors.filter((e) => !/THREE\.Clock|deprecated/i.test(e))
  ok('Tanpa error console/runtime', realErrors.length === 0,
    realErrors.length ? realErrors.slice(0, 3).join(' | ') : '0 error')
} catch (err) {
  ok('Skrip uji berjalan', false, String(err))
} finally {
  if (ws) ws.close()
  chrome.kill()
  try {
    rmSync(PROFILE, { recursive: true, force: true })
  } catch {
    /* abaikan */
  }
}

const passed = results.filter((r) => r.pass).length
console.log(`\nHASIL: ${passed}/${results.length} pemeriksaan lulus`)
process.exit(passed === results.length ? 0 : 1)
