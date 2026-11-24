/** Pita marquee melambat dengan halus saat di-hover (Web Animations API). */
import { isFinePointer, prefersReducedMotion } from "./utils.js"

export function initMarquee() {
  if (!isFinePointer() || prefersReducedMotion()) return

  document.querySelectorAll(".marquee-band").forEach((band) => {
    const track = band.querySelector(".marquee-track")
    if (!track) return
    let rate = 1
    let target = 1
    let frame = 0

    const step = () => {
      rate += (target - rate) * .08
      const animation = track.getAnimations()[0]
      if (Math.abs(target - rate) < .01) rate = target
      if (animation) animation.playbackRate = rate
      if (rate !== target) frame = requestAnimationFrame(step)
    }
    const setTarget = (value) => {
      target = value
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(step)
    }

    band.addEventListener("pointerenter", () => setTarget(.15))
    band.addEventListener("pointerleave", () => setTarget(1))
  })
}
