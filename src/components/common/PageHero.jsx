/**
 * Header baku untuk halaman materi: kicker, judul, deskripsi.
 * Menjaga hierarki teks konsisten di seluruh website.
 */
export default function PageHero({ kicker, title, description, icon, accent = '#6654d9' }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-white">
      {/* Lapisan dekoratif lembut di belakang teks */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl"
        style={{ background: accent }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{ background: '#f27ba5' }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {icon && (
          <span
            aria-hidden="true"
            className="mb-4 inline-grid h-16 w-16 place-items-center rounded-3xl text-3xl shadow-card"
            style={{ background: `${accent}1f` }}
          >
            {icon}
          </span>
        )}
        {kicker && (
          <p
            className="text-xs font-black uppercase tracking-[0.16em]"
            style={{ color: accent }}
          >
            {kicker}
          </p>
        )}
        <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-3xl text-base text-muted sm:text-lg">{description}</p>
        )}
      </div>
    </section>
  )
}
