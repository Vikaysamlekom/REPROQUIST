import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import PageHero from '../components/common/PageHero.jsx'
import { useProgress } from '../hooks/useProgress.js'

/** Pasangan nama organ ↔ fungsinya (spesifikasi Section M). */
const PAIRS = [
  { id: 'ovarium', organ: 'Ovarium', func: 'Menghasilkan sel telur', icon: '🥚' },
  { id: 'tuba-falopi', organ: 'Tuba falopi', func: 'Saluran penghubung ovarium dan rahim', icon: '🔗' },
  { id: 'rahim', organ: 'Rahim', func: 'Tempat janin berkembang selama kehamilan', icon: '🤰' },
  { id: 'testis', organ: 'Testis', func: 'Menghasilkan sel sperma', icon: '🔵' },
  { id: 'skrotum', organ: 'Skrotum', func: 'Melindungi testis', icon: '🛡️' },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Matching() {
  const reduced = useReducedMotion()
  const { markDone } = useProgress()

  const targets = useMemo(() => shuffle(PAIRS), [])
  const [picks, setPicks] = useState({}) // { targetId: organId }
  const [selected, setSelected] = useState(null) // organ yang sedang dipilih (mode tap)
  const [dragging, setDragging] = useState(null) // organ yang sedang di-drag

  const assign = (targetId, organId) => {
    if (!organId) return
    // Bila organ sudah terpakai di target lain, lepaskan dulu
    setPicks((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(next)) {
        if (next[key] === organId) delete next[key]
      }
      next[targetId] = organId
      return next
    })
  }

  const isDone = Object.keys(picks).length === PAIRS.length
  const correct = Object.entries(picks).filter(([tid, oid]) => tid === oid).length

  const handleFinish = () => {
    if (isDone) markDone('mencocokkan-selesai')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const restart = () => {
    setPicks({})
    setSelected(null)
    setDragging(null)
  }

  const organOf = (id) => PAIRS.find((p) => p.id === id)
  const freeOrgans = PAIRS.filter((p) => !Object.values(picks).includes(p.id))

  return (
    <>
      <PageHero
        icon="🧩"
        kicker="Tantangan tambahan"
        title="Mencocokkan Organ"
        description="Pasangkan nama organ dengan fungsinya. Bisa dengan seret-lepas (drag) atau ketuk — ramah untuk ponsel."
        accent="#6ccbb5"
      />

      <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        {/* Instruksi */}
        <div className="rounded-2xl border border-line bg-white px-5 py-4 text-sm text-muted shadow-card">
          <b className="text-ink">Cara main:</b> ketuk nama organ, lalu ketuk fungsi yang cocok —
          atau seret nama organ ke kolom fungsinya. Klik pasangan yang salah untuk mengubahnya.
        </div>

        {/* Skor berjalan */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-extrabold text-primary">
            Terisi: {Object.keys(picks).length} / {PAIRS.length}
          </span>
          {isDone && (
            <span
              className={`rounded-full px-4 py-2 text-sm font-extrabold ${
                correct === PAIRS.length
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-sun/30 text-amber-700'
              }`}
            >
              {correct === PAIRS.length
                ? '🎉 Sempurna! Semua benar'
                : `Benar: ${correct} · Salah: ${PAIRS.length - correct}`}
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* -------------------- Sisi kiri: nama organ -------------------- */}
          <div>
            <h2 className="mb-3 font-display text-lg font-bold text-ink">🧬 Nama Organ</h2>
            <div className="flex flex-col gap-3">
              {PAIRS.map((pair) => {
                const used = Object.entries(picks).find(([, oid]) => oid === pair.id)
                const isSelected = selected === pair.id

                return (
                  <button
                    key={pair.id}
                    type="button"
                    draggable={!used}
                    onDragStart={() => setDragging(pair.id)}
                    onDragEnd={() => setDragging(null)}
                    onClick={() => {
                      if (used) {
                        // Lepaskan dari target tempat ia berada
                        setPicks((prev) => {
                          const next = { ...prev }
                          delete next[used[0]]
                          return next
                        })
                        setSelected(null)
                      } else {
                        setSelected((s) => (s === pair.id ? null : pair.id))
                      }
                    }}
                    disabled={Boolean(used)}
                    className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left font-bold transition ${
                      used
                        ? 'cursor-default border-line bg-line/50 text-muted opacity-60'
                        : isSelected
                          ? 'cursor-grab border-primary bg-primary/10 text-primary shadow-pop'
                          : 'cursor-grab border-line bg-white text-ink hover:-translate-y-0.5 hover:border-primary/40'
                    } ${dragging === pair.id ? 'opacity-50' : ''}`}
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {pair.icon}
                    </span>
                    <span className="flex-1">{pair.organ}</span>
                    <span aria-hidden="true" className="text-lg">
                      {used ? '✅' : isSelected ? '👉' : '⋮⋮'}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Pilihan alternatif untuk perangkat sentuh */}
            <div className="mt-5 rounded-2xl border border-line bg-white p-4">
              <label
                htmlFor="alt-select"
                className="text-xs font-black uppercase tracking-wider text-muted"
              >
                Alternatif: pilih dari daftar
              </label>
              <select
                id="alt-select"
                value={selected ?? ''}
                onChange={(e) => setSelected(e.target.value || null)}
                disabled={freeOrgans.length === 0}
                className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-3 text-sm font-bold text-ink"
              >
                <option value="">— Ketuk fungsi di kolom kanan —</option>
                {freeOrgans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.organ}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* -------------------- Sisi kanan: fungsi -------------------- */}
          <div>
            <h2 className="mb-3 font-display text-lg font-bold text-ink">⚙️ Fungsi Organ</h2>
            <div className="flex flex-col gap-3">
              {targets.map((target) => {
                const assigned = picks[target.id]
                const matched = assigned === target.id
                const isHover = Boolean(selected || dragging)

                return (
                  <div
                    key={target.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      assign(target.id, dragging)
                      setDragging(null)
                    }}
                    onClick={() => {
                      if (assigned && assigned === target.id) return // sudah benar
                      if (assigned) {
                        // ganti isi lama
                        setPicks((prev) => {
                          const next = { ...prev }
                          delete next[target.id]
                          return next
                        })
                      }
                      assign(target.id, selected ?? dragging)
                      setSelected(null)
                    }}
                    className={`relative rounded-2xl border-2 px-4 py-4 transition ${
                      matched
                        ? 'border-emerald-400 bg-emerald-50'
                        : assigned
                          ? 'cursor-pointer border-rose-300 bg-rose-50'
                          : isHover
                            ? 'cursor-pointer border-dashed border-primary/70 bg-primary/5'
                            : 'cursor-pointer border-dashed border-line bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg" aria-hidden="true">
                        {assigned ? (matched ? '✅' : '❌') : '▢'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">{target.func}</p>
                        {assigned && (
                          <p
                            className={`mt-1.5 text-sm font-extrabold ${
                              matched ? 'text-emerald-700' : 'text-rose-500'
                            }`}
                          >
                            Jawabanmu: {organOf(assigned)?.icon} {organOf(assigned)?.organ}
                            {!matched && (
                              <span className="ml-2 font-bold text-muted">
                                (ketuk untuk ganti)
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ---------------------- Hasil akhir ---------------------- */}
        {isDone && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-3xl border border-line bg-white p-6 text-center shadow-card sm:p-8"
          >
            <span className="text-5xl" aria-hidden="true">
              {correct === PAIRS.length ? '🏆' : '👏'}
            </span>
            <h2 className="mt-3 font-display text-2xl font-extrabold text-ink">
              Permainan selesai!
            </h2>
            <p className="mt-2 text-muted">
              Kamu mencocokkan <b className="text-ink">{correct}</b> dari{' '}
              <b className="text-ink">{PAIRS.length}</b> pasangan dengan benar.
            </p>
            {correct === PAIRS.length && (
              <p className="mt-2 font-bold text-emerald-600">
                Sempurna! Semua pasangan organ dan fungsinya tepat. 🎉
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={restart}
                className="rounded-2xl border-2 border-line px-6 py-3.5 font-extrabold text-ink transition hover:-translate-y-0.5 hover:border-primary/40"
              >
                🔄 Main lagi
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="rounded-2xl bg-primary px-6 py-3.5 font-extrabold text-white shadow-pop transition hover:-translate-y-0.5 hover:bg-primary-dark"
              >
                ✅ Tandai selesai
              </button>
            </div>
          </motion.div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/kuis"
            className="rounded-xl bg-line/70 px-5 py-2.5 text-sm font-bold text-muted transition hover:text-primary"
          >
            ← Kuis
          </Link>
          <Link
            to="/refleksi"
            className="rounded-xl bg-line/70 px-5 py-2.5 text-sm font-bold text-muted transition hover:text-primary"
          >
            Lanjut: E-LKPD →
          </Link>
        </div>
      </section>
    </>
  )
}
