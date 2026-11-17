import { useCallback, useEffect, useState } from 'react'

/**
 * State kecil yang tersimpan di LocalStorage.
 * Aman dipakai di server tanpa localStorage (mode render awal).
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const raw = window.localStorage.getItem(key)
      return raw !== null ? JSON.parse(raw) : initialValue
    } catch {
      // Data rusak atau storage diblokir — kembali ke nilai awal
      return initialValue
    }
  })

  // Sinkronkan bila tab lain mengubah key yang sama
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== key) return
      try {
        setValue(event.newValue !== null ? JSON.parse(event.newValue) : initialValue)
      } catch {
        /* abaikan nilai tidak valid */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
    // initialValue sengaja tidak dijadikan dependensi agar listener stabil
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          /* storage penuh/diblokir: nilai tetap hidup di memori */
        }
        return resolved
      })
    },
    [key],
  )

  return [value, set]
}
