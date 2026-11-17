# Folder Model 3D

Letakkan file model **GLB/GLTF** di sini, lalu hubungkan ke data organ.

## Cara memasang

1. Salin file model, misalnya `ovarium.glb`, ke folder ini.
2. Buka `src/data/organs.js`.
3. Ubah properti `modelPath` organ terkait:

```js
{
  slug: 'ovarium',
  // ...
  modelPath: '/models/ovarium.glb',   // sebelumnya null
  modelNote: 'Model 3D ovarium',
}
```

4. Simpan, lalu buka `/organ/ovarium`. Model akan dimuat otomatis (lazy loading).

## Status saat ini

| File | Organ | Status |
|---|---|---|
| `ovarium.glb` | Ovarium | ✅ Tersedia (2,19 MB, 64 mesh, 7 tahap folikel) |
| — | 6 organ lainnya | **Placeholder** dengan status jelas ("Model 3D belum tersedia") — bukan gambar 2D yang menyamar sebagai model 3D |

### Tentang `ovarium.glb`

Model prosedural yang dibangkitkan ulang dari berkas sumber
`ovarium-3d.html` (milik pengguna) melalui skrip:

```bash
node scripts/export-ovarium-glb.mjs
```

Skrip ini meniru geometri & warna sumber persis (badan ellipsoid berdeformasi +
7 jenis folikel dengan `rng(7)`), sekaligus memberi nama material/node
`folikel_<tahap>` sehingga viewer bisa menyorot tahap dan menampilkan label.

Fitur interaktif yang terhubung dari `src/data/organs.js`:

- `stages: OVARIUM_STAGES` — legenda 7 tahap + label menempel + sorotan emissive
- `cutaway: true` — tombol "Potongan" (clipping plane memotong separuh model)

> Catatan format: glTF tidak memiliki sisi `BackSide`, sehingga dinding rongga
> dalam diekspor sebagai `DoubleSide` dengan skala 0.99 (lihat komentar di
> skrip ekspor).

## Ketentuan

- Format: `.glb` (disarankan) atau `.gltf`
- Ukuran ideal: < 2 MB per model (kompresi di gltf.report atau Blender)
- **Pastikan model memiliki izin penggunaan / lisensi bebas.**
  Jangan mengambil aset berhak cipta tanpa izin.
