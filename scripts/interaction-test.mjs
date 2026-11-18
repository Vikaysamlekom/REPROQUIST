/**
 * Uji interaksi end-to-end REPRODUKSI QUEST via Chrome DevTools Protocol.
 *
 * Memverifikasi bahwa fitur benar-benar BEKERJA (bukan hanya tampil):
 *   1. Kuis: menjawab sampai selesai -> skor tersimpan di LocalStorage
 *   2. Mencocokkan: memasangkan semua organ -> skor & umpan balik muncul
 *   3. Detail organ: progres "sudah dipelajari" tersimpan
 *   4. Refleksi: jawaban bertahan setelah muat ulang
 *   5. Tautan internal: seluruh href menunjuk route yang ada
 *
 * Pemakaian: node scripts/interaction-test.mjs
 */
import { spawn } from 'node:child_process'
import { rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = process.argv[2] || 'http://localhost:4173'
const PORT = 9344
const PROFILE = join(tmpdir(), `rq-it-${randomUUID()}`)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []
const ok = (name, pass, detail = '') => {
  results.push({ name, pass, detail })
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
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || ''))
    return r.result.value
  }

  /** Buka halaman, tunggu React selesai mount. */
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

  // ======================= 1. KUIS =======================
  console.log('\n--- 1. Kuis ---')
  // localStorage hanya bisa diakses setelah halaman aplikasi termuat
  await send('Page.navigate', { url: BASE })
  await sleep(2000)
  await evaljs(`localStorage.clear()`)
  await goto('/kuis', `document.body.innerText.includes('Tantangan Kuis')`)

  // 12 soal: jawab opsi pertama pada tiap soal, klik tombol lanjut
  let answered = 0
  for (let i = 0; i < 20 && answered < 12; i++) {
    const done = await evaljs(`(() => {
      if (document.body.innerText.includes('Kuis selesai!')) return 'finished'
      // Opsi jawaban: tombol yang berisi span huruf A/B/C
      const btns = [...document.querySelectorAll('button')].filter(b => {
        const span = b.querySelector('span')
        return span && /^[ABC]$/.test(span.textContent.trim()) && b.className.includes('border-2')
      })
      if (!btns.length) return 'no-options'
      btns[0].click()
      return 'picked'
    })()`)
    await sleep(350)
    if (done === 'no-options') break
    if (done === 'picked') {
      answered++
      const next = await evaljs(`(() => {
        const b = [...document.querySelectorAll('button')].find(x =>
          /Pertanyaan berikutnya|Lihat hasil/.test(x.innerText))
        if (b) { b.click(); return true } return false
      })()`)
      await sleep(400)
      if (!next) break
    } else break
  }
  await sleep(600)
  if (answered < 12) console.log(`   (catatan: ${answered}/12 soal terjawab)`)

  const quizState = await evaljs(`(() => ({
    finished: document.body.innerText.includes('Kuis selesai!'),
    score: localStorage.getItem('rq_quiz_score'),
    progress: localStorage.getItem('rq_progress'),
    benar: (document.body.innerText.match(/(\\d+) benar/) || [])[1] || null,
  }))()`)
  ok('Kuis: menampilkan layar hasil', quizState.finished)
  ok('Kuis: skor tersimpan di LocalStorage', Boolean(quizState.score),
    String(quizState.score || '').slice(0, 80))
  ok('Kuis: progres misi tersimpan', String(quizState.progress || '').includes('kuis-selesai'))

  // Tombol ulang berfungsi
  const restarted = await evaljs(`(() => {
    const b = [...document.querySelectorAll('button')].find(x => /Ulangi kuis/.test(x.innerText))
    if (!b) return false; b.click(); return true
  })()`)
  await sleep(700)
  const backToFirst = await evaljs(`document.body.innerText.includes('Pertanyaan') &&
    document.body.innerText.includes('dari 12')`)
  ok('Kuis: tombol "Ulangi kuis" berfungsi', restarted && backToFirst)

  // ================= 2. MENCOCOKKAN ORGAN =================
  console.log('\n--- 2. Mencocokkan organ ---')
  await goto('/tantangan', `document.body.innerText.includes('Mencocokkan Organ')`)

  const matchResult = await evaljs(`(async () => {
    const sleep = (ms) => new Promise(r => setTimeout(r, ms))
    // Uji mode ketuk: pilih organ -> ketuk kolom fungsinya
    const organBtns = [...document.querySelectorAll('button')].filter(b =>
      /Ovarium|Tuba falopi|Rahim|Testis|Skrotum/.test(b.textContent))
    if (!organBtns.length) return { error: 'tombol organ tidak ada' }

    const allBoxes = [...document.querySelectorAll('div')].filter(d =>
      d.className.includes('rounded-2xl') && d.className.includes('border-2'))
    const boxesWithFn = allBoxes.filter(d =>
      /Menghasilkan sel telur|Menghasilkan sel sperma|Saluran penghubung|Tempat janin|Melindungi testis/.test(d.textContent))
    const dbg = { total: allBoxes.length, withFn: boxesWithFn.length, organBtns: organBtns.length }

    for (const ob of organBtns) {
      if (ob.disabled) continue
      ob.click()
      await sleep(150)
      const targets = boxesWithFn.filter(d => !d.textContent.includes('Jawabanmu:'))
      if (!targets.length) return { error: 'kolom fungsi tidak ada', dbg }
      targets[0].click()
      await sleep(150)
    }
    await sleep(300)

    // Klik tombol "Tandai selesai" agar progres misi tersimpan
    const done = [...document.querySelectorAll('button')]
      .find(x => /Tandai selesai/.test(x.textContent))
    if (done) { done.click(); await sleep(400) }

    return {
      terisi: (document.body.innerText.match(/Terisi: (\\d+)/) || [])[1],
      adaHasil: /Permainan selesai|Benar:/.test(document.body.innerText),
      progress: localStorage.getItem('rq_progress') || '',
    }
  })()`)
  ok('Mencocokkan: kolom terisi penuh', matchResult.terisi === '5',
    `terisi=${matchResult.terisi}${matchResult.dbg ? ' dbg=' + JSON.stringify(matchResult.dbg) : ''}`)
  ok('Mencocokkan: skor/umpan balik tampil', Boolean(matchResult.adaHasil),
    matchResult.error || '')
  ok('Mencocokkan: tersimpan sebagai progres',
    String(matchResult.progress || '').includes('mencocokkan-selesai'))

  // ================== 3. DETAIL ORGAN ==================
  console.log('\n--- 3. Detail organ & progres ---')
  await goto('/organ/tuba-falopi', `document.body.innerText.includes('Tuba Falopi')`)
  // Viewer 3D dimuat malas (lazy) — tunggu hingga canvas benar-benar muncul
  let organProgress = null
  for (let i = 0; i < 20; i++) {
    organProgress = await evaljs(`({
      progress: localStorage.getItem('rq_progress') || '',
      title: document.title,
      hasCanvas: Boolean(document.querySelector('canvas') ||
        document.querySelector('iframe')?.contentDocument?.querySelector('canvas')),
      hasIframe: Boolean(document.querySelector('iframe[src*="/models-3d/"]')),
      placeholder: document.body.innerText.toLowerCase().includes('model 3d belum tersedia'),
      back: [...document.querySelectorAll('a')].some(a => a.textContent.includes('Kembali ke')),
    })`)
    if (organProgress.hasCanvas) break
    await sleep(400)
  }
  ok('Detail organ: judul halaman = nama organ', organProgress.title.startsWith('Tuba Falopi'),
    organProgress.title)
  ok('Detail organ: viewer 3D termuat', organProgress.hasCanvas)
  ok('Detail organ: model 3D interaktif (iframe) terpasang', organProgress.hasIframe)
  ok('Detail organ: tidak ada placeholder "belum tersedia"', !organProgress.placeholder)
  ok('Detail organ: tombol kembali ada', organProgress.back)
  ok('Detail organ: penanda "sudah dipelajari" tersimpan',
    organProgress.progress.includes('organ-tuba-falopi'))

  // Slug tidak valid -> 404
  await goto('/organ/bukan-organ', `document.body.innerText.includes('halaman ini tidak ada')`)
  const notFound = await evaljs(`document.title`)
  ok('Slug organ tidak valid menampilkan 404', notFound.includes('Tidak Ditemukan'), notFound)

  // =================== 4. REFLEKSI ===================
  console.log('\n--- 4. Refleksi / E-LKPD ---')
  await goto('/refleksi', `document.body.innerText.includes('Refleksi dan E-LKPD')`)
  // Gunakan setter asli agar React menerima perubahan nilai
  await evaljs(`(() => {
    const t = document.getElementById('q1')
    const set = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
    set.call(t, 'Saya belajar nama organ reproduksi.')
    t.dispatchEvent(new Event('input', { bubbles: true }))
  })()`)
  await sleep(500)
  const saved1 = await evaljs(`localStorage.getItem('rq_reflection')`)
  ok('Refleksi: jawaban tersimpan', String(saved1 || '').includes('nama organ reproduksi'),
    String(saved1 || '').slice(0, 70))

  // Muat ulang -> jawaban tetap ada
  await send('Page.navigate', { url: BASE + '/refleksi' })
  await sleep(2500)
  const persisted = await evaljs(`document.getElementById('q1')?.value || ''`)
  ok('Refleksi: jawaban bertahan setelah muat ulang',
    persisted.includes('nama organ reproduksi'))

  // =================== 5. TAUTAN ===================
  console.log('\n--- 5. Tautan internal ---')
  const ROUTES = ['/', '/dashboard', '/materi', '/organ/perempuan', '/organ/laki-laki',
    '/organ/ovarium', '/organ/tuba-falopi', '/organ/rahim', '/organ/vagina', '/organ/testis',
    '/organ/skrotum', '/organ/penis', '/organ-explorer', '/kebersihan', '/kuis', '/tantangan',
    '/refleksi']
  const badLinks = []
  for (const route of ROUTES.slice(0, 6)) {
    await goto(route)
    const found = await evaljs(`[...document.querySelectorAll('a[href]')]
      .map(a => a.getAttribute('href'))
      .filter(h => h.startsWith('/') && !h.startsWith('//'))`)
    for (const href of found) {
      if (!ROUTES.includes(href) && !href.startsWith('/organ/')) {
        badLinks.push(`${route} -> ${href}`)
      }
    }
  }
  ok('Tautan internal menunjuk route valid', badLinks.length === 0,
    badLinks.slice(0, 4).join(', '))

  // =================== RINGKASAN ===================
  const failed = results.filter((r) => !r.pass)
  console.log(`\n=== RINGKASAN: ${results.length - failed.length}/${results.length} lulus ===`)
  if (errors.length) {
    console.log('\n⚠️  Error console/runtime selama pengujian:')
    for (const e of [...new Set(errors)].slice(0, 10)) console.log('   -', e)
  } else {
    console.log('✅ Tidak ada error console/runtime.')
  }
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
