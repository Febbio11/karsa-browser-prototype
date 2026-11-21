export interface EngineComparisonRow {
  criterion: string;
  chromiumFork: string;
  geckoView: string;
  systemWebView: string;
}

export interface TechLayerItem {
  id: string;
  layer: string;
  technology: string;
  role: string;
  rationale: string;
}

export interface ArchitectureModule {
  id: string;
  name: string;
  layer:
    | 'Presentation (Compose UI)'
    | 'Browser Core & Session'
    | 'Navigation & Security'
    | 'Rendering & Media'
    | 'Network & Automation'
    | 'Mobile DevTools & Inspection';
  process:
    | 'UI Process (Kotlin)'
    | 'Browser Process (C++/JNI)'
    | 'Renderer Sandbox (Blink/V8)'
    | 'Network Service';
  summary: string;
  responsibilities: string[];
  ipcContract: string;
}

export interface WorkflowBlueprint {
  id:
    | 'anti-redirect'
    | 'flexible-popup'
    | 'terminal-proxy'
    | 'render-fps'
    | 'mobile-devtools'
    | 'fullscreen-profiles';
  title: string;
  subtitle: string;
  trigger: string;
  outcome: string;
  steps: {
    step: string;
    component: string;
    detail: string;
  }[];
}

export interface RoadmapPhase {
  id: string;
  phase: string;
  title: string;
  duration: string;
  target: string;
  deliverables: string[];
  acceptanceCriteria: string[];
}

export interface StarterCodeFile {
  id: string;
  filename: string;
  path: string;
  language: 'Kotlin' | 'JavaScript' | 'C++';
  module: string;
  summary: string;
  code: string;
}

export const ENGINE_COMPARISON: EngineComparisonRow[] = [
  {
    criterion: 'Dukungan Ekstensi Chrome (.crx / MV3)',
    chromiumFork: 'Penuh (Native Chromium Extensions API + patch Kiwi/Cromite)',
    geckoView: 'Terbatas (hanya XPI Mozilla, banyak wallet Web3 tidak kompatibel)',
    systemWebView: 'Tidak ada (harus injeksi polyfill manual, sangat rawan rusak)',
  },
  {
    criterion: 'Mobile-First Chrome DevTools Lokal (Tanpa PC)',
    chromiumFork: 'Native Local DevToolsAgentHost (CDP DOM, Network, Storage, Console) + UI sentuh',
    geckoView: 'Hanya Remote Debugging via USB/Wi-Fi (tidak ada DevTools sentuh internal)',
    systemWebView: 'Hanya remote chrome://inspect via PC, tidak ada akses CDP lokal',
  },
  {
    criterion: 'Performa WebGL2 / WebGPU & Canvas Game',
    chromiumFork: 'Optimal (ANGLE Vulkan/GLES + Skia Graphite + V8 TurboFan)',
    geckoView: 'Baik, namun konsumsi memori WebGL lebih tinggi pada perangkat 4–6 GB RAM',
    systemWebView: 'Sedang, tidak bisa mengontrol BeginFrame atau flag GPU secara mendalam',
  },
  {
    criterion: 'Kontrol Anti-Redirect & Intent Lockdown',
    chromiumFork: 'Penuh di level C++ ExternalNavigationHandler & NavigationThrottle',
    geckoView: 'Baik melalui NavigationDelegate.onLoadRequest',
    systemWebView: 'Cukup (shouldOverrideUrlLoading), tetapi mudah lolos pada sub-frame/window.open',
  },
  {
    criterion: 'Reparenting WebContents (Pop-up/DevTools ke Tab)',
    chromiumFork: 'Native tanpa reload halaman atau memutus sesi OAuth/Wallet/Game',
    geckoView: 'Didukung melalui GeckoSession attach/detach',
    systemWebView: 'Rapuh (re-parent View sering memicu reset konteks WebGL)',
  },
  {
    criterion: 'Multi-Profil Isolasi Penuh & Proxy Per-Sesi',
    chromiumFork: 'Native via BrowserContext / StoragePartition terisolasi (Cookie, CRX, Proxy)',
    geckoView: 'Terbatas (GeckoRuntime global, isolasi ekstensi per kontainer sulit)',
    systemWebView: 'Sangat terbatas (ProxyController global proses, tanpa SOCKS5 auth)',
  },
  {
    criterion: 'Force Zoom, Anti Pull-to-Refresh & Orientasi Full Screen',
    chromiumFork: 'Native via WebPreferences::force_enable_zoom + OverscrollController + Compose',
    geckoView: 'Didukung sebagian lewat GeckoSessionSettings',
    systemWebView: 'Sering dikalahkan oleh meta viewport situs & WebView scroll conflict',
  },
  {
    criterion: 'Passkey (WebAuthn / FIDO2) & Force Dark Mode',
    chromiumFork: 'Native Credential Manager API + Blink AutoDarkMode per situs',
    geckoView: 'Passkey didukung di Android 14+, Force Dark perlu ekstensi terpisah',
    systemWebView: 'Passkey sering gagal pada cross-origin iframe',
  },
];

export const TECH_STACK_LAYERS: TechLayerItem[] = [
  {
    id: 'engine',
    layer: 'Browser Engine Core',
    technology: 'Custom Chromium Fork (basis Cromite / Ungoogled-Chromium) + Patch WebExtensions',
    role: 'Menyediakan engine Blink, V8, Skia, dukungan ekstensi .crx Manifest V3, AutoDarkMode, Force Zoom, serta kontrol penuh compositor & jaringan.',
    rationale: 'Satu-satunya jalur produksi yang mendukung MetaMask, Rabby, Phantom, dan lokal CDP DevTools sekaligus sambil menjaga kecepatan WebGL2/WebGPU desktop.',
  },
  {
    id: 'ui-shell',
    layer: 'Android UI Shell, Orientasi Full Screen & Compositor Host',
    technology: 'Kotlin + Jetpack Compose + WindowInsetsController + Activity Orientation Lock',
    role: 'Menangani antarmuka editorial ala Claude, jendela pop-up fleksibel, mode Full Screen Vertikal/Horizontal dengan kunci orientasi (Auto/Portrait/Landscape) tanpa reload, serta kontrol anti pull-to-refresh.',
    rationale: 'Menangani configChanges="orientation|screenSize|smallestScreenSize" di level Activity memastikan perpindahan potret-lanskap saat Full Screen langsung me-reflow viewport & DevTools tanpa memutus sesi game.',
  },
  {
    id: 'mobile-devtools',
    layer: 'Mobile-First DevTools & Touch Inspector',
    technology: 'Local DevToolsAgentHost (CDP) + Compose Touch-First Inspector + IME Code Accessory Bar',
    role: 'Menghadirkan Elements (touch-to-inspect dengan kaca pembesar), Console terintegrasi Terminal, Network monitor, Application Storage editor, dan mini overlay FPS — semuanya dengan touch target ≥ 44dp.',
    rationale: 'UI DevTools desktop standar tidak layak dipakai di layar 6 inci; membangun shell UI sentuh di atas protokol CDP native memberi akurasi 100% Chrome DevTools dengan ergonomi mobile sejati.',
  },
  {
    id: 'extensions',
    layer: 'Multi-Profil Container & Extension (.crx) Subsystem',
    technology: 'Isolated BrowserContext / StoragePartition + Chromium //extensions (MV3)',
    role: 'Memisahkan Cookie, Cache, IndexedDB, Ekstensi Wallet, dan Proxy antar profil/kontainer akun, serta membatasi RAM per ekstensi.',
    rationale: 'Pemain Web3 multi-akun dapat berpindah profil tanpa logout atau takut kebocoran cookie/fingerprint antar sesi.',
  },
  {
    id: 'network-proxy',
    layer: 'Network, Per-Session Proxy, Ad-Blocker & Page Utilities',
    technology: 'Chromium NetworkContext + ProxyConfigService + EasyList Adblock + On-Device Translation & PDF Print',
    role: 'Mengatur proxy HTTP/HTTPS/SOCKS5 berautentikasi per profil/sesi, pemblokiran iklan/pelacak ringan, terjemahan halaman lokal, simpan PDF/offline, dan ekspor/impor JSON pengaturan.',
    rationale: 'Semua berjalan di lapisan lokal/native tanpa memerlukan layanan cloud eksternal maupun membebani proses renderer game.',
  },
  {
    id: 'security-vault',
    layer: 'Keamanan, Passkey & Granular Site Permissions',
    technology: 'AndroidX Credential Manager (FIDO2) + BiometricPrompt + SQLCipher + ContentSettingsMap',
    role: 'Mengelola Passkey, brankas kata sandi terenkripsi lokal/eksternal, serta izin granular per situs (Clipboard, Notifikasi, Kamera, Mikrofon, Lokasi, Pop-up, Autoplay).',
    rationale: 'Kunci enkripsi disimpan di hardware-backed Keystore (TEE/StrongBox) dan kebijakan izin per origin ditegakkan langsung di Browser Process.',
  },
];

export const ARCHITECTURE_MODULES: ArchitectureModule[] = [
  {
    id: 'desktop-spoof',
    name: 'Desktop Environment, Smart Zoom & Viewport Engine',
    layer: 'Browser Core & Session',
    process: 'Renderer Sandbox (Blink/V8)',
    summary: 'Mengemulasikan lingkungan PC desktop penuh sekaligus menyediakan Pinch-to-Zoom mulus, Paksa Zoom, penyimpanan zoom per situs, dan kunci anti pull-to-refresh.',
    responsibilities: [
      'Override User-Agent, Sec-CH-UA Client Hints, resolusi virtual (1280×720 hingga 1920×1080), dan pointer mouse virtual.',
      'Force Enable Zoom (mengabaikan user-scalable=no pada meta viewport) dan persistensi level zoom per origin secara otomatis.',
      'Mengintersepsi OverscrollRefreshHandler untuk mematikan pull-to-refresh secara global maupun khusus per situs game.',
    ],
    ipcContract: 'ViewportAndZoomConfigMojom (UI Process -> RenderWidgetHostViewAndroid)',
  },
  {
    id: 'mobile-devtools',
    name: 'Mobile-First DevTools & Touch-to-Inspect Engine',
    layer: 'Mobile DevTools & Inspection',
    process: 'UI Process (Kotlin)',
    summary: 'Chrome DevTools lengkap bergaya mobile dengan target sentuh ≥ 44dp, kaca pembesar inspector, bar pintas simbol di atas keyboard virtual, dan 4 mode tata letak adaptif.',
    responsibilities: [
      'Menghubungkan panel Elements, Console, Network, Application Storage, dan Performance Overlay ke Local DevToolsAgentHost (CDP).',
      'Mode Touch-to-Inspect: menerjemahkan koordinat sentuh menjadi CDP DOM.getNodeForLocation + Overlay highlight dan kaca pembesar presisi.',
      'Tata letak adaptif otomatis: split-screen atas-bawah (potret) / kiri-kanan (lanskap), jendela mengambang resizable, layar penuh DevTools, atau promosi ke tab terpisah.',
    ],
    ipcContract: 'LocalDevToolsPipe (CDP JSON-RPC) <-> ComposeDevToolsHost',
  },
  {
    id: 'anti-redirect',
    name: 'Smart Navigation Guard (Anti-Redirect Pintar)',
    layer: 'Navigation & Security',
    process: 'Browser Process (C++/JNI)',
    summary: 'Mengunci 100% media sosial (X, Discord, Telegram) di dalam browser, namun menyediakan Whitelist terverifikasi untuk deep-link aplikasi wallet resmi (Rabby Wallet / WalletConnect).',
    responsibilities: [
      'Memblokir 100% skema media sosial (twitter://, x://, discord://, tg://, App Links) agar OAuth selalu tetap di Pop-up Fleksibel internal.',
      'Menyediakan Daftar Izin (Whitelist) Aplikasi Wallet Eksternal (default aktif untuk Rabby Wallet) yang meneruskan rabby:// & wc:// setelah konfirmasi singkat pengguna.',
      'Menerapkan kontrol izin situs granular (Clipboard, Kamera, Mikrofon, Lokasi, Notifikasi, Pop-up, Autoplay) dan toggle Whitelist Wallet per origin di ikon gembok 🔒.',
    ],
    ipcContract: 'NavigationThrottle::WillStartRequest + WalletWhitelistPolicy + HostContentSettingsMap',
  },
  {
    id: 'flexible-popup',
    name: 'Flexible Pop-up & Full Screen Orientation Coordinator',
    layer: 'Presentation (Compose UI)',
    process: 'UI Process (Kotlin)',
    summary: 'Mengelola jendela pop-up draggable/resizable dengan WebContents reparenting serta kontrol orientasi Full Screen (Auto, Kunci Vertikal, Kunci Horizontal) tanpa reload.',
    responsibilities: [
      'Mempertahankan WebContents aktif saat pengguna menekan "Buka di Tab Baru" maupun saat orientasi Full Screen berpindah antara Potret dan Lanskap.',
      'Menyediakan tombol melayang semi-transparan untuk keluar Full Screen atau mengunci orientasi seketika saat bermain.',
      'Memicu auto-reflow pada skala viewport game dan split-screen DevTools setiap kali orientasi berubah.',
    ],
    ipcContract: 'WebContentsDelegate::AddNewContents + OrientationLockController',
  },
  {
    id: 'render-control',
    name: 'Manual Render, DPR, FPS & Force Dark Stabilizer',
    layer: 'Rendering & Media',
    process: 'Browser Process (C++/JNI)',
    summary: 'Kendali manual real-time atas skala render GPU, batas FPS, mode hemat grafis, Force Dark Mode, serta hibernasi tab.',
    responsibilities: [
      'Mengubah Render Scale / DPR (0.5x–1.5x) dan membatasi FPS (30/45/60/Unlimited) lewat BeginFrameSource tanpa reload.',
      'Mengaktifkan Blink AutoDarkMode untuk situs tanpa tema gelap serta mode Hemat Grafis untuk stabilitas suhu.',
      'Hibernasi tab latar otomatis (SetPageFrozen) dan pembersihan memori V8 (GC) satu ketukan.',
    ],
    ipcContract: 'RenderThrottleController -> Viz DisplayScheduler + Blink AutoDark',
  },
  {
    id: 'terminal-proxy',
    name: 'Multi-Profile Container, Terminal & Session Proxy',
    layer: 'Network & Automation',
    process: 'Network Service',
    summary: 'Mengisolasi kontainer profil pengguna (cookie, cache, ekstensi, proxy terpisah) serta menyediakan Terminal skrip JS & manajemen proxy real-time.',
    responsibilities: [
      'Setiap profil memiliki direktori StoragePartition sendiri sehingga beberapa akun/wallet berjalan bersih tanpa bentrok.',
      'Sinkronisasi log & eksekusi skrip antara Terminal Mengambang dan Console Mobile DevTools via satu sesi CDP.',
      'Mendukung ekspor/impor konfigurasi JSON (bookmark, profil, zoom per situs, izin) dan simpan halaman PDF/offline.',
    ],
    ipcContract: 'ProfileContainerManager + ProxyConfigServiceAndroid::UpdateProxy()',
  },
];

export const WORKFLOW_BLUEPRINTS: WorkflowBlueprint[] = [
  {
    id: 'mobile-devtools',
    title: 'Mobile-First DevTools, Touch-to-Inspect & Smart Keyboard',
    subtitle: 'Debugging penuh bergaya Chrome DevTools di layar sentuh tanpa PC dengan target ketuk ≥ 44dp dan tata letak adaptif.',
    trigger: 'Pengguna mengetuk tombol mengambang DevTools atau mengaktifkan mode Touch-to-Inspect di atas layar game.',
    outcome: 'Elemen kecil terbidik presisi lewat kaca pembesar, skrip JS cepat diketik dengan bar simbol di atas keyboard, dan request API/Storage bisa diedit instan.',
    steps: [
      {
        step: '01',
        component: 'Adaptive Layout Host (Compose)',
        detail: 'Mendeteksi orientasi layar saat ini: otomatis membuka Split-Screen atas-bawah (Potret) atau kiri-kanan (Lanskap), dengan tombol cepat pindah ke Floating Resizable, Full Screen DevTools, atau Tab Terpisah.',
      },
      {
        step: '02',
        component: 'Touch-to-Inspect Magnifier + CDP DOM',
        detail: 'Saat jari menyentuh layar game, overlay menampilkan kaca pembesar di atas jari dan mengirim koordinat ke CDP DOM.getNodeForLocation untuk menyorot box-model elemen terkecil tanpa tertutup jari.',
      },
      {
        step: '03',
        component: 'IME Smart Code Accessory Bar',
        detail: 'WindowInsets.ime mengangkat area input Console/CSS otomatis tepat di atas keyboard Android disertai bar pintas sentuh besar ({ }, ( ), ;, =, Tab, Paste, Run) serta slider ukuran font kode.',
      },
      {
        step: '04',
        component: 'Unified CDP Stream (Network, Storage, Perf)',
        detail: 'Satu pipa lokal DevToolsAgentHost mengalirkan event Network.requestWillBeSent, Storage CRUD (Cookies/Local/Session/IndexedDB), Console sinkron Terminal, dan overlay mini transparan FPS/RAM.',
      },
    ],
  },
  {
    id: 'fullscreen-profiles',
    title: 'Full Screen Orientasi Manual, Force Zoom & Multi-Profil',
    subtitle: 'Bermain layar penuh tanpa rotasi liar, anti-refresh tidak sengaja, dan isolasi penuh multi-akun Web3.',
    trigger: 'Pengguna mengaktifkan Full Screen, mengunci orientasi Horizontal/Vertikal, atau berpindah Kontainer Profil.',
    outcome: 'Layar terkunci stabil dengan auto-reflow tanpa reload game; zoom per situs tersimpan otomatis dan cookie/proxy/ekstensi terpisah total per profil.',
    steps: [
      {
        step: '01',
        component: 'OrientationLockController (Android Activity)',
        detail: 'Tombol melayang semi-transparan di mode Full Screen mengatur requestedOrientation (UNSPECIFIED / SENSOR_PORTRAIT / SENSOR_LANDSCAPE).',
      },
      {
        step: '02',
        component: 'Zero-Reload Auto-Reflow',
        detail: 'Activity menangkap configChanges="orientation|screenSize" sehingga WebContents tidak dihancurkan; RenderWidgetHostView langsung menghitung ulang Auto-Fit Desktop, Force Zoom per situs, dan posisi Split DevTools.',
      },
      {
        step: '03',
        component: 'Overscroll & Force Zoom Policy',
        detail: 'Mematikan OverscrollRefreshHandler (anti pull-to-refresh global/per situs) dan menyuntikkan WebPreferences::force_enable_zoom agar pinch-to-zoom selalu mulus meski dikunci meta viewport.',
      },
      {
        step: '04',
        component: 'Multi-Profile StoragePartition Switcher',
        detail: 'Memilih profil (misal "Utama" vs "Alt Farming") memuat BrowserContext berbeda lengkap dengan cookie, cache, ekstensi .crx, izin situs, dan konfigurasi proxy yang 100% terisolasi.',
      },
    ],
  },
  {
    id: 'anti-redirect',
    title: 'Aturan Anti-Redirect Pintar (Sosmed 100% Terkunci, Wallet via Whitelist)',
    subtitle: 'Memastikan login X, Discord & Telegram tetap 100% di dalam browser, sekaligus mendukung tanda tangan di aplikasi wallet resmi HP (Rabby Wallet / WalletConnect).',
    trigger: 'Game Web3 memicu OAuth X/Discord (twitter://, discord://) atau koneksi WalletConnect (rabby://, wc://).',
    outcome: 'Aplikasi media sosial diblokir 100% dan dibuka di Pop-up Fleksibel; deep-link wallet resmi di Whitelist diteruskan setelah konfirmasi singkat lalu kembali ke game tanpa reload.',
    steps: [
      {
        step: '01',
        component: 'NavigationThrottle (C++ Blink/Content)',
        detail: 'Menangkap setiap request navigasi utama, sub-frame, dan custom URI scheme sebelum diteruskan ke Android ActivityManager.',
      },
      {
        step: '02',
        component: 'Social Lockdown Policy (Terkunci 100%)',
        detail: 'Memblokir total intent://, twitter://, x://, discord://, tg://, dan Android App Links media sosial, lalu mengonversi ke HTTPS web di Pop-up Fleksibel internal.',
      },
      {
        step: '03',
        component: 'WalletConnect Whitelist Gate (Rabby Default ON)',
        detail: 'Saat mendeteksi skema rabby:// atau wc:// dan aplikasi termasuk Whitelist (dapat diatur via ikon gembok 🔒), menampilkan konfirmasi singkat dengan opsi "Buka Aplikasi Rabby Wallet" atau "Salin URI WalletConnect".',
      },
      {
        step: '04',
        component: 'Zero-Reload Session Return (Kotlin)',
        detail: 'Setelah pengguna menyetujui tanda tangan di aplikasi wallet HP, sesi WalletConnect v2 mengembalikan status terhubung langsung ke tab game tanpa memuat ulang halaman.',
      },
    ],
  },
  {
    id: 'flexible-popup',
    title: 'Pop-up Fleksibel & Promosi ke Tab Baru Tanpa Reload',
    subtitle: 'Menjaga tombol konfirmasi transaksi Web3 selalu utuh dan memindahkan jendela pop-up ke tab penuh secara mulus.',
    trigger: 'Ekstensi MetaMask / Rabby memicu chrome.windows.create({ type: "popup" }) atau OAuth membuka jendela baru.',
    outcome: 'Pengguna bebas menarik sudut ukuran pop-up, memindahkannya, atau memindahkannya ke tab penuh tanpa kehilangan koneksi window.opener.',
    steps: [
      {
        step: '01',
        component: 'ExtensionWindowController',
        detail: 'Menerima permintaan pembuatan popup ekstensi (notification.html) atau window.open() dari situs game.',
      },
      {
        step: '02',
        component: 'Compose FloatingPopupOverlay',
        detail: 'Merender CompositorView dalam container draggable & resizable dengan bar aksi tetap di atas: "Buka di Tab Baru" | "Tetap di Pop-up".',
      },
      {
        step: '03',
        component: 'Dynamic Viewport Reflow',
        detail: 'Saat sudut pop-up ditarik, dimensi baru dikirim ke RenderWidgetHostViewAndroid agar tombol "Confirm" tidak pernah terpotong.',
      },
      {
        step: '04',
        component: 'Zero-Reload WebContents Reparenting',
        detail: 'Saat "Buka di Tab Baru" ditekan, WebContents dilepas dari PopupHost dan dipasang ke TabModel aktif tanpa reload.',
      },
    ],
  },
  {
    id: 'terminal-proxy',
    title: 'Terminal Terintegrasi, Script Runner & Proxy Per-Sesi',
    subtitle: 'Injeksi JavaScript real-time yang tersinkron dengan Console DevTools dan pergantian proxy HTTP/HTTPS/SOCKS5.',
    trigger: 'Pengguna membuka Terminal mengambang, menempel skrip JS, atau mengetik perintah proxy.',
    outcome: 'Skrip dieksekusi di world halaman game aktif dan seluruh trafik sesi/profil dialihkan lewat proxy terautentikasi.',
    steps: [
      {
        step: '01',
        component: 'FloatingTerminalSheet (Compose)',
        detail: 'Panel overlay yang dapat diubah ukurannya, di-dock ke bawah, atau diminimalkan menjadi tombol kecil semi-transparan.',
      },
      {
        step: '02',
        component: 'Command Parser & Script Dispatcher',
        detail: 'Memisahkan perintah sistem (proxy set, gc, fps, dpr, tab hibernate) dari blok skrip JavaScript yang ditempel pengguna.',
      },
      {
        step: '03',
        component: 'Shared Local CDP Session',
        detail: 'Mengeksekusi blok JS via Runtime.evaluate dan mengalirkan log yang sama ke panel Terminal maupun Console Mobile DevTools.',
      },
      {
        step: '04',
        component: 'Per-Profile / Per-Session Proxy',
        detail: 'Menerapkan ProxyConfig (HTTP/HTTPS/SOCKS5 + autentikasi) khusus pada StoragePartition profil aktif dan memutus soket lama agar IP langsung berubah.',
      },
    ],
  },
  {
    id: 'render-fps',
    title: 'Kontrol Render Manual, Pembatas FPS & Hibernasi Tab',
    subtitle: 'Menjaga suhu HP kelas menengah tetap adem dan frame rate stabil saat sesi grinding game Web3 panjang.',
    trigger: 'Pengguna mengubah Render Scale (0.5x–1.5x), memilih batas 30/45/60 FPS, atau mengaktifkan Mode Hemat Grafis.',
    outcome: 'Beban GPU turun hingga 55% pada skala 0.75x dan penggunaan RAM berkurang drastis lewat hibernasi tab latar.',
    steps: [
      {
        step: '01',
        component: 'RenderControlPanel & Mini FPS Overlay',
        detail: 'Menangkap perubahan pengguna secara real-time tanpa reload halaman dan menampilkan metrik pada mini overlay transparan.',
      },
      {
        step: '02',
        component: 'Dynamic DPR & Canvas Resolution Hook',
        detail: 'Menyesuaikan scale factor framebuffer dan mengekspos window.devicePixelRatio (0.5x–1.5x) untuk memangkas beban shader WebGL.',
      },
      {
        step: '03',
        component: 'Frame Pacing & FPS Limiter',
        detail: 'Mengatur interval BeginFrameSource (33.3ms untuk 30 FPS, 22.2ms untuk 45 FPS, 16.6ms untuk 60 FPS) guna mencegah thermal throttling.',
      },
      {
        step: '04',
        component: 'Memory Pressure & Tab Hibernation',
        detail: 'Tab latar otomatis dibekukan (SetPageFrozen) dan memori V8/Blink dilepas lewat MemoryPressureListener.',
      },
    ],
  },
];

export const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    id: 'phase-1',
    phase: 'Fase 1',
    title: 'MVP Core Desktop Engine, Smart Zoom & Orientasi Full Screen',
    duration: 'Minggu 1 – 6',
    target: 'Browser Android ringan berkemampuan desktop penuh dengan layar penuh Potret/Lanskap terkunci & anti-refresh.',
    deliverables: [
      'Setup build pipeline Chromium Android (basis Cromite) tanpa telemetri + Desktop User-Agent, Client Hints, dan mouse virtual.',
      'Mesin Auto-Fit Desktop, Pinch-to-Zoom mulus, Paksa Zoom (override user-scalable=no), serta penyimpanan level zoom otomatis per situs.',
      'Mode Layar Penuh manual (Horizontal & Vertikal) dengan kunci orientasi Auto / Portrait / Landscape dan auto-reflow tanpa reload.',
      'Toggle Anti Pull-to-Refresh (global & per situs), antarmuka editorial ala Claude (Terang/Gelap), serta hibernasi tab & GC manual.',
    ],
    acceptanceCriteria: [
      'Cold start < 1,2 detik di Snapdragon 680 (6 GB RAM) dengan 0 reload saat transisi orientasi Full Screen.',
      '100% lulus deteksi desktop + Paksa Zoom berfungsi pada situs game yang mengunci meta viewport.',
    ],
  },
  {
    id: 'phase-2',
    phase: 'Fase 2',
    title: 'Anti-Redirect Lockdown, Pop-up Fleksibel & Kontrol Render FPS',
    duration: 'Minggu 7 – 11',
    target: 'Alur login sosial & wallet terkunci di dalam browser disertai stabilitas FPS manual.',
    deliverables: [
      'Patch ExternalNavigationHandler & NavigationThrottle untuk memblokir seluruh deep link (X, Discord, Telegram, mobile wallet).',
      'Jendela Pop-up Fleksibel draggable & resizable dengan tombol wajib "Buka di Tab Baru" (WebContents reparenting tanpa reload) dan "Tetap di Pop-up".',
      'Panel Kontrol Render real-time: Render Scale (0.5x–1.5x), FPS Limiter (30/45/60/Unlimited), Hardware Acceleration, Mode Hemat Grafis, dan Force Dark Mode.',
      'Mini overlay transparan Performance/FPS Monitor di atas layar game.',
    ],
    acceptanceCriteria: [
      '0 redirect ke aplikasi luar saat login X/Discord dan koneksi wallet pada 20 dApp populer.',
      'Stabilitas frame time (< 2ms jitter pada target 30/45 FPS) selama sesi game 45 menit.',
    ],
  },
  {
    id: 'phase-3',
    phase: 'Fase 3',
    title: 'Ekstensi Chrome (.crx), Mobile-First DevTools & Terminal/Proxy',
    duration: 'Minggu 12 – 18',
    target: 'Dukungan penuh ekosistem ekstensi Web3, DevTools layar sentuh lengkap, dan automasi terminal/proxy.',
    deliverables: [
      'Subsistem WebExtensions (MV3) + pemasangan dari Chrome Web Store & file .crx lokal (MetaMask, Rabby, Phantom).',
      'Mobile-First DevTools lengkap (Elements dengan Touch-to-Inspect & kaca pembesar, Console terintegrasi Terminal, Network monitor, Application Storage CRUD, Performance overlay).',
      'Ergonomi sentuh DevTools: target ≥ 44dp, slider ukuran font kode, tata letak adaptif (Split Potret/Lanskap, Floating, Full Screen, Tab Terpisah), dan Smart Keyboard Accessory Bar ({ }, ( ), ;, =, Tab, Paste, Run).',
      'Terminal mengambang + manajemen Proxy HTTP/HTTPS/SOCKS5 berautentikasi per sesi lewat CLI dan UI cepat.',
    ],
    acceptanceCriteria: [
      'Touch-to-Inspect membidik elemen < 24dp dengan akurasi tinggi dan Console tetap terlihat di atas keyboard virtual Android.',
      'Transaksi EIP-1559/EIP-712 berhasil 100% dan pergantian proxy SOCKS5 efektif dalam < 300ms.',
    ],
  },
  {
    id: 'phase-4',
    phase: 'Fase 4',
    title: 'Multi-Profil Isolasi, Passkey, Izin Granular & Utilitas Lengkap',
    duration: 'Minggu 19 – 24',
    target: 'Isolasi multi-akun Web3, keamanan FIDO2, kontrol izin situs penuh, dan fitur utilitas harian siap rilis beta.',
    deliverables: [
      'Multi-Profil & Kontainer Sesi terisolasi (Cookie, Cache, Ekstensi .crx, dan Proxy terpisah penuh per profil).',
      'Kontrol Izin Situs Granular per origin (Clipboard, Notifikasi, Kamera, Mikrofon, Lokasi, Pop-up, Autoplay).',
      'Passkey (WebAuthn/FIDO2) via Android Credential Manager, BiometricPrompt, brankas sandi terenkripsi + sinkronisasi eksternal.',
      'Terjemahan halaman bawaan, simpan halaman sebagai PDF/offline, ekspor/impor JSON bookmark & pengaturan, ad-blocker ringan, dan uji soak test.',
    ],
    acceptanceCriteria: [
      '0 kebocoran cookie/storage antar profil kontainer pada pengujian isolasi multi-wallet.',
      'RAM stabil < 520 MB saat 1 game WebGL aktif + 1 wallet + Mobile DevTools diminimalkan + 5 tab latar terhibernasi.',
    ],
  },
];

export const STARTER_CODE_FILES: StarterCodeFile[] = [
  {
    id: 'mobile-devtools-kt',
    filename: 'MobileDevToolsController.kt',
    path: 'app/src/main/java/id/karsa/browser/devtools/MobileDevToolsController.kt',
    language: 'Kotlin',
    module: 'Mobile-First DevTools & Touch Inspector',
    summary: 'Kontroler Mobile DevTools berbasis Local CDP: Touch-to-Inspect dengan kaca pembesar, tata letak adaptif (Split/Floating/FullScreen/Tab), dan bar pintas simbol di atas keyboard virtual.',
    code: `package id.karsa.browser.devtools

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.json.JSONObject

enum class DevToolsLayoutMode { SPLIT_ADAPTIVE, FLOATING, FULLSCREEN, SEPARATE_TAB }
enum class DevToolsPanel { ELEMENTS, CONSOLE, NETWORK, STORAGE, PERFORMANCE }

class MobileDevToolsController(
    private val cdpPipe: LocalCdpPipe
) {
    /**
     * Touch-to-Inspect: menerjemahkan koordinat sentuh jari + offset kaca pembesar
     * menjadi node DOM presisi lewat Chrome DevTools Protocol lokal.
     */
    suspend fun inspectNodeAtTouch(xCssPx: Int, yCssPx: Int): JSONObject {
        val params = JSONObject()
            .put("x", xCssPx)
            .put("y", yCssPx)
            .put("includeUserAgentShadowDOM", false)

        val nodeResult = cdpPipe.sendCommand("DOM.getNodeForLocation", params)
        val backendNodeId = nodeResult.optInt("backendNodeId")

        if (backendNodeId > 0) {
            cdpPipe.sendCommand(
                "Overlay.highlightNode",
                JSONObject()
                    .put("backendNodeId", backendNodeId)
                    .put("highlightConfig", JSONObject().put("showInfo", true))
            )
        }
        return nodeResult
    }

    suspend fun evaluateConsoleExpression(jsCode: String): String {
        val params = JSONObject()
            .put("expression", jsCode)
            .put("awaitPromise", true)
            .put("returnByValue", true)
        return cdpPipe.sendCommand("Runtime.evaluate", params).toString()
    }
}

/**
 * Smart Mobile Keyboard Accessory Bar — otomatis terangkat tepat di atas keyboard virtual
 * menggunakan Modifier.imePadding(), dengan ukuran tombol >= 44dp agar anti salah pencet.
 */
@Composable
fun CodeKeyboardAccessoryBar(
    onInsertToken: (String) -> Unit,
    onPaste: () -> Unit,
    onRun: () -> Unit
) {
    val tokens = listOf("{ }", "( )", ";", "=", "=>", "Tab")
    Surface(
        tonalElevation = 4.dp,
        modifier = Modifier
            .fillMaxWidth()
            .imePadding() // Otomatis naik di atas keyboard virtual Android
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            tokens.forEach { token ->
                OutlinedButton(
                    onClick = { onInsertToken(if (token == "Tab") "  " else token) },
                    modifier = Modifier.defaultMinSize(minWidth = 44.dp, minHeight = 44.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp)
                ) {
                    Text(token)
                }
            }
            FilledTonalButton(
                onClick = onPaste,
                modifier = Modifier.defaultMinSize(minHeight = 44.dp)
            ) { Text("Paste") }
            Button(
                onClick = onRun,
                modifier = Modifier.defaultMinSize(minHeight = 44.dp)
            ) { Text("Run") }
        }
    }
}

interface LocalCdpPipe {
    suspend fun sendCommand(method: String, params: JSONObject): JSONObject
}`,
  },
  {
    id: 'fullscreen-profile-kt',
    filename: 'FullScreenOrientationAndProfileManager.kt',
    path: 'app/src/main/java/id/karsa/browser/session/FullScreenOrientationAndProfileManager.kt',
    language: 'Kotlin',
    module: 'Orientasi Full Screen, Force Zoom & Multi-Profil',
    summary: 'Mengunci orientasi Vertikal/Horizontal saat Full Screen tanpa reload game, mengaktifkan Paksa Zoom & Anti Pull-to-Refresh per situs, serta isolasi kontainer Multi-Profil.',
    code: `package id.karsa.browser.session

import android.app.Activity
import android.content.pm.ActivityInfo
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

enum class OrientationLock { AUTO, PORTRAIT, LANDSCAPE }

data class SiteZoomAndScrollPolicy(
    val origin: String,
    val savedZoomPercent: Int = 100,
    val forceEnableZoom: Boolean = true,
    val disablePullToRefresh: Boolean = true,
    val forceDarkMode: Boolean = false
)

data class IsolatedProfileContainer(
    val profileId: String,
    val displayName: String,
    val storagePartitionPath: String, // Direktori cookie, cache, IDB & ekstensi terpisah
    val proxyUri: String? = null
)

class FullScreenOrientationAndProfileManager(
    private val activity: Activity,
    private val engineBridge: EnginePolicyBridge
) {
    /**
     * Pastikan AndroidManifest.xml menyertakan:
     * android:configChanges="orientation|screenSize|smallestScreenSize|keyboardHidden"
     * agar perpindahan Potret <-> Lanskap tidak pernah me-reload halaman game.
     */
    fun setFullScreenAndOrientation(enabled: Boolean, lock: OrientationLock) {
        val controller = WindowCompat.getInsetsController(activity.window, activity.window.decorView)
        controller.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

        if (enabled) {
            controller.hide(WindowInsetsCompat.Type.systemBars())
        } else {
            controller.show(WindowInsetsCompat.Type.systemBars())
        }

        activity.requestedOrientation = when (lock) {
            OrientationLock.AUTO -> ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
            OrientationLock.PORTRAIT -> ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT
            OrientationLock.LANDSCAPE -> ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
        }

        // Memicu reflow desktop viewport & split-screen DevTools tanpa reload WebContents
        engineBridge.notifyViewportAutoReflow()
    }

    fun applySitePolicy(policy: SiteZoomAndScrollPolicy) {
        engineBridge.setForceEnableZoom(policy.forceEnableZoom)
        engineBridge.setSavedSiteZoom(policy.origin, policy.savedZoomPercent)
        engineBridge.setPullToRefreshEnabled(policy.origin, !policy.disablePullToRefresh)
        engineBridge.setAutoDarkMode(policy.origin, policy.forceDarkMode)
    }

    fun switchIsolatedProfile(profile: IsolatedProfileContainer) {
        // Memuat BrowserContext & StoragePartition terpisah (Cookie, Ekstensi .crx, Proxy)
        engineBridge.activateBrowserContext(
            profileId = profile.profileId,
            partitionPath = profile.storagePartitionPath,
            proxyUri = profile.proxyUri
        )
    }
}

interface EnginePolicyBridge {
    fun notifyViewportAutoReflow()
    fun setForceEnableZoom(enabled: Boolean)
    fun setSavedSiteZoom(origin: String, percent: Int)
    fun setPullToRefreshEnabled(origin: String, enabled: Boolean)
    fun setAutoDarkMode(origin: String, enabled: Boolean)
    fun activateBrowserContext(profileId: String, partitionPath: String, proxyUri: String?)
}`,
  },
  {
    id: 'nav-guard',
    filename: 'InternalNavigationDelegate.kt',
    path: 'app/src/main/java/id/karsa/browser/navigation/InternalNavigationDelegate.kt',
    language: 'Kotlin',
    module: 'Anti-Redirect Pintar & Whitelist WalletConnect',
    summary: 'Mengunci 100% deep link & App Links media sosial (X, Discord, Telegram) ke Pop-up Fleksibel, sambil mengizinkan penerusan deep-link rabby:// & wc:// khusus aplikasi wallet resmi di Whitelist.',
    code: `package id.karsa.browser.navigation

import android.net.Uri
import java.net.URLDecoder

data class WalletWhitelistPolicy(
    val enabled: Boolean = true,
    val allowedSchemes: Set<String> = setOf("rabby", "wc"),
    val allowedPackages: Map<String, String> = mapOf(
        "rabby" to "com.debank.rabbymobile",
        "metamask" to "io.metamask",
        "phantom" to "app.phantom",
        "okx" to "com.okinc.okex.gp"
    )
)

sealed class NavigationDecision {
    data object AllowInCurrentTab : NavigationDecision()
    data class OpenInFlexiblePopup(
        val resolvedUrl: String,
        val blockedScheme: String?,
        val reason: String
    ) : NavigationDecision()
    data class ForwardToExternalWalletApp(
        val deepLinkUri: String,
        val targetPackage: String?,
        val scheme: String
    ) : NavigationDecision()
    data class BlockSilently(val rawUrl: String) : NavigationDecision()
}

class InternalNavigationDelegate(
    private var walletPolicy: WalletWhitelistPolicy = WalletWhitelistPolicy()
) {

    // Media sosial & store selalu 100% terkunci — tidak pernah keluar dari Karsa Browser
    private val lockedSocialSchemes = setOf(
        "intent", "twitter", "x", "discord", "tg", "telegram", "market"
    )

    private val walletSchemes = setOf("rabby", "wc", "metamask", "phantom", "okx")

    private val oauthPopupHosts = setOf(
        "x.com", "twitter.com", "api.twitter.com",
        "discord.com", "oauth.telegram.org", "accounts.google.com"
    )

    fun updateWalletWhitelist(policy: WalletWhitelistPolicy) {
        walletPolicy = policy
    }

    fun interceptNavigation(rawUrl: String, isPopupRequest: Boolean): NavigationDecision {
        val uri = runCatching { Uri.parse(rawUrl) }.getOrNull()
            ?: return NavigationDecision.BlockSilently(rawUrl)

        val scheme = uri.scheme?.lowercase().orEmpty()

        // 1. Whitelist WalletConnect: izinkan deep-link aplikasi wallet resmi jika aktif
        if (scheme in walletSchemes) {
            return if (walletPolicy.enabled && scheme in walletPolicy.allowedSchemes) {
                NavigationDecision.ForwardToExternalWalletApp(
                    deepLinkUri = rawUrl,
                    targetPackage = walletPolicy.allowedPackages[scheme],
                    scheme = "$scheme://"
                )
            } else {
                NavigationDecision.OpenInFlexiblePopup(
                    resolvedUrl = rawUrl,
                    blockedScheme = "$scheme://",
                    reason = "Wallet eksternal tidak berada di Whitelist — ditahan di Pop-up Fleksibel"
                )
            }
        }

        // 2. Blokir 100% seluruh intent:// dan skema aplikasi media sosial
        if (scheme in lockedSocialSchemes) {
            val fallbackWebUrl = extractFallbackWebUrl(rawUrl, uri, scheme)
            return if (fallbackWebUrl != null) {
                NavigationDecision.OpenInFlexiblePopup(
                    resolvedUrl = fallbackWebUrl,
                    blockedScheme = "$scheme://",
                    reason = "Anti-Redirect 100%: aplikasi media sosial diblokir — dialihkan ke Pop-up Fleksibel"
                )
            } else {
                NavigationDecision.BlockSilently(rawUrl)
            }
        }

        // 3. Paksa alur OAuth media sosial tetap masuk Pop-up Fleksibel internal
        val host = uri.host?.lowercase().orEmpty()
        val isAuthPath = uri.path?.contains("oauth", ignoreCase = true) == true ||
            uri.path?.contains("authorize", ignoreCase = true) == true

        if (isPopupRequest || (host in oauthPopupHosts && isAuthPath)) {
            return NavigationDecision.OpenInFlexiblePopup(
                resolvedUrl = rawUrl,
                blockedScheme = null,
                reason = "Otorisasi ditangani di Pop-up Fleksibel internal"
            )
        }

        return NavigationDecision.AllowInCurrentTab
    }

    private fun extractFallbackWebUrl(rawUrl: String, uri: Uri, scheme: String): String? {
        if (scheme == "intent") {
            val fallbackRegex = Regex("S\\.browser_fallback_url=([^;]+)")
            val encoded = fallbackRegex.find(rawUrl)?.groupValues?.getOrNull(1)
            if (encoded != null) return URLDecoder.decode(encoded, "UTF-8")

            val host = uri.host ?: return null
            val path = uri.encodedPath.orEmpty()
            val query = uri.encodedQuery?.let { "?$it" }.orEmpty()
            return "https://$host$path$query"
        }

        return when (scheme) {
            "twitter", "x" -> "https://x.com/i/flow/login"
            "discord" -> "https://discord.com/login"
            "tg", "telegram" -> "https://web.telegram.org/"
            else -> null
        }
    }
}`,
  },
  {
    id: 'flexible-popup',
    filename: 'FlexiblePopupWindow.kt',
    path: 'app/src/main/java/id/karsa/browser/ui/popup/FlexiblePopupWindow.kt',
    language: 'Kotlin',
    module: 'Pop-up Fleksibel & Reparenting',
    summary: 'Komponen Jetpack Compose pop-up draggable & resizable dengan bar aksi wajib "Buka di Tab Baru" dan "Tetap di Pop-up" yang memindahkan WebContents tanpa reload.',
    code: `package id.karsa.browser.ui.popup

import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import kotlin.math.roundToInt

data class PopupWindowState(
    val webContentsId: Long,
    val title: String,
    val url: String,
    val blockedIntentNotice: String? = null
)

@Composable
fun FlexiblePopupWindow(
    state: PopupWindowState,
    onPromoteToNewTab: (webContentsId: Long) -> Unit,
    onKeepInPopup: () -> Unit,
    onResizeViewport: (widthPx: Int, heightPx: Int) -> Unit,
    onClose: () -> Unit,
    webContentSlot: @Composable (Modifier) -> Unit
) {
    var offsetX by remember { mutableFloatStateOf(24f) }
    var offsetY by remember { mutableFloatStateOf(48f) }
    var windowSize by remember { mutableStateOf(DpSize(360.dp, 460.dp)) }

    Surface(
        modifier = Modifier
            .offset { IntOffset(offsetX.roundToInt(), offsetY.roundToInt()) }
            .size(windowSize),
        shape = MaterialTheme.shapes.large,
        tonalElevation = 6.dp
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .pointerInput(Unit) {
                        detectDragGestures { change, dragAmount ->
                            change.consume()
                            offsetX += dragAmount.x
                            offsetY += dragAmount.y
                        }
                    }
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilledTonalButton(
                        onClick = { onPromoteToNewTab(state.webContentsId) }
                    ) { Text("Buka di Tab Baru") }
                    OutlinedButton(onClick = onKeepInPopup) {
                        Text("Tetap di Pop-up")
                    }
                }
                TextButton(onClick = onClose) { Text("Tutup") }
            }

            Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
                webContentSlot(Modifier.fillMaxSize())
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .pointerInput(Unit) {
                            detectDragGestures { change, drag ->
                                change.consume()
                                val nextW = (windowSize.width + drag.x.toDp()).coerceIn(280.dp, 680.dp)
                                val nextH = (windowSize.height + drag.y.toDp()).coerceIn(300.dp, 620.dp)
                                windowSize = DpSize(nextW, nextH)
                                onResizeViewport(nextW.value.toInt(), nextH.value.toInt())
                            }
                        }
                )
            }
        }
    }
}`,
  },
  {
    id: 'desktop-spoof',
    filename: 'DesktopSpoofInjector.js',
    path: 'chromium_patches/karsa/injections/DesktopSpoofInjector.js',
    language: 'JavaScript',
    module: 'Desktop Spoofing & Viewport Virtual',
    summary: 'Injeksi document-start untuk spoofing User-Agent Desktop, Client Hints, resolusi virtual (1280×720–1920×1080), pointer mouse, dan Render Scale (DPR).',
    code: `(() => {
  'use strict';
  const cfg = window.__KARSA_CONFIG__ || {
    width: 1600,
    height: 900,
    dpr: 1.0,
    forceZoom: true,
  };

  // 1. Desktop Navigator & Client Hints Spoofing
  Object.defineProperties(Navigator.prototype, {
    platform: { get: () => 'Win32' },
    maxTouchPoints: { get: () => 0 },
    hardwareConcurrency: { get: () => 8 },
    deviceMemory: { get: () => 8 },
  });

  // 2. Paksa Zoom: hapus kunci user-scalable=no dari meta viewport situs
  if (cfg.forceZoom) {
    const unlockViewport = () => {
      const meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.setAttribute(
          'content',
          'width=' + cfg.width + ', initial-scale=1.0, user-scalable=yes, maximum-scale=5.0'
        );
      }
    };
    document.addEventListener('DOMContentLoaded', unlockViewport, { once: true });
  }

  // 3. Virtual Desktop Screen Metrics & Render Scale (DPR)
  Object.defineProperties(window.screen, {
    width: { get: () => cfg.width },
    height: { get: () => cfg.height },
    availWidth: { get: () => cfg.width },
    availHeight: { get: () => cfg.height - 40 },
  });
  Object.defineProperty(window, 'devicePixelRatio', {
    get: () => cfg.dpr,
    configurable: true,
  });
})();`,
  },
  {
    id: 'render-fps',
    filename: 'RenderControlBridge.cpp',
    path: 'chromium_patches/karsa/renderer/RenderControlBridge.cpp',
    language: 'C++',
    module: 'Kontrol Render, DPR & FPS Limiter',
    summary: 'Kontrol native Chromium pada BeginFrameSource & WebContents untuk pembatasan FPS manual (30/45/60/Unlimited), DPR scaling, Force Dark, dan hibernasi tab.',
    code: `#include "karsa/renderer/render_control_bridge.h"
#include "base/time/time.h"
#include "content/public/browser/render_widget_host_view.h"
#include "content/public/browser/web_contents.h"

namespace karsa {

void RenderControlBridge::ApplyRenderProfile(
    content::WebContents* web_contents,
    float render_scale_dpr,
    int fps_limit,
    bool graphics_saver_mode) {
  if (!web_contents) return;

  const float clamped_dpr = std::clamp(render_scale_dpr, 0.5f, 1.5f);
  if (auto* rwhv = web_contents->GetRenderWidgetHostView()) {
    rwhv->SetDeviceScaleFactorOverride(clamped_dpr);
  }

  base::TimeDelta frame_interval = fps_limit > 0
      ? base::Microseconds(1000000 / std::clamp(fps_limit, 15, 120))
      : base::TimeDelta();

  web_contents->SetPreferredFrameInterval(frame_interval);

  if (graphics_saver_mode) {
    web_contents->GetPrimaryMainFrame()->InsertCSS(
        u"*, *::before, *::after { "
        u"backdrop-filter: none !important; "
        u"box-shadow: none !important; "
        u"animation-duration: 0.01ms !important; }");
  }
}

void RenderControlBridge::HibernateInactiveTab(content::WebContents* tab) {
  if (!tab || tab->GetVisibility() == content::Visibility::VISIBLE) return;
  tab->SetPageFrozen(true);
  tab->GetPrimaryMainFrame()->GetProcess()->PurgeAndSuspend();
}

}  // namespace karsa`,
  },
  {
    id: 'proxy-session',
    filename: 'ProxySessionManager.kt',
    path: 'app/src/main/java/id/karsa/browser/network/ProxySessionManager.kt',
    language: 'Kotlin',
    module: 'Proxy Manager & Terminal Parser',
    summary: 'Parser perintah terminal proxy (HTTP/HTTPS/SOCKS5 + autentikasi) dan penerapannya ke NetworkContext per sesi/profil secara real-time.',
    code: `package id.karsa.browser.network

import java.net.URI

data class SessionProxyConfig(
    val protocol: String, // HTTP, HTTPS, SOCKS5, DIRECT
    val host: String = "",
    val port: Int = 0,
    val username: String? = null,
    val password: String? = null,
    val perSessionOnly: Boolean = true
)

class ProxySessionManager(
    private val nativeBridge: ChromiumNetworkBridge
) {
    private var activeConfig = SessionProxyConfig(protocol = "DIRECT")

    fun executeTerminalCommand(commandLine: String): String {
        val parts = commandLine.trim().split(Regex("\\s+"))
        if (parts.isEmpty() || parts[0] != "proxy") {
            return "Format tidak dikenal. Gunakan: proxy <set|off|status>"
        }

        return when (parts.getOrNull(1)) {
            "off" -> {
                activeConfig = SessionProxyConfig(protocol = "DIRECT")
                nativeBridge.applySessionProxy(activeConfig)
                "Proxy dinonaktifkan. Koneksi kembali ke DIRECT."
            }
            "status" -> {
                if (activeConfig.protocol == "DIRECT") "Status Proxy: DIRECT"
                else "Aktif: \${activeConfig.protocol}://\${activeConfig.host}:\${activeConfig.port}"
            }
            "set" -> {
                val rawUri = parts.getOrNull(2)
                    ?: return "Error: Sertakan URI proxy, misal socks5://user:pass@host:1080"
                applyFromUri(rawUri)
            }
            else -> "Sub-perintah tidak valid. Pilih: set, off, atau status."
        }
    }

    private fun applyFromUri(rawUri: String): String {
        val uri = runCatching { URI(rawUri) }.getOrNull()
            ?: return "Error: Format URI proxy tidak valid."
        val scheme = uri.scheme?.uppercase() ?: return "Error: Protokol wajib (http/https/socks5)."
        val userInfo = uri.userInfo?.split(":", limit = 2)
        activeConfig = SessionProxyConfig(
            protocol = scheme,
            host = uri.host ?: return "Error: Host proxy kosong.",
            port = if (uri.port > 0) uri.port else 1080,
            username = userInfo?.getOrNull(0),
            password = userInfo?.getOrNull(1),
            perSessionOnly = true
        )
        nativeBridge.applySessionProxy(activeConfig)
        return "Proxy per-sesi diterapkan: $scheme://\${activeConfig.host}:\${activeConfig.port}"
    }
}

interface ChromiumNetworkBridge {
    fun applySessionProxy(config: SessionProxyConfig)
}`,
  },
  {
    id: 'passkey-bridge',
    filename: 'WebAuthnPasskeyBridge.kt',
    path: 'app/src/main/java/id/karsa/browser/security/WebAuthnPasskeyBridge.kt',
    language: 'Kotlin',
    module: 'Passkey (FIDO2) & Vault Terenkripsi',
    summary: 'Integrasi Android Credential Manager API untuk autentikasi Passkey WebAuthn/FIDO2 dan autofill kata sandi terenkripsi lokal maupun eksternal.',
    code: `package id.karsa.browser.security

import android.content.Context
import androidx.credentials.*

sealed class AuthFillResult {
    data class PasskeyAssertion(val responseJson: String) : AuthFillResult()
    data class PasswordPair(val username: String, val password: String) : AuthFillResult()
    data class Error(val message: String) : AuthFillResult()
}

class WebAuthnPasskeyBridge(private val context: Context) {
    private val credentialManager = CredentialManager.create(context)

    suspend fun requestPasskeyOrPassword(requestJsonFromWebAuthn: String): AuthFillResult {
        val request = GetCredentialRequest(
            credentialOptions = listOf(
                GetPublicKeyCredentialOption(requestJson = requestJsonFromWebAuthn),
                GetPasswordOption()
            )
        )
        return try {
            when (val cred = credentialManager.getCredential(context, request).credential) {
                is PublicKeyCredential -> AuthFillResult.PasskeyAssertion(cred.authenticationResponseJson)
                is PasswordCredential -> AuthFillResult.PasswordPair(cred.id, cred.password)
                else -> AuthFillResult.Error("Tipe kredensial tidak dikenali.")
            }
        } catch (ex: Exception) {
            AuthFillResult.Error("Autentikasi dibatalkan: \${ex.localizedMessage}")
        }
    }
}`,
  },
];
