import { Component, lazy, Suspense } from 'react'

const OrganViewer = lazy(() => import('./OrganViewer.jsx'))

/** Cek dukungan WebGL — tampilkan fallback bila perangkat tidak mendukung. */
function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    )
  } catch {
    return false
  }
}

/** Fallback bila WebGL tidak tersedia: penjelasan jelas, bukan tampilan kosong. */
function NoWebGL() {
  return (
    <div className="grid h-full min-h-[320px] place-items-center rounded-3xl border-2 border-dashed border-line bg-paper p-6 text-center">
      <div>
        <span className="text-5xl" aria-hidden="true">
          🖼️
        </span>
        <p className="mt-3 font-display text-lg font-bold text-ink">
          Perangkat ini belum mendukung tampilan 3D
        </p>
        <p className="mt-1 text-sm text-muted">
          Kamu tetap bisa membaca penjelasan lengkap organ di sebelah layar.
        </p>
      </div>
    </div>
  )
}

/** Error boundary agar kegagalan memuat model 3D tidak merusak halaman. */
class ViewerErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="grid h-full min-h-[320px] place-items-center rounded-3xl border-2 border-dashed border-line bg-paper p-6 text-center">
          <div>
            <span className="text-5xl" aria-hidden="true">
              ⚙️
            </span>
            <p className="mt-3 font-display text-lg font-bold text-ink">
              Model 3D gagal dimuat
            </p>
            <p className="mt-1 text-sm text-muted">
              Muat ulang halaman untuk mencoba lagi. Penjelasan organ tetap bisa dibaca.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white"
            >
              Muat ulang
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

/**
 * Pembungkus viewer 3D:
 * - lazy loading (model hanya dimuat saat halaman detail dibuka)
 * - fallback WebGL
 * - skeleton saat memuat
 */
export default function OrganViewerWrapper(props) {
  if (typeof window !== 'undefined' && !supportsWebGL()) {
    return <NoWebGL />
  }

  return (
    <ViewerErrorBoundary>
      <Suspense
        fallback={
          <div className="grid h-full min-h-[320px] place-items-center rounded-3xl border border-line bg-paper">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary/25 border-t-primary" />
              <p className="mt-3 text-sm font-bold text-muted">Memuat viewer 3D…</p>
            </div>
          </div>
        }
      >
        <OrganViewer {...props} />
      </Suspense>
    </ViewerErrorBoundary>
  )
}
