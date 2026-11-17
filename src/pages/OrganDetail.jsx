import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import OrganViewerWrapper from '../components/viewer3d/OrganViewerWrapper.jsx'
import NotFound from './NotFound.jsx'
import { ORGANS, FEMALE_ORGANS, MALE_ORGANS, getOrganBySlug } from '../data/organs.js'
import { useProgress } from '../hooks/useProgress.js'

function InfoBlock({ icon, title, children }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
        <span aria-hidden="true">{icon}</span> {title}
      </h2>
      <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
    </div>
  )
}

/**
 * Legenda tahap pada model 3D (mis. siklus folikel di ovarium).
 * Menyorot tahap terpilih di dalam viewer sekaligus menampilkan
 * penjelasan singkat berbahasa Indonesia.
 */
function StageLegend({ organ, selected, onSelect }) {
  const panel = organ.panel || {}
  const active = organ.stages.find((s) => s.id === selected) || null

  return (
    <div className="mt-4 rounded-3xl border border-line bg-white p-5 shadow-card">
      <p className="font-display text-lg font-bold text-ink">
        {panel.title || `Tahapan pada ${organ.name}`}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        {panel.hint || 'Pilih salah satu tahap untuk menyorotnya pada model 3D.'}
      </p>

      <div
        className="mt-3 flex flex-wrap gap-2"
        role="group"
        aria-label={`Tahapan pada ${organ.name}`}
      >
        {organ.stages.map((s) => {
          const on = s.id === selected
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(on ? null : s.id)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-extrabold transition ${
                on ? 'shadow-sm' : 'border-line text-muted hover:border-primary/40 hover:text-ink'
              }`}
              style={
                on
                  ? { borderColor: organ.accent, background: `${organ.accent}14`, color: '#1d2430' }
                  : undefined
              }
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full ring-1 ring-black/15"
                style={{ background: s.color }}
                aria-hidden="true"
              />
              {s.name}
            </button>
          )
        })}
      </div>

      {active ? (
        <div
          className="mt-3 rounded-2xl border p-4"
          style={{ borderColor: `${organ.accent}55`, background: `${organ.accent}12` }}
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-extrabold text-ink">{active.name}</p>
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="rounded-lg px-2 py-1 text-[11px] font-bold text-muted transition hover:text-ink"
            >
              ✕ Matikan sorotan
            </button>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{active.desc}</p>
        </div>
      ) : (
        <p className="mt-3 rounded-2xl border border-dashed border-line px-4 py-3 text-xs text-muted">
          💡 Sorotan pada model akan menampilkan penjelasan tahap yang kamu pilih.
        </p>
      )}
    </div>
  )
}

/**
 * Kartu ilustrasi 2D organ. Gambar statis — TIDAK diklaim sebagai model 3D.
 * Menampilkan pasangan label Inggris→Indonesia untuk istilah
 * yang menempel di dalam gambar.
 */
function IllustrationCard({ organ }) {
  const illo = organ.illustration
  if (!illo) return null

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <span aria-hidden="true">🖼️</span> Ilustrasi organ
        </h2>
        <span className="rounded-full bg-line/60 px-2.5 py-1 text-[11px] font-extrabold text-muted">
          Gambar 2D statis · bukan model 3D
        </span>
      </div>

      <figure className="mt-3">
        <a
          href={illo.src}
          target="_blank"
          rel="noreferrer"
          title="Buka gambar ukuran penuh di tab baru"
          className="block overflow-hidden rounded-xl border border-line"
        >
          <img
            src={illo.src}
            alt={illo.alt}
            loading="lazy"
            className="w-full transition duration-300 hover:scale-[1.02]"
          />
        </a>
        <figcaption className="mt-2 text-sm leading-relaxed text-muted">{illo.caption}</figcaption>
      </figure>

      {illo.labels?.length > 0 && (
        <details className="mt-3 rounded-xl border border-dashed border-line px-4 py-3">
          <summary className="cursor-pointer text-xs font-extrabold text-ink">
            Label pada gambar (Inggris → Indonesia)
          </summary>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {illo.labels.map((l) => (
              <li key={l.en} className="text-xs leading-relaxed text-muted">
                <span className="font-bold text-ink">{l.en}</span> → {l.id}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}

export default function OrganDetail() {
  const { slug } = useParams()
  const organ = getOrganBySlug(slug)
  const notFound = !organ
  const reduced = useReducedMotion()
  const { markOrganStudied } = useProgress()

  // Tahap model 3D yang sedang disorot (mis. siklus folikel di ovarium)
  const [selectedStage, setSelectedStage] = useState(null)

  // Tandai organ sebagai sudah dipelajari saat halaman dibuka
  useEffect(() => {
    setSelectedStage(null)
    if (organ) markOrganStudied(organ.slug)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organ?.slug])

  // Slug tidak dikenal -> halaman 404 (judul disetel oleh route handle)
  if (notFound) return <NotFound />

  const list = organ.gender === 'perempuan' ? FEMALE_ORGANS : MALE_ORGANS
  const index = list.findIndex((o) => o.slug === organ.slug)
  const prev = list[index - 1]
  const next = list[index + 1]
  const backTo = organ.gender === 'perempuan' ? '/organ/perempuan' : '/organ/laki-laki'
  const backLabel =
    organ.gender === 'perempuan' ? 'Organ Reproduksi Perempuan' : 'Organ Reproduksi Laki-laki'

  const panelMotion = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 22 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
      }

  return (
    <>
      {/* Header organ */}
      <section className="relative overflow-hidden border-b border-line bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-25 blur-3xl"
          style={{ background: organ.accent }}
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-muted transition hover:border-primary/40 hover:text-primary"
          >
            ← Kembali ke {backLabel}
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span
              className="grid h-16 w-16 place-items-center rounded-3xl text-4xl"
              style={{ background: `${organ.accent}1f` }}
              aria-hidden="true"
            >
              {organ.icon}
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em]" style={{ color: organ.accent }}>
                Organ {organ.gender}
              </p>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
                {organ.name}
              </h1>
              <p className="mt-1 text-base text-muted">{organ.summary}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ------------------------- Viewer 3D ------------------------- */}
          <motion.div {...panelMotion} className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
                <p className="text-sm font-extrabold text-ink">Model 3D</p>
                <p className="text-[11px] font-bold text-muted">
                  {organ.cutaway
                    ? 'Putar 360° · Zoom · Potongan'
                    : 'Putar 360° · Zoom ⤢ · Sentuh di ponsel'}
                </p>
              </div>

              <div className="h-[340px] w-full bg-gradient-to-b from-paper to-white sm:h-[420px]">
                <OrganViewerWrapper
                  modelPath={organ.modelPath}
                  modelNote={organ.modelNote}
                  accent={organ.accent}
                  organName={organ.name}
                  stages={organ.stages}
                  cutaway={organ.cutaway}
                  selectedStage={selectedStage}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3">
                <p className="text-[11px] text-muted">
                  {organ.modelPath
                    ? `Aset: ${organ.modelPath}`
                    : organ.illustration
                      ? 'Status: placeholder — ilustrasi 2D ada di panel sebelah.'
                      : 'Status: placeholder — slot GLB/GLTF siap diisi.'}
                </p>
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-extrabold"
                  style={{ background: `${organ.accent}1f`, color: organ.accent }}
                >
                  {organ.name}
                </span>
              </div>
            </div>

            {/* Legenda tahap model 3D (hanya untuk organ bertopeng stages) */}
            {organ.stages?.length > 0 && (
              <StageLegend organ={organ} selected={selectedStage} onSelect={setSelectedStage} />
            )}
          </motion.div>

          {/* --------------------- Panel penjelasan --------------------- */}
          <motion.div {...panelMotion} transition={{ delay: reduced ? 0 : 0.1 }} className="space-y-4">
            <InfoBlock icon="📖" title="Definisi">
              {organ.definition}
            </InfoBlock>

            <InfoBlock icon="⚙️" title="Fungsi">
              {organ.function}
            </InfoBlock>

            <InfoBlock icon="📍" title="Letak organ">
              {organ.location}
            </InfoBlock>

            <InfoBlock icon="🔄" title="Cara kerja (sederhana)">
              {organ.howItWorks}
            </InfoBlock>

            {/* Ilustrasi 2D (hanya untuk organ yang memiliki gambar) */}
            <IllustrationCard organ={organ} />

            <div
              className="rounded-2xl border p-5"
              style={{ borderColor: `${organ.accent}55`, background: `${organ.accent}12` }}
            >
              <h2 className="font-display text-lg font-bold text-ink">✨ Fakta singkat</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">{organ.fact}</p>
            </div>

            {/* Navigasi antar organ */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {prev ? (
                <Link
                  to={`/organ/${prev.slug}`}
                  className="rounded-2xl border-2 border-line bg-white px-5 py-3 text-sm font-extrabold text-ink transition hover:-translate-y-0.5 hover:border-primary/40"
                >
                  ← {prev.name}
                </Link>
              ) : (
                <Link
                  to={backTo}
                  className="rounded-2xl border-2 border-line bg-white px-5 py-3 text-sm font-extrabold text-ink transition hover:-translate-y-0.5 hover:border-primary/40"
                >
                  ← Daftar organ
                </Link>
              )}

              {next && (
                <Link
                  to={`/organ/${next.slug}`}
                  className="rounded-2xl px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5"
                  style={{ background: organ.accent }}
                >
                  {next.name} →
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/organ-explorer"
                className="rounded-xl bg-line/70 px-4 py-2.5 text-sm font-bold text-muted transition hover:text-primary"
              >
                🧬 Semua organ
              </Link>
              <Link
                to="/dashboard"
                className="rounded-xl bg-line/70 px-4 py-2.5 text-sm font-bold text-muted transition hover:text-primary"
              >
                🗺️ Peta Misi
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Daftar seluruh organ (navigasi cepat) */}
        <div className="mt-10 rounded-3xl border border-line bg-white p-5 shadow-card sm:p-6">
          <p className="text-sm font-extrabold text-ink">Pindah cepat ke organ lain</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ORGANS.map((o) => (
              <Link
                key={o.slug}
                to={`/organ/${o.slug}`}
                className={`rounded-xl border px-3.5 py-2 text-sm font-bold transition ${
                  o.slug === organ.slug
                    ? 'border-transparent text-white'
                    : 'border-line text-muted hover:border-primary/40 hover:text-primary'
                }`}
                style={o.slug === organ.slug ? { background: o.accent } : undefined}
              >
                {o.icon} {o.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
