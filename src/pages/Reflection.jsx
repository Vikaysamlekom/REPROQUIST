import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import PageHero from '../components/common/PageHero.jsx'
import Reveal from '../components/common/Reveal.jsx'
import { useReflection, useProgress, useQuizScore } from '../hooks/useProgress.js'
import { MISSIONS } from '../data/missions.js'
import { ORGANS } from '../data/organs.js'

const QUESTIONS = [
  {
    id: 'q1',
    question: 'Apa hal baru yang kamu pelajari hari ini?',
    hint: 'Tuliskan satu hal paling menarik menurutmu.',
  },
  {
    id: 'q2',
    question: 'Organ apa yang paling kamu ingat dan apa fungsinya?',
    hint: 'Sebutkan nama organ lalu tulis fungsinya.',
  },
  {
    id: 'q3',
    question: 'Mengapa kita perlu menjaga kebersihan tubuh?',
    hint: 'Coba jelaskan dengan kalimatmu sendiri.',
  },
  {
    id: 'q4',
    question: 'Bagaimana cara menjaga kesehatan tubuh sehari-hari?',
    hint: 'Sebutkan kebiasaan yang bisa kamu lakukan setiap hari.',
  },
]

function Summary() {
  const { score } = useQuizScore()
  const { flags } = useProgress()
  const studiedOrgans = ORGANS.filter((o) => flags[`organ-${o.slug}`])

  return (
    <Reveal className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">
        Rangkuman pembelajaran
      </p>
      <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
        📚 Apa yang sudah kamu capai
      </h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-primary/8 p-4 text-center">
          <p className="font-display text-3xl font-extrabold text-primary">
            {score ? `${score.score}/${score.total}` : '—'}
          </p>
          <p className="mt-1 text-xs font-bold text-muted">Nilai kuis terakhir</p>
        </div>
        <div className="rounded-2xl bg-mint/15 p-4 text-center">
          <p className="font-display text-3xl font-extrabold text-emerald-700">
            {studiedOrgans.length}/{ORGANS.length}
          </p>
          <p className="mt-1 text-xs font-bold text-muted">Organ dipelajari</p>
        </div>
        <div className="rounded-2xl bg-sun/25 p-4 text-center">
          <p className="font-display text-3xl font-extrabold text-amber-600">
            {MISSIONS.filter((m) => m.doneWhen.every((f) => flags[f])).length}/{MISSIONS.length}
          </p>
          <p className="mt-1 text-xs font-bold text-muted">Misi selesai</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-sun/50 bg-sun/15 p-5">
        <p className="font-display font-bold text-ink">🎯 Ingat kembali</p>
        <ul className="mt-2 space-y-1.5 text-sm text-ink/80">
          <li>• Ovarium menghasilkan sel telur, testis menghasilkan sel sperma.</li>
          <li>• Rahim adalah tempat janin berkembang selama kehamilan.</li>
          <li>• Tuba falopi menghubungkan ovarium dengan rahim.</li>
          <li>• Skrotum melindungi testis; penis adalah saluran keluar urine dan semen.</li>
          <li>• Jaga kebersihan tubuh dan cerita kepada orang dewasa tepercaya bila tidak nyaman.</li>
        </ul>
      </div>
    </Reveal>
  )
}

export default function Reflection() {
  const reduced = useReducedMotion()
  const { answers, setAnswer } = useReflection()
  const { markDone } = useProgress()

  const filled = QUESTIONS.filter((q) => (answers[q.id] ?? '').trim().length > 0).length
  const allFilled = filled === QUESTIONS.length

  const handleComplete = () => {
    markDone('refleksi-selesai')
    document.getElementById('rangkuman')?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  return (
    <>
      <PageHero
        icon="📝"
        kicker="Misi 6 · E-LKPD"
        title="Refleksi dan E-LKPD"
        description="Tulis pembelajaranmu hari ini. Jawabanmu tersimpan otomatis di perangkat ini, jadi tidak hilang bila halaman dimuat ulang."
        accent="#4f9dd8"
      />

      <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-bold text-muted">
            Terisi <span className="text-primary">{filled}</span> dari {QUESTIONS.length} soal
          </p>
          <span className="text-xs text-muted">💾 Tersimpan otomatis</span>
        </div>

        <div className="mt-6 space-y-5">
          {QUESTIONS.map((q, i) => (
            <Reveal key={q.id} delay={i * 0.05}>
              <label
                htmlFor={q.id}
                className="block rounded-3xl border border-line bg-white p-5 shadow-card sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 font-display text-sm font-extrabold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-bold leading-snug text-ink">
                      {q.question}
                    </p>
                    <p className="mt-1 text-xs italic text-muted">💡 {q.hint}</p>
                  </div>
                </div>
                <textarea
                  id={q.id}
                  rows={3}
                  value={answers[q.id] ?? ''}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  placeholder="Tulis jawabanmu di sini…"
                  className="mt-4 w-full resize-y rounded-2xl border-2 border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-primary/60 focus:bg-white"
                />
                {(answers[q.id] ?? '').trim().length > 0 && (
                  <p className="mt-2 text-right text-[11px] font-bold text-emerald-600">
                    ✓ Tersimpan
                  </p>
                )}
              </label>
            </Reveal>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleComplete}
            className="rounded-2xl bg-primary px-7 py-4 font-extrabold text-white shadow-pop transition hover:-translate-y-1 hover:bg-primary-dark"
          >
            {allFilled ? '✅ Selesaikan misi & lihat rangkuman' : '✅ Tandai selesai & lihat rangkuman'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Hapus semua jawaban refleksi?')) {
                QUESTIONS.forEach((q) => setAnswer(q.id, ''))
              }
            }}
            className="rounded-2xl border-2 border-line px-6 py-4 font-bold text-muted transition hover:border-pink/50 hover:text-pink"
          >
            🗑 Kosongkan jawaban
          </button>
        </div>

        {!allFilled && (
          <p className="mt-3 text-xs text-muted">
            Semua jawaban boleh diisi nanti — progresmu tetap tersimpan.
          </p>
        )}

        {/* ---------------------- Rangkuman ---------------------- */}
        <motion.div
          id="rangkuman"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 scroll-mt-24"
        >
          <Summary />
        </motion.div>

        {/* Tampilkan kembali jawaban siswa */}
        {filled > 0 && (
          <Reveal className="mt-6 rounded-3xl border border-line bg-white p-6 shadow-card">
            <h2 className="font-display text-xl font-extrabold text-ink">🖊 Jawabanmu</h2>
            <dl className="mt-4 space-y-4">
              {QUESTIONS.filter((q) => (answers[q.id] ?? '').trim()).map((q) => (
                <div key={q.id}>
                  <dt className="text-sm font-bold text-ink">{q.question}</dt>
                  <dd className="mt-1 rounded-2xl bg-paper px-4 py-3 text-sm whitespace-pre-wrap text-muted">
                    {answers[q.id]}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/dashboard"
            className="rounded-2xl border-2 border-line bg-white px-6 py-3.5 font-extrabold text-ink transition hover:-translate-y-0.5 hover:border-primary/40"
          >
            🗺️ Kembali ke Peta Misi
          </Link>
          <Link
            to="/"
            className="rounded-2xl px-4 py-3.5 font-bold text-muted transition hover:text-primary"
          >
            ← Beranda
          </Link>
        </div>
      </section>
    </>
  )
}
