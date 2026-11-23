import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import PageHero from '../components/common/PageHero.jsx'
import { QUIZ_QUESTIONS } from '../data/quiz.js'
import { useQuizScore, useProgress } from '../hooks/useProgress.js'
import {
  buildQuizResultsCsv,
  fetchQuizResults,
  getLocalQuizResults,
  isQuizSheetConfigured,
  mergeQuizResults,
  saveLocalQuizResult,
  submitQuizResult,
} from '../lib/quizResults.js'

const TEACHER_PASSWORD = '1234'

function shuffleQuestions() {
  const arr = [...QUIZ_QUESTIONS]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function Quiz() {
  const reduced = useReducedMotion()
  const questions = useMemo(shuffleQuestions, [])
  const { setScore } = useQuizScore()
  const { markDone } = useProgress()

  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setLocalScore] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [finished, setFinished] = useState(false)
  const [mode, setMode] = useState('entry')
  const [quizStarted, setQuizStarted] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [teacherPassword, setTeacherPassword] = useState('')
  const [teacherAuthenticated, setTeacherAuthenticated] = useState(false)
  const [teacherError, setTeacherError] = useState('')
  const [results, setResults] = useState([])
  const [resultsMessage, setResultsMessage] = useState('')
  const [syncMessage, setSyncMessage] = useState('')

  const question = questions[index]
  const total = questions.length

  const choose = (i) => {
    if (picked !== null) return // hanya boleh menjawab sekali
    setPicked(i)
    if (i === question.answer) setLocalScore((s) => s + 1)
    else setWrong((w) => w + 1)
  }

  const next = () => {
    if (index + 1 >= total) {
      const finalScore = score
      const date = new Date().toISOString()
      const result = {
        id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: studentName,
        score: finalScore,
        total,
        percent: Math.round((finalScore / total) * 100),
        date,
      }
      setScore({ ...result })
      let localSaveFailed = false
      try {
        saveLocalQuizResult(result)
      } catch {
        localSaveFailed = true
      }
      setSyncMessage(
        localSaveFailed
          ? 'Penyimpanan lokal gagal. Sedang mencoba mengirim nilai ke Google Sheets...'
          : isQuizSheetConfigured()
          ? 'Sedang mengirim nilai ke Google Sheets...'
          : 'Nilai tersimpan di perangkat ini. Google Sheets belum dihubungkan.',
      )
      if (isQuizSheetConfigured()) {
        submitQuizResult(result)
          .then(() => setSyncMessage(
            localSaveFailed
              ? 'Nilai berhasil dikirim ke Google Sheets, tetapi penyimpanan lokal gagal.'
              : 'Nilai berhasil dikirim ke Google Sheets.',
          ))
          .catch((error) => setSyncMessage(
            `${localSaveFailed ? 'Penyimpanan lokal gagal dan ' : ''}gagal mengirim nilai ke Google Sheets: ${error.message}`,
          ))
      } else if (localSaveFailed) {
        setSyncMessage('Penyimpanan nilai gagal. Google Sheets belum dihubungkan.')
      }
      markDone('kuis-selesai')
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setPicked(null)
  }

  const restart = () => {
    setIndex(0)
    setPicked(null)
    setLocalScore(0)
    setWrong(0)
    setFinished(false)
    setSyncMessage('')
    setMode('quiz')
    setQuizStarted(true)
  }

  const startQuiz = (event) => {
    event.preventDefault()
    const name = studentName.trim()
    if (!name) return
    setStudentName(name)
    setIndex(0)
    setPicked(null)
    setLocalScore(0)
    setWrong(0)
    setFinished(false)
    setMode('quiz')
    setQuizStarted(true)
  }

  const openTeacherPage = () => {
    setResults(getLocalQuizResults())
    setResultsMessage('')
    setTeacherError('')
    setMode('teacher')
  }

  const loginTeacher = async (event) => {
    event.preventDefault()
    if (teacherPassword !== TEACHER_PASSWORD) {
      setTeacherError('Password salah. Silakan coba lagi.')
      return
    }

    setTeacherAuthenticated(true)
    setTeacherError('')
    setResults(getLocalQuizResults())
    if (!isQuizSheetConfigured()) {
      setResultsMessage('Menampilkan hasil di perangkat ini. Google Sheets belum dihubungkan.')
      return
    }

    setResultsMessage('Memuat rekap dari Google Sheets...')
    try {
      const sheetResults = await fetchQuizResults(teacherPassword)
      setResults(mergeQuizResults(getLocalQuizResults(), sheetResults))
      setResultsMessage(`Rekap Google Sheets berhasil dimuat (${sheetResults.length} hasil).`)
    } catch (error) {
      setResultsMessage(`Gagal memuat Google Sheets: ${error.message}`)
    }
  }

  const refreshTeacherResults = async () => {
    setResults(getLocalQuizResults())
    if (!isQuizSheetConfigured()) {
      setResultsMessage('Menampilkan hasil di perangkat ini. Google Sheets belum dihubungkan.')
      return
    }
    setResultsMessage('Memuat ulang rekap...')
    try {
      const sheetResults = await fetchQuizResults(teacherPassword)
      setResults(mergeQuizResults(getLocalQuizResults(), sheetResults))
      setResultsMessage(`Rekap Google Sheets berhasil dimuat (${sheetResults.length} hasil).`)
    } catch (error) {
      setResultsMessage(`Gagal memuat Google Sheets: ${error.message}`)
    }
  }

  const downloadResultsCsv = () => {
    const blob = new Blob([buildQuizResultsCsv(results)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rekap-nilai-kuis-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const percent = Math.round((score / total) * 100)
  const bestMessage =
    percent >= 80
      ? 'Luar biasa! Pemahamanmu sangat baik. 🌟'
      : percent >= 60
        ? 'Bagus! Terus belajar sedikit lagi ya. 💪'
        : 'Terus semangat, coba pelajari lagi materinya ya. 🌱'

  const animation = reduced
    ? {}
    : {
        initial: { opacity: 0, x: 24 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -24 },
        transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
      }

  return (
    <>
      <PageHero
        icon="🏆"
        kicker="Misi 5 · Tantangan"
        title="Tantangan Kuis"
        description={`${total} soal pilihan ganda. Jawab satu per satu — setiap jawaban disertai penjelasan singkat.`}
        accent="#9a87ff"
      />

      <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        {mode === 'teacher' ? (
          <div className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
            <button
              type="button"
              onClick={() => setMode(quizStarted ? 'quiz' : 'entry')}
              className="mb-5 text-sm font-bold text-primary hover:text-primary-dark"
            >
              ← Kembali ke kuis
            </button>
            {!teacherAuthenticated ? (
              <>
                <h2 className="font-display text-2xl font-extrabold text-ink">Halaman Guru</h2>
                <p className="mt-2 text-sm text-muted">Masukkan password untuk melihat rekap nilai siswa.</p>
                <form onSubmit={loginTeacher} className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <label className="sr-only" htmlFor="teacher-password">Password guru</label>
                  <input
                    id="teacher-password"
                    type="password"
                    value={teacherPassword}
                    onChange={(event) => setTeacherPassword(event.target.value)}
                    placeholder="Password guru"
                    autoComplete="current-password"
                    className="min-w-0 flex-1 rounded-xl border-2 border-line px-4 py-3 outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-6 py-3 font-extrabold text-white hover:bg-primary-dark"
                  >
                    Lihat rekap
                  </button>
                </form>
                {teacherError && <p role="alert" className="mt-3 text-sm font-bold text-rose-600">{teacherError}</p>}
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl font-extrabold text-ink">Rekap Nilai Siswa</h2>
                    <p className="mt-1 text-sm text-muted">{results.length} hasil tersimpan</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={refreshTeacherResults}
                      className="rounded-xl border-2 border-line px-4 py-2 text-sm font-bold text-ink hover:border-primary"
                    >
                      Muat ulang
                    </button>
                    <button
                      type="button"
                      onClick={downloadResultsCsv}
                      disabled={!results.length}
                      className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Unduh CSV
                    </button>
                  </div>
                </div>
                {resultsMessage && <p role="status" className="mt-4 text-sm text-muted">{resultsMessage}</p>}
                {results.length ? (
                  <div className="mt-5 overflow-x-auto rounded-xl border border-line">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="bg-paper text-xs uppercase text-muted">
                        <tr>
                          <th className="px-4 py-3">Nama</th>
                          <th className="px-4 py-3">Nilai</th>
                          <th className="px-4 py-3">Persentase</th>
                          <th className="px-4 py-3">Waktu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((result) => (
                          <tr key={result.id} className="border-t border-line">
                            <td className="px-4 py-3 font-bold text-ink">{result.name}</td>
                            <td className="px-4 py-3">{result.score} / {result.total}</td>
                            <td className="px-4 py-3">{result.percent}%</td>
                            <td className="px-4 py-3 text-muted">
                              {new Date(result.date).toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-5 rounded-xl bg-paper p-5 text-sm text-muted">Belum ada nilai kuis.</p>
                )}
              </>
            )}
            <p className="mt-5 text-xs text-muted">
              Password halaman ini adalah gerbang sederhana di sisi browser, bukan perlindungan data yang kuat.
            </p>
          </div>
        ) : mode === 'entry' ? (
          <div className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-display text-2xl font-extrabold text-ink">Sebelum mulai</h2>
            <p className="mt-2 text-sm text-muted">Isi nama agar hasil kuis bisa dicatat di rekap nilai.</p>
            <form onSubmit={startQuiz} className="mt-5 flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="student-name">Nama siswa</label>
              <input
                id="student-name"
                type="text"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                placeholder="Nama siswa"
                maxLength={100}
                required
                className="min-w-0 flex-1 rounded-xl border-2 border-line px-4 py-3 outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="rounded-xl bg-primary px-6 py-3 font-extrabold text-white shadow-pop hover:bg-primary-dark"
              >
                Mulai kuis →
              </button>
            </form>
            <button
              type="button"
              onClick={openTeacherPage}
              className="mt-5 rounded-xl border-2 border-line px-5 py-2.5 text-sm font-bold text-ink hover:border-primary"
            >
              Halaman Guru · Rekap nilai
            </button>
          </div>
        ) : !finished ? (
          <>
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-muted">Peserta: <span className="text-ink">{studentName}</span></p>
              <button
                type="button"
                onClick={openTeacherPage}
                className="text-sm font-bold text-primary hover:text-primary-dark"
              >
                Halaman Guru
              </button>
            </div>
            {/* Progres kuis */}
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-extrabold text-muted">
                Pertanyaan <span className="text-ink">{index + 1}</span> dari {total}
              </p>
              <p className="text-sm font-extrabold text-primary">Benar: {score}</p>
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-line">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-pink"
                initial={false}
                animate={{ width: `${((index + 1) / total) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={question.id}
                {...animation}
                className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-navy to-[#5145a9] p-6 text-white shadow-pop sm:p-8"
              >
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c7c9ff]">
                  Pilih jawaban yang benar
                </p>
                <h2 className="mt-3 font-display text-xl font-bold leading-snug sm:text-2xl">
                  {question.question}
                </h2>

                <div className="mt-6 grid gap-3">
                  {question.options.map((option, i) => {
                    const isCorrect = i === question.answer
                    const isPicked = i === picked
                    const answered = picked !== null

                    let cls =
                      'border-white/25 bg-white/10 hover:bg-white/20 hover:border-white/50'
                    if (answered && isCorrect) cls = 'border-emerald-400 bg-emerald-500/80'
                    else if (answered && isPicked) cls = 'border-rose-300 bg-rose-400/70'
                    else if (answered) cls = 'border-white/15 bg-white/5 opacity-60'

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => choose(i)}
                        disabled={answered}
                        className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-sm font-bold transition sm:text-base ${cls}`}
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/20 text-xs font-black">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {option}
                        {answered && isCorrect && <span className="ml-auto">✅</span>}
                        {answered && isPicked && !isCorrect && <span className="ml-auto">💭</span>}
                      </button>
                    )
                  })}
                </div>

                {/* Umpan balik + penjelasan */}
                {picked !== null && (
                  <motion.div
                    initial={reduced ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-5 rounded-2xl p-4 ${
                      picked === question.answer ? 'bg-emerald-400/20' : 'bg-white/15'
                    }`}
                  >
                    <p className="font-display font-bold">
                      {picked === question.answer
                        ? '🎉 Tepat sekali!'
                        : '🌱 Belum tepat, tapi tidak apa-apa!'}
                    </p>
                    <p className="mt-1 text-sm text-[#e6e7ff]">{question.explanation}</p>
                  </motion.div>
                )}

                {picked !== null && (
                  <button
                    type="button"
                    onClick={next}
                    className="mt-5 w-full rounded-2xl bg-white px-6 py-4 font-extrabold text-navy transition hover:-translate-y-0.5 sm:w-auto"
                  >
                    {index + 1 >= total ? 'Lihat hasil →' : 'Pertanyaan berikutnya →'}
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          /* ==================== HASIL AKHIR ==================== */
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-line bg-white p-8 text-center shadow-card"
          >
            <span className="text-6xl" aria-hidden="true">
              {percent >= 80 ? '🏅' : percent >= 60 ? '🎖️' : '🌱'}
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-ink">
              Kuis selesai!
            </h2>
            <p className="mt-4 font-display text-5xl font-extrabold text-primary">
              {score}
              <span className="text-2xl text-muted"> / {total}</span>
            </p>

            <div className="mt-5 flex justify-center gap-3">
              <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-extrabold text-emerald-700">
                ✅ {score} benar
              </span>
              <span className="rounded-full bg-rose-100 px-4 py-2 text-sm font-extrabold text-rose-600">
                💭 {wrong} belum tepat
              </span>
            </div>

            <p className="mx-auto mt-4 max-w-md text-sm text-muted">{bestMessage}</p>
            <p role="status" className="mt-4 text-sm text-muted">{syncMessage}</p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  restart()
                }}
                className="rounded-2xl bg-primary px-6 py-3.5 font-extrabold text-white shadow-pop transition hover:-translate-y-0.5 hover:bg-primary-dark"
              >
                🔄 Ulangi kuis
              </button>
              <Link
                to="/tantangan"
                className="rounded-2xl border-2 border-line px-6 py-3.5 font-extrabold text-ink transition hover:-translate-y-0.5 hover:border-primary/40"
              >
                🧩 Mencocokkan organ →
              </Link>
            </div>

            <p className="mt-6 text-xs text-muted">
              Nilai terakhir tersimpan otomatis di perangkat ini.
            </p>
          </motion.div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/dashboard"
            className="rounded-xl bg-line/70 px-5 py-2.5 text-sm font-bold text-muted transition hover:text-primary"
          >
            ← Peta Misi
          </Link>
          <Link
            to="/organ-explorer"
            className="rounded-xl bg-line/70 px-5 py-2.5 text-sm font-bold text-muted transition hover:text-primary"
          >
            🧬 Pelajari lagi materinya
          </Link>
        </div>
      </section>
    </>
  )
}
