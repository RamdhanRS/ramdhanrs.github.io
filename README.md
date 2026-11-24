# Portfolio Ramdhan Ridho Saputra

Website portofolio untuk GitHub Pages. HTML dipecah per section dengan **Jekyll includes**
(dibangun otomatis oleh GitHub Pages, tanpa setup tambahan), CSS & JavaScript dipecah per bagian,
dan dilengkapi animasi 3D (Three.js + CSS 3D).

## Struktur

```text
.
├── _config.yml                  # Judul, deskripsi, username, versi aset
├── index.html                   # Daftar section (urutan halaman)
├── _layouts/
│   └── default.html             # Kerangka halaman: head, header, main, footer
├── _includes/
│   ├── partials/                # head.html · header.html · footer.html
│   └── sections/                # Satu file per section
│       ├── hero.html            #   Hero + panggung 3D
│       ├── marquee.html         #   Pita teknologi 3D
│       ├── about.html           #   01 Tentang saya
│       ├── stack.html           #   02 Tech stack + kubus 3D
│       ├── projects.html        #   03 Studi kasus
│       ├── working-style.html   #   04 Cara kerja
│       ├── journey.html         #   05 Perjalanan belajar
│       ├── platforms.html       #   06 Platform developer
│       └── contact.html         #   Kontak + globe 3D
├── assets/
│   ├── css/
│   │   ├── base/                # variables.css (design token) · reset.css
│   │   ├── layout/              # container.css · header.css · footer.css
│   │   ├── components/          # ui.css · effects.css · side-objects.css
│   │   └── sections/            # Satu file CSS per section (termasuk responsif)
│   ├── js/
│   │   ├── main.js              # Entry point
│   │   ├── data/translations.js # Kamus ID → EN
│   │   ├── modules/             # theme, i18n, header, scroll-effects, pointer-effects, tech-cube, visitor-counter
│   │   └── three/               # stage.js · hero-scene.js · contact-globe.js
│   └── img/favicon.svg
└── tools/preview.mjs            # Preview lokal tanpa Jekyll
```

## Menjalankan secara lokal

Karena section digabung oleh Jekyll, `index.html` tidak bisa dibuka langsung dari file.
Gunakan salah satu cara berikut:

**Cara cepat (Node.js, tanpa instalasi tambahan):**

```bash
node tools/preview.mjs
```

Buka `http://localhost:4000`. Halaman di-build ulang setiap kali di-refresh.

**Jekyll asli (sama persis dengan GitHub Pages):**

```bash
gem install bundler jekyll
jekyll serve
```

## Mengedit konten

| Ingin mengubah…                 | Edit file                                   |
| ------------------------------- | ------------------------------------------- |
| Teks / isi sebuah section       | `_includes/sections/<nama>.html`            |
| Urutan atau menghapus section   | `index.html`                                |
| Warna, font, radius             | `assets/css/base/variables.css`             |
| Tampilan satu section           | `assets/css/sections/<nama>.css`            |
| Terjemahan bahasa Inggris       | `assets/js/data/translations.js`            |
| Scene 3D                        | `assets/js/three/*.js`                      |

> Saat menambah teks baru di HTML, tambahkan juga terjemahannya di `translations.js`.
> Setelah mengubah CSS/JS, naikkan `asset_version` di `_config.yml` agar cache browser diperbarui.

## Fitur

- Scene 3D Three.js: inti service mesh interaktif di hero dan globe jaringan di section kontak
  (otomatis berhenti saat tidak terlihat, fallback CSS bila WebGL tidak tersedia)
- Kubus teknologi 3D yang bisa di-drag, pita marquee 3D, tilt 3D + kilau pada kartu
- Mode terang/gelap tanpa kedipan, transisi tema (View Transitions API)
- Bahasa Indonesia / Inggris
- Scrollspy navigasi, progress bar, tombol kembali ke atas, timeline yang terisi saat scroll
- Menghormati `prefers-reduced-motion` dan dapat dinavigasi dengan keyboard

## Deploy ke GitHub Pages

1. Push seluruh perubahan ke branch `main`.
2. Buka **Settings → Pages** pada repository GitHub.
3. Pada **Build and deployment**, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. GitHub Pages akan menjalankan Jekyll secara otomatis. Jangan menambahkan file `.nojekyll`.

## Privasi

Studi kasus profesional ditulis pada level umum. Tidak ada source code private, credential,
alamat server, data perusahaan, maupun konfigurasi internal yang ditampilkan.
