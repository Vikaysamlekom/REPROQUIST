const RESULTS_KEY = 'rq_quiz_results'
const GOOGLE_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzh-9l3N2IyLhMo68l3cLag95QbUnyB8BixZ-cEHtC0PiAc43jzbXJl4mRTpY0G-4Om/exec'

function readLocalResults() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(RESULTS_KEY) || '[]')
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

export function saveLocalQuizResult(result) {
  const results = [result, ...readLocalResults()]
  window.localStorage.setItem(RESULTS_KEY, JSON.stringify(results))
  return results
}

export function getLocalQuizResults() {
  return readLocalResults()
}

export function isQuizSheetConfigured() {
  return Boolean(GOOGLE_APPS_SCRIPT_URL)
}

function requestSheet(action, params = {}) {
  if (!GOOGLE_APPS_SCRIPT_URL) {
    return Promise.reject(new Error('URL Google Apps Script belum dikonfigurasi.'))
  }

  return new Promise((resolve, reject) => {
    const callbackName = `rqSheetCallback${Date.now()}${Math.random().toString(36).slice(2)}`
    const query = new URLSearchParams({ action, callback: callbackName, ...params })
    const script = document.createElement('script')
    const timeout = window.setTimeout(() => {
      cleanup()
      reject(new Error('Google Sheets tidak merespons. Periksa URL dan deployment Apps Script.'))
    }, 15000)

    const cleanup = () => {
      window.clearTimeout(timeout)
      delete window[callbackName]
      script.remove()
    }

    window[callbackName] = (response) => {
      cleanup()
      if (!response?.ok) {
        reject(new Error(response?.error || 'Google Sheets gagal memproses permintaan.'))
        return
      }
      resolve(response.data)
    }
    script.onerror = () => {
      cleanup()
      reject(new Error('Tidak dapat terhubung ke Google Apps Script.'))
    }
    script.src = `${GOOGLE_APPS_SCRIPT_URL}?${query.toString()}`
    document.head.appendChild(script)
  })
}

export async function submitQuizResult(result) {
  return requestSheet('save', { data: JSON.stringify(result) })
}

export async function fetchQuizResults(password) {
  return requestSheet('list', { password })
}

export function mergeQuizResults(...groups) {
  const results = new Map()
  groups.flat().forEach((result) => {
    if (result?.id) results.set(result.id, result)
  })
  return [...results.values()].sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function buildQuizResultsCsv(results) {
  const escapeCell = (value) => {
    const text = String(value ?? '')
    const safeText = /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text
    return `"${safeText.replace(/"/g, '""')}"`
  }
  const rows = [
    ['Nama', 'Nilai benar', 'Jumlah soal', 'Nilai (%)', 'Waktu'],
    ...results.map((result) => [
      result.name,
      result.score,
      result.total,
      result.percent,
      result.date,
    ]),
  ]
  return `\uFEFF${rows.map((row) => row.map(escapeCell).join(',')).join('\r\n')}`
}
