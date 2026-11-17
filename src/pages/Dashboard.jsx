import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import PageHero from '../components/common/PageHero.jsx'
import Reveal from '../components/common/Reveal.jsx'
import { MISSIONS } from '../data/missions.js'
import { useProgress } from '../hooks/useProgress.js'

/** Hitung status misi berdasarkan seluruh penanda `doneWhen`. */
function useMissionStatus() {
  const { isDone } = useProgress()

  return MISSIONS.map((mission) => {
    const total = mission.doneWhen.length
    const completed = mission.doneWhen.filter((flag) => isDone(flag)).length
    const percent = Math.round((completed / total) * 100)
    return { ...mission, completed, total, percent, isComplete: completed === total }
  })
}

function ProgressBar({ percent, color }) {
  const reduced = useReducedMotion()
  return (
    <div
      className="h-3 w-full overflow-hidden rounded-full bg-line"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={reduced ? false : { width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}

export default function Dashboard() {
  const missions = useMissionStatus()
  const { completedCount, resetProgress } = useProgress()

  const totalFlags = MISSIONS.reduce((sum, m) => sum + m.doneWhen.length, 0)
  const doneFlags = missions.reduce((sum, m) => sum + m.completed, 0)
  const overallPercent = Math.round((doneFlags / totalFlags) * 100)

  return (
    <>
      <PageHero
        icon="🗺️"
        kicker="Dashboard pembelajaran"
        title="Peta Misi"
        description="Ikuti enam misi berikut secara berurutan. Progresmu tersimpan otomatis di perangkat ini."
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        {/* Ringkasan progres keseluruhan */}
        <Reveal className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">
                Progres keseluruhan
              </p>
              <p className="mt-1 font-display text-4xl font-extrabold text-ink">
                {overallPercent}%
              </p>
              <p className="text-sm text-muted">
                {doneFlags} dari {totalFlags} penanda selesai · {completedCount} misi tuntas
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Hapus semua progres belajar di perangkat ini?')) {
                  resetProgress()
                }
              }}
              className="rounded-xl border border-line px-4 py-2.5 text-sm font-bold text-muted transition hover:border-pink/50 hover:text-pink"
            >
              🔄 Reset progres
            </button>
          </div>
          <div className="mt-5">
            <ProgressBar percent={overallPercent} color="linear-gradient(90deg, #6654d9, #f27ba5)" />
          </div>
        </Reveal>

        {/* Daftar misi */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {missions.map((mission, i) => (
            <Reveal key={mission.id} delay={i * 0.05}>
              <article className="flex h-full flex-col rounded-3xl border border-line bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-pop">
                <div className="flex items-start gap-4">
                  <span
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl"
                    style={{ background: `${mission.color}1f` }}
                  >
                    {mission.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-black uppercase tracking-wider text-muted">
                        Misi {mission.number}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-extrabold"
                        style={{
                          background: mission.isComplete ? '#dcfce7' : '#eef0fb',
                          color: mission.isComplete ? '#15803d' : '#66738e',
                        }}
                      >
                        {mission.isComplete ? '✅ Selesai' : `${mission.completed}/${mission.total}`}
                      </span>
                    </div>
                    <h2 className="mt-1 font-display text-xl font-bold leading-snug text-ink">
                      {mission.title}
                    </h2>
                  </div>
                </div>

                <p className="mt-3 flex-1 text-sm text-muted">{mission.description}</p>

                <div className="mt-4">
                  <ProgressBar percent={mission.percent} color={mission.color} />
                </div>

                <Link
                  to={mission.to}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5"
                  style={{ background: mission.color }}
                >
                  {mission.cta} <span aria-hidden="true">→</span>
                </Link>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white px-6 py-3.5 font-bold text-ink transition hover:border-primary/40 hover:text-primary"
          >
            ← Kembali ke beranda
          </Link>
        </Reveal>
      </section>
    </>
  )
}
