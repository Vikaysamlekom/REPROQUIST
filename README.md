# 🧬 REPRODUKSI QUEST

**Mengenal Organ Reproduksi Manusia** — website edukasi interaktif untuk mendukung pembelajaran
**IPAS Kelas V SD**. Website ini dirancang untuk dihubungkan dari tombol/objek pada
**PowerPoint interaktif**, sehingga setiap halaman memiliki URL unik yang bisa dibuka langsung.

> Konsep: *educational adventure* — jelajahi misi, lihat model anatomi 3D, baca penjelasan
> sederhana, lalu kerjakan kuis dan E-LKPD.

---

## 1. Cara instalasi dependency

Prasyarat: **Node.js 20+** dan **npm 10+**.

```bash
npm install
```

## 2. Cara menjalankan website secara lokal

```bash
npm run dev
```

Buka alat yang muncul di terminal (biasanya `http://localhost:5173`).

## 3. Cara build website

```bash
npm run build
npm run preview   # pratinjau hasil build secara lokal
```

Hasil build tersimpan di folder `dist/`.

## 4. Cara deploy ke Vercel

1. Unggah proyek ke repository GitHub.
2. Buka **Vercel → Add New Project → Import** repository tersebut.
3. Framework preset: **Vite** · Build command: `npm run build` · Output directory: `dist`.
4. Klik **Deploy**.

> ⚠️ **Penting:** file `vercel.json` sudah disertakan untuk me-rewrite semua rute ke
> `index.html`. Ini memastikan halaman seperti `/organ/ovarium` **tidak menghasilkan 404**
> setelah deployment — syarat wajib untuk hyperlink PowerPoint.

---

## 5. Daftar URL untuk hyperlink PowerPoint

Ganti `https://ALAMAT-WEBSITE-KAMU.vercel.app` dengan domain Vercel milikmu,
lalu salin URL ke hyperlink PowerPoint.

### Halaman utama

| Halaman | URL |
|---|---|
| Beranda | `/` |
| Peta Misi (Dashboard) | `/dashboard` |
| Materi Pengantar (Misi 1) | `/materi` |
| Organ Reproduksi Perempuan (Misi 2) | `/organ/perempuan` |
| Organ Reproduksi Laki-laki (Misi 3) | `/organ/laki-laki` |
| Jelajahi Semua Organ | `/organ-explorer` |
| Menjaga Kesehatan & Kebersihan (Misi 4) | `/kebersihan` |
| Tantangan Kuis (Misi 5) | `/kuis` |
| Mencocokkan Organ | `/tantangan` |
| Refleksi & E-LKPD (Misi 6) | `/refleksi` |

### Detail organ (URL unik per organ)

| Organ | URL |
|---|---|
| Ovarium | `/organ/ovarium` |
| Tuba falopi | `/organ/tuba-falopi` |
| Rahim | `/organ/rahim` |
| Vagina | `/organ/vagina` |
| Testis | `/organ/testis` |
| Skrotum | `/organ/skrotum` |
| Penis | `/organ/penis` |

### Contoh penggunaan di PowerPoint

```
https://ALAMAT-WEBSITE-KAMU.vercel.app/organ/ovarium
https://ALAMAT-WEBSITE-KAMU.vercel.app/kuis
https://ALAMAT-WEBSITE-KAMU.vercel.app/materi
```

Semua URL di atas **bisa dibuka langsung** melalui browser, tidak perlu melewati halaman beranda
terlebih dahulu.

---

## 6. Cara menambahkan atau mengganti model 3D GLB/GLTF

### Langkah

1. Letakkan file model di folder:

   ```
   public/models/
   ```

   Format yang didukung: **`.glb`** (disarankan) atau **`.gltf`**.

2. Buka `src/data/organs.js` lalu isi properti `modelPath` pada organ terkait:

   ```js
   {
     slug: 'ovarium',
     name: 'Ovarium',
     // ...
     modelPath: '/models/ovarium.glb',   // sebelumnya null
     modelNote: 'Model 3D ovarium + siklus folikel',
     stages: OVARIUM_STAGES,             // opsional: legenda tahap interaktif
     cutaway: true,                      // opsional: tombol "Potongan"
   }
   ```

3. Selesai. Viewer akan otomatis memuat model tersebut (lazy loading, hanya saat halaman
   detail organ dibuka).

### Fitur interaktif per model (opsional)

| Field | Fungsi |
|---|---|
| `stages` | Daftar tahap (mis. 7 tahap folikel) → legenda klik-untuk-sorot di bawah model, label menempel pada titik 3D, dan penjelasan singkat |
| `cutaway: true` | Tombol **✂️ Potongan** — clipping plane memotong separuh model untuk melihat bagian dalam |

Tambahan di viewer: tombol **Label** (tampilkan/sembunyikan), **Putar otomatis**
(menghormati pengaturan *reduced motion*), dan **zoom +/−**.

Model ovarium dibangkitkan dari berkas sumber pengguna dengan skrip
`node scripts/export-ovarium-glb.mjs` (idempoten — ulangi bila kode generasi berubah).

### Catatan teknis

- Model ditampilkan dengan **React Three Fiber + Three.js + Drei**.
- Kontrol tersedia: **putar 360°** (mouse/sentuh), **zoom in/out**, putaran terkunci sumbu agar
  model tetap nyaman dilihat.
- Pastikan ukuran file `.glb` ringan (disarankan < 2 MB). Kompresi bisa dilakukan di
  [gltf.report](https://gltf.report/) atau Blender.
- Pencahayaan, material, bayangan kontak, dan penanda bagian organ sudah disiapkan.

### Sumber model 3D

> ⚠️ **Pastikan model yang kamu gunakan memiliki izin penggunaan** (lisensi bebas atau izin
> tertulis). Jangan mengambil aset berhak cipta tanpa izin.

Sumber yang umumnya aman digunakan:

- [Poly Haven](https://polyhaven.com/) — CC0
- [Sketchfab](https://sketchfab.com/) — filter lisensi CC
- Buat sendiri di **Blender** (gratis) lalu ekspor ke glTF

---

## 7. Aset yang masih berupa placeholder

**Sudah ada 1 model GLB:** `/organ/ovarium` menampilkan model 3D asli
(`public/models/ovarium.glb`, 2,19 MB) lengkap dengan legenda 7 tahap folikel,
label menempel, sorotan tahap, dan tombol **Potongan** (potongan melintang).

**6 organ lainnya** (`tuba-falopi`, `rahim`, `vagina`, `testis`, `skrotum`, `penis`)
masih `modelPath: null` dan menampilkan placeholder:

- Viewer 3D tetap berfungsi (bisa diputar dan zoom) dengan geometri placeholder berbentuk
  wireframe.
- Label jelas tertulis: **"Model 3D belum tersedia"** — **bukan** gambar 2D yang menyamar
  sebagai model 3D.
- Slot siap diisi pada `src/data/organs.js`.

### Lokasi placeholder lain

| Aset | Status |
|---|---|
| Model 3D organ | **Ovarium ✅** · 6 organ lainnya **placeholder** — slot siap diisi di `public/models/` |
| Logo/favicon | Placeholder SVG bawaan (`public/favicon.svg`) — bisa diganti |
| Ilustrasi halaman | Emoji & SVG inline (orisinal, bukan gambar eksternal) |
| Gambar pendukung | Belum ada — folder `src/assets/` disiapkan untuk gambar |

---

## 📁 Struktur proyek

```
Reproduksi_Quest_Website/
├── public/
│   ├── favicon.svg
│   └── models/
│       ├── README.md          panduan memasang model
│       └── ovarium.glb        model 3D ovarium (7 tahap folikel)
├── scripts/
│   ├── smoke-test.mjs         uji render + screenshot via Chrome DevTools Protocol
│   ├── interaction-test.mjs   uji interaksi end-to-end (kuis, game, penyimpanan)
│   ├── network-test.mjs       uji lazy loading three.js + anti-404 seluruh route
│   ├── model-3d-test.mjs      uji model GLB + fitur (legenda, potongan, label, zoom)
│   └── export-ovarium-glb.mjs membangkitkan ovarium.glb dari berkas sumber
├── src/
│   ├── components/
│   │   ├── common/            Navbar, Footer, PageHero, Reveal
│   │   ├── layout/            RootLayout (wrapper rute + judul halaman)
│   │   ├── organs/            OrganCard
│   │   └── viewer3d/          OrganViewer (R3F) + wrapper fallback WebGL
│   ├── data/                  organs, ovariumStages, missions, quiz, health
│   ├── hooks/                 useLocalStorage, useProgress
│   ├── pages/                 11 halaman + NotFound
│   ├── index.css              Tailwind v4 + tema desain
│   ├── main.jsx               entry point
│   └── router.jsx             seluruh route unik
├── index.html                 meta SEO + Open Graph
├── vercel.json                rewrite SPA (anti-404)
├── vite.config.js
└── package.json
```

---

## 🧪 Pengujian otomatis

Empat skrip memverifikasi bahwa website **benar-benar berfungsi**, bukan sekadar tampil.
Semuanya menjalankan Chrome headless via Chrome DevTools Protocol.

Jalankan dulu server preview di terminal pertama:

```bash
npm run build && npm run preview
```

Lalu di terminal kedua (jalankan satu per satu — jangan paralel):

```bash
# 1. Uji render + ambil screenshot halaman
node scripts/smoke-test.mjs http://localhost:4173/organ/ovarium

# 2. Uji interaksi end-to-end (16 pemeriksaan)
node scripts/interaction-test.mjs

# 3. Uji pemisahan aset & anti-404 (6 pemeriksaan)
node scripts/network-test.mjs

# 4. Uji model 3D + fitur interaktif (17 pemeriksaan)
node scripts/model-3d-test.mjs http://localhost:4173 ovarium
```

Yang diverifikasi oleh `interaction-test.mjs`:

- Kuis: menjawab 12 soal → skor tersimpan di LocalStorage, tombol ulang berfungsi
- Mencocokkan: 5 pasangan terisi → skor tampil, progres tersimpan
- Detail organ: judul = nama organ, viewer 3D termuat, status placeholder, tombol kembali
- Slug organ tidak valid → halaman 404 dengan judul yang benar
- Refleksi: jawaban tersimpan dan **bertahan setelah muat ulang**
- Seluruh tautan internal menunjuk route yang valid
- Tidak ada error console/runtime

Yang diverifikasi oleh `network-test.mjs`:

- **Beranda tidak mengunduh three.js** (1 MB) — hanya diunduh saat membuka halaman organ
- Chunk `OrganViewer` dimuat secara lazy melalui `import()` dinamis
- Seluruh 18 route mengembalikan 200 (tidak ada 404 setelah deploy)

Yang diverifikasi oleh `model-3d-test.mjs` (organ bertopeng GLB, default `ovarium`):

- Model GLB benar-benar diunduh dan dipakai (bukan placeholder), footer menampilkan path aset
- Kontrol 3D lengkap: **Potongan, Label, Putar otomatis, zoom −/+**
- 7 label tahap menempel pada model — bisa dimatikan lewat tombol Label
- Legenda 7 tahap: klik → sorotan aktif + penjelasan tahap muncul
- Organ tanpa model **tetap** menampilkan placeholder yang jelas
- Tidak ada error console/runtime

> Ganti path Chrome bila berbeda dengan `CHROME_PATH="..."`.
> Atur ukuran layar uji mobile dengan `RQ_WIDTH=390 RQ_HEIGHT=844`.
> Port CDP tiap skrip berbeda (9333/9344/9355/9366) — tetap jalankan satu per satu.

---

## ✅ Daftar route lengkap

```
/                      Beranda
/dashboard             Peta Misi
/materi                Materi Pengantar
/organ/perempuan       Organ Reproduksi Perempuan
/organ/laki-laki       Organ Reproduksi Laki-laki
/organ/ovarium         Detail Ovarium
/organ/tuba-falopi     Detail Tuba Falopi
/organ/rahim           Detail Rahim
/organ/vagina          Detail Vagina
/organ/testis          Detail Testis
/organ/skrotum         Detail Skrotum
/organ/penis           Detail Penis
/organ-explorer        Jelajahi Semua Organ
/kebersihan            Menjaga Kesehatan & Kebersihan
/kuis                  Tantangan Kuis
/tantangan             Mencocokkan Organ
/refleksi              Refleksi & E-LKPD
*                      Halaman 404
```

---

## 💾 Penyimpanan progres (LocalStorage)

Tidak ada backend — semua progres disimpan di perangkat siswa:

| Key | Isi |
|---|---|
| `rq_progress` | Penanda misi & organ yang sudah dipelajari |
| `rq_quiz_score` | Nilai kuis terakhir |
| `rq_reflection` | Jawaban refleksi / E-LKPD |
| `rq_health_checklist` | Centang checklist kebersihan |

Untuk mengembangkan ke tahap berikutnya (dengan database), ganti implementasi di
`src/hooks/` — seluruh pemanggilan halaman sudah terpusat di sana.

---

## 🎯 Teknologi

- **React 19 + Vite 8** — frontend & build
- **Tailwind CSS 4** — styling responsif
- **React Router 7** — navigasi & URL unik per halaman
- **React Three Fiber + Three.js + Drei** — visualisasi 3D
- **Framer Motion** — animasi masuk, parallax, transisi halaman
- **LocalStorage** — progres belajar tanpa backend
