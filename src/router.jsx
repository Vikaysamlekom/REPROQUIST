import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './components/layout/RootLayout.jsx'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Intro from './pages/Intro.jsx'
import FemaleOrgans from './pages/FemaleOrgans.jsx'
import MaleOrgans from './pages/MaleOrgans.jsx'
import OrganDetail from './pages/OrganDetail.jsx'
import OrganExplorer from './pages/OrganExplorer.jsx'
import Health from './pages/Health.jsx'
import Quiz from './pages/Quiz.jsx'
import Matching from './pages/Matching.jsx'
import Reflection from './pages/Reflection.jsx'
import NotFound from './pages/NotFound.jsx'
import { getOrganBySlug } from './data/organs.js'

/**
 * Judul halaman detail organ dibuat dinamis dari parameternya,
 * sehingga tab browser menampilkan nama organ (dan 404 bila slug salah).
 */
function organTitle(params) {
  const organ = getOrganBySlug(params.slug)
  return organ ? organ.name : 'Halaman Tidak Ditemukan'
}

/**
 * Peta route REPRODUKSI QUEST.
 * Setiap halaman punya URL unik agar bisa ditautkan langsung
 * dari hyperlink PowerPoint interaktif.
 */
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home />, handle: { title: 'Beranda' } },
      { path: '/dashboard', element: <Dashboard />, handle: { title: 'Peta Misi' } },
      { path: '/materi', element: <Intro />, handle: { title: 'Materi Pengantar' } },
      { path: '/organ/perempuan', element: <FemaleOrgans />, handle: { title: 'Organ Reproduksi Perempuan' } },
      { path: '/organ/laki-laki', element: <MaleOrgans />, handle: { title: 'Organ Reproduksi Laki-laki' } },
      { path: '/organ/:slug', element: <OrganDetail />, handle: { title: organTitle } },
      { path: '/organ-explorer', element: <OrganExplorer />, handle: { title: 'Jelajahi Organ' } },
      { path: '/kebersihan', element: <Health />, handle: { title: 'Menjaga Kesehatan & Kebersihan' } },
      { path: '/kuis', element: <Quiz />, handle: { title: 'Tantangan Kuis' } },
      { path: '/tantangan', element: <Matching />, handle: { title: 'Mencocokkan Organ' } },
      { path: '/refleksi', element: <Reflection />, handle: { title: 'Refleksi & E-LKPD' } },
      { path: '*', element: <NotFound />, handle: { title: 'Halaman Tidak Ditemukan' } },
    ],
  },
])

export default router
