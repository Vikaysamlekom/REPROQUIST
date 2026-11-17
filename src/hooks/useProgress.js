import { useCallback, useMemo } from 'react'
import useLocalStorage from './useLocalStorage.js'

const PROGRESS_KEY = 'rq_progress'
const QUIZ_KEY = 'rq_quiz_score'
const REFLECTION_KEY = 'rq_reflection'

/**
 * Progres belajar siswa, disimpan di LocalStorage.
 *
 * Bentuk data:
 * rq_progress   -> { [flag: string]: true }
 * rq_quiz_score -> { score, total, date }
 * rq_reflection -> { [questionId: string]: string }
 */
export function useProgress() {
  const [flags, setFlags] = useLocalStorage(PROGRESS_KEY, {})

  const markDone = useCallback((flag) => setFlags((prev) => ({ ...prev, [flag]: true })), [setFlags])

  const isDone = useCallback((flag) => Boolean(flags[flag]), [flags])

  /** Tandai organ sudah dipelajari, dipakai oleh halaman detail organ. */
  const markOrganStudied = useCallback((slug) => markDone(`organ-${slug}`), [markDone])

  /** Hitung jumlah misi yang selesai. */
  const completedCount = useMemo(
    () => Object.values(flags).filter(Boolean).length,
    [flags],
  )

  /** Reset seluruh progres (dipakai tombol di dashboard). */
  const resetProgress = useCallback(() => setFlags({}), [setFlags])

  return { flags, isDone, markDone, markOrganStudied, completedCount, resetProgress }
}

/** Nilai kuis terakhir. */
export function useQuizScore() {
  const [score, setScore] = useLocalStorage(QUIZ_KEY, null)
  return { score, setScore }
}

/** Jawaban refleksi / E-LKPD sementara. */
export function useReflection() {
  const [answers, setAnswers] = useLocalStorage(REFLECTION_KEY, {})
  const setAnswer = useCallback(
    (id, text) => setAnswers((prev) => ({ ...prev, [id]: text })),
    [setAnswers],
  )
  return { answers, setAnswer }
}
