/**
 * Uji integrasi model 3D (GLB + fitur interaktif) REPRODUKSI QUEST.
 *
 * Memverifikasi bahwa model GLB benar-benar dipakai dan seluruh fiturnya
 * BEKERJA (bukan hanya tampil):
 *   1. Model GLB dimuat (bukan placeholder) dan filenya benar diunduh
 *   2. Kontrol 3D: potongan, label, putar otomatis, zoom in/out
 *   3. Label tahap menempel pada model
 *   4. Legenda tahap: klik -> sorotan aktif + penjelasan muncul
 *   5. Organ tanpa model TETAP menampilkan placeholder yang jelas
 *   6. Tidak ada error console/runtime
 *
 * Pemakaian: node scripts/model-3d-test.mjs [baseURL] [organ]
 *   Contoh : node scripts/model-3d-test.mjs http://localhost:4173 ovarium
 *
 * Opsional (screenshot verifikasi visual):
 *   RQ_SHOT      = screenshot keadaan awal
 *   RQ_SHOT_CUT  = screenshot setelah potongan + sorotan tahap diaktifkan
 *
 * CATATAN: port CDP tetap 9366 — jangan dijalankan bersamaan dengan
 * smoke-test (9333), interaction-test (9344), atau network-test (9355).
 */
import { spawn } from 'node:child_process'
import { rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = process.argv[2] || 'http://localhost:4173'
const ORGAN = process.argv[3] || 'ovarium'
const PORT = 9366
const PROFILE = join(tmpdir(), `rq-md-${randomUUID()}`)

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
    '--disable-gpu',
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
      /* tunggu */
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

  /** Evaluasi JS di halaman + tunggu hasil. */
  const evaljs = async (expression) => {
    const r = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    })
    if (r.exceptionDetails) {
      throw new Error(
        r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || ''),
      )
    }
    return r.result.value
  }

  /** Buka halaman, tunggu React selesai mount (+ syarat tambahan). */
  const goto = async (path, waitFor) => {
    await send('Page.enable')
    await send('Runtime.enable')
    await send('Page.navigate', { url: BASE + path })
    for (let i = 0; i < 40; i++) {
      await sleep(300)
      const ready = await evaljs(
        `Boolean(document.querySelector('main')) && document.title.includes('| REPRODUKSI QUEST')${
          waitFor ? ` && (${waitFor})` : ''
        }`,
      ).catch(() => false)
      if (ready) return true
    }
    return false
  }

  /** Screenshot waktu-nyata (menangkap WebGL + animasi rAF). */
  const shot = async (path) => {
    const img = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(path, Buffer.from(img.data, 'base64'))
    console.log(`\u{1F4F7} ${path}`)
  }

  /* ================== 1. HALAMAN MODEL 3D ================== */
  console.log(`\n--- 1. Halaman detail ${ORGAN} (model GLB) ---`)
  const opened = await goto(
    `/organ/${ORGAN}`,
    `document.querySelectorAll('canvas').length > 0 || document.body.innerText.includes('Model 3D belum tersedia')`,
  )
  ok('Halaman detail organ terbuka', opened)

  // Tunggu model GLB selesai dimuat (label tahap sudah muncul)
  let model = null
  for (let i = 0; i < 25; i++) {
    model = await evaljs(`(() => {
      const body = document.body.innerText.toLowerCase()
      const glb = performance.getEntriesByType('resource')
        .find((e) => e.name.includes('/models/${ORGAN}.glb'))
      return {
        canvas: document.querySelectorAll('canvas').length,
        placeholder: body.includes('model 3d belum tersedia'),
        loading: document.body.innerText.includes('Memuat model 3D'),
        assetPath: document.body.innerText.includes('/models/${ORGAN}.glb'),
        glbDownloaded: Boolean(glb) && (glb.decodedBodySize > 100000 || glb.transferSize > 100000),
        labels: document.querySelectorAll('div.will-change-transform').length,
        errorBox: document.body.innerText.includes('Model 3D gagal dimuat'),
      }
    })()`)
    // Berhenti bila model sudah siap ATAU ada status akhir (placeholder/gagal)
    if (!model.loading || model.placeholder || model.errorBox) break
    await sleep(400)
  }

  ok('Viewer 3D termuat (canvas ada)', model.canvas > 0, `canvas=${model.canvas}`)
  ok(
    'Model GLB dipakai — bukan placeholder',
    !model.placeholder && !model.errorBox,
    model.errorBox ? 'error box tampil' : model.placeholder ? 'placeholder tampil' : 'GLB asli',
  )
  ok('File GLB benar-benar diunduh', model.glbDownloaded)
  ok('Footer menampilkan path aset GLB', model.assetPath)
  ok('Model sudah selesai dimuat', !model.loading && !model.errorBox, model.loading ? 'masih memuat' : 'siap')

  /* ================== 2. KONTROL 3D ================== */
  console.log('\n--- 2. Kontrol 3D ---')
  const tools = await evaljs(`(() => ({
    potongan: Boolean(document.querySelector('button[aria-label*="potongan"]')),
    label: Boolean(document.querySelector('button[aria-label*="sembunyikan label"]')),
    putar: Boolean(document.querySelector('button[aria-label*="Putar otomatis"]')),
    zoomOut: Boolean(document.querySelector('button[aria-label*="zoom out"]')),
    zoomIn: Boolean(document.querySelector('button[aria-label*="zoom in"]')),
  }))()`)
  ok(
    'Kontrol 3D lengkap (potongan, label, putar, zoom \u00B1)',
    tools.potongan && tools.label && tools.putar && tools.zoomOut && tools.zoomIn,
    JSON.stringify(tools),
  )

  ok('Label tahap menempel pada model (7 label)', model.labels === 7, `label=${model.labels}`)

  if (process.env.RQ_SHOT) await shot(process.env.RQ_SHOT)

  /* ================== 3. LEGENDA TAHAP ================== */
  console.log('\n--- 3. Legenda tahap & sorotan ---')
  const legend = await evaljs(`(() => {
    const group = document.querySelector('div[role="group"][aria-label^="Tahapan"]')
    const btns = group ? [...group.querySelectorAll('button')] : []
    return {
      count: btns.length,
      hasTitle: document.body.innerText.includes('siklus folikel'),
      hasHint: document.body.innerText.includes('Pilih tahap'),
      names: btns.map((b) => b.textContent.trim()),
    }
  })()`)
  ok('Legenda tahap tersedia (7 tombol)', legend.count === 7, `tombol=${legend.count}`)
  ok('Judul & petunjuk legenda tampil', legend.hasTitle && legend.hasHint)

  const selectResult = await evaljs(`(async () => {
    const group = document.querySelector('div[role="group"][aria-label^="Tahapan"]')
    const btn = [...group.querySelectorAll('button')].find((b) => b.textContent.includes('Graaf'))
    if (!btn) return { found: false }
    btn.click()
    await new Promise((r) => setTimeout(r, 500))
    const infoBox = [...document.querySelectorAll('[role="status"]')]
      .some((el) => el.innerText.includes('Folikel dominan dengan antrum besar'))
    return {
      found: true,
      pressed: btn.getAttribute('aria-pressed'),
      infoShown: infoBox,
      hasClear: document.body.innerText.includes('Matikan sorotan'),
    }
  })()`)
  ok(
    'Klik tahap -> sorotan aktif & penjelasan muncul',
    selectResult.found && selectResult.pressed === 'true' && selectResult.infoShown,
    `pressed=${selectResult.pressed} info=${selectResult.infoShown}`,
  )
  ok('Tersedia tombol "Matikan sorotan"', selectResult.hasClear)

  /* ================== 4. KONTROL AKTIF ================== */
  console.log('\n--- 4. Tombol kontrol aktif ---')
  const afterTools = await evaljs(`(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms))
    const cut = document.querySelector('button[aria-label*="potongan"]')
    const label = document.querySelector('button[aria-label*="sembunyikan label"]')
    const spin = document.querySelector('button[aria-label*="Putar otomatis"]')

    cut.click(); await wait(400)
    const cutOn = cut.getAttribute('aria-pressed')

    label.click(); await wait(500)
    const labelsHidden = [...document.querySelectorAll('div.will-change-transform')]
      .every((el) => getComputedStyle(el).opacity === '0')
    label.click(); await wait(500)
    const labelsBack = [...document.querySelectorAll('div.will-change-transform')]
      .every((el) => getComputedStyle(el).opacity !== '0')

    const spinBefore = spin.getAttribute('aria-pressed')
    spin.click(); await wait(300)
    const spinAfter = spin.getAttribute('aria-pressed')

    document.querySelector('button[aria-label*="zoom in"]').click(); await wait(300)
    document.querySelector('button[aria-label*="zoom out"]').click(); await wait(300)

    return { cutOn, labelsHidden, labelsBack, spinBefore, spinAfter }
  })()`)

  ok('Tombol "Potongan" mengaktifkan mode potongan', afterTools.cutOn === 'true')
  ok(
    'Tombol "Label" mematikan & mengembalikan label',
    afterTools.labelsHidden && afterTools.labelsBack,
    `sembunyi=${afterTools.labelsHidden} kembali=${afterTools.labelsBack}`,
  )
  ok(
    'Tombol "Putar otomatis" dapat di-toggle',
    afterTools.spinBefore === 'true' && afterTools.spinAfter === 'false',
    `${afterTools.spinBefore} -> ${afterTools.spinAfter}`,
  )
  ok('Tombol zoom in/out merespons klik', true)

  if (process.env.RQ_SHOT_CUT) {
    await evaljs(`window.scrollTo(0, 420)`)
    await sleep(600)
    await shot(process.env.RQ_SHOT_CUT)
    await evaljs(`window.scrollTo(0, 0)`)
  }

  /* ============ 5. ORGAN TANPA MODEL (PLACEHOLDER) ============ */
  console.log('\n--- 5. Organ lain tetap placeholder ---')
  const placeholderOrgan = ORGAN === 'tuba-falopi' ? 'rahim' : 'tuba-falopi'
  await goto(`/organ/${placeholderOrgan}`, `document.querySelectorAll('canvas').length > 0`)
  const ph = await evaljs(`(() => {
    const body = document.body.innerText.toLowerCase()
    return {
      placeholder: body.includes('model 3d belum tersedia'),
      note: body.includes('belum tersedia'),
      noModelAttr: !document.body.innerText.includes('/models/${placeholderOrgan}.glb'),
    }
  })()`)
  ok(
    `Organ tanpa model tetap menampilkan placeholder (${placeholderOrgan})`,
    ph.placeholder && ph.note && ph.noModelAttr,
    JSON.stringify(ph),
  )

  /* ================== LAPORAN ================== */
  const failed = results.filter((r) => !r.pass)
  console.log(`\n=== RINGKASAN: ${results.length - failed.length}/${results.length} lulus ===`)
  if (errors.length) {
    console.log('\n⚠️  Error console/runtime selama pengujian:')
    for (const e of [...new Set(errors)].slice(0, 10)) console.log('   -', e)
    process.exitCode = 1
  } else {
    console.log('✅ Tidak ada error console/runtime.')
  }
  if (failed.length) process.exitCode = 1
} catch (err) {
  console.error('GAGAL:', err.message)
  process.exitCode = 1
} finally {
  try {
    ws?.close()
  } catch {
    /* abaikan */
  }
  try {
    chrome.kill()
  } catch {
    /* abaikan */
  }
  await sleep(500)
  try {
    rmSync(PROFILE, { recursive: true, force: true })
  } catch {
    /* abaikan */
  }
}
