import { Link } from 'react-router-dom'
import PageHero from '../components/common/PageHero.jsx'
import OrganCard from '../components/organs/OrganCard.jsx'
import { ORGANS, FEMALE_ORGANS, MALE_ORGANS } from '../data/organs.js'

/**
 * "Jelajahi Organ" — pusat eksplorasi seluruh organ.
 * Setiap kartu mengarah ke URL detail unik, bisa dibuka langsung dari
 * hyperlink PowerPoint.
 */
export default function OrganExplorer() {
  const renderGroup = (title, organs, accent) => (
    <div className="mt-10 first:mt-0">
      <div className="mb-4 flex items-center gap-3">
        <span
          className="h-4 w-4 rounded-full"
          style={{ background: accent }}
          aria-hidden="true"
        />
        <h2 className="font-display text-2xl font-extrabold text-ink">{title}</h2>
        <span className="rounded-full bg-line px-3 py-1 text-xs font-bold text-muted">
          {organs.length} organ
        </span>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {organs.map((organ, i) => (
          <OrganCard key={organ.slug} organ={organ} index={i} />
        ))}
      </div>
    </div>
  )

  return (
    <>
      <PageHero
        icon="🧬"
        kicker="Pusat eksplorasi"
        title="Jelajahi Organ"
        description={`Semua organ reproduksi dalam satu tempat — ${ORGANS.length} organ dengan penjelasan dan model 3D.`}
        accent="#6654d9"
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        {renderGroup('Organ Reproduksi Perempuan', FEMALE_ORGANS, '#f27ba5')}
        {renderGroup('Organ Reproduksi Laki-laki', MALE_ORGANS, '#6ccbb5')}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/kuis"
            className="rounded-2xl bg-primary px-6 py-3.5 font-extrabold text-white shadow-pop transition hover:-translate-y-0.5 hover:bg-primary-dark"
          >
            🏆 Coba kuis sekarang
          </Link>
          <Link
            to="/dashboard"
            className="rounded-2xl border-2 border-line bg-white px-6 py-3.5 font-extrabold text-ink transition hover:-translate-y-0.5 hover:border-primary/40"
          >
            ← Peta Misi
          </Link>
        </div>
      </section>
    </>
  )
}
