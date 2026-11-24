/** Efek berbasis scroll: reveal, progress bar, tombol kembali ke atas, dan garis timeline. */
import { clamp, rafThrottle } from "./utils.js"

const root = document.documentElement
const backToTop = document.querySelector(".back-to-top")
const progressBar = document.querySelector(".scroll-progress")
const timeline = document.querySelector(".timeline")

function initReveal() {
  const elements = document.querySelectorAll(".reveal")
  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("visible"))
    return
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add("visible")
        observer.unobserve(entry.target)
      })
    },
    { threshold: .1, rootMargin: "0px 0px -40px 0px" },
  )
  elements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 3, 2) * 80}ms`
    observer.observe(element)
  })
}

/** Jeda animasi CSS pada blok halaman yang berada di luar layar. */
function initOffscreenPause() {
  if (!("IntersectionObserver" in window)) return
  const blocks = document.querySelectorAll("main > section, main > .tech-marquee, .site-footer")
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.target.classList.toggle("is-offscreen", !entry.isIntersecting)),
    { rootMargin: "150px 0px" },
  )
  blocks.forEach((block) => observer.observe(block))
}

function updateScroll() {
  const max = root.scrollHeight - window.innerHeight
  const progress = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0
  // Set variabel hanya pada elemen yang memakainya, BUKAN di <html>:
  // mengubah custom property di root memaksa hitung ulang style seluruh halaman.
  const value = progress.toFixed(4)
  progressBar?.style.setProperty("--progress", value)
  backToTop?.style.setProperty("--progress", value)
  backToTop?.classList.toggle("show", window.scrollY > window.innerHeight * .8)

  if (timeline) {
    // Garis timeline terisi mengikuti posisi tengah layar
    const rect = timeline.getBoundingClientRect()
    const value = clamp((window.innerHeight * .6 - rect.top) / rect.height, 0, 1)
    timeline.style.setProperty("--timeline-progress", value.toFixed(4))
    timeline.style.setProperty("--timeline-px", `${(value * rect.height).toFixed(1)}px`)
  }
}

export function initScrollEffects() {
  initReveal()
  initOffscreenPause()
  updateScroll()
  window.addEventListener("scroll", rafThrottle(updateScroll), { passive: true })
  window.addEventListener("resize", rafThrottle(updateScroll))
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }))
}
