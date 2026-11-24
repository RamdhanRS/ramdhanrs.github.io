/**
 * Penghitung kunjungan memakai counterapi.dev v2.
 *
 * Nama workspace & counter diatur di _config.yml (counter_workspace, counter_name)
 * lalu diteruskan lewat atribut data-workspace / data-counter di footer.
 *
 *   GET https://api.counterapi.dev/v2/{workspace}/{counter}      → baca nilai
 *   GET https://api.counterapi.dev/v2/{workspace}/{counter}/up   → tambah 1
 *   Respons: { "code": "200", "data": { "up_count": 123, ... } }
 */
import { isEnglish, prefersReducedMotion, t } from "./utils.js"

const API_BASE = "https://api.counterapi.dev/v2"
const SESSION_KEY = "portfolio-visit-counted"

const container = document.querySelector(".visitor-counter")
const output = document.getElementById("visitor-count")
let lastCount = null

const format = (value) => new Intl.NumberFormat(isEnglish() ? "en-US" : "id-ID").format(value)

function animateTo(target) {
  if (prefersReducedMotion()) {
    output.textContent = format(target)
    return
  }
  const start = performance.now()
  const duration = 1400
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    output.textContent = format(Math.round(target * eased))
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

/** Ambil angka dari respons v2 (dengan cadangan bila format berubah). */
function readCount(json) {
  const data = json?.data ?? json
  const value = data?.up_count ?? data?.value ?? data?.count
  if (!Number.isFinite(value)) throw new Error("Format respons counter tidak dikenal")
  return value
}

export async function initVisitorCounter() {
  const year = document.getElementById("year")
  if (year) year.textContent = new Date().getFullYear()
  if (!container || !output) return

  const workspace = container.dataset.workspace?.trim()
  const counter = container.dataset.counter?.trim() || "pageviews"
  if (!workspace) {
    // Workspace belum diatur → sembunyikan counter daripada menampilkan "—"
    container.hidden = true
    return
  }

  const isLocalPreview = ["", "localhost", "127.0.0.1"].includes(window.location.hostname)
  const shouldIncrement = !isLocalPreview && sessionStorage.getItem(SESSION_KEY) !== "true"
  const url = `${API_BASE}/${encodeURIComponent(workspace)}/${encodeURIComponent(counter)}${shouldIncrement ? "/up" : ""}`

  document.addEventListener("languagechange", () => {
    if (lastCount !== null) output.textContent = format(lastCount)
  })

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Visitor counter unavailable (${response.status})`)
    lastCount = readCount(await response.json())
    if (shouldIncrement) sessionStorage.setItem(SESSION_KEY, "true")

    // Animasi angka dimulai saat footer terlihat
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      animateTo(lastCount)
      observer.disconnect()
    })
    observer.observe(output)
  } catch (error) {
    console.warn(error)
    output.textContent = "—"
    container.setAttribute("title", t("Jumlah kunjungan sementara tidak tersedia", "Visitor count is temporarily unavailable"))
  }
}
