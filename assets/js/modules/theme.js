/** Tema terang/gelap. Mengirim event "themechange" agar scene 3D ikut berganti warna. */
import { root, t } from "./utils.js"

const STORAGE_KEY = "portfolio-theme"
const button = document.querySelector(".theme-toggle")
const themeMeta = document.querySelector('meta[name="theme-color"]')

export function applyTheme(theme) {
  root.dataset.theme = theme
  button?.setAttribute("aria-label", theme === "dark" ? t("Aktifkan mode terang", "Enable light mode") : t("Aktifkan mode gelap", "Enable dark mode"))
  themeMeta?.setAttribute("content", theme === "dark" ? "#0f100e" : "#f4f2ec")
  document.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }))
}

export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  applyTheme(root.dataset.theme || saved || preferred)

  button?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark"
    // View Transitions API: animasi lingkaran saat berganti tema (bila didukung)
    if (document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.startViewTransition(() => applyTheme(next))
    } else {
      applyTheme(next)
    }
    localStorage.setItem(STORAGE_KEY, next)
  })

  document.addEventListener("languagechange", () => applyTheme(root.dataset.theme))
}
