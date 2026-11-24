/**
 * Entry point. Setiap fitur ada di modulnya masing-masing:
 *
 *   modules/theme.js            → tema terang/gelap
 *   modules/i18n.js             → bahasa ID/EN (kamus di data/translations.js)
 *   modules/header.js           → header, menu mobile, scrollspy
 *   modules/scroll-effects.js   → reveal, progress bar, back-to-top, timeline
 *   modules/pointer-effects.js  → tilt 3D kartu, parallax hero, tombol magnetik
 *   modules/tech-cube.js        → kubus teknologi 3D (CSS)
 *   modules/visitor-counter.js  → penghitung kunjungan
 *   three/hero-scene.js         → scene 3D hero (Three.js)
 *   three/contact-globe.js      → globe 3D di section kontak (Three.js)
 */
import { initTheme } from "./modules/theme.js"
import { initI18n } from "./modules/i18n.js"
import { initHeader } from "./modules/header.js"
import { initScrollEffects } from "./modules/scroll-effects.js"
import { initPointerEffects } from "./modules/pointer-effects.js"
import { initTechCube } from "./modules/tech-cube.js"
import { initVisitorCounter } from "./modules/visitor-counter.js"
import { supportsWebGL } from "./three/stage.js"

initTheme()
initI18n()
initHeader()
initScrollEffects()
initPointerEffects()
initTechCube()
initVisitorCounter()

// Scene 3D dimuat terakhir (Three.js ~150 KB dari CDN) supaya tidak menghambat konten.
async function initThreeScenes() {
  if (!supportsWebGL()) return
  const heroCanvas = document.querySelector(".hero-canvas")
  const heroStage = document.querySelector(".hero-stage")
  const contactCanvas = document.querySelector(".contact-canvas")
  const contact = document.querySelector(".contact")

  try {
    const [{ initHeroScene }, { initContactGlobe }] = await Promise.all([
      import("./three/hero-scene.js"),
      import("./three/contact-globe.js"),
    ])
    if (heroCanvas && heroStage) {
      await initHeroScene(heroCanvas, heroStage)
      heroStage.classList.add("webgl-ready")
    }
    if (contactCanvas && contact) {
      await initContactGlobe(contactCanvas)
      contact.classList.add("webgl-ready")
    }
  } catch (error) {
    // CDN gagal / WebGL error → fallback CSS tetap tampil
    console.warn("Scene 3D tidak dapat dimuat:", error)
  }
}

if ("requestIdleCallback" in window) {
  requestIdleCallback(initThreeScenes, { timeout: 1500 })
} else {
  setTimeout(initThreeScenes, 300)
}
