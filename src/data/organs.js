import { OVARIUM_STAGES, OVARIUM_PANEL } from './ovariumStages.js'

/**
 * Data organ reproduksi manusia untuk REPRODUKSI QUEST.
 * Bahasa disederhanakan untuk siswa kelas V SD: ilmiah, sopan, sesuai usia.
 *
 * `modelPath` menunjuk file GLB/GLTF di folder `public/models/`.
 * `modelHtml` menunjuk viewer 3D interaktif (Three.js) di `public/models-3d/`
 * untuk organ yang modelnya dibuat sebagai halaman mandiri, bukan GLB.
 * Saat keduanya `null`, viewer menampilkan status placeholder yang jelas
 * (bukan gambar 2D yang menyamar sebagai model 3D).
 *
 * `stages`  -> daftar tahap yang bisa disorot pada model (legenda interaktif)
 * `cutaway` -> mengaktifkan tombol "Potongan" (melihat bagian dalam model)
 *
 * `illustration` -> gambar ilustrasi 2D (JPG di `public/images/organ/`).
 * Hanya tampil sebagai gambar statis berlabel — TIDAK pernah diklaim
 * sebagai model 3D. Menyertakan `labels` pasangan Inggris→Indonesia
 * untuk istilah yang menempel di dalam gambar.
 */
export const ORGANS = [
  // ---------- Perempuan ----------
  {
    slug: 'ovarium',
    name: 'Ovarium',
    gender: 'perempuan',
    icon: '🥚',
    accent: '#f27ba5',
    summary: 'Menghasilkan sel telur.',
    definition:
      'Ovarium adalah organ reproduksi perempuan yang menghasilkan sel telur.',
    function: 'Menghasilkan sel telur dan membantu menjaga kesehatan tubuh perempuan.',
    location:
      'Terletak di dalam rongga perut perempuan, di kiri dan kanan rahim.',
    howItWorks:
      'Secara berkala, ovarium menghasilkan satu sel telur. Sel telur ini lalu berjalan menuju rahim melalui tuba falopi.',
    fact: 'Perempuan memiliki dua ovarium, satu di sisi kiri dan satu di sisi kanan rahim.',
    modelPath: '/models/ovarium.glb',
    modelNote: 'Model 3D ovarium + siklus folikel',
    stages: OVARIUM_STAGES,
    panel: OVARIUM_PANEL,
    cutaway: true,
  },
  {
    slug: 'tuba-falopi',
    name: 'Tuba Falopi',
    gender: 'perempuan',
    icon: '🔗',
    accent: '#6ccbb5',
    summary: 'Saluran penghubung ovarium dan rahim.',
    definition:
      'Tuba falopi adalah saluran yang menghubungkan ovarium dengan rahim.',
    function: 'Menghubungkan ovarium dengan rahim. Pembuahan dapat terjadi di bagian ini.',
    location: 'Berada di sisi kiri dan kanan rahim, mengarah dari ovarium menuju rahim.',
    howItWorks:
      'Sel telur yang dilepaskan ovarium berjalan melewati tuba falopi. Bila bertemu sperma, pembuahan dapat terjadi di saluran ini, lalu hasilnya menuju rahim.',
    fact: 'Tuba falopi sering disebut juga saluran telur dan selalu berjumlah dua saluran.',
    modelPath: null,
    modelHtml: '/models-3d/tuba-falopi.html',
    modelNote: 'Model 3D interaktif tuba falopi (Three.js, putar/zoom/potongan).',
    illustration: {
      src: '/images/organ/tuba-falopi.jpg',
      alt: 'Ilustrasi potongan rahim yang menunjukkan tuba falopi dan ovarium di kiri-kanan',
      caption:
        'Ilustrasi potongan rahim: di ujung tuba falopi terdapat jumbai (fimbriae) yang menjemput sel telur dari ovarium.',
      labels: [
        { en: 'Uterus', id: 'Rahim' },
        { en: 'Fallopian Tube', id: 'Tuba falopi' },
        { en: 'Fimbriae', id: 'Jumbai (ujung tuba falopi)' },
        { en: 'Ovary', id: 'Ovarium' },
      ],
    },
  },
  {
    slug: 'rahim',
    name: 'Rahim (Uterus)',
    gender: 'perempuan',
    icon: '🤰',
    accent: '#9a87ff',
    summary: 'Tempat janin berkembang selama kehamilan.',
    definition: 'Rahim adalah organ tempat janin berkembang selama kehamilan.',
    function: 'Menjadi tempat tumbuh dan berkembangnya janin selama masa kehamilan.',
    location: 'Terletak di tengah rongga panggul, di antara ovarium dan vagina.',
    howItWorks:
      'Jika terjadi pembuahan, hasilnya akan menempel dan tumbuh di dinding rahim. Rahim membesar mengikuti pertumbuhan janin hingga siap dilahirkan.',
    fact: 'Rahim juga dikenal dengan nama lain, yaitu uterus.',
    modelPath: null,
    modelHtml: '/models-3d/rahim.html',
    modelNote: 'Model 3D interaktif rahim/uterus (Three.js, putar/zoom/potongan).',
    illustration: {
      src: '/images/organ/rahim.jpg',
      alt: 'Ilustrasi rahim dari arah depan beserta tuba falopi dan ovarium di kedua sisi',
      caption:
        'Rahim berbentuk seperti buah pir terbalik. Dinding rahim yang tebal menjadi tempat janin berkembang.',
      labels: [],
    },
  },
  {
    slug: 'vagina',
    name: 'Vagina',
    gender: 'perempuan',
    icon: '🌿',
    accent: '#ffd66b',
    summary: 'Saluran penghubung rahim dengan bagian luar tubuh.',
    definition:
      'Vagina adalah saluran yang menghubungkan rahim dengan bagian luar tubuh.',
    function: 'Menjadi saluran penghubung rahim dengan bagian luar tubuh.',
    location: 'Terletak di bagian bawah rahim, mengarah ke bagian luar tubuh.',
    howItWorks:
      'Vagina menghubungkan rahim dengan bagian luar tubuh. Saluran ini juga berperan dalam proses kelahiran bayi.',
    fact: 'Menggunakan istilah ilmiah dengan tepat dan sopan adalah bagian dari belajar yang baik.',
    modelPath: null,
    modelHtml: '/models-3d/vagina.html',
    modelNote: 'Model 3D interaktif vagina (Three.js, putar/zoom/potongan).',
    illustration: {
      src: '/images/organ/vagina.jpg',
      alt: 'Ilustrasi potongan samping organ reproduksi perempuan yang menunjukkan rahim, serviks, dan vagina',
      caption:
        'Potongan samping tubuh perempuan. Vagina berada di bawah rahim dan menghubungkannya dengan bagian luar tubuh.',
      labels: [
        { en: 'Uterus', id: 'Rahim' },
        { en: 'Cervix', id: 'Serviks (leher rahim)' },
        { en: 'Ovary', id: 'Ovarium' },
        { en: 'Fallopian Tube', id: 'Tuba falopi' },
        { en: 'Urinary Bladder', id: 'Kandung kemih' },
        { en: 'Pubic Bone', id: 'Tulang kemaluan' },
        { en: 'Urethra', id: 'Uretra (saluran kencing)' },
        { en: 'Vagina', id: 'Vagina' },
        { en: 'Rectum', id: 'Rektum (usus besar)' },
        { en: 'Anus', id: 'Anus' },
      ],
    },
  },

  // ---------- Laki-laki ----------
  {
    slug: 'testis',
    name: 'Testis',
    gender: 'laki-laki',
    icon: '🔵',
    accent: '#6ccbb5',
    summary: 'Menghasilkan sel sperma.',
    definition: 'Testis adalah organ reproduksi laki-laki yang menghasilkan sel sperma.',
    function: 'Menghasilkan sel sperma, yaitu sel kelamin laki-laki.',
    location: 'Berada di dalam skrotum, yaitu kantong kulit di bagian luar tubuh.',
    howItWorks:
      'Testis terus memproduksi sel sperma. Sel sperma ini kemudian berjalan melalui saluran di dalam tubuh hingga siap digunakan.',
    fact: 'Laki-laki memiliki dua testis yang letaknya berdampingan di dalam skrotum.',
    modelPath: null,
    modelHtml: '/models-3d/testis.html',
    modelNote: 'Model 3D interaktif testis (Three.js, putar/zoom/potongan).',
    illustration: {
      src: '/images/organ/testis.jpg',
      alt: 'Ilustrasi bagian dalam testis yang menunjukkan epididimis dan saluran mani',
      caption:
        'Di dalam testis terdapat saluran halus tempat sperma dibuat, lalu disimpan di epididimis hingga matang.',
      labels: [
        { en: 'Testis', id: 'Testis' },
        { en: 'Tunica Albuginea', id: 'Tunika albuginea (selaput testis)' },
        { en: 'Seminiferous Tubules', id: 'Tubulus seminiferus (pembuat sperma)' },
        { en: 'Epididymis', id: 'Epididimis (penyimpan sperma)' },
        { en: 'Vas Deferens', id: 'Vas deferens (saluran mani)' },
      ],
    },
  },
  {
    slug: 'skrotum',
    name: 'Skrotum',
    gender: 'laki-laki',
    icon: '🛡️',
    accent: '#9a87ff',
    summary: 'Kantong kulit yang melindungi testis.',
    definition: 'Skrotum adalah kantong kulit yang melindungi testis.',
    function: 'Melindungi testis dan menjaga suhu agar tetap sesuai.',
    location: 'Terletak di bagian luar tubuh, di bawah penis.',
    howItWorks:
      'Skrotum menjaga testis tetap aman. Kantong kulit ini dapat mengecil atau mengendur untuk menjaga suhu testis agar tetap nyaman.',
    fact: 'Skrotum berada di luar tubuh agar suhu testis tetap terjaga dengan baik.',
    modelPath: null,
    modelHtml: '/models-3d/skrotum.html',
    modelNote: 'Model 3D interaktif skrotum (Three.js, putar/zoom/potongan).',
    illustration: {
      src: '/images/organ/skrotum.jpg',
      alt: 'Ilustrasi skrotum yang menggantung di luar tubuh beserta testis dan epididimis di dalamnya',
      caption:
        'Skrotum berada di luar tubuh sehingga testis mendapat suhu yang lebih sejuk dan sesuai.',
      labels: [
        { en: 'Scrotum', id: 'Skrotum (kantong kulit)' },
        { en: 'Testis', id: 'Testis' },
        { en: 'Epididymis', id: 'Epididimis' },
        { en: 'Vas Deferens', id: 'Vas deferens (saluran mani)' },
        { en: 'Spermatic Cord', id: 'Tali spermatik' },
        { en: 'Pubic Bone', id: 'Tulang kemaluan' },
      ],
    },
  },
  {
    slug: 'penis',
    name: 'Penis',
    gender: 'laki-laki',
    icon: '💧',
    accent: '#f27ba5',
    summary: 'Organ luar, saluran keluarnya urine dan semen.',
    definition:
      'Penis adalah organ luar tubuh laki-laki sekaligus saluran keluarnya urine dan semen.',
    function: 'Menjadi saluran keluarnya urine dan semen dari dalam tubuh.',
    location: 'Terletak di bagian luar tubuh laki-laki.',
    howItWorks:
      'Urine keluar dari kandung kemih melalui penis. Sel sperma juga berjalan melalui saluran yang sama saat keluar dari tubuh.',
    fact: 'Urine dan semen keluar melalui saluran yang sama, tetapi pada waktu yang berbeda.',
    modelPath: null,
    modelHtml: '/models-3d/penis.html',
    modelNote: 'Model 3D interaktif penis (Three.js, putar/zoom/potongan).',
    illustration: {
      src: '/images/organ/penis.jpg',
      alt: 'Ilustrasi sistem reproduksi laki-laki dari samping yang menunjukkan penis, uretra, kandung kemih, dan prostat',
      caption:
        'Uretra adalah saluran yang dilalui urine dari kandung kemih dan semen dari saluran mani — keduanya keluar lewat penis.',
      labels: [
        { en: 'Urinary Bladder', id: 'Kandung kemih' },
        { en: 'Prostate Gland', id: 'Kelenjar prostat' },
        { en: 'Urethra', id: 'Uretra (saluran kencing)' },
        { en: 'Erectile Tissue (Corpus Cavernosum)', id: 'Jaringan ereksi (korpus kavernosum)' },
        { en: 'Glans', id: 'Glans penis' },
        { en: 'Vas Deferens', id: 'Vas deferens (saluran mani)' },
        { en: 'Epididymis', id: 'Epididimis' },
        { en: 'Testis', id: 'Testis' },
        { en: 'Scrotum', id: 'Skrotum' },
        { en: 'Pubic Bone', id: 'Tulang kemaluan' },
        { en: 'Rectum', id: 'Rektum (usus besar)' },
      ],
    },
  },
]

/** Ambil data organ berdasarkan slug, atau `undefined` bila tidak ditemukan. */
export function getOrganBySlug(slug) {
  return ORGANS.find((organ) => organ.slug === slug)
}

/** Daftar slug yang valid, berguna untuk validasi route. */
export const ORGAN_SLUGS = ORGANS.map((organ) => organ.slug)

export const FEMALE_ORGANS = ORGANS.filter((o) => o.gender === 'perempuan')
export const MALE_ORGANS = ORGANS.filter((o) => o.gender === 'laki-laki')

/** URL detail organ (untuk daftar hyperlink PowerPoint). */
export const organUrl = (slug) => `/organ/${slug}`
