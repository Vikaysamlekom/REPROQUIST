import { Link } from 'react-router-dom'
import PageHero from '../components/common/PageHero.jsx'
import Reveal from '../components/common/Reveal.jsx'
import { useProgress } from '../hooks/useProgress.js'

const CONCEPTS = [
  {
    icon: '🧬',
    title: 'Apa itu sistem reproduksi?',
    body: 'Sistem reproduksi adalah bagian tubuh yang membantu makhluk hidup menghasilkan keturunan. Pada manusia, organ ini bekerja sejak kita masih bayi hingga dewasa.',
  },
  {
    icon: '⚙️',
    title: 'Fungsi umumnya',
    body: 'Organ reproduksi menghasilkan sel kelamin, menyatukannya, dan — pada perempuan — menjadi tempat tumbuhnya janin selama kehamilan.',
  },
  {
    icon: '⚖️',
    title: 'Perbedaan laki-laki & perempuan',
    body: 'Laki-laki memiliki testis dan skrotum. Perempuan memiliki ovarium, tuba falopi, rahim, dan vagina. Keduanya sama-sama penting untuk kehidupan.',
  },
  {
    icon: '🛡️',
    title: 'Mengapa harus dijaga?',
    body: 'Mengenal dan menjaga kesehatan organ tubuh membuat kita tumbuh sehat, percaya diri, dan tahu apa yang harus dilakukan bila merasa tidak nyaman.',
  },
]

const COMPARE = [
  { female: 'Ovarium — menghasilkan sel telur', male: 'Testis — menghasilkan sel sperma' },
  { female: 'Tuba falopi — penghubung ovarium & rahim', male: 'Skrotum — melindungi testis' },
  { female: 'Rahim — tempat janin berkembang', male: 'Penis — saluran keluar urine & semen' },
  { female: 'Vagina — penghubung rahim & luar tubuh', male: '—' },
]

export default function Intro() {
  const { isDone, markDone } = useProgress()
  const finished = isDone('materi-selesai')

  const handleFinish = () => {
    markDone('materi-selesai')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <PageHero
        icon="📘"
        kicker="Misi 1"
        title="Mengenal Sistem Reproduksi"
        description="Pelajari pengertian, fungsi umum, perbedaan organ laki-laki dan perempuan, serta pentingnya menjaga kesehatan tubuh."
        accent="#6654d9"
      />

      {/* Kartu konsep */}
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {CONCEPTS.map((concept, i) => (
            <Reveal key={concept.title} delay={i * 0.06}>
              <article className="h-full rounded-3xl border border-line bg-white p-6 shadow-card">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-3xl">
                  {concept.icon}
                </span>
                <h2 className="mt-4 font-display text-xl font-bold text-ink">{concept.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{concept.body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Perbandingan sederhana */}
        <Reveal className="mt-8">
          <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
            <div className="grid grid-cols-2">
              <div className="bg-pink/10 px-5 py-4 text-center font-display text-lg font-extrabold text-pink sm:px-6 sm:text-xl">
                🌸 Perempuan
              </div>
              <div className="bg-mint/15 px-5 py-4 text-center font-display text-lg font-extrabold text-emerald-700 sm:px-6 sm:text-xl">
                🚀 Laki-laki
              </div>
            </div>
            <div className="divide-y divide-line">
              {COMPARE.map((row, i) => (
                <div key={i} className="grid grid-cols-2">
                  <p className="px-5 py-4 text-sm text-ink sm:px-6 sm:text-base">{row.female}</p>
                  <p className="border-l border-line px-5 py-4 text-sm text-ink sm:px-6 sm:text-base">
                    {row.male}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Catatan penting */}
        <Reveal className="mt-6">
          <div className="rounded-3xl border border-sun/50 bg-sun/15 p-6">
            <p className="font-display text-lg font-bold text-ink">
              💡 Mengapa kita belajar ini?
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">
              Mengenal organ tubuh adalah bagian dari menjaga diri. Dengan memahami namanya dan
              fungsinya, kita bisa merawat tubuh dengan benar dan tidak mudah percaya informasi
              yang keliru. Gunakan selalu istilah ilmiah dengan tepat dan sopan.
            </p>
          </div>
        </Reveal>

        {/* Aksi lanjut */}
        <div className="mt-8 flex flex-wrap gap-3">
          {!finished && (
            <button
              type="button"
              onClick={handleFinish}
              className="rounded-2xl bg-primary px-7 py-4 font-extrabold text-white shadow-pop transition hover:-translate-y-1 hover:bg-primary-dark"
            >
              ✅ Tandai misi ini selesai
            </button>
          )}
          <Link
            to="/organ/perempuan"
            className="rounded-2xl border-2 border-line bg-white px-7 py-4 font-extrabold text-ink transition hover:-translate-y-1 hover:border-primary/40"
          >
            Lanjut: Organ Perempuan →
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
