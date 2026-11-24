/**
 * Scene 3D hero: "service mesh core".
 * Inti icosahedron (sistem backend) dikelilingi orbit microservice,
 * garis koneksi, paket data yang bergerak, dan medan partikel.
 * Bereaksi terhadap gerakan mouse dan scroll.
 */
import { createStage, themeColors } from "./stage.js"

export function initHeroScene(canvas, stageElement) {
  return createStage(canvas, (THREE, { reducedMotion }) => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 100)
    camera.position.set(0, 0, 7.4)

    const world = new THREE.Group()
    scene.add(world)

    // ---------- Cahaya ----------
    const ambient = new THREE.AmbientLight(0xffffff, .65)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5)
    keyLight.position.set(3, 4, 5)
    const rimLight = new THREE.PointLight(0xc8ff45, 6, 12)
    rimLight.position.set(-3, -2, 2.5)
    const fillLight = new THREE.PointLight(0x7059ee, 8, 12)
    fillLight.position.set(3, -1, -2)
    scene.add(ambient, keyLight, rimLight, fillLight)

    // ---------- Inti ----------
    const core = new THREE.Group()
    world.add(core)

    const coreGeometry = new THREE.IcosahedronGeometry(1.05, 1)
    const coreMaterial = new THREE.MeshStandardMaterial({ flatShading: true, metalness: .25, roughness: .35, transparent: true, opacity: .95 })
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial)
    core.add(coreMesh)

    const edgeMaterial = new THREE.LineBasicMaterial({ transparent: true, opacity: .8 })
    const coreEdges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.09, 1)), edgeMaterial)
    core.add(coreEdges)

    const heartMaterial = new THREE.MeshBasicMaterial()
    const heart = new THREE.Mesh(new THREE.SphereGeometry(.22, 24, 24), heartMaterial)
    core.add(heart)

    // Cangkang titik di sekitar inti
    const shellGeometry = new THREE.IcosahedronGeometry(1.65, 2)
    const shellMaterial = new THREE.PointsMaterial({ size: .045, transparent: true, opacity: .9, sizeAttenuation: true })
    const shell = new THREE.Points(shellGeometry, shellMaterial)
    const shellLinesMaterial = new THREE.LineBasicMaterial({ transparent: true, opacity: .12 })
    const shellLines = new THREE.LineSegments(new THREE.EdgesGeometry(shellGeometry), shellLinesMaterial)
    world.add(shell, shellLines)

    // ---------- Orbit & microservice ----------
    const ringMaterial = new THREE.LineBasicMaterial({ transparent: true, opacity: .25 })
    const orbitConfigs = [
      { radius: 2.15, tilt: new THREE.Euler(1.2, .2, 0), speed: .32, count: 2 },
      { radius: 2.55, tilt: new THREE.Euler(.35, .9, .4), speed: -.22, count: 2 },
      { radius: 2.95, tilt: new THREE.Euler(-.6, -.4, .9), speed: .16, count: 3 },
    ]
    const satelliteGeometries = [
      new THREE.OctahedronGeometry(.13),
      new THREE.BoxGeometry(.17, .17, .17),
      new THREE.TetrahedronGeometry(.15),
    ]
    const satelliteMaterials = []
    const satellites = []

    orbitConfigs.forEach((config, orbitIndex) => {
      const orbit = new THREE.Group()
      orbit.rotation.copy(config.tilt)
      world.add(orbit)

      const points = []
      for (let i = 0; i <= 128; i++) {
        const angle = (i / 128) * Math.PI * 2
        points.push(new THREE.Vector3(Math.cos(angle) * config.radius, Math.sin(angle) * config.radius, 0))
      }
      orbit.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), ringMaterial))

      for (let i = 0; i < config.count; i++) {
        const material = new THREE.MeshStandardMaterial({ flatShading: true, metalness: .2, roughness: .4, emissiveIntensity: .35 })
        satelliteMaterials.push(material)
        const mesh = new THREE.Mesh(satelliteGeometries[(orbitIndex + i) % satelliteGeometries.length], material)
        orbit.add(mesh)
        satellites.push({ mesh, orbit, radius: config.radius, speed: config.speed, offset: (i / config.count) * Math.PI * 2 + orbitIndex })
      }
    })

    // ---------- Koneksi inti → microservice + paket data ----------
    const linkPositions = new Float32Array(satellites.length * 6)
    const linkGeometry = new THREE.BufferGeometry()
    linkGeometry.setAttribute("position", new THREE.BufferAttribute(linkPositions, 3))
    const linkMaterial = new THREE.LineBasicMaterial({ transparent: true, opacity: .32 })
    world.add(new THREE.LineSegments(linkGeometry, linkMaterial))

    const packetMaterial = new THREE.MeshBasicMaterial()
    const packetGeometry = new THREE.SphereGeometry(.045, 12, 12)
    const packets = satellites.map((_, index) => {
      const mesh = new THREE.Mesh(packetGeometry, packetMaterial)
      world.add(mesh)
      return { mesh, offset: index * .37, speed: .45 + (index % 3) * .12 }
    })

    // ---------- Medan partikel ----------
    const starCount = 520
    const starPositions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      const radius = 3.6 + Math.random() * 3.2
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      starPositions.set([radius * Math.sin(phi) * Math.cos(theta), radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi)], i * 3)
    }
    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3))
    const starMaterial = new THREE.PointsMaterial({ size: .03, transparent: true, opacity: .55 })
    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)

    // ---------- Warna mengikuti tema ----------
    const applyTheme = () => {
      const c = themeColors(THREE)
      coreMaterial.color.copy(c.purple)
      coreMaterial.emissive.copy(c.purple).multiplyScalar(c.dark ? .5 : .12)
      edgeMaterial.color.copy(c.dark ? c.lime : c.ink)
      edgeMaterial.opacity = c.dark ? .75 : .55
      heartMaterial.color.copy(c.lime)
      shellMaterial.color.copy(c.dark ? c.lime : c.purple)
      shellLinesMaterial.color.copy(c.dark ? c.lime : c.ink)
      shellLinesMaterial.opacity = c.dark ? .1 : .08
      ringMaterial.color.copy(c.dark ? new THREE.Color(0xffffff) : c.ink)
      ringMaterial.opacity = c.dark ? .2 : .18
      linkMaterial.color.copy(c.dark ? c.lime : c.purple)
      packetMaterial.color.copy(c.dark ? c.lime : c.orange)
      starMaterial.color.copy(c.dark ? new THREE.Color(0xffffff) : c.muted)
      const palette = [c.orange, c.blue, c.green, c.lime, c.purple, c.orange, c.blue]
      satelliteMaterials.forEach((material, index) => {
        material.color.copy(palette[index % palette.length])
        material.emissive.copy(palette[index % palette.length])
      })
      rimLight.color.copy(c.lime)
      fillLight.color.copy(c.purple)
      ambient.intensity = c.dark ? .45 : .8
      fadeMaterials.forEach((material) => { material.userData.base = material.opacity })
    }
    const fadeMaterials = [shellMaterial, shellLinesMaterial, ringMaterial, linkMaterial, starMaterial]
    applyTheme()

    // ---------- Interaksi: mouse & scroll ----------
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    window.addEventListener("pointermove", (event) => {
      pointer.tx = (event.clientX / window.innerWidth) * 2 - 1
      pointer.ty = (event.clientY / window.innerHeight) * 2 - 1
    }, { passive: true })

    let scrollRatio = 0
    const updateScroll = () => {
      const rect = stageElement.getBoundingClientRect()
      scrollRatio = Math.min(Math.max(-rect.top / (rect.height || 1), 0), 1.5)
    }
    let scrollQueued = false
    window.addEventListener("scroll", () => {
      if (scrollQueued) return
      scrollQueued = true
      requestAnimationFrame(() => { scrollQueued = false; updateScroll() })
    }, { passive: true })
    updateScroll()

    const tmp = new THREE.Vector3()
    const coreAnchor = new THREE.Vector3()

    let baseZ = 7.4
    const resize = (width, height) => {
      // Layar sempit: mundurkan kamera agar orbit tetap muat
      baseZ = width / height < .9 ? 9.2 : 7.4
    }

    // Easing untuk animasi pembuka
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
    const easeOutBack = (t) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2)

    const update = (time, delta) => {
      pointer.x += (pointer.tx - pointer.x) * .05
      pointer.y += (pointer.ty - pointer.y) * .05

      // ---------- Intro: node tersebar lalu menyatu ke inti (±2.4 detik) ----------
      const t = reducedMotion ? 1 : Math.min(time / 2.4, 1)
      const intro = easeOutCubic(t)
      const spread = 1 - intro
      core.scale.setScalar(reducedMotion ? 1 : Math.max(.001, easeOutBack(Math.min(time / 1.6, 1))))
      shell.scale.setScalar(1 + spread * 1.8)
      shellLines.scale.copy(shell.scale)
      fadeMaterials.forEach((material) => { material.opacity = (material.userData.base ?? material.opacity) * intro })

      // ---------- Scroll: orb mundur & naik saat melewati hero ----------
      camera.position.z = baseZ + scrollRatio * 2.6
      world.position.y = scrollRatio * .9

      world.rotation.y = time * .12 + pointer.x * .45 + scrollRatio * 1.4 + spread * 2.2
      world.rotation.x = .25 + pointer.y * .25 + scrollRatio * .4
      core.rotation.x = time * .25
      core.rotation.z = time * .18
      shell.rotation.y = shellLines.rotation.y = -time * .08
      stars.rotation.y = time * .015 - pointer.x * .1
      stars.rotation.x = pointer.y * .06

      const pulse = 1 + Math.sin(time * 2.2) * .08
      heart.scale.setScalar(pulse)

      satellites.forEach((satellite, index) => {
        const angle = time * satellite.speed + satellite.offset
        const radius = satellite.radius * (1 + spread * 1.4)
        satellite.mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
        satellite.mesh.scale.setScalar(.3 + intro * .7)
        satellite.mesh.rotation.x += delta * .8
        satellite.mesh.rotation.y += delta * 1.1

        // Posisi dunia satelit (relatif ke group world)
        satellite.mesh.getWorldPosition(tmp)
        world.worldToLocal(tmp)
        coreAnchor.copy(tmp).setLength(1.1)
        linkPositions.set([coreAnchor.x, coreAnchor.y, coreAnchor.z, tmp.x, tmp.y, tmp.z], index * 6)

        const packet = packets[index]
        const progress = (time * packet.speed + packet.offset) % 1
        packet.mesh.position.lerpVectors(coreAnchor, tmp, progress)
        packet.mesh.scale.setScalar((Math.sin(progress * Math.PI) * 1.2 + .2) * Math.max(0, intro * 4 - 3))
      })
      linkGeometry.attributes.position.needsUpdate = true
    }

    return { scene, camera, update, resize, theme: applyTheme }
  })
}
