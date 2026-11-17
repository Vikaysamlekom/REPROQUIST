/**
 * Konversi model 3D Ovarium (prosedural) menjadi file GLB.
 *
 * Sumber : C:\Users\VICKRY DWI\Downloads\ovarium-3d.html
 *          (model dibangun langsung dengan kode three.js r128)
 * Hasil  : public/models/ovarium.glb
 *
 * Logika geometri, seed acak rng(7), dan penempatan folikel dipindahkan
 * SEKEDAR mungkin agar hasilnya sama persis dengan model asli.
 *
 * Pemakaian: node scripts/export-ovarium-glb.mjs
 */
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

/* ------------------------------------------------------------------ *
 * 1. Polyfill FileReader (dipakai GLTFExporter, tidak ada di Node)    *
 * ------------------------------------------------------------------ */
class NodeFileReader {
  constructor() {
    this.result = null
    this.onloadend = null
    this.onload = null
    this.onerror = null
  }
  // Sengaja asinkron (Promise) — pemanggil menetapkan onloadend SETELAH
  // metode ini dipanggil, seperti perilaku FileReader browser asli.
  readAsArrayBuffer(blob) {
    blob
      .arrayBuffer()
      .then((buf) => {
        this.result = buf
        this.onloadend?.({ target: this })
        this.onload?.({ target: this })
      })
      .catch((err) => this.onerror?.({ target: this, error: err }))
  }
  readAsDataURL(blob) {
    blob
      .arrayBuffer()
      .then((buf) => {
        this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(buf).toString('base64')}`
        this.onloadend?.({ target: this })
        this.onload?.({ target: this })
      })
      .catch((err) => this.onerror?.({ target: this, error: err }))
  }
}
globalThis.FileReader = NodeFileReader

/* ------------------------------------------------------------------ *
 * 2. Data tahap folikel (disalin dari model asli)                      *
 * ------------------------------------------------------------------ */
const TYPES = [
  { id: 'primordial', name: 'Folikel primordial', color: 0xf3e6d8, r: 0.055, n: 14, f: [0.86, 0.95] },
  { id: 'primary', name: 'Folikel primer', color: 0xf0d9c4, r: 0.1, n: 5, f: [0.8, 0.92] },
  { id: 'secondary', name: 'Folikel sekunder', color: 0xe9c9a8, r: 0.17, n: 3, f: [0.75, 0.88] },
  { id: 'antral', name: 'Folikel antral', color: 0xcfe3ea, r: 0.25, n: 2, f: [0.7, 0.85] },
  { id: 'graafian', name: 'Folikel Graaf (matang)', color: 0xbfe0f0, r: 0.38, n: 1, f: [0.9, 0.9] },
  { id: 'luteum', name: 'Korpus luteum', color: 0xe0a335, r: 0.3, n: 1, f: [0.8, 0.8] },
  { id: 'albicans', name: 'Korpus albikans', color: 0xf6f1ea, r: 0.16, n: 1, f: [0.82, 0.82] },
]

// Arah tetap untuk struktur utama (disalin dari model asli)
const FIX = {
  graafian: [[0.72, 0.38, 0.35]],
  luteum: [[-0.7, 0.15, -0.25]],
  albicans: [[-0.25, -0.75, -0.3]],
  antral: [
    [0.1, 0.6, -0.45],
    [0.35, -0.55, -0.4],
  ],
  secondary: [
    [0.45, -0.1, -0.7],
    [-0.35, 0.45, -0.55],
    [-0.1, -0.35, -0.8],
  ],
}

/* ------------------------------------------------------------------ *
 * 3. Generator acak deterministik & bentuk badan ovarium               *
 * ------------------------------------------------------------------ */
function rng(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = rng(7)

const SX = 1.5
const SY = 1.0
const SZ = 0.85

function noise(x, y, z) {
  return (
    Math.sin(x * 5 + 1.3) * Math.sin(y * 6 + 0.7) * Math.sin(z * 4 + 2.1) * 0.035 +
    Math.sin(x * 13) * Math.sin(y * 11 + 1) * Math.sin(z * 12) * 0.012
  )
}

// Titik pada elipsoid; f = kedalaman (1 = permukaan)
function onOvary(d, f) {
  const v = new THREE.Vector3(d[0], d[1], d[2]).normalize()
  const k = 1 + noise(v.x, v.y, v.z)
  return new THREE.Vector3(v.x * SX * k * f, v.y * SY * k * f, v.z * SZ * k * f)
}

/* ------------------------------------------------------------------ *
 * 4. Bangun scene                                                      *
 * ------------------------------------------------------------------ */
const group = new THREE.Group()
group.name = 'model_ovarium'

// --- Badan ovarium (dibagi menjadi permukaan luar & rongga dalam) ---
const geo = new THREE.SphereGeometry(1, 96, 64)
const posAttr = geo.attributes.position
const v = new THREE.Vector3()
for (let i = 0; i < posAttr.count; i++) {
  v.fromBufferAttribute(posAttr, i)
  const k = 1 + noise(v.x, v.y, v.z)
  posAttr.setXYZ(i, v.x * SX * k, v.y * SY * k, v.z * SZ * k)
}
geo.computeVertexNormals()

const outer = new THREE.Mesh(
  geo,
  new THREE.MeshPhysicalMaterial({
    color: 0xe3b2a0,
    roughness: 0.55,
    clearcoat: 0.35,
    clearcoatRoughness: 0.5,
  }),
)
outer.name = 'badan_ovarium'

// --- Badan ovarium (permukaan luar & rongga dalam) ---
// CATATAN FORMAT: glTF tidak memiliki sisi "BackSide" (ekspor otomatis
// menjadi FrontSide). Bila dibiarkan, dinding rongga ikut menutupi permukaan
// luar (warna jadi merah marun) dan menghilang saat "Potongan" aktif.
// Solusinya: material dalam memakai DoubleSide (sisi dalam tetap terlihat
// saat dipotong) dengan skala 0.99 agar posisinya DI BELAKANG cangkang luar —
// sehingga saat normal yang terlihat tetap cangkang luar, tanpa z-fighting.
const inner = new THREE.Mesh(
  geo,
  new THREE.MeshStandardMaterial({ color: 0xb86a62, roughness: 0.9, side: THREE.DoubleSide }),
)
inner.name = 'rongga_ovarium'
inner.scale.setScalar(0.99)

group.add(outer, inner)

// --- Material folikel ---
// Nama material dipakai oleh viewer untuk menyorot seluruh folikel
// pada satu tahap (lihat OrganViewer.jsx).
const MATS = {}
TYPES.forEach((t) => {
  const translucent = t.id === 'antral' || t.id === 'graafian' || t.id === 'secondary'
  const m = new THREE.MeshPhysicalMaterial({
    color: t.color,
    roughness: translucent ? 0.15 : 0.6,
    transparent: translucent,
    opacity: translucent ? 0.55 : 1,
    depthWrite: !translucent,
    side: THREE.DoubleSide,
    emissive: 0x000000,
  })
  m.name = `folikel_${t.id}` // kunci penyimpanan nama asli
  MATS[t.id] = m
})

const oocyteMat = new THREE.MeshStandardMaterial({ color: 0xfff3d6, roughness: 0.5 })
oocyteMat.name = 'oosit'

const thecaMat = new THREE.MeshStandardMaterial({
  color: 0xd98f86,
  roughness: 0.7,
  transparent: true,
  opacity: 0.35,
  depthWrite: false,
  side: THREE.BackSide,
})
thecaMat.name = 'theca'

const luteumCoreMat = new THREE.MeshStandardMaterial({ color: 0xa4522f, roughness: 0.8 })
luteumCoreMat.name = 'inti_korpus_luteum'

function build(t, position) {
  const g = new THREE.Group()
  g.position.copy(position)
  g.name = `folikel_${t.id}` // kunci: viewer mencari node berdasarkan nama ini

  const dirIn = position.clone().normalize().multiplyScalar(-1)
  const r = t.r * (0.9 + rand() * 0.25)

  if (t.id === 'luteum' || t.id === 'albicans') {
    // Badan bergelombang
    const ig = new THREE.IcosahedronGeometry(r, 3)
    const q = ig.attributes.position
    const w = new THREE.Vector3()
    for (let i = 0; i < q.count; i++) {
      w.fromBufferAttribute(q, i).normalize()
      const d =
        1 +
        Math.sin(w.x * 9) *
          Math.sin(w.y * 8 + 1) *
          Math.sin(w.z * 10) *
          0.12 *
          (t.id === 'luteum' ? 1.4 : 0.7)
      q.setXYZ(i, w.x * r * d, w.y * r * d * (t.id === 'albicans' ? 0.8 : 1), w.z * r * d)
    }
    ig.computeVertexNormals()
    g.add(new THREE.Mesh(ig, MATS[t.id]))

    if (t.id === 'luteum') {
      const core = new THREE.Mesh(new THREE.SphereGeometry(r * 0.4, 24, 16), luteumCoreMat)
      g.add(core)
    }
  } else {
    // Cangkang folikel
    const shell = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 28), MATS[t.id])
    g.add(shell)

    // Lapisan theca (untuk folikel yang cukup besar)
    if (t.id === 'secondary' || t.id === 'antral' || t.id === 'graafian') {
      const theca = new THREE.Mesh(new THREE.SphereGeometry(r * 1.06, 32, 20), thecaMat)
      g.add(theca)
    }

    // Oosit (sel telur) di dalam folikel
    const oo = new THREE.Mesh(
      new THREE.SphereGeometry(
        t.id === 'primordial' ? r * 0.55 : r * (t.id === 'graafian' ? 0.2 : 0.32),
        20,
        14,
      ),
      oocyteMat,
    )

    if (t.id === 'antral' || t.id === 'graafian') {
      oo.position.copy(dirIn.clone().multiplyScalar(r * 0.55))
      const mound = new THREE.Mesh(
        new THREE.SphereGeometry(r * 0.3, 20, 14),
        MATS[t.id].clone(),
      )
      mound.material.opacity = 0.9
      mound.material.transparent = false
      mound.material.depthWrite = true
      mound.material.name = `folikel_${t.id}` // ikut disorot saat tahap dipilih
      mound.position.copy(oo.position)
      g.add(mound)
    }

    g.add(oo)
  }

  group.add(g)
}

// Penempatan: urutan, seed, dan jumlah panggilan acak SAMA seperti model asli
TYPES.forEach((t) => {
  const fixed = FIX[t.id] || []
  for (let i = 0; i < t.n; i++) {
    const d = fixed[i] || [rand() * 2 - 1, rand() * 2 - 1, rand() * 1.4 - 0.9]
    const f = t.f[0] + (t.f[1] - t.f[0]) * rand()
    build(t, onOvary(d, f))
  }
})

/* ------------------------------------------------------------------ *
 * 5. Ekspor ke GLB                                                     *
 * ------------------------------------------------------------------ */
const here = dirname(fileURLToPath(import.meta.url))
const outFile = resolve(here, '..', 'public', 'models', 'ovarium.glb')

const exporter = new GLTFExporter()

try {
  const buffer = await exporter.parseAsync(group, { binary: true })

  if (!existsSync(dirname(outFile))) mkdirSync(dirname(outFile), { recursive: true })
  writeFileSync(outFile, Buffer.from(buffer))

  const size = statSync(outFile).size
  let meshCount = 0
  let matCount = 0
  const names = new Set()
  group.traverse((o) => {
    if (o.isMesh) {
      meshCount++
      const mats = Array.isArray(o.material) ? o.material : [o.material]
      mats.forEach((m) => names.add(m.name || '(tanpa nama)'))
      matCount += mats.length
    }
  })

  console.log('✅ Ekspor GLB berhasil')
  console.log(`   File      : ${outFile}`)
  console.log(`   Ukuran    : ${(size / 1024).toFixed(1)} KB`)
  console.log(`   Mesh      : ${meshCount}`)
  console.log(`   Material  : ${matCount}`)
  console.log(`   Nama tahap: ${[...names].filter((n) => n.startsWith('folikel_')).join(', ')}`)
} catch (err) {
  console.error('❌ Ekspor gagal:', err)
  process.exitCode = 1
}
