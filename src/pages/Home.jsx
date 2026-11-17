import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import Reveal from '../components/common/Reveal.jsx'
import { MISSIONS } from '../data/missions.js'

/** Lapisan parallax untuk hero — dihitung dari posisi gulir halaman. */
function ParallaxHero({ children }) {
  const reduced = useReducedMotion()
  const { scrollY } = useScroll()

  const layerBack = useTransform(scrollY, [0, 500], [0, reduced ? 0 : -70])
  const layerMid = useTransform(scrollY, [0, 500], [0, reduced ? 0 : -140])
  const layerFront = useTransform(scrollY, [0, 500], [0, reduced ? 0 : -30])

  return (
    <div className="relative">
      <motion.div
        aria-hidden="true"
        style={{ y: layerBack }}
        className="absolute inset-x-0 top-0 h-full"
      >
        {/* Lapisan paling belakang: blob warna */}
        <div className="absolute left-[6%] top-16 h-40 w-40 rounded-full bg-pink/25 blur-3xl" />
        <div className="absolute right-[8%] top-10 h-52 w-52 rounded-full bg-mint/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-44 w-40 rounded-full bg-sun/30 blur-3xl" />
      </motion.div>

      <motion.div
        aria-hidden="true"
        style={{ y: layerMid }}
        className="absolute inset-x-0 top-0 h-full"
      >
        {/* Lapisan tengah: ikon melayang */}
        <span className="absolute left-[12%] top-28 text-4xl opacity-70">🧫</span>
        <span className="absolute right-[16%] top-24 text-4xl opacity-70">🔬</span>
        <span className="absolute left-[45%] top-8 text-3xl opacity-60">✨</span>
        <span className="absolute right-[34%] bottom-24 text-3xl opacity-60">🌱</span>
      </motion.div>

      <motion.div style={{ y: layerFront }} className="relative z-10">
        {children}
      </motion.div>
    </div>
  )
}

const QUICK_LINKS = [
  { to: '/materi', icon: '📘', label: 'Materi Pengantar' },
  { to: '/organ-explorer', icon: '🧬', label: 'Jelajahi Organ' },
  { to: '/kuis', icon: '🏆', label: 'Tantangan Kuis' },
  { to: '/refleksi', icon: '📝', label: 'E-LKPD' },
]

export default function Home() {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const fade = reduced || !mounted ? {} : { initial: { opacity: 0, y: 26 }, animate: { opacity: 1, y: 0 } }

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-paper to-white">
        <ParallaxHero>
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <motion.span
                {...fade}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-primary"
              >
                🎯 IPAS Kelas V SD
              </motion.span>

              <motion.h1
                {...fade}
                transition={{ duration: 0.6, delay: 0.08 }}
                className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl"
              >
                REPRODUKSI{' '}
                <span className="bg-gradient-to-r from-primary to-pink bg-clip-text text-transparent">
                  QUEST
                </span>
              </motion.h1>

              <motion.h2
                {...fade}
                transition={{ duration: 0.6, delay: 0.16 }}
                className="mt-3 font-display text-2xl font-bold text-ink/80 sm:text-3xl"
              >
                Mengenal Organ Reproduksi Manusia
              </motion.h2>

              <motion.p
                {...fade}
                transition={{ duration: 0.6, delay: 0.24 }}
                className="mt-5 max-w-xl text-base text-muted sm:text-lg"
              >
                Selamat datang di petualangan belajar! Jelajahi misi, putar model anatomi 3D,
                baca penjelasan sederhana, lalu uji pemahamanmu lewat kuis dan E-LKPD.
              </motion.p>

              <motion.div
                {...fade}
                transition={{ duration: 0.6, delay: 0.32 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link
                  to="/dashboard"
                  className="rounded-2xl bg-primary px-7 py-4 text-base font-extrabold text-white shadow-pop transition hover:-translate-y-1 hover:bg-primary-dark"
                >
                  🚀 Mulai Petualangan
                </Link>
                <Link
                  to="/organ-explorer"
                  className="rounded-2xl border-2 border-line bg-white px-7 py-4 text-base font-extrabold text-ink transition hover:-translate-y-1 hover:border-primary/40"
                >
                  🧬 Jelajahi Organ
                </Link>
              </motion.div>
            </div>

            {/* Ilustrasi edukatif ramah anak */}
            <motion.div
              initial={reduced ? false : { opacity: 0, scale: 0.92 }}
              animate={mounted ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-md"
            >
              <div className="relative aspect-square rounded-[2.5rem] bg-gradient-to-br from-primary to-pink shadow-pop">
                <div className="absolute inset-6 rounded-[2rem] border border-white/30" />
                <div className="absolute inset-0 grid place-items-center text-center text-white">
                  <div>
                    <div className="text-7xl sm:text-8xl">🧬</div>
                    <p className="mt-4 font-display text-2xl font-extrabold">
                      Belajar seru & aman
                    </p>
                    <p className="mt-1 text-sm text-white/85">
                      Ilmiah · Sopan · Sesuai usia
                    </p>
                  </div>
                </div>
              </div>

              {/* Kartu melayang di sekeliling ilustrasi */}
              <div className="absolute -left-4 top-6 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-ink shadow-card sm:-left-8">
                🥚 Ovarium
              </div>
              <div className="absolute -right-3 bottom-10 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-ink shadow-card sm:-right-6">
                🔵 Testis
              </div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-primary shadow-card">
                ✅ Kuis 12 soal
              </div>
            </motion.div>
          </div>
        </ParallaxHero>
      </section>

      {/* ====================== TOMBOL NAVIGASI ====================== */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <Reveal className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">
            Mulai dari mana?
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Pilih jalur belajarmu
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((link, i) => (
            <Reveal key={link.to} delay={i * 0.06}>
              <Link
                to={link.to}
                className="group flex h-full flex-col items-center gap-3 rounded-3xl border border-line bg-white px-5 py-7 text-center shadow-card transition hover:-translate-y-1.5 hover:border-primary/30"
              >
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-3xl transition group-hover:scale-110">
                  {link.icon}
                </span>
                <span className="font-display text-lg font-bold text-ink">{link.label}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ========================= RINGKASAN MISI ========================= */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <Reveal className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">
              Peta misi
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              6 misi menantimu
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              Selesaikan setiap misi untuk mengumpulkan progres belajarmu.
            </p>
          </Reveal>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MISSIONS.map((mission, i) => (
              <Reveal key={mission.id} delay={i * 0.05}>
                <Link
                  to={mission.to}
                  className="group flex h-full flex-col rounded-3xl border border-line bg-paper p-6 transition hover:-translate-y-1.5 hover:bg-white hover:shadow-card"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-12 w-12 place-items-center rounded-2xl text-2xl"
                      style={{ background: `${mission.color}1f` }}
                    >
                      {mission.icon}
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-muted">
                      Misi {mission.number}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-ink">
                    {mission.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-muted">{mission.description}</p>
                  <span
                    className="mt-4 text-sm font-extrabold transition group-hover:translate-x-1"
                    style={{ color: mission.color }}
                  >
                    {mission.cta} →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
