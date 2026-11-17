/**
 * Enam misi pembelajaran REPRODUKSI QUEST.
 * Setiap misi punya rute tujuan dan kunci progres di LocalStorage.
 */
export const MISSIONS = [
  {
    id: 'misi-1',
    number: 1,
    title: 'Mengenal Sistem Reproduksi',
    description:
      'Pelajari pengertian, fungsi umum, dan perbedaan organ reproduksi laki-laki dan perempuan.',
    icon: '🧭',
    color: '#6654d9',
    to: '/materi',
    cta: 'Buka materi',
    doneWhen: ['materi-selesai'],
  },
  {
    id: 'misi-2',
    number: 2,
    title: 'Menjelajahi Organ Reproduksi Perempuan',
    description:
      'Kenali ovarium, tuba falopi, rahim, dan vagina beserta fungsinya.',
    icon: '🌸',
    color: '#f27ba5',
    to: '/organ/perempuan',
    cta: 'Jelajahi organ',
    doneWhen: ['organ-ovarium', 'organ-tuba-falopi', 'organ-rahim', 'organ-vagina'],
  },
  {
    id: 'misi-3',
    number: 3,
    title: 'Menjelajahi Organ Reproduksi Laki-laki',
    description: 'Kenali testis, skrotum, dan penis beserta fungsinya.',
    icon: '🚀',
    color: '#6ccbb5',
    to: '/organ/laki-laki',
    cta: 'Jelajahi organ',
    doneWhen: ['organ-testis', 'organ-skrotum', 'organ-penis'],
  },
  {
    id: 'misi-4',
    number: 4,
    title: 'Menjaga Kesehatan dan Kebersihan',
    description:
      'Pelajari kebiasaan sehat setiap hari dan kepada siapa kita meminta bantuan.',
    icon: '🧼',
    color: '#ffd66b',
    to: '/kebersihan',
    cta: 'Pelajari kebiasaan',
    doneWhen: ['kebersihan-selesai'],
  },
  {
    id: 'misi-5',
    number: 5,
    title: 'Tantangan Kuis',
    description: 'Uji pemahamanmu dengan kuis pilihan ganda dan permainan mencocokkan.',
    icon: '🏆',
    color: '#9a87ff',
    to: '/kuis',
    cta: 'Mulai kuis',
    doneWhen: ['kuis-selesai'],
  },
  {
    id: 'misi-6',
    number: 6,
    title: 'Refleksi dan E-LKPD',
    description: 'Tulis pembelajaranmu hari ini dan lihat rangkuman materi.',
    icon: '📝',
    color: '#4f9dd8',
    to: '/refleksi',
    cta: 'Isi refleksi',
    doneWhen: ['refleksi-selesai'],
  },
]
