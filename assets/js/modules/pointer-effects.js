/**
 * Efek pointer (hanya perangkat dengan mouse):
 * - tilt 3D + kilau pada kartu
 * - parallax panggung hero (console & chip)
 * - tombol magnetik
 * - cahaya yang mengikuti kursor
 */
import { root, clamp, isFinePointer, prefersReducedMotion } from "./utils.js"

const TILT_SELECTOR = ".stack-card, .case-card, .workflow-card, .timeline-card, .about-bento > *"
const MAX_TILT = 6 // derajat

function initTilt() {
  document.querySelectorAll(TILT_SELECTOR).forEach((card) => {
    card.classList.add("tilt")
    const glare = document.createElement("span")
    glare.className = "tilt-glare"
    glare.setAttribute("aria-hidden", "true")
    card.prepend(glare)

    let frame = 0
    card.addEventListener("pointermove", (event) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width
        const y = (event.clientY - rect.top) / rect.height
        // Kartu besar dimiringkan lebih sedikit agar tetap nyaman dibaca
        const strength = rect.width > 700 ? .35 : 1
        card.style.setProperty("--ry", `${((x - .5) * 2 * MAX_TILT * strength).toFixed(2)}deg`)
        card.style.setProperty("--rx", `${((.5 - y) * 2 * MAX_TILT * strength).toFixed(2)}deg`)
        card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`)
        card.style.setProperty("--my", `${(y * 100).toFixed(1)}%`)
        card.classList.add("is-tilting")
      })
    })
    card.addEventListener("pointerleave", () => {
      cancelAnimationFrame(frame)
      card.classList.remove("is-tilting")
      card.style.setProperty("--rx", "0deg")
      card.style.setProperty("--ry", "0deg")
    })
  })
}

function initHeroParallax() {
  const hero = document.querySelector(".hero")
  const stage = document.querySelector("[data-parallax]")
  if (!hero || !stage) return
  hero.addEventListener("pointermove", (event) => {
    const rect = stage.getBoundingClientRect()
    const x = clamp((event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2), -1, 1)
    const y = clamp((event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2), -1, 1)
    stage.style.setProperty("--px", x.toFixed(3))
    stage.style.setProperty("--py", y.toFixed(3))
  })
  hero.addEventListener("pointerleave", () => {
    stage.style.setProperty("--px", "0")
    stage.style.setProperty("--py", "0")
  })
}

function initMagnetic() {
  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect()
      const x = event.clientX - (rect.left + rect.width / 2)
      const y = event.clientY - (rect.top + rect.height / 2)
      element.style.setProperty("--tx", `${(x * .25).toFixed(1)}px`)
      element.style.setProperty("--ty", `${(y * .35).toFixed(1)}px`)
    })
    element.addEventListener("pointerleave", () => {
      element.style.setProperty("--tx", "0px")
      element.style.setProperty("--ty", "0px")
    })
  })
}

function initSpotlight() {
  document.querySelectorAll(".platform-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect()
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`)
      card.style.setProperty("--my", `${event.clientY - rect.top}px`)
    })
  })
}

function initCursorGlow() {
  const glow = document.querySelector(".cursor-glow")
  if (!glow) return
  let x = -999
  let y = -999
  let currentX = x
  let currentY = y
  let running = false

  const loop = () => {
    // Gerak halus (lerp) agar cahaya terasa "mengambang"
    currentX += (x - currentX) * .12
    currentY += (y - currentY) * .12
    glow.style.setProperty("--cx", `${currentX.toFixed(1)}px`)
    glow.style.setProperty("--cy", `${currentY.toFixed(1)}px`)
    if (Math.abs(x - currentX) > .5 || Math.abs(y - currentY) > .5) {
      requestAnimationFrame(loop)
    } else {
      running = false
    }
  }

  window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return
    if (currentX === -999) {
      currentX = event.clientX
      currentY = event.clientY
    }
    x = event.clientX
    y = event.clientY
    root.classList.add("has-pointer")
    if (!running) {
      running = true
      requestAnimationFrame(loop)
    }
  }, { passive: true })
  document.addEventListener("pointerleave", () => root.classList.remove("has-pointer"))
}

export function initPointerEffects() {
  if (!isFinePointer() || prefersReducedMotion()) return
  initTilt()
  initHeroParallax()
  initMagnetic()
  initSpotlight()
  initCursorGlow()
}
