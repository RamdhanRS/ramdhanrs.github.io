/**
 * Scene 3D kontak: globe jaringan dari titik-titik (fibonacci sphere)
 * dengan busur data yang terbang antar-node.
 */
import { createStage } from "./stage.js"

export function initContactGlobe(canvas) {
  return createStage(canvas, (THREE) => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 100)
    camera.position.set(0, 0, 7)

    const globe = new THREE.Group()
    globe.rotation.set(.35, 0, -.25)
    scene.add(globe)

    const RADIUS = 2

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
    const dots = new THREE.Points(dotsGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: .028, transparent: true, opacity: .6 }))
    globe.add(dots)

    // Bola dalam samar + garis lintang/bujur
    globe.add(new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * .985, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x2a1f6b, transparent: true, opacity: .25 }),
    ))
    globe.add(new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(RADIUS * 1.002, 3)),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .05 }),
    ))

    // Cincin orbit di luar globe
    const ringPoints = []
    for (let i = 0; i <= 160; i++) {
      const angle = (i / 160) * Math.PI * 2
      ringPoints.push(new THREE.Vector3(Math.cos(angle) * RADIUS * 1.45, 0, Math.sin(angle) * RADIUS * 1.45))
    }
    const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPoints), new THREE.LineBasicMaterial({ color: 0xd9f58f, transparent: true, opacity: .3 }))
    ring.rotation.x = .3
    scene.add(ring)
    const moon = new THREE.Mesh(new THREE.SphereGeometry(.06, 16, 16), new THREE.MeshBasicMaterial({ color: 0xd9f58f }))
    scene.add(moon)

    // ---------- Busur data ----------
    const ARC_SEGMENTS = 48
    const arcMaterial = new THREE.LineBasicMaterial({ color: 0xd9f58f, transparent: true, opacity: .85 })
    const headMaterial = new THREE.MeshBasicMaterial({ color: 0xd9f58f })
    const headGeometry = new THREE.SphereGeometry(.035, 10, 10)

    const makeArc = () => {
      const start = nodes[Math.floor(Math.random() * count)]
      let end = nodes[Math.floor(Math.random() * count)]
      while (end.distanceTo(start) < 1.2) end = nodes[Math.floor(Math.random() * count)]
      const mid = start.clone().add(end).multiplyScalar(.5)
      mid.setLength(RADIUS + start.distanceTo(end) * .45)
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
      return curve.getPoints(ARC_SEGMENTS)
    }

    const arcs = Array.from({ length: 9 }, (_, index) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(makeArc())
      geometry.setDrawRange(0, 0)
      const line = new THREE.Line(geometry, arcMaterial)
      const head = new THREE.Mesh(headGeometry, headMaterial)
      globe.add(line, head)
      return { line, head, geometry, start: index * -.55, duration: 2.6 + Math.random() * 1.4 }
    })

    // Interaksi mouse ringan
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    window.addEventListener("pointermove", (event) => {
      pointer.tx = (event.clientX / window.innerWidth) * 2 - 1
      pointer.ty = (event.clientY / window.innerHeight) * 2 - 1
    }, { passive: true })

    const update = (time) => {
      pointer.x += (pointer.tx - pointer.x) * .04
      pointer.y += (pointer.ty - pointer.y) * .04
      globe.rotation.y = time * .09 + pointer.x * .3
      globe.rotation.x = .35 + pointer.y * .15

      const moonAngle = time * .5
      moon.position.set(Math.cos(moonAngle) * RADIUS * 1.45, 0, Math.sin(moonAngle) * RADIUS * 1.45).applyEuler(ring.rotation)

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
          // Siklus baru → busur baru di lokasi acak
          arc.cycle = cycle
          // Perbarui buffer yang ada (tanpa membuat buffer GPU baru)
          const attribute = arc.geometry.attributes.position
          makeArc().forEach((point, i) => attribute.setXYZ(i, point.x, point.y, point.z))
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
