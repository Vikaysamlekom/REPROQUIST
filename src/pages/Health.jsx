import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/common/PageHero.jsx'
import Reveal from '../components/common/Reveal.jsx'
import { HEALTH_TIPS, HEALTH_CHECKLIST } from '../data/health.js'
import useLocalStorage from '../hooks/useLocalStorage.js'
import { useProgress } from '../hooks/useProgress.js'

const CHECK_KEY = 'rq_health_checklist'

export default function Health() {
  const [checked, setChecked] = useLocalStorage(CHECK_KEY, {})
  const { isDone, markDone } = useProgress()
  const finished = isDone('kebersihan-selesai')

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const toggle = (i) => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))
  const checkedCount = Object.values(checked).filter(Boolean).length

  return (
    <>
      <PageHero
        icon="🧼"
        kicker="Misi 4"
        title="Menjaga Kesehatan dan Kebersihan"
        description="Kebiasaan sederhana setiap hari agar tubuh tetap sehat, bersih, dan nyaman."
        accent="#ffd66b"
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        {/* Kartu tips */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {HEALTH_TIPS.map((tip, i) => (
            <Reveal key={tip.id} delay={i * 0.05}>
              <article className="h-full rounded-3xl border border-line bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-pop">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sun/25 text-3xl">
                  {tip.icon}
                </span>
                <h2 className="mt-4 font-display text-lg font-bold leading-snug text-ink">
                  {tip.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{tip.description}</p>
              </article>
            </Reveal>
          ))}

          {/* Kartu bantuan menonjol */}
          <Reveal delay={0.3}>
            <article className="h-full rounded-3xl border-2 border-pink/40 bg-pink/8 p-6">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-pink/20 text-3xl">
                🆘
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-ink">
                Bicara dengan orang dewasa tepercaya
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Orang tua, guru, atau orang dewasa tepercaya siap membantu menjawab pertanyaan
                tentang tubuhmu.
              </p>
            </article>
          </Reveal>
        </div>

        {/* Checklist sederhana */}
        <Reveal className="mt-8">
          <div className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">
                  Checklist harian
                </p>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-ink">
                  ✅ Cek kebiasaan sehatmu
                </h2>
              </div>
              <span className="rounded-full bg-mint/20 px-4 py-2 text-sm font-extrabold text-emerald-700">
                {hydrated ? checkedCount : 0} / {HEALTH_CHECKLIST.length} centang
              </span>
            </div>

            <ul className="mt-5 space-y-3">
              {HEALTH_CHECKLIST.map((item, i) => {
                const isChecked = hydrated && Boolean(checked[i])
                return (
                  <li key={item}>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 transition ${
                        isChecked
                          ? 'border-mint bg-mint/10'
                          : 'border-line bg-paper hover:border-primary/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(i)}
                        className="h-5 w-5 shrink-0 cursor-pointer accent-[#6ccbb5]"
                      />
                      <span className={`text-sm font-semibold ${isChecked ? 'text-ink' : 'text-muted'}`}>
                        {item}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>

            {checkedCount === HEALTH_CHECKLIST.length && (
              <p className="mt-4 rounded-2xl bg-mint/15 px-4 py-3 text-sm font-bold text-emerald-700">
                🎉 Hebat! Semua kebiasaan sehat sudah kamu tandai hari ini.
              </p>
            )}
          </div>
        </Reveal>

        {/* Aksi lanjut */}
        <div className="mt-8 flex flex-wrap gap-3">
          {!finished && (
            <button
              type="button"
              onClick={() => markDone('kebersihan-selesai')}
              className="rounded-2xl bg-primary px-7 py-4 font-extrabold text-white shadow-pop transition hover:-translate-y-1 hover:bg-primary-dark"
            >
              ✅ Tandai misi ini selesai
            </button>
          )}
          <Link
            to="/kuis"
            className="rounded-2xl border-2 border-line bg-white px-7 py-4 font-extrabold text-ink transition hover:-translate-y-1 hover:border-primary/40"
          >
            Lanjut ke Kuis →
          </Link>
          <Link
            to="/dashboard"
            className="rounded-2xl px-4 py-4 font-bold text-muted transition hover:text-primary"
          >
            ← Peta Misi
          </Link>
        </div>
      </section>
    </>
  )
}
