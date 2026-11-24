/**
 * Angka menghitung naik saat elemennya pertama kali terlihat.
 * Mendukung desimal (99.9), persen (78%), waktu (02:00), dan angka di dalam teks (42ms).
 */
import { prefersReducedMotion } from "./utils.js"

const TARGETS = [
  ".contact-system-score strong",
  ".sentiment-score strong",
  ".scheduler-time strong",
  ".query-preview small",
]
const NUMBER = /(\d+(?:[.:]\d+)?)/

function findNumberNode(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    if (NUMBER.test(walker.currentNode.nodeValue)) return walker.currentNode
  }
  return null
}

function animate(node) {
  const original = node.nodeValue
  const [match] = original.match(NUMBER)
  const [before, after] = [original.slice(0, original.indexOf(match)), original.slice(original.indexOf(match) + match.length)]

  let target
  let format
  if (match.includes(":")) {
    // Waktu hh:mm → hitung dalam menit
    const [hours, minutes] = match.split(":").map(Number)
    target = hours * 60 + minutes
    format = (value) => `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(Math.round(value % 60)).padStart(2, "0")}`
  } else {
    const decimals = match.split(".")[1]?.length ?? 0
    target = Number(match)
    format = (value) => value.toFixed(decimals)
  }

  const start = performance.now()
  const duration = 1600
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 4)
    node.nodeValue = `${before}${format(target * eased)}${after}`
    if (progress < 1) requestAnimationFrame(step)
    else node.nodeValue = original
  }
  requestAnimationFrame(step)
}

export function initCountUp() {
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) return
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      observer.unobserve(entry.target)
      const node = findNumberNode(entry.target)
      if (node) animate(node)
    })
  }, { threshold: .6 })
  document.querySelectorAll(TARGETS.join(",")).forEach((element) => observer.observe(element))
}
