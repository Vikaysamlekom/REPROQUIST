const SHEET_NAME = 'Rekap Kuis'
const TEACHER_PASSWORD = '1234'

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {}
  const callback = params.callback || ''
  let response

  try {
    if (params.action === 'save') {
      response = saveQuizResult_(params.data)
    } else if (params.action === 'list') {
      if (params.password !== TEACHER_PASSWORD) {
        throw new Error('Password guru salah.')
      }
      response = { ok: true, data: listQuizResults_() }
    } else {
      throw new Error('Aksi tidak dikenal.')
    }
  } catch (error) {
    response = { ok: false, error: error.message }
  }

  const json = JSON.stringify(response)
  if (callback && /^[A-Za-z_$][\w$]*$/.test(callback)) {
    return ContentService.createTextOutput(`${callback}(${json});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT)
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON)
}

function saveQuizResult_(rawData) {
  if (!rawData || rawData.length > 2000) {
    throw new Error('Data hasil kuis tidak valid.')
  }

  const result = JSON.parse(rawData)
  const name = cleanCell_(result.name, 100)
  const id = cleanCell_(result.id, 100)
  const date = cleanCell_(result.date, 40)
  const score = Number(result.score)
  const total = Number(result.total)
  const percent = Number(result.percent)

  if (!id || !name || !date || !Number.isInteger(score) || !Number.isInteger(total) ||
      total < 1 || score < 0 || score > total || !Number.isFinite(percent)) {
    throw new Error('Data hasil kuis tidak lengkap atau tidak valid.')
  }

  const sheet = getSheet_()
  const lock = LockService.getScriptLock()
  lock.waitLock(10000)
  try {
    const existingIds = sheet.getLastRow() > 1
      ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues().flat()
      : []
    if (!existingIds.includes(id)) {
      sheet.appendRow([id, name, score, total, percent, date])
    }
  } finally {
    lock.releaseLock()
  }

  return { ok: true, data: { id: id } }
}

function listQuizResults_() {
  const sheet = getSheet_()
  if (sheet.getLastRow() < 2) return []

  return sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues()
    .map(function (row) {
      return {
        id: String(row[0]),
        name: String(row[1]),
        score: Number(row[2]),
        total: Number(row[3]),
        percent: Number(row[4]),
        date: row[5] instanceof Date ? row[5].toISOString() : String(row[5]),
      }
    })
    .reverse()
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  if (!spreadsheet) throw new Error('Skrip harus terhubung ke Google Spreadsheet.')

  let sheet = spreadsheet.getSheetByName(SHEET_NAME)
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME)
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['ID', 'Nama siswa', 'Nilai benar', 'Jumlah soal', 'Nilai (%)', 'Waktu'])
    sheet.setFrozenRows(1)
  }
  return sheet
}

function cleanCell_(value, maxLength) {
  const text = String(value == null ? '' : value).trim().slice(0, maxLength)
  return /^[=+\-@]/.test(text) ? "'" + text : text
}
