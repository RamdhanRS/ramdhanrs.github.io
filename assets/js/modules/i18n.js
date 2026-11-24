/** Pengalih bahasa ID ⇄ EN berbasis kamus di data/translations.js. */
import { translations, attributeTranslations, meta } from "../data/translations.js"
import { root } from "./utils.js"

const STORAGE_KEY = "portfolio-language"
const button = document.querySelector(".language-toggle")
const normalize = (text) => text.replace(/\s+/g, " ").trim()

// Simpan semua text node asli sekali saja saat halaman dimuat.
const originalText = new WeakMap()
const textNodes = []

function collectTextNodes() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.parentElement || node.parentElement.closest("script, style")) return NodeFilter.FILTER_REJECT
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    },
  })
  while (walker.nextNode()) {
    const node = walker.currentNode
    originalText.set(node, node.nodeValue)
    textNodes.push(node)
  }
}

export function applyLanguage(language) {
  const english = language === "en"
  root.lang = english ? "en" : "id"

  textNodes.forEach((node) => {
    const original = originalText.get(node)
    const trimmed = original.trim()
    const output = english ? translations.get(normalize(trimmed)) : null
    node.nodeValue = output ? original.replace(trimmed, output) : original
  })

  attributeTranslations.forEach(({ selector, attr, id, en }) => {
    document.querySelectorAll(selector).forEach((element) => element.setAttribute(attr, english ? en : id))
  })

  button?.querySelectorAll("[data-language]").forEach((item) => {
    item.classList.toggle("active", item.dataset.language === root.lang)
  })

  const copy = english ? meta.en : meta.id
  document.querySelector('meta[name="description"]')?.setAttribute("content", copy.description)
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", copy.social)

  document.dispatchEvent(new CustomEvent("languagechange", { detail: { language: root.lang } }))
}

export function initI18n() {
  collectTextNodes()
  applyLanguage(localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "id")

  button?.addEventListener("click", () => {
    const next = root.lang === "en" ? "id" : "en"
    applyLanguage(next)
    localStorage.setItem(STORAGE_KEY, next)
  })
}
