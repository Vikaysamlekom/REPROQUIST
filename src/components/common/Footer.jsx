import { Link } from 'react-router-dom'

const QUICK_LINKS = [
  { to: '/materi', label: 'Materi' },
  { to: '/organ-explorer', label: 'Jelajahi Organ' },
  { to: '/kebersihan', label: 'Kebersihan' },
  { to: '/kuis', label: 'Kuis' },
  { to: '/tantangan', label: 'Mencocokkan' },
  { to: '/refleksi', label: 'E-LKPD' },
]

export default function Footer() {
  return (
    <footer className="bg-navy text-[#dfe2ff]">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <div>
            <p className="font-display text-xl font-extrabold text-white">
              REPRODUKSI <span className="text-pink">QUEST</span>
            </p>
            <p className="mt-1 text-sm text-[#b9c0ec]">
              Media pembelajaran IPAS Kelas V SD — Mengenal Organ Reproduksi Manusia
            </p>
          </div>

          <nav aria-label="Tautan cepat footer" className="flex flex-wrap justify-center gap-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold transition hover:bg-white/20"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="text-xs text-[#9aa3dd]">
            Disusun untuk pembelajaran yang ilmiah, sopan, dan sesuai usia. ©{' '}
            {new Date().getFullYear()} REPRODUKSI QUEST
          </p>
        </div>
      </div>
    </footer>
  )
}
