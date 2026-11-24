/** Kubus teknologi 3D (CSS) yang berputar otomatis dan bisa di-drag. */
import { prefersReducedMotion } from "./utils.js"

export function initTechCube() {
  const scene = document.querySelector(".tech-cube-scene")
  const cube = scene?.querySelector(".tech-cube")
  if (!scene || !cube) return

  let rotateX = -22
  let rotateY = 30
  let velocityX = 0
  let velocityY = prefersReducedMotion() ? 0 : .35
  let dragging = false
  let lastX = 0
  let lastY = 0
  let visible = true

  const render = () => {
    cube.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`)
    cube.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`)
  }

  const tick = () => {
    if (!dragging) {
      rotateY += velocityY
      rotateX += velocityX
      // Kembali perlahan ke kecepatan putar default setelah di-drag
      velocityY += ((prefersReducedMotion() ? 0 : .35) - velocityY) * .02
      velocityX *= .94
      rotateX += (-22 - rotateX) * .01
    }
    render()
    if (visible) requestAnimationFrame(tick)
  }

  scene.addEventListener("pointerdown", (event) => {
    dragging = true
    lastX = event.clientX
    lastY = event.clientY
    scene.setPointerCapture(event.pointerId)
  })
  scene.addEventListener("pointermove", (event) => {
    if (!dragging) return
    const dx = event.clientX - lastX
    const dy = event.clientY - lastY
    lastX = event.clientX
    lastY = event.clientY
    rotateY += dx * .6
    rotateX -= dy * .6
    velocityY = dx * .25
    velocityX = -dy * .25
  })
  const stop = () => { dragging = false }
  scene.addEventListener("pointerup", stop)
  scene.addEventListener("pointercancel", stop)

  // Hemat baterai: hanya animasi saat kubus terlihat
  new IntersectionObserver(([entry]) => {
    const wasVisible = visible
    visible = entry.isIntersecting
    if (visible && !wasVisible) requestAnimationFrame(tick)
  }).observe(scene)

  render()
  requestAnimationFrame(tick)
}
