/**
 * Scene 3D kontak: globe jaringan dari titik-titik (fibonacci sphere).
 * - Pin berdenyut di Jakarta (6.2088° S, 106.8456° E)
 * - Busur data terbang dari Jakarta ke node lain (dan antar-node)
 * - Globe bisa di-drag untuk diputar, dengan inersia
 */
import { createStage } from "./stage.js"

const JAKARTA = { lat: -6.2088, lon: 106.8456 }

export function initContactGlobe(canvas) {
  return createStage(canvas, (THREE, { reducedMotion }) => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 100)
    camera.position.set(0, 0, 7)

    const RADIUS = 2
    const globe = new THREE.Group()
    scene.add(globe)

    /** Lintang/bujur → titik di permukaan bola. */
    const latLonToVector = (lat, lon, radius = RADIUS) => {
      const phi = THREE.MathUtils.degToRad(90 - lat)
      const theta = THREE.MathUtils.degToRad(lon + 180)
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
      )
    }

    // ---------- Titik-titik permukaan ----------
    const count = 1100
    const positions = new Float32Array(count * 3)
    const nodes = []
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = golden * i
      const point = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(RADIUS)
      positions.set([point.x, point.y, point.z], i * 3)
      nodes.push(point)
    }
    const dotsGeometry = new THREE.BufferGeometry()
    dotsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    globe.add(new THREE.Points(dotsGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: .028, transparent: true, opacity: .6 })))

    // Bola dalam samar + jaring
    globe.add(new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * .985, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x2a1f6b, transparent: true, opacity: .25 }),
    ))
    globe.add(new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(RADIUS * 1.002, 3)),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .05 }),
    ))

    // ---------- Pin Jakarta ----------
    const LIME = 0xd9f58f
    const jakarta = latLonToVector(JAKARTA.lat, JAKARTA.lon)
    const normal = jakarta.clone().normalize()

    const pin = new THREE.Group()
    pin.position.copy(jakarta)
    pin.lookAt(jakarta.clone().multiplyScalar(2)) // sumbu z pin menghadap keluar dari globe
    globe.add(pin)

    pin.add(new THREE.Mesh(new THREE.SphereGeometry(.055, 16, 16), new THREE.MeshBasicMaterial({ color: LIME })))
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(.008, .008, .5, 8),
      new THREE.MeshBasicMaterial({ color: LIME, transparent: true, opacity: .8 }),
    )
    beam.rotation.x = Math.PI / 2
    beam.position.z = .25
    pin.add(beam)
    pin.add(new THREE.Mesh(new THREE.SphereGeometry(.035, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff })).translateZ(.5))

    // Gelombang yang memancar dari pin
    const ripples = [0, 1, 2].map((index) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(.07, .085, 40),
        new THREE.MeshBasicMaterial({ color: LIME, transparent: true, side: THREE.DoubleSide }),
      )
      ring.position.z = .004
      pin.add(ring)
      return { ring, offset: index / 3 }
    })

    // ---------- Cincin orbit ----------
    const ringPoints = []
    for (let i = 0; i <= 160; i++) {
      const angle = (i / 160) * Math.PI * 2
      ringPoints.push(new THREE.Vector3(Math.cos(angle) * RADIUS * 1.45, 0, Math.sin(angle) * RADIUS * 1.45))
    }
    const orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPoints), new THREE.LineBasicMaterial({ color: LIME, transparent: true, opacity: .3 }))
    orbit.rotation.x = .3
    scene.add(orbit)
    const moon = new THREE.Mesh(new THREE.SphereGeometry(.06, 16, 16), new THREE.MeshBasicMaterial({ color: LIME }))
    scene.add(moon)

    // ---------- Busur data ----------
    const ARC_SEGMENTS = 48
    const arcMaterial = new THREE.LineBasicMaterial({ color: LIME, transparent: true, opacity: .85 })
    const headMaterial = new THREE.MeshBasicMaterial({ color: LIME })
    const headGeometry = new THREE.SphereGeometry(.035, 10, 10)
    const randomNode = () => nodes[Math.floor(Math.random() * count)]

    /** 2 dari 3 busur berangkat dari Jakarta. */
    const makeArc = (index) => {
      const start = index % 3 !== 2 ? jakarta : randomNode()
      let end = randomNode()
      while (end.distanceTo(start) < 1.2) end = randomNode()
      const mid = start.clone().add(end).multiplyScalar(.5)
      mid.setLength(RADIUS + start.distanceTo(end) * .45)
      return new THREE.QuadraticBezierCurve3(start, mid, end).getPoints(ARC_SEGMENTS)
    }

    const arcs = Array.from({ length: 9 }, (_, index) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(makeArc(index))
      geometry.setDrawRange(0, 0)
      const line = new THREE.Line(geometry, arcMaterial)
      const head = new THREE.Mesh(headGeometry, headMaterial)
      globe.add(line, head)
      return { index, line, head, geometry, start: index * -.55, duration: 2.6 + Math.random() * 1.4 }
    })

    // ---------- Rotasi: otomatis + drag + mouse ----------
    // Rotasi awal: Jakarta menghadap kamera, sedikit ke kiri agar terlihat di samping kartu status
    const baseY = -Math.atan2(normal.x, normal.z) - .85
    const baseX = .15
    let autoY = 0
    let dragY = 0
    let dragX = 0
    let velocityY = 0
    let velocityX = 0
    let dragging = false
    let last = { x: 0, y: 0 }

    canvas.addEventListener("pointerdown", (event) => {
      dragging = true
      last = { x: event.clientX, y: event.clientY }
      canvas.setPointerCapture(event.pointerId)
      canvas.classList.add("is-dragging")
    })
    canvas.addEventListener("pointermove", (event) => {
      if (!dragging) return
      const dx = event.clientX - last.x
      const dy = event.clientY - last.y
      last = { x: event.clientX, y: event.clientY }
      velocityY = dx * .006
      velocityX = dy * .004
      dragY += velocityY
      dragX = THREE.MathUtils.clamp(dragX + velocityX, -.6, .6)
    })
    const release = () => {
      dragging = false
      canvas.classList.remove("is-dragging")
    }
    canvas.addEventListener("pointerup", release)
    canvas.addEventListener("pointercancel", release)

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    window.addEventListener("pointermove", (event) => {
      pointer.tx = (event.clientX / window.innerWidth) * 2 - 1
      pointer.ty = (event.clientY / window.innerHeight) * 2 - 1
    }, { passive: true })

    const update = (time, delta) => {
      pointer.x += (pointer.tx - pointer.x) * .04
      pointer.y += (pointer.ty - pointer.y) * .04

      if (!dragging) {
        // Inersia setelah drag dilepas, lalu kembali berputar pelan
        dragY += velocityY
        dragX += velocityX
        velocityY *= .94
        velocityX *= .94
        dragX *= .97
        if (!reducedMotion) autoY += delta * .09
      }
      globe.rotation.y = baseY + autoY + dragY + pointer.x * .25
      globe.rotation.x = baseX + dragX + pointer.y * .12

      const moonAngle = time * .5
      moon.position.set(Math.cos(moonAngle) * RADIUS * 1.45, 0, Math.sin(moonAngle) * RADIUS * 1.45).applyEuler(orbit.rotation)

      // Denyut pin Jakarta
      ripples.forEach(({ ring, offset }) => {
        const progress = (time * .6 + offset) % 1
        ring.scale.setScalar(1 + progress * 5)
        ring.material.opacity = (1 - progress) * .8
      })
      beam.material.opacity = .55 + Math.sin(time * 3) * .25

      arcs.forEach((arc) => {
        const local = (time - arc.start) / arc.duration
        if (local < 0) {
          arc.geometry.setDrawRange(0, 0)
          arc.head.visible = false
          return
        }
        const cycle = Math.floor(local)
        const progress = local - cycle
        if (cycle !== arc.cycle) {
          // Siklus baru → busur baru (update buffer yang ada, tanpa buffer GPU baru)
          arc.cycle = cycle
          const attribute = arc.geometry.attributes.position
          makeArc(arc.index).forEach((point, i) => attribute.setXYZ(i, point.x, point.y, point.z))
          attribute.needsUpdate = true
          arc.geometry.computeBoundingSphere()
        }
        // 0 → .5: busur digambar; .5 → 1: busur menghilang dari pangkal
        const points = ARC_SEGMENTS + 1
        const head = Math.min(progress * 2, 1) * points
        const tail = Math.max(progress * 2 - 1, 0) * points
        arc.geometry.setDrawRange(Math.floor(tail), Math.max(Math.ceil(head - tail), 0))
        const index = Math.min(Math.floor(head), ARC_SEGMENTS)
        const pos = arc.geometry.attributes.position
        arc.head.position.set(pos.getX(index), pos.getY(index), pos.getZ(index))
        arc.head.visible = progress < .55
      })
    }

    return { scene, camera, update }
  })
}
