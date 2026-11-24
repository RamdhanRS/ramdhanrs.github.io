#!/usr/bin/env node
/**
 * Preview lokal tanpa perlu menginstal Jekyll.
 *
 *   node tools/preview.mjs          → build ke _site/ lalu jalankan server di http://localhost:4000
 *   node tools/preview.mjs --build  → hanya build ke _site/
 *
 * Mendukung subset Liquid yang dipakai proyek ini:
 *   {% include path %}, {{ content }}, {{ site.key }}, {% comment %}…{% endcomment %}, front matter.
 * GitHub Pages tetap memakai Jekyll asli saat deploy.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, statSync } from "node:fs"
import { createServer } from "node:http"
import { join, extname, dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const OUT = join(ROOT, "_site")
const PORT = Number(process.env.PORT) || 4000

// Parser YAML sederhana untuk nilai skalar tingkat atas di _config.yml
function readConfig() {
  const site = {}
  for (const line of readFileSync(join(ROOT, "_config.yml"), "utf8").split("\n")) {
    const match = line.match(/^([A-Za-z_][\w-]*):\s*(.+?)\s*$/)
    if (match) site[match[1]] = match[2].replace(/^["']|["']$/g, "")
  }
  return site
}

function splitFrontMatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { data: {}, body: source }
  const data = {}
  for (const line of match[1].split("\n")) {
    const pair = line.match(/^(\w+):\s*(.+)$/)
    if (pair) data[pair[1]] = pair[2].trim()
  }
  return { data, body: source.slice(match[0].length) }
}

function render(template, site, depth = 0) {
  if (depth > 10) throw new Error("Include terlalu dalam (kemungkinan rekursif)")
  return template
    .replace(/{%-?\s*comment\s*-?%}[\s\S]*?{%-?\s*endcomment\s*-?%}\n?/g, "")
    .replace(/{%-?\s*include\s+([\w./-]+)\s*-?%}/g, (_, file) => {
      const path = join(ROOT, "_includes", file)
      if (!existsSync(path)) throw new Error(`Include tidak ditemukan: ${file}`)
      return render(readFileSync(path, "utf8"), site, depth + 1)
    })
    .replace(/{{\s*site\.(\w+)\s*}}/g, (_, key) => site[key] ?? "")
}

function build() {
  const site = readConfig()
  rmSync(OUT, { recursive: true, force: true })
  mkdirSync(OUT, { recursive: true })
  cpSync(join(ROOT, "assets"), join(OUT, "assets"), { recursive: true })

  const { data, body } = splitFrontMatter(readFileSync(join(ROOT, "index.html"), "utf8"))
  let html = render(body, site)
  if (data.layout) {
    const layout = readFileSync(join(ROOT, "_layouts", `${data.layout}.html`), "utf8")
    html = render(layout, site).replace(/{{\s*content\s*}}/, html)
  }
  writeFileSync(join(OUT, "index.html"), html)
  console.log(`✔ Build selesai → ${OUT}`)
}

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json", ".ico": "image/x-icon" }

function serve() {
  createServer((request, response) => {
    // Rebuild setiap memuat halaman agar perubahan langsung terlihat
    let path = decodeURIComponent(new URL(request.url, "http://x").pathname)
    if (path === "/") {
      try { build() } catch (error) { response.writeHead(500).end(String(error)); return }
      path = "/index.html"
    }
    const file = resolve(OUT, `.${path}`)
    if (!file.startsWith(OUT) || !existsSync(file) || statSync(file).isDirectory()) {
      response.writeHead(404).end("Not found")
      return
    }
    // Aset dibaca langsung dari sumber agar perubahan CSS/JS langsung terlihat
    const source = file.replace(OUT, ROOT)
    response.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" })
    response.end(readFileSync(existsSync(source) && path !== "/index.html" ? source : file))
  }).listen(PORT, () => console.log(`▶ Preview berjalan di http://localhost:${PORT}`))
}

build()
if (!process.argv.includes("--build")) serve()
