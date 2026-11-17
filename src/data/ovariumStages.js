/**
 * Tahap perkembangan folikel pada ovarium.
 *
 * Sumber materi & deskripsi: file model 3D "ovarium-3d.html"
 * ("Ovarium dan siklus folikel").
 *
 * `id` harus sama dengan:
 *   - nama material `folikel_<id>` di dalam file GLB, dan
 *   - nama node `folikel_<id>` (untuk posisi label pada model).
 *
 * Dipakai oleh OrganViewer.jsx untuk:
 *   - legenda tahap yang bisa diklik,
 *   - label yang menempel pada model,
 *   - penyorotan (emissive berdenyut) pada tahap terpilih.
 */
export const OVARIUM_STAGES = [
  {
    id: 'primordial',
    name: 'Folikel primordial',
    color: '#f3e6d8',
    desc: 'Cadangan awal. Oosit kecil yang dikelilingi selapis sel gepeng, tersebar tepat di bawah permukaan (korteks).',
  },
  {
    id: 'primary',
    name: 'Folikel primer',
    color: '#f0d9c4',
    desc: 'Oosit membesar dan sel di sekelilingnya berubah menjadi kuboid. Zona pelusida mulai terbentuk.',
  },
  {
    id: 'secondary',
    name: 'Folikel sekunder',
    color: '#e9c9a8',
    desc: 'Sel granulosa berlapis-lapis dan sel teka mulai terbentuk. Folikel bergerak lebih dalam ke korteks.',
  },
  {
    id: 'antral',
    name: 'Folikel antral',
    color: '#cfe3ea',
    desc: 'Muncul rongga berisi cairan (antrum). Satu folikel akan terpilih menjadi dominan.',
  },
  {
    id: 'graafian',
    name: 'Folikel Graaf (matang)',
    color: '#bfe0f0',
    desc: 'Folikel dominan dengan antrum besar yang menonjol di permukaan. Pecah saat ovulasi dan melepas oosit.',
  },
  {
    id: 'luteum',
    name: 'Korpus luteum',
    color: '#e0a335',
    desc: 'Sisa folikel setelah ovulasi. Menghasilkan progesteron untuk menyiapkan rahim.',
  },
  {
    id: 'albicans',
    name: 'Korpus albikans',
    color: '#f6f1ea',
    desc: 'Jaringan parut putih yang tersisa saat korpus luteum tidak lagi aktif.',
  },
]

/** Judul & petunjuk panel tahap (disalin dari model asli). */
export const OVARIUM_PANEL = {
  title: 'Ovarium dan siklus folikel',
  hint: 'Pilih tahap di bawah untuk menyorotnya pada model. Aktifkan "Potongan" untuk melihat bagian dalam.',
}
