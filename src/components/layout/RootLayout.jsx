import { useEffect } from 'react'
import { Outlet, useLocation, useMatches } from 'react-router-dom'
import Navbar from '../common/Navbar.jsx'
import Footer from '../common/Footer.jsx'

/** Judul halaman otomatis berdasarkan route aktif (untuk tab browser & SEO). */
function usePageTitle() {
  const matches = useMatches()
  const location = useLocation()

  useEffect(() => {
    const leaf = [...matches].reverse().find((m) => m.handle?.title)
    const raw = leaf?.handle?.title
    // handle.title boleh berupa string atau fungsi (menerima params route)
    const title = typeof raw === 'function' ? raw(leaf.params) : raw
    document.title = title
      ? `${title} | REPRODUKSI QUEST`
      : 'REPRODUKSI QUEST — Mengenal Organ Reproduksi Manusia'
    // Scroll ke atas setiap pindah halaman
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [matches, location.pathname])
}

export default function RootLayout() {
  usePageTitle()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
