import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import PageHero from '../components/common/PageHero.jsx'
import { QUIZ_QUESTIONS } from '../data/quiz.js'
import { useQuizScore, useProgress } from '../hooks/useProgress.js'

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
      setScore({ score: finalScore, total, date: new Date().toISOString() })
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
        {!finished ? (
          <>
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

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={restart}
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
