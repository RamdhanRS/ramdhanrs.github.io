/**
 * Console hero "mengetik sendiri":
 * perintah diketik per karakter, output ditampilkan per baris.
 */
import { prefersReducedMotion } from "./utils.js"

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function initConsoleTyping() {
  const body = document.querySelector(".console-body")
  if (!body || prefersReducedMotion()) return

  // Pecah isi <pre> menjadi baris agar bisa ditampilkan satu per satu
  const pre = body.querySelector("pre")
  if (pre) pre.innerHTML = pre.innerHTML.split("\n").map((line) => `<span class="pre-line">${line}</span>`).join("\n")

  // Susun langkah: perintah ($ ...) diketik, output langsung tampil
  const steps = []
  body.querySelectorAll(":scope > p:not(.cursor-line), :scope > pre .pre-line").forEach((element) => {
    const isCommand = element.matches("p") && element.querySelector("b") && !element.classList.contains("output")
    if (isCommand) {
      const textNode = [...element.childNodes].reverse().find((node) => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim())
      steps.push({ element, type: "command", textNode, text: textNode?.nodeValue ?? "" })
    } else {
      steps.push({ element, type: "output" })
    }
    element.classList.add("type-hidden")
  })
  body.classList.add("is-typing")

  const run = async () => {
    await sleep(900)
    for (const step of steps) {
      step.element.classList.remove("type-hidden")
      if (step.type === "command" && step.textNode) {
        step.element.classList.add("type-caret")
        step.textNode.nodeValue = ""
        await sleep(250)
        for (const char of step.text) {
          step.textNode.nodeValue += char
          await sleep(char === " " ? 30 : 45 + Math.random() * 55)
        }
        await sleep(320)
        step.element.classList.remove("type-caret")
      } else {
        await sleep(70)
      }
    }
    body.classList.remove("is-typing")
  }

  // Mulai saat console terlihat
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return
    observer.disconnect()
    run()
  }, { threshold: .3 })
  observer.observe(body)
}
