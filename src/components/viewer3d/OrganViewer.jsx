import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, ContactShadows, Center } from '@react-three/drei'
import { useReducedMotion } from 'framer-motion'
import * as THREE from 'three'

/**
 * Viewer 3D organ reproduksi.
 *
 * Mode A — model GLB/GLTF tersedia (`modelPath`):
 *   - model asli yang bisa diputar 360° dan zoom
 *   - label yang mengikuti titik 3D pada model
 *   - opsional: `stages`  -> label + daftar tahap yang bisa disorot
 *   - opsional: `cutaway` -> tombol "Potongan" (potongan melintang/bagian dalam)
 *
 * Mode B — model belum ada (`modelPath = null`):
 *   - placeholder wireframe yang JELAS berstatus "Model 3D belum tersedia"
 *   (bukan gambar 2D yang menyamar sebagai model 3D)
 *
 * Semua label adalah HTML biasa pada tree React utama (bukan portal) sehingga
 * selalu ikut ter-render dan mudah diakses pembaca layar.
 */

const STAGE_PREFIX = 'folikel_' // nama material/node di dalam file GLB ovarium

/* ------------------------------------------------------------------ *
 * Projector: memindahkan titik 3D menjadi posisi piksel layar         *
 * ------------------------------------------------------------------ */
function Projector({ target, slot, position, visible = true }) {
  const { camera, size } = useThree()
  const vector = useMemo(() => new THREE.Vector3(...position), [position])
  const projected = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const root = target.current
    if (!root) return
    const el = slot ? root[slot] : root
    if (!el) return

    projected.copy(vector).project(camera)
    const x = (projected.x * 0.5 + 0.5) * size.width
    const y = (-projected.y * 0.5 + 0.5) * size.height
    const behind = projected.z > 1 // berada di belakang kamera

    el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
    el.style.opacity = !visible || behind ? '0' : '1'
  })

  return null
}

/* ------------------------------------------------------------------ *
 * Jembatan zoom: tombol +/- di DOM membutuhkan akses kamera di dalam  *
 * Canvas. Komponen ini mendaftarkan fungsi zoom ke ref milik pemanggil.*
 * ------------------------------------------------------------------ */
function ZoomBridge({ apiRef }) {
  const { camera, controls } = useThree()

  useEffect(() => {
    if (!controls) return undefined
    apiRef.current = (factor) => {
      const offset = camera.position.clone().sub(controls.target)
      const min = Number.isFinite(controls.minDistance) ? controls.minDistance : 0.5
      const max = Number.isFinite(controls.maxDistance) ? controls.maxDistance : 100
      const next = THREE.MathUtils.clamp(offset.length() * factor, min, max)
      camera.position.copy(controls.target).add(offset.setLength(next))
      controls.update()
    }
    return () => {
      apiRef.current = null
    }
  }, [camera, controls, apiRef])

  return null
}

/* ------------------------------------------------------------------ *
 * Analisis scene GLB: kumpulkan material & posisi label per tahap     *
 * ------------------------------------------------------------------ */
function analyzeStages(root, stages) {
  const materials = new Map() // id tahap -> Material[] (tanpa duplikat)
  const seenNodes = new Set()
  const positions = {} // id tahap -> [x, y, z] posisi world label
  const tmp = new THREE.Vector3()

  root.traverse((obj) => {
    const name = obj.name || ''
    if (name.startsWith(STAGE_PREFIX) && !seenNodes.has(name)) {
      seenNodes.add(name)
      obj.getWorldPosition(tmp)
      positions[name.slice(STAGE_PREFIX.length)] = [tmp.x, tmp.y, tmp.z]
    }
    if (!obj.isMesh) return
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
    for (const m of mats) {
      const matName = (m && m.name) || ''
      if (!matName.startsWith(STAGE_PREFIX)) continue
      const id = matName.slice(STAGE_PREFIX.length)
      if (!materials.has(id)) materials.set(id, [])
      const list = materials.get(id)
      if (!list.includes(m)) list.push(m)
    }
  })

  return { materials, positions }
}

/* ------------------------------------------------------------------ *
 * Model GLB/GLTF sungguhan                                            *
 * ------------------------------------------------------------------ */
function GltfModel({
  path,
  accent,
  stages,
  selectedStage,
  labelsOn,
  cutaway,
  cutOn,
  labelsRef,
  reduced,
  onReady,
}) {
  const { scene } = useGLTF(path)
  // Clone agar setiap viewer punya scene sendiri
  const cloned = useMemo(() => scene.clone(true), [scene])
  const hasStages = Boolean(stages && stages.length)

  const [info, setInfo] = useState(null)

  // Posisi label dihitung SETELAH <Center> menerapkan penggeserannya
  // (efek layout anak berjalan lebih dulu), bukan saat render.
  useLayoutEffect(() => {
    setInfo(hasStages ? analyzeStages(cloned, stages) : null)
    onReady?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloned, hasStages])

  // ---- Fitur "Potongan": bidang kliping memotong separuh model --------
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 100), [])

  useLayoutEffect(() => {
    if (!cutaway) return
    // 100 = tidak memotong apa pun; 0 = memotong bagian menghadap kamera
    plane.constant = cutOn ? 0 : 100
    const touched = new Set()
    cloned.traverse((obj) => {
      if (!obj.isMesh) return
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      for (const m of mats) {
        if (touched.has(m)) continue
        touched.add(m)
        m.clippingPlanes = cutOn ? [plane] : null
        m.needsUpdate = true // paksa kompilasi ulang shader
      }
    })
  }, [cutOn, cutaway, cloned, plane])

  // ---- Penyorotan tahap terpilih (emissive berdenyut) ----------------
  useFrame(({ clock }) => {
    if (!info || !hasStages) return
    const time = clock.elapsedTime
    const intensity = reduced ? 0.75 : 0.45 + 0.3 * Math.sin(time * 5)

    for (const s of stages) {
      const mats = info.materials.get(s.id)
      if (!mats) continue
      const active = selectedStage === s.id
      for (const m of mats) {
        if (!m.emissive) continue
        if (active) {
          m.emissive.set(s.color)
          m.emissiveIntensity = intensity
        } else if (m.emissive.getHex() !== 0 || m.emissiveIntensity !== 0) {
          m.emissive.setHex(0x000000)
          m.emissiveIntensity = 0
        }
      }
    }
  })

  return (
    <Center>
      <primitive object={cloned} />

      {/* Penanda bagian organ yang sedang dibahas — hanya bila tidak ada tahap */}
      {!hasStages && (
        <>
          <mesh position={[0.7, 0.7, 0.7]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.7} />
          </mesh>
          <mesh position={[0.7, 0.7, 0.7]}>
            <ringGeometry args={[0.13, 0.17, 32]} />
            <meshBasicMaterial color={accent} transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}

      {/* Label tiap tahap folikel (HTML di luar canvas) */}
      {info &&
        hasStages &&
        stages.map((s) => {
          const pos = info.positions[s.id]
          if (!pos) return null
          return (
            <Projector
              key={s.id}
              target={labelsRef}
              slot={s.id}
              position={pos}
              visible={labelsOn}
            />
          )
        })}
    </Center>
  )
}

/* ------------------------------------------------------------------ *
 * Placeholder: BUKAN model 3D organ. Hanya penanda status,           *
 * dengan slot siap pakai untuk file GLB/GLTF sungguhan.              *
 * ------------------------------------------------------------------ */
function PlaceholderModel({ accent }) {
  const spin = useRef()
  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.y += delta * 0.25
  })

  return (
    <Center>
      <group ref={spin} rotation={[0.3, 0.5, 0]}>
        <mesh>
          <icosahedronGeometry args={[1.1, 1]} />
          <meshStandardMaterial color={accent} wireframe flatShading transparent opacity={0.6} />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[1.1, 1]} />
          <meshStandardMaterial color={accent} transparent opacity={0.07} />
        </mesh>
      </group>
    </Center>
  )
}

/* ------------------------------------------------------------------ *
 * Sub-scene di dalam Canvas                                           *
 * ------------------------------------------------------------------ */
function Scene(props) {
  if (props.modelPath) return <GltfModel {...props} path={props.modelPath} />
  return <PlaceholderModel accent={props.accent} />
}

/* ------------------------------------------------------------------ *
 * Tombol kontrol di atas canvas                                       *
 * ------------------------------------------------------------------ */
function ToolButton({ active, onClick, label, children, accent }) {
  const cls =
    'rounded-full border px-3 py-1.5 text-[11px] font-extrabold shadow-sm backdrop-blur transition'
  const style = active
    ? { background: accent, borderColor: accent, color: '#ffffff' }
    : { background: 'rgba(255,255,255,0.92)', borderColor: 'rgba(15,23,42,0.12)', color: '#1d2430' }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={typeof active === 'boolean' ? active : undefined}
      className={active ? cls : `${cls} hover:brightness-95`}
      style={style}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ *
 * Viewer utama: rotasi 360°, zoom, pencahayaan, label HTML overlay    *
 * ------------------------------------------------------------------ */
export default function OrganViewer({
  modelPath = null,
  modelNote = 'Slot model GLB/GLTF siap diisi.',
  accent = '#6654d9',
  organName = 'Organ',
  stages = null,
  cutaway = false,
  selectedStage = null,
}) {
  const labelRef = useRef(null)
  const labelsRef = useRef({})
  const zoomRef = useRef(null)
  const reduced = Boolean(useReducedMotion())

  const [cutOn, setCutOn] = useState(false)
  const [labelsOn, setLabelsOn] = useState(true)
  const [autoRotate, setAutoRotate] = useState(true)
  const [readyPath, setReadyPath] = useState(null)

  const handleReady = useCallback(() => setReadyPath(modelPath), [modelPath])

  const hasStages = Boolean(stages && stages.length)
  const modelReady = Boolean(modelPath) && readyPath === modelPath
  const rotating = autoRotate && !reduced

  return (
    <div className="relative h-full w-full">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.4, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        className="h-full w-full touch-none"
        aria-label={`Model 3D ${organName}, dapat diputar 360 derajat dan di-zoom`}
        onCreated={({ gl }) => {
          // Dibutuhkan fitur "Potongan" (clipping plane per material)
          gl.localClippingEnabled = true
        }}
      >
        {/* Pencahayaan lembut agar material nyaman dilihat */}
        <ambientLight intensity={0.85} />
        <directionalLight position={[4, 6, 5]} intensity={1.15} />
        <directionalLight position={[-5, 2, -4]} intensity={0.45} color="#ffd66b" />
        <pointLight position={[0, -3, 2]} intensity={0.35} color="#f27ba5" />

        {/* Suspense hanya untuk model GLB (lazy) — placeholder langsung tampil */}
        <Suspense fallback={null}>
          <Scene
            modelPath={modelPath}
            accent={accent}
            stages={stages}
            selectedStage={selectedStage}
            labelsOn={labelsOn}
            cutaway={cutaway}
            cutOn={cutOn}
            labelsRef={labelsRef}
            reduced={reduced}
            onReady={handleReady}
          />
        </Suspense>

        <ContactShadows position={[0, -1.45, 0]} opacity={0.3} scale={9} blur={2.6} far={3.5} />

        {/* Kontrol rotasi 360° + zoom in/out (+ putar otomatis opsional) */}
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={2.2}
          maxDistance={9}
          minPolarAngle={0.25}
          maxPolarAngle={Math.PI - 0.25}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.8}
          zoomSpeed={0.8}
          autoRotate={rotating}
          autoRotateSpeed={0.9}
        />

        <ZoomBridge apiRef={zoomRef} />

        {!hasStages && (
          <Projector
            target={labelRef}
            position={modelPath ? [0.7, 1.0, 0.7] : [0, 1.5, 0]}
            visible={labelsOn}
          />
        )}
      </Canvas>

      {/* ------------------- Label / status HTML ------------------- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {!hasStages && (
          <div className="absolute left-0 top-0 opacity-0 will-change-transform" ref={labelRef}>
            {modelPath ? (
              <span
                className="whitespace-nowrap rounded-full bg-white/95 px-3 py-1.5 text-xs font-extrabold text-ink shadow-lg ring-1 ring-black/5"
                style={{ color: accent }}
              >
                ⌖ bagian yang dibahas
              </span>
            ) : (
              <span className="block rounded-xl bg-white/95 px-3 py-1.5 text-xs font-extrabold shadow-lg ring-1 ring-black/5">
                {organName}
              </span>
            )}
          </div>
        )}

        {hasStages &&
          stages.map((s) => (
            <div
              key={s.id}
              ref={(el) => {
                labelsRef.current[s.id] = el
              }}
              className="absolute left-0 top-0 opacity-0 will-change-transform"
            >
              <span
                className="block whitespace-nowrap rounded-lg bg-white/95 py-1 pl-2 pr-2.5 text-[11px] font-extrabold text-ink shadow-lg ring-1 ring-black/5"
                style={{ borderLeft: `4px solid ${s.color}` }}
              >
                {s.name}
              </span>
            </div>
          ))}
      </div>

      {/* ------------------- Kontrol di atas canvas ------------------- */}
      {modelPath && (
        <div className="absolute inset-x-3 bottom-3 z-10 flex flex-wrap items-center gap-2">
          {cutaway && (
            <ToolButton
              active={cutOn}
              accent={accent}
              label="Tampilkan atau sembunyikan potongan model"
              onClick={() => setCutOn((v) => !v)}
            >
              ✂️ Potongan
            </ToolButton>
          )}

          <ToolButton
            active={labelsOn}
            accent={accent}
            label="Tampilkan atau sembunyikan label"
            onClick={() => setLabelsOn((v) => !v)}
          >
            🏷️ Label
          </ToolButton>

          <ToolButton
            active={rotating}
            accent={accent}
            label="Putar otomatis model"
            onClick={() => setAutoRotate((v) => !v)}
          >
            🔄 Putar otomatis
          </ToolButton>

          <span className="ml-auto flex gap-2">
            <ToolButton
              accent={accent}
              label="Perkecil tampilan (zoom out)"
              onClick={() => zoomRef.current?.(1.25)}
            >
              −
            </ToolButton>
            <ToolButton
              accent={accent}
              label="Perbesar tampilan (zoom in)"
              onClick={() => zoomRef.current?.(0.8)}
            >
              ＋
            </ToolButton>
          </span>
        </div>
      )}

      {/* Status pemuatan model GLB */}
      {modelPath && !modelReady && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="rounded-full bg-white/95 px-4 py-2 text-xs font-extrabold text-muted shadow-md ring-1 ring-black/5">
            Memuat model 3D…
          </span>
        </div>
      )}

      {/* Status placeholder — jelas, bukan gambar 2D yang menyamar sebagai 3D */}
      {!modelPath && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
          <div
            className="mx-auto max-w-sm rounded-2xl border-2 border-dashed bg-white/95 px-4 py-3 text-center shadow-md"
            style={{ borderColor: accent }}
            role="status"
          >
            <p
              className="text-[11px] font-black uppercase tracking-wider"
              style={{ color: accent }}
            >
              Model 3D belum tersedia
            </p>
            <p className="mt-1 text-[11px] leading-snug text-muted">{modelNote}</p>
          </div>
        </div>
      )}
    </div>
  )
}

/** Preload model bila file GLB sudah tersedia (hemat waktu saat halaman dibuka). */
export function preloadModel(path) {
  if (path) useGLTF.preload(path)
}
