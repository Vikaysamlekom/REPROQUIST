import { Link } from 'react-router-dom'
import PageHero from '../components/common/PageHero.jsx'
import OrganCard from '../components/organs/OrganCard.jsx'
import Reveal from '../components/common/Reveal.jsx'
import { MALE_ORGANS } from '../data/organs.js'

const REMINDERS = [
  'Setiap organ memiliki fungsi yang berbeda dan sama-sama penting.',
  'Gunakan istilah ilmiah secara tepat dan sopan saat belajar.',
  'Jaga kebersihan tubuh dan pakaian dalam setiap hari.',
]

export default function MaleOrgans() {
  return (
    <>
      <PageHero
        icon="🚀"
        kicker="Misi 3"
        title="Organ Reproduksi Laki-laki"
        description="Klik salah satu organ untuk membuka halaman detailnya, lengkap dengan model 3D dan penjelasan sederhana."
        accent="#6ccbb5"
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MALE_ORGANS.map((organ, i) => (
            <OrganCard key={organ.slug} organ={organ} index={i} />
          ))}
        </div>

        <Reveal className="mt-8">
          <div className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h2 className="font-display text-xl font-bold text-ink">💡 Ingat!</h2>
                <ul className="mt-3 space-y-3">
                  {REMINDERS.map((text) => (
                    <li key={text} className="flex items-start gap-3 text-sm text-muted">
                      <span aria-hidden="true" className="text-mint">
                        ●
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-sun/50 bg-sun/15 p-5">
                <p className="font-display font-bold text-ink">🌱 Catatan untuk kamu</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">
                  Materi ini bertujuan menambah pengetahuan dan membantu kita menjaga diri.
                  Belajar mengenal tubuh adalah hal yang wajar, ilmiah, dan sopan.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/kebersihan"
            className="rounded-2xl bg-mint px-6 py-3.5 font-extrabold text-white transition hover:-translate-y-0.5"
          >
            Lanjut: Kebersihan Diri →
          </Link>
          <Link
            to="/organ/perempuan"
            className="rounded-2xl border-2 border-line bg-white px-6 py-3.5 font-extrabold text-ink transition hover:-translate-y-0.5 hover:border-pink"
          >
            ← Organ Perempuan
          </Link>
        </div>
      </section>
    </>
  )
}
