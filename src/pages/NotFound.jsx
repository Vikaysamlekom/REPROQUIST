import { Link } from 'react-router-dom'

/** Halaman 404 — membantu siswa kembali bila URL salah ketik. */
export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <span className="text-7xl" aria-hidden="true">
        🧭
      </span>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-primary">
        Halaman tidak ditemukan
      </p>
      <h1 className="mt-2 font-display text-4xl font-extrabold text-ink">
        Hmm, halaman ini tidak ada
      </h1>
      <p className="mt-3 max-w-md text-muted">
        Jangan khawatir — kamu bisa kembali ke peta misi untuk melanjutkan petualangan belajarmu.
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          to="/dashboard"
          className="rounded-2xl bg-primary px-6 py-3.5 font-extrabold text-white shadow-pop transition hover:-translate-y-1 hover:bg-primary-dark"
        >
          🗺️ Peta Misi
        </Link>
        <Link
          to="/"
          className="rounded-2xl border-2 border-line bg-white px-6 py-3.5 font-extrabold text-ink transition hover:-translate-y-1 hover:border-primary/40"
        >
          🏠 Beranda
        </Link>
      </div>
    </section>
  )
}
