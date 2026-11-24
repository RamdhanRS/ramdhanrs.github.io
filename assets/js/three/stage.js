/**
 * Pembungkus umum untuk scene Three.js:
 * - memuat Three.js dari CDN (sekali saja)
 * - mengatur renderer, ukuran, dan pixel ratio
 * - berhenti merender saat canvas tidak terlihat atau tab disembunyikan
 * - menghormati prefers-reduced-motion (render 1 frame statis)
 */
const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js"

let threePromise = null
export const loadThree = () => (threePromise ??= import(THREE_URL))

export function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas")
    return Boolean(window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")))
  } catch {
    return false
  }
}

/** Mengambil warna tema dari CSS variable sebagai THREE.Color. */
export function themeColors(THREE) {
  const styles = getComputedStyle(document.documentElement)
  const read = (name, fallback) => new THREE.Color(styles.getPropertyValue(name).trim() || fallback)
  return {
    dark: document.documentElement.dataset.theme === "dark",
    ink: read("--ink", "#111210"),
    muted: read("--muted", "#62635d"),
    purple: read("--purple", "#7059ee"),
    lime: read("--lime", "#c8ff45"),
    orange: read("--orange", "#ff6542"),
    blue: read("--blue", "#3da9e8"),
    green: read("--green", "#5b923f"),
  }
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {(THREE) => { scene, camera, update?: (time, delta) => void, resize?: (w, h) => void, theme?: () => void }} setup
 */
export async function createStage(canvas, setup) {
  const THREE = await loadThree()
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  // Layar retina tidak perlu antialias (piksel sudah rapat) → GPU jauh lebih ringan
  const dpr = window.devicePixelRatio || 1
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: dpr < 1.5, alpha: true, powerPreference: "low-power" })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(dpr, 1.5))

  const world = setup(THREE)
  const { scene, camera } = world
  const clock = new THREE.Clock()

  let inView = true
  let running = false

  const resize = () => {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (!width || !height) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    world.resize?.(width, height)
    if (!running) renderer.render(scene, camera)
  }

  const frame = () => {
    if (!running) return
    const delta = Math.min(clock.getDelta(), .05)
    world.update?.(clock.elapsedTime, delta)
    renderer.render(scene, camera)
    requestAnimationFrame(frame)
  }

  const start = () => {
    if (running || reducedMotion || !inView || document.hidden) return
    running = true
    clock.getDelta()
    requestAnimationFrame(frame)
  }
  const stop = () => { running = false }

  new ResizeObserver(resize).observe(canvas)
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
    inView ? start() : stop()
  }, { rootMargin: "100px" }).observe(canvas)
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()))
  document.addEventListener("themechange", () => {
    world.theme?.()
    if (!running) renderer.render(scene, camera)
  })

  resize()
  world.update?.(0, 0)
  renderer.render(scene, camera)
  start()

  return { THREE, renderer }
}
