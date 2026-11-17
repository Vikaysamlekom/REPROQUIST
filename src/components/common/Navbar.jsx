import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const LINKS = [
  { to: '/materi', label: 'Materi' },
  { to: '/organ/perempuan', label: 'Organ Perempuan' },
  { to: '/organ/laki-laki', label: 'Organ Laki-laki' },
  { to: '/kebersihan', label: 'Kebersihan' },
  { to: '/kuis', label: 'Kuis' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Tutup menu mobile setiap pindah halaman
  const closeMenu = () => setOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight text-ink"
        >
          <span
            aria-hidden="true"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-pink text-xl text-white shadow-pop"
          >
            🧬
          </span>
          <span>
            REPRO<span className="text-primary">QUEST</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-xl px-3.5 py-2 text-sm font-bold transition ${
                  isActive || location.pathname.startsWith(link.to)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted hover:bg-line/70 hover:text-ink'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/dashboard"
            className="ml-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-extrabold text-white shadow-pop transition hover:-translate-y-0.5 hover:bg-primary-dark"
          >
            Peta Misi
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-white text-2xl md:hidden"
        >
          {open ? '✕' : '☰'}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-white px-4 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-base font-bold transition ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-ink hover:bg-line/70'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/dashboard"
              onClick={closeMenu}
              className="mt-2 rounded-xl bg-primary px-4 py-3 text-center font-extrabold text-white"
            >
              🗺️ Peta Misi
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
