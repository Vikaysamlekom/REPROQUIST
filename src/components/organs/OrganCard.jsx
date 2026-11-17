import { Link } from 'react-router-dom'
import Reveal from '../common/Reveal.jsx'
import { organUrl } from '../../data/organs.js'
import { useProgress } from '../../hooks/useProgress.js'

/**
 * Kartu organ: nama, thumbnail ilustrasi, ringkasan fungsi,
 * tombol "Pelajari", dan indikator sudah/belum dipelajari.
 */
export default function OrganCard({ organ, index = 0 }) {
  const { isDone } = useProgress()
  const studied = isDone(`organ-${organ.slug}`)

  return (
    <Reveal delay={index * 0.05}>
      <Link
        to={organUrl(organ.slug)}
        className="group flex h-full flex-col rounded-3xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-pop"
      >
        <div className="flex items-start gap-4">
          {/* Thumbnail ilustrasi (gambar asli bila tersedia, ikon jika tidak) */}
          {organ.illustration ? (
            <img
              src={organ.illustration.src}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="h-16 w-16 shrink-0 rounded-2xl border border-line object-cover transition group-hover:scale-105"
            />
          ) : (
            <span
              className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-3xl transition group-hover:scale-105"
              style={{ background: `${organ.accent}1f` }}
              aria-hidden="true"
            >
              {organ.icon}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-lg font-bold leading-tight text-ink">
                {organ.name}
              </h3>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold"
                style={{
                  background: studied ? '#dcfce7' : '#eef0fb',
                  color: studied ? '#15803d' : '#66738e',
                }}
              >
                {studied ? '✅ Dipelajari' : 'Belum'}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{organ.summary}</p>
          </div>
        </div>

        <span
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold text-white transition group-hover:-translate-y-0.5"
          style={{ background: organ.accent }}
        >
          Pelajari <span aria-hidden="true">→</span>
        </span>
      </Link>
    </Reveal>
  )
}
