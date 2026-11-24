/** Header: status scroll, menu mobile, dan scrollspy dengan indikator aktif. */
import { t, rafThrottle } from "./utils.js"

const header = document.querySelector(".site-header")
const nav = document.querySelector(".site-header nav")
const menuButton = document.querySelector(".menu-button")
const navLinks = [...document.querySelectorAll(".site-header nav a")]
const indicator = document.querySelector(".nav-indicator")

function setMenu(open) {
  document.body.classList.toggle("menu-open", open)
  menuButton?.setAttribute("aria-expanded", String(open))
  menuButton?.setAttribute("aria-label", open ? t("Tutup menu", "Close menu") : t("Buka menu", "Open menu"))
}

function moveIndicator(link) {
  if (!indicator || !nav) return
  if (!link) {
    nav.classList.remove("has-active")
    return
  }
  nav.classList.add("has-active")
  indicator.style.width = `${link.offsetWidth}px`
  indicator.style.transform = `translateX(${link.offsetLeft}px)`
}

function initScrollSpy() {
  const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean)
  if (!("IntersectionObserver" in window) || !sections.length) return

  let activeId = null
  const visible = new Map()

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0))
      // Section dengan porsi terlihat terbesar dianggap aktif
      const [bestId, ratio] = [...visible.entries()].sort((a, b) => b[1] - a[1])[0] || []
      const nextId = ratio > 0 ? bestId : null
      if (nextId === activeId) return
      activeId = nextId
      navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`))
      moveIndicator(navLinks.find((link) => link.classList.contains("active")))
    },
    { rootMargin: "-35% 0px -45% 0px", threshold: [0, .25, .5, .75, 1] },
  )
  sections.forEach((section) => observer.observe(section))

  window.addEventListener("resize", rafThrottle(() => moveIndicator(navLinks.find((link) => link.classList.contains("active")))))
  document.addEventListener("languagechange", () => requestAnimationFrame(() => moveIndicator(navLinks.find((link) => link.classList.contains("active")))))
}

export function initHeader() {
  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 24)
  updateHeader()
  window.addEventListener("scroll", rafThrottle(updateHeader), { passive: true })

  menuButton?.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")))
  navLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)))
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("menu-open")) setMenu(false)
  })
  document.addEventListener("languagechange", () => setMenu(document.body.classList.contains("menu-open")))

  initScrollSpy()
}
