/** Utilitas kecil yang dipakai bersama oleh modul lain. */

export const root = document.documentElement

export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

export const isFinePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches

export const isEnglish = () => root.lang === "en"

/** Pilih teks sesuai bahasa aktif. */
export const t = (id, en) => (isEnglish() ? en : id)

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

/** Membaca nilai CSS custom property, misalnya cssVar("--purple"). */
export const cssVar = (name, element = root) => getComputedStyle(element).getPropertyValue(name).trim()

/** Menjalankan callback paling banyak sekali per frame. */
export function rafThrottle(callback) {
  let queued = false
  return (...args) => {
    if (queued) return
    queued = true
    requestAnimationFrame(() => {
      queued = false
      callback(...args)
    })
  }
}
