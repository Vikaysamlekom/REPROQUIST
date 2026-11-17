import { Link } from 'react-router-dom'
import PageHero from '../components/common/PageHero.jsx'
import OrganCard from '../components/organs/OrganCard.jsx'
import Reveal from '../components/common/Reveal.jsx'
import { FEMALE_ORGANS } from '../data/organs.js'

export default function FemaleOrgans() {
  return (
    <>
      <PageHero
        icon="🌸"
        kicker="Misi 2"
        title="Organ Reproduksi Perempuan"
        description="Klik salah satu organ untuk membuka halaman detailnya, lengkap dengan model 3D dan penjelasan sederhana."
        accent="#f27ba5"
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEMALE_ORGANS.map((organ, i) => (
            <OrganCard key={organ.slug} organ={organ} index={i} />
          ))}
        </div>

        {/* Skema posisi organ */}
        <Reveal className="mt-8">
          <div className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-display text-xl font-bold text-ink">📍 Posisi organ</h2>
            <p className="mt-1 text-sm text-muted">
              Skema sederhana untuk mengenali letak organ. Ini ilustrasi, bukan gambar anatomi
              rinci.
            </p>
            <div className="mt-5 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
              <svg
                viewBox="0 0 360 300"
                role="img"
                aria-label="Skema sederhana organ reproduksi perempuan"
                className="mx-auto w-full max-w-sm"
              >
                <path
                  d="M115 80 C145 35 215 35 245 80 M115 80 C80 65 65 95 92 112 M245 80 C280 65 295 95 268 112"
                  fill="none"
                  stroke="#f27ba5"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                <ellipse cx="82" cy="116" rx="23" ry="15" fill="#ffd66b" />
                <ellipse cx="278" cy="116" rx="23" ry="15" fill="#ffd66b" />
                <path
                  d="M145 85 Q180 70 215 85 L205 170 Q180 210 155 170Z"
                  fill="#f6a4bf"
                  stroke="#d95c91"
                  strokeWidth="4"
                />
                <path
                  d="M169 180 L169 245 M191 180 L191 245"
                  stroke="#d95c91"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <g fill="#24304a" fontSize="13" fontWeight="700">
                  <text x="180" y="25" textAnchor="middle">
                    Tuba falopi
                  </text>
                  <text x="40" y="152">
                    Ovarium
                  </text>
                  <text x="320" y="152" textAnchor="end">
                    Ovarium
                  </text>
                  <text x="180" y="135" textAnchor="middle">
                    Rahim
                  </text>
                  <text x="180" y="272" textAnchor="middle">
                    Vagina
                  </text>
                </g>
              </svg>

              <ul className="space-y-3">
                {FEMALE_ORGANS.map((organ) => (
                  <li key={organ.slug} className="flex items-start gap-3">
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg"
                      style={{ background: `${organ.accent}1f` }}
                      aria-hidden="true"
                    >
                      {organ.icon}
                    </span>
                    <div>
                      <p className="font-bold text-ink">{organ.name}</p>
                      <p className="text-sm text-muted">{organ.summary}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/organ/laki-laki"
            className="rounded-2xl border-2 border-line bg-white px-6 py-3.5 font-extrabold text-ink transition hover:-translate-y-0.5 hover:border-mint"
          >
            Lanjut: Organ Laki-laki →
          </Link>
          <Link
            to="/dashboard"
            className="rounded-2xl px-4 py-3.5 font-bold text-muted transition hover:text-primary"
          >
            ← Peta Misi
          </Link>
        </div>
      </section>
    </>
  )
}
