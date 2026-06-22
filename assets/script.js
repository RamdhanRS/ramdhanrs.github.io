const root = document.documentElement
const header = document.querySelector(".site-header")
const menuButton = document.querySelector(".menu-button")
const themeButton = document.querySelector(".theme-toggle")
const languageButton = document.querySelector(".language-toggle")
const navLinks = document.querySelectorAll(".site-header nav a")
const themeMeta = document.querySelector('meta[name="theme-color"]')
const descriptionMeta = document.querySelector('meta[name="description"]')
const ogTitleMeta = document.querySelector('meta[property="og:title"]')
const ogDescriptionMeta = document.querySelector('meta[property="og:description"]')

const translations = new Map([
  ["Tentang", "About"],
  ["Teknologi", "Technology"],
  ["Proyek", "Projects"],
  ["Perjalanan", "Journey"],
  ["Kontak", "Contact"],
  ["Membangun sistem backend yang", "Building backend systems that are"],
  ["andal", "reliable"],
  ["dan mudah dirawat.", "and easy to maintain."],
  ["Saya", "I’m"],
  ["Fokus saya ada pada Java, Spring Boot, Oracle Database, REST API, microservices, serta integrasi sistem dari proses bisnis hingga deployment.", "I focus on Java, Spring Boot, Oracle Database, REST APIs, microservices, and system integration—from business processes to deployment."],
  ["Lihat studi kasus", "View case studies"],
  ["GitHub saya", "My GitHub"],
  ["01 / Tentang saya", "01 / About me"],
  ["Saya menikmati bagian sistem yang bekerja", "I enjoy the parts of a system that work"],
  ["di balik layar.", "behind the scenes."],
  ["Saya banyak bekerja dengan layanan backend berbasis", "I work extensively with backend services built with"],
  ["—merancang endpoint, mengolah data, menghubungkan sistem, serta memastikan proses berjalan konsisten di berbagai environment.", "—designing endpoints, processing data, integrating systems, and keeping processes consistent across environments."],
  ["Saya menyukai kode yang jelas, alur data yang dapat ditelusuri, dan layanan yang tetap tenang ketika kompleksitas mulai tumbuh.", "I value clear code, traceable data flows, and services that stay composed as complexity grows."],
  ["Terbiasa membaca error log dan stack trace, menyusun query Oracle, menangani background job, serta menelusuri masalah sampai ke akar penyebab.", "Comfortable reading error logs and stack traces, writing Oracle queries, handling background jobs, and tracing issues to their root cause."],
  ["Membawa aplikasi dari kode lokal menuju server menggunakan Docker dan pipeline CI/CD.", "Taking applications from local code to servers using Docker and CI/CD pipelines."],
  ["Tumbuh menjadi Backend Engineer dengan fondasi", "Growing into a Backend Engineer with a strong"],
  ["yang kuat.", "foundation."],
  ["Memperdalam microservices, cloud, DevOps, dan data engineering sambil membangun proyek personal di area monitoring, automation, dan AI.", "Deepening my knowledge of microservices, cloud, DevOps, and data engineering while building personal projects in monitoring, automation, and AI."],
  ["Saya mengeksplorasi bagaimana data dan bahasa dapat diubah menjadi automation serta insight yang berguna.", "I explore how data and language can be transformed into useful automation and insights."],
  ["Perangkat yang saya gunakan untuk", "The tools I use to"],
  ["menyelesaikan masalah.", "solve problems."],
  ["Toolkit yang terus berkembang mengikuti kebutuhan sistem, bukan sekadar mengikuti tren.", "A toolkit that evolves with system needs, not simply with trends."],
  ["Layanan, business logic, dan integrasi yang menjadi inti aplikasi.", "Services, business logic, and integrations at the core of an application."],
  ["Data modeling dan query yang akurat, efisien, serta mudah ditelusuri.", "Accurate, efficient, and traceable data modeling and queries."],
  ["Membawa aplikasi dari source code menuju environment yang siap digunakan.", "Taking applications from source code to production-ready environments."],
  ["Perangkat harian untuk kolaborasi, pengujian, build, dan troubleshooting.", "Daily tools for collaboration, testing, builds, and troubleshooting."],
  ["Eksperimen mengubah data dan teks menjadi klasifikasi serta insight.", "Experiments that turn data and text into classifications and insights."],
  ["Interface pendukung dan quality checks agar solusi nyaman digunakan.", "Supporting interfaces and quality checks that make solutions pleasant to use."],
  ["Studi kasus dari pekerjaan dan", "Case studies from professional work and"],
  ["eksperimen teknis.", "technical experiments."],
  ["Detail proyek profesional disajikan secara umum untuk menjaga kerahasiaan sistem dan data.", "Professional projects are described at a high level to protect system and data confidentiality."],
  ["Layanan backend untuk mengelola siklus subscription, customer, product, billing, dan status layanan secara konsisten.", "A backend service for consistently managing subscription, customer, product, billing, and service-status lifecycles."],
  ["Proses lintas domain membutuhkan aturan bisnis dan alur data yang terjaga.", "Cross-domain processes require well-maintained business rules and data flows."],
  ["Peran & highlight", "Role & highlights"],
  ["Mengembangkan REST API, business logic, query database, validasi, dan integrasi antarlayanan.", "Developed REST APIs, business logic, database queries, validation, and service integrations."],
  ["Pembelajaran", "Key learnings"],
  ["Pemisahan domain, konsistensi transaksi, error handling, dan API maintainability.", "Domain separation, transaction consistency, error handling, and API maintainability."],
  ["Service untuk menjalankan proses terjadwal dan background job secara terkontrol menggunakan Quartz.", "A service for running scheduled processes and background jobs in a controlled way using Quartz."],
  ["Konfigurasi jadwal dan trigger", "Schedule and trigger configuration"],
  ["Logging serta penanganan kegagalan", "Logging and failure handling"],
  ["Proses batch yang dapat ditelusuri", "Traceable batch processes"],
  ["Lapisan integrasi untuk mempertukarkan data antar-aplikasi dengan kontrak API, validasi, dan respons error yang jelas.", "An integration layer for exchanging data between applications with clear API contracts, validation, and error responses."],
  ["Alur build dan deployment aplikasi yang lebih konsisten dari repository menuju environment Linux.", "A more consistent application build and deployment flow from repository to Linux environment."],
  ["Eksperimen klasifikasi sentimen ulasan aplikasi untuk melihat pola opini pengguna dalam bentuk dashboard.", "A sentiment-classification experiment that presents user-review patterns in a dashboard."],
  ["Klasifikasi Naïve Bayes", "Naïve Bayes classification"],
  ["Visualisasi hasil analisis", "Analysis result visualization"],
  ["Jejak awal eksplorasi aplikasi desktop Java dan sistem informasi akademik berbasis PHP.", "Early explorations in Java desktop applications and a PHP-based academic information system."],
  ["04 / Cara kerja", "04 / Working style"],
  ["Tenang saat debugging, teliti saat", "Calm while debugging, deliberate when"],
  ["menyusun solusi.", "crafting solutions."],
  ["Mulai dari bukti", "Start with evidence"],
  ["Membaca log, stack trace, payload, dan data aktual sebelum menyimpulkan sumber masalah.", "Read logs, stack traces, payloads, and actual data before identifying the source of a problem."],
  ["Jaga struktur", "Preserve structure"],
  ["Memisahkan tanggung jawab kode agar perubahan lebih aman dan aplikasi mudah dirawat.", "Separate code responsibilities so changes are safer and applications remain maintainable."],
  ["Pikirkan data", "Think about data"],
  ["Menulis query dengan mempertimbangkan ketepatan hasil, volume data, dan efisiensi eksekusi.", "Write queries with result accuracy, data volume, and execution efficiency in mind."],
  ["Siap dioperasikan", "Ready to operate"],
  ["Memperhatikan konfigurasi, deployment, observability, dan perbedaan antar-environment.", "Consider configuration, deployment, observability, and differences between environments."],
  ["Prinsip utama", "Core principle"],
  ["Solusi yang baik tidak berhenti pada “berjalan”, tetapi juga dapat dipahami, diuji, dan dioperasikan.", "A good solution does not stop at “it works”; it should also be understandable, testable, and operable."],
  ["Perjalanan belajar yang terus", "A learning journey that keeps"],
  ["bertambah.", "growing."],
  ["Java & aplikasi desktop", "Java & desktop applications"],
  ["Membangun fondasi pemrograman, OOP, dan alur aplikasi melalui Java dan NetBeans.", "Built programming, OOP, and application-flow foundations through Java and NetBeans."],
  ["Spring Boot & REST API", "Spring Boot & REST APIs"],
  ["Beralih ke pengembangan service, business logic, kontrak API, dan integrasi sistem.", "Moved into service development, business logic, API contracts, and system integration."],
  ["Oracle & native query", "Oracle & native queries"],
  ["Mendalami pengolahan data, relasi, query kompleks, debugging SQL, dan performa.", "Deepened my understanding of data processing, relationships, complex queries, SQL debugging, and performance."],
  ["Memahami perjalanan aplikasi dari source code, build, container, hingga server.", "Learned the application journey from source code and builds to containers and servers."],
  ["Scheduler & background job", "Schedulers & background jobs"],
  ["Mengelola proses berkala, trigger, logging, dan penanganan kegagalan job.", "Managed recurring processes, triggers, logging, and job-failure handling."],
  ["NLP & dashboard", "NLP & dashboards"],
  ["Bereksperimen dengan TF-IDF, Naïve Bayes, React, dan visualisasi data.", "Experimented with TF-IDF, Naïve Bayes, React, and data visualization."],
  ["Fokus berikutnya untuk membangun sistem yang semakin scalable dan observable.", "My next focus is building increasingly scalable and observable systems."],
  ["06 / Jejak kode", "06 / Code presence"],
  ["Temukan saya di", "Find me on"],
  ["platform developer.", "developer platforms."],
  ["Repositori publik berisi proyek pembelajaran. Sebagian besar studi kasus profesional berada di repository private.", "Public repositories contain learning projects. Most professional case studies live in private repositories."],
  ["Terbuka untuk peluang dan kolaborasi", "Open to opportunities and collaboration"],
  ["Mari membangun sistem yang", "Let’s build systems that are"],
  ["bisa diandalkan.", "dependable."],
  ["Punya tantangan backend, integrasi, automation, atau ide produk? Saya senang bertukar pikiran dan mengeksplorasi solusi.", "Have a backend, integration, automation challenge, or product idea? I’m happy to exchange ideas and explore solutions."],
  ["Hubungi via GitHub", "Contact via GitHub"],
  ["Lihat GitLab", "View GitLab"],
  ["Total kunjungan", "Total visits"],
])

const originalText = new WeakMap()
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
  acceptNode(node) {
    if (!node.parentElement || node.parentElement.closest("script, style")) return NodeFilter.FILTER_REJECT
    return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
  },
})
const translatableNodes = []
while (walker.nextNode()) {
  const node = walker.currentNode
  originalText.set(node, node.nodeValue)
  translatableNodes.push(node)
}

const savedTheme = localStorage.getItem("portfolio-theme")
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
const initialTheme = savedTheme || preferredTheme

function applyTheme(theme) {
  root.dataset.theme = theme
  const english = root.lang === "en"
  themeButton?.setAttribute("aria-label", english ? (theme === "dark" ? "Enable light mode" : "Enable dark mode") : theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap")
  themeMeta?.setAttribute("content", theme === "dark" ? "#111210" : "#f4f2ec")
}

function applyLanguage(language) {
  const english = language === "en"
  root.lang = english ? "en" : "id"

  translatableNodes.forEach((node) => {
    const original = originalText.get(node)
    const trimmed = original.trim()
    const output = english ? translations.get(trimmed) : trimmed
    node.nodeValue = original.replace(trimmed, output || trimmed)
  })

  languageButton?.querySelectorAll("[data-language]").forEach((item) => {
    item.classList.toggle("active", item.dataset.language === root.lang)
  })

  const title = "Ramdhan Ridho Saputra — Backend Developer"
  const description = english ? "Portfolio of Ramdhan Ridho Saputra, a Backend Developer focused on Java, Spring Boot, Oracle Database, REST APIs, microservices, and system integration." : "Portofolio Ramdhan Ridho Saputra, Backend Developer dengan fokus pada Java, Spring Boot, Oracle Database, REST API, microservices, dan system integration."
  const socialDescription = english ? "A backend developer who builds reliable APIs, microservices, schedulers, and system integrations." : "Backend developer yang membangun API, microservices, scheduler, dan integrasi sistem yang andal."

  document.title = title
  descriptionMeta?.setAttribute("content", description)
  ogTitleMeta?.setAttribute("content", title)
  ogDescriptionMeta?.setAttribute("content", socialDescription)
  languageButton?.setAttribute("aria-label", english ? "Switch language to Indonesian" : "Ubah bahasa ke Inggris")
  languageButton?.setAttribute("title", english ? "Change language" : "Ganti bahasa")
  document.querySelector(".brand")?.setAttribute("aria-label", english ? "Back to home" : "Kembali ke beranda")
  document.querySelector(".site-header nav")?.setAttribute("aria-label", english ? "Main navigation" : "Navigasi utama")

  const open = document.body.classList.contains("menu-open")
  menuButton?.setAttribute("aria-label", english ? (open ? "Close menu" : "Open menu") : open ? "Tutup menu" : "Buka menu")
  applyTheme(root.dataset.theme || initialTheme)
}

const initialLanguage = localStorage.getItem("portfolio-language") === "en" ? "en" : "id"
applyLanguage(initialLanguage)
applyTheme(initialTheme)

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24)
}

updateHeader()
window.addEventListener("scroll", updateHeader, { passive: true })

themeButton?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark"
  applyTheme(nextTheme)
  localStorage.setItem("portfolio-theme", nextTheme)
})

languageButton?.addEventListener("click", () => {
  const nextLanguage = root.lang === "en" ? "id" : "en"
  applyLanguage(nextLanguage)
  localStorage.setItem("portfolio-language", nextLanguage)
})

menuButton?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("menu-open")
  menuButton.setAttribute("aria-expanded", String(isOpen))
  menuButton.setAttribute("aria-label", root.lang === "en" ? (isOpen ? "Close menu" : "Open menu") : isOpen ? "Tutup menu" : "Buka menu")
})

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("menu-open")
    menuButton?.setAttribute("aria-expanded", "false")
  })
})

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible")
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 },
  )

  document.querySelectorAll(".reveal").forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`
    observer.observe(element)
  })
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"))
}

document.getElementById("year").textContent = new Date().getFullYear()

const visitorCount = document.getElementById("visitor-count")
const counterBaseUrl = "https://api.counterapi.dev/v1/ramdhanrs-portfolio/pageviews"
const isLocalPreview = ["", "localhost", "127.0.0.1"].includes(window.location.hostname)
const hasCountedSession = sessionStorage.getItem("portfolio-visit-counted") === "true"

async function loadVisitorCount() {
  try {
    const shouldIncrement = !isLocalPreview && !hasCountedSession
    const response = await fetch(`${counterBaseUrl}${shouldIncrement ? "/up" : ""}`)
    if (!response.ok) throw new Error("Visitor counter unavailable")

    const data = await response.json()
    visitorCount.textContent = new Intl.NumberFormat(root.lang === "en" ? "en-US" : "id-ID").format(data.count)

    if (shouldIncrement) {
      sessionStorage.setItem("portfolio-visit-counted", "true")
    }
  } catch {
    visitorCount.textContent = "—"
    visitorCount.closest(".visitor-counter")?.setAttribute("title", root.lang === "en" ? "Visitor count is temporarily unavailable" : "Jumlah kunjungan sementara tidak tersedia")
  }
}

loadVisitorCount()
