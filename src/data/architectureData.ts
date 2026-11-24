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
    | 'fullscreen-profiles'
    | 'play-protect-security';
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
  language: 'Kotlin' | 'JavaScript' | 'C++' | 'XML' | 'Gradle' | 'ProGuard' | 'YAML' | 'Profile';
  category?: 'security' | 'core';
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
  {
    id: 'play-protect-security',
    name: 'Keamanan Produksi, Isolasi Script & Kepatuhan Play Protect',
    layer: 'Navigation & Security',
    process: 'Browser Process (C++/JNI)',
    summary: 'Hardening menyeluruh agar APK lolos pemindaian Google Play Protect tanpa peringatan palsu: izin minimal, HTTPS strict, SSL lockdown, isolasi injeksi JS pada OAuth/Wallet, enkripsi Android Keystore, dan Zero Telemetry.',
    responsibilities: [
      'Izin AndroidManifest minimal (hanya INTERNET & ACCESS_NETWORK_STATE), allowBackup="false", usesCleartextTraffic="false", dan network_security_config yang memaksa HTTPS global.',
      'WebView hardening penuh: blokir akses file/content URL, aktifkan Safe Browsing, tolak error SSL secara ketat (handler.cancel() + dialog peringatan), dan matikan remote debugging di build Release.',
      'Script Isolation Guard memblokir eksekusi JavaScript Terminal/Userscript di dalam pop-up OAuth sensitif (X, Discord, Google) & dialog WalletConnect, dipadukan EncryptedSharedPreferences berbasis Android Keystore tanpa telemetri.',
    ],
    ipcContract: 'WebViewSecurityConfig + ScriptIsolationGuard + SecureVault (Android Keystore)',
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
  {
    id: 'play-protect-security',
    title: 'Keamanan Tingkat Produksi, Isolasi Script & Kepatuhan Play Protect',
    subtitle: 'Arsitektur zero-telemetry dengan izin minimal, HTTPS strict, isolasi skrip pada sesi login/wallet, enkripsi Keystore lokal, dan penandatanganan APK Release otomatis.',
    trigger: 'Pengguna memasang APK Release, membuka situs HTTPS/OAuth/Wallet, atau menyimpan sandi/proxy di brankas lokal.',
    outcome: 'Lolos verifikasi Google Play Protect tanpa false-positive, sesi OAuth/Wallet bebas injeksi skrip, dan seluruh kredensial terenkripsi perangkat keras di perangkat.',
    steps: [
      {
        step: '01',
        component: 'Minimal Manifest & Network Security Config',
        detail: 'Hanya meminta izin INTERNET dan ACCESS_NETWORK_STATE dengan allowBackup="false" serta usesCleartextTraffic="false" (HTTP hanya diizinkan ke 127.0.0.1/localhost).',
      },
      {
        step: '02',
        component: 'WebView Hardening & Strict SSL Guard',
        detail: 'Mengunci allowFileAccess/allowContentAccess = false, menyalakan Safe Browsing (API 26+), mematikan debugging di build Release, dan membatalkan setiap sertifikat SSL tidak valid lewat handler.cancel() + dialog peringatan.',
      },
      {
        step: '03',
        component: 'OAuth & Wallet Script Isolation Guard',
        detail: 'Memblokir otomatis injeksi JavaScript dari Terminal maupun Userscript saat konteks aktif adalah pop-up login OAuth (X, Discord, Google) atau dialog WalletConnect.',
      },
      {
        step: '04',
        component: 'Android Keystore Vault & Signed Release CI',
        detail: 'Sandi dan kredensial proxy dienkripsi lokal lewat EncryptedSharedPreferences (AES256-GCM) tanpa telemetri, dan GitHub Actions mem-build KarsaBrowser-release.apk ter-obfuscate R8 dengan keystore dari Secrets.',
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
  {
    id: 'compose-mobile-chrome',
    filename: 'KarsaBrowserScreen.kt',
    path: 'app/src/main/java/id/karsa/browser/ui/KarsaBrowserScreen.kt',
    language: 'Kotlin',
    module: 'UI Standar Mobile v1.0.1 (Top Bar + Bottom Bar + Edge-to-Edge)',
    summary: 'Implementasi Jetpack Compose bebas overlap dengan statusBarsPadding(), navigationBarsPadding(), 3-elemen Top Bar lega, 5-ikon Bottom Bar (Home, Bookmark, +, [N], ⋮), serta Immersive Full Screen.',
    code: `package id.karsa.browser.ui

import android.app.Activity
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.DpOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

/**
 * Atur kontras ikon Status Bar / Navigation Bar & mode Immersive Full Screen.
 * Panggil enableEdgeToEdge() di MainActivity.onCreate sebelum setContent { }.
 */
@Composable
fun KarsaSystemBarsEffect(
    isDarkTheme: Boolean = isSystemInDarkTheme(),
    isFullScreen: Boolean
) {
    val view = LocalView.current
    DisposableEffect(isDarkTheme, isFullScreen) {
        val window = (view.context as? Activity)?.window
        if (window != null) {
            val controller = WindowCompat.getInsetsController(window, view)
            controller.isAppearanceLightStatusBars = !isDarkTheme
            controller.isAppearanceLightNavigationBars = !isDarkTheme
            controller.systemBarsBehavior =
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            if (isFullScreen) {
                controller.hide(WindowInsetsCompat.Type.systemBars())
            } else {
                controller.show(WindowInsetsCompat.Type.systemBars())
            }
        }
        onDispose { }
    }
}

@Composable
fun KarsaTopBar(
    displayUrl: String,
    onLockClick: () -> Unit,
    onUrlClick: () -> Unit,
    onExtensionsClick: () -> Unit,
    onFullScreenClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 1.dp,
        modifier = modifier
            .fillMaxWidth()
            .statusBarsPadding() // Wajib: duduk rapi tepat di bawah jam, sinyal & baterai
    ) {
        Column {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .padding(horizontal = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                // 1. Kolom URL Pill Lebar (42dp, ikon gembok vektor kiri, tanpa kaca pembesar ganda)
                Surface(
                    shape = CircleShape,
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.65f),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
                    modifier = Modifier
                        .weight(1f)
                        .height(42.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(start = 4.dp, end = 14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(
                            onClick = onLockClick,
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.Lock,
                                contentDescription = "Info & Kontrol Situs",
                                modifier = Modifier.size(18.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxHeight()
                                .clickable(onClick = onUrlClick),
                            contentAlignment = Alignment.CenterStart
                        ) {
                            Text(
                                text = displayUrl.removePrefix("https://").removePrefix("http://"),
                                fontSize = 14.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }

                // 2. Ikon Ekstensi / Userscript Vektor Monokrom
                IconButton(
                    onClick = onExtensionsClick,
                    modifier = Modifier.size(44.dp)
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Extension,
                        contentDescription = "Ekstensi & Userscript",
                        modifier = Modifier.size(22.dp),
                        tint = MaterialTheme.colorScheme.onSurface
                    )
                }

                // 3. Ikon Full Layar Vektor Monokrom
                IconButton(
                    onClick = onFullScreenClick,
                    modifier = Modifier.size(44.dp)
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Fullscreen,
                        contentDescription = "Mode Layar Penuh",
                        modifier = Modifier.size(22.dp),
                        tint = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
            HorizontalDivider(thickness = 0.5.dp, color = MaterialTheme.colorScheme.outlineVariant)
        }
    }
}

@Composable
fun KarsaBottomBar(
    tabCount: Int,
    menuExpanded: Boolean,
    onDismissMenu: () -> Unit,
    onHomeClick: () -> Unit,
    onBookmarkClick: () -> Unit,
    onNewTabClick: () -> Unit,
    onTabSwitcherClick: () -> Unit,
    onMoreMenuClick: () -> Unit,
    menuContent: @Composable ColumnScope.() -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        color = MaterialTheme.colorScheme.surface,
        modifier = modifier
            .fillMaxWidth()
            .navigationBarsPadding() // Wajib: duduk rapi di atas gesture bar Android
    ) {
        Column {
            HorizontalDivider(thickness = 0.5.dp, color = MaterialTheme.colorScheme.outlineVariant)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .padding(horizontal = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                // 1. Home
                IconButton(onClick = onHomeClick, modifier = Modifier.size(48.dp)) {
                    Icon(
                        imageVector = Icons.Rounded.Home,
                        contentDescription = "Beranda",
                        modifier = Modifier.size(22.dp)
                    )
                }

                // 2. Bookmark (1-Tap Toggle: outline -> solid hitam/putih + floating toast)
                IconButton(
                    onClick = onBookmarkToggleClick,
                    modifier = Modifier.size(48.dp)
                ) {
                    Icon(
                        imageVector = if (isCurrentPageBookmarked) {
                            Icons.Rounded.Bookmark
                        } else {
                            Icons.Rounded.BookmarkBorder
                        },
                        contentDescription = if (isCurrentPageBookmarked) "Hapus Bookmark" else "Simpan Bookmark",
                        modifier = Modifier.size(22.dp),
                        tint = if (isCurrentPageBookmarked) {
                            // Hitam solid di Mode Terang, Putih solid di Mode Gelap
                            if (isDarkTheme) Color.White else Color(0xFF141413)
                        } else {
                            MaterialTheme.colorScheme.onSurface
                        }
                    )
                }

                // 3. Tambah Tab (+) -> langsung buka tab baru ke halaman Home
                IconButton(onClick = onNewTabClick, modifier = Modifier.size(48.dp)) {
                    Icon(
                        imageVector = Icons.Rounded.Add,
                        contentDescription = "Tambah Tab Baru",
                        modifier = Modifier.size(24.dp)
                    )
                }

                // 4. Menu Tab ([N]) dengan bingkai RoundedCornerShape(4.dp)
                IconButton(onClick = onTabSwitcherClick, modifier = Modifier.size(48.dp)) {
                    Box(
                        modifier = Modifier
                            .defaultMinSize(minWidth = 22.dp, minHeight = 22.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .border(
                                width = 1.75.dp,
                                color = MaterialTheme.colorScheme.onSurface,
                                shape = RoundedCornerShape(4.dp)
                            )
                            .padding(horizontal = 4.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (tabCount > 99) ":D" else tabCount.toString(),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }

                // 5. Menu Titik Tiga (⋮) dengan switch Mode Desktop di atas daftar 1 kolom
                Box {
                    IconButton(onClick = onMoreMenuClick, modifier = Modifier.size(48.dp)) {
                        Icon(
                            imageVector = Icons.Rounded.MoreVert,
                            contentDescription = "Menu Browser",
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    DropdownMenu(
                        expanded = menuExpanded,
                        onDismissRequest = onDismissMenu,
                        offset = DpOffset(x = (-8).dp, y = (-8).dp),
                        modifier = Modifier
                            .widthIn(min = 264.dp, max = 316.dp)
                            .heightIn(max = 460.dp)
                    ) {
                        Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                            menuContent()
                        }
                    }
                }
            }
        }
    }
}`,
  },
  {
    id: 'home-mobile-ua-fresh',
    filename: 'KarsaHomeAndUaPolicy.kt',
    path: 'app/src/main/java/id/karsa/browser/ui/KarsaHomeAndUaPolicy.kt',
    language: 'Kotlin',
    module: 'Fresh State 0 Dummy, Karsa Home, Bookmark Toast & Mode Mobile/Desktop',
    summary: 'State awal 100% bersih (1 tab Home, 0 ekstensi/history/bookmark/log), User-Agent Chrome Mobile bersih (tanpa "; wv") sebagai default, toggle Mode Desktop per tab, dan Floating Toast Bookmark.',
    code: `package id.karsa.browser.ui

import android.webkit.WebSettings
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ChevronRight
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

object KarsaUserAgentPolicy {
    // Default = Chrome Mobile bersih TANPA penanda "; wv" agar login Google & X aman
    const val CHROME_MOBILE_CLEAN =
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/131.0.6778.135 Mobile Safari/537.36"

    // Aktif hanya saat pengguna menyalakan "Mode Desktop" per tab / per situs
    const val CHROME_DESKTOP_CLEAN =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/131.0.6778.135 Safari/537.36"

    fun applyToWebSettings(settings: WebSettings, desktopMode: Boolean) {
        settings.userAgentString = if (desktopMode) CHROME_DESKTOP_CLEAN else CHROME_MOBILE_CLEAN
        settings.useWideViewPort = desktopMode
        settings.loadWithOverviewMode = desktopMode
    }
}

data class BrowserFreshState(
    val tabs: List<TabModel> = listOf(TabModel.createHomeTab()), // 1 tab Home saja, ZERO tab dummy
    val activeTabId: String = tabs.first().id,
    val bookmarks: List<BookmarkModel> = emptyList(),
    val history: List<HistoryModel> = emptyList(),
    val downloads: List<DownloadModel> = emptyList(),
    val extensions: List<ExtensionModel> = emptyList(),
    val terminalLogs: List<String> = emptyList(),
    val rememberedDesktopHosts: Set<String> = emptySet()
)

@Composable
fun BookmarkFloatingToast(
    visible: Boolean,
    message: String,
    siteBadge: String,
    showOpenListArrow: Boolean,
    onOpenBookmarks: () -> Unit,
    modifier: Modifier = Modifier
) {
    AnimatedVisibility(visible = visible, modifier = modifier) {
        Surface(
            shape = RoundedCornerShape(14.dp),
            tonalElevation = 6.dp,
            shadowElevation = 8.dp,
            color = MaterialTheme.colorScheme.inverseSurface,
            contentColor = MaterialTheme.colorScheme.inverseOnSurface,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 8.dp)
                .clickable(enabled = showOpenListArrow, onClick = onOpenBookmarks)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 11.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = MaterialTheme.colorScheme.inverseOnSurface.copy(alpha = 0.14f)
                ) {
                    Text(
                        text = siteBadge,
                        style = MaterialTheme.typography.labelSmall,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                    )
                }
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.weight(1f)
                )
                if (showOpenListArrow) {
                    Icon(
                        imageVector = Icons.Rounded.ChevronRight,
                        contentDescription = "Buka daftar Bookmark"
                    )
                }
            }
        }
    }
}`,
  },
  {
    id: 'sec-manifest-xml',
    filename: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'XML',
    category: 'security',
    module: 'Play Protect · Izin Minimal & Hardening Manifest',
    summary: 'Manifest bersih ramah Google Play Protect: hanya izin INTERNET & ACCESS_NETWORK_STATE, allowBackup="false", usesCleartextTraffic="false", dan network_security_config.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!--
      Izin MINIMAL khusus ramah Google Play Protect.
      DILARANG menambahkan izin sensitif/berisiko tinggi:
      MANAGE_EXTERNAL_STORAGE, READ/WRITE_EXTERNAL_STORAGE,
      QUERY_ALL_PACKAGES, atau REQUEST_INSTALL_PACKAGES.
    -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:name=".KarsaApplication"
        android:allowBackup="false"
        android:fullBackupContent="false"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:usesCleartextTraffic="false"
        android:networkSecurityConfig="@xml/network_security_config"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:hardwareAccelerated="true"
        android:theme="@style/Theme.KarsaBrowser">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:configChanges="orientation|screenSize|smallestScreenSize|keyboardHidden|uiMode"
            android:windowSoftInputMode="adjustResize">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Tangani tautan HTTPS secara aman sebagai browser -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" />
            </intent-filter>
        </activity>

    </application>
</manifest>`,
  },
  {
    id: 'sec-network-xml',
    filename: 'network_security_config.xml',
    path: 'app/src/main/res/xml/network_security_config.xml',
    language: 'XML',
    category: 'security',
    module: 'Play Protect · HTTPS Strict Policy',
    summary: 'Memaksa HTTPS di seluruh koneksi publik (cleartextTrafficPermitted="false") dan hanya memberi pengecualian HTTP untuk pengembangan lokal di localhost / 127.0.0.1.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Paksa HTTPS secara global dan hanya percaya sertifikat CA sistem -->
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>

    <!-- Pengecualian HTTP terbatas HANYA untuk loopback lokal (localhost / 127.0.0.1) -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="false">localhost</domain>
        <domain includeSubdomains="false">127.0.0.1</domain>
    </domain-config>
</network-security-config>`,
  },
  {
    id: 'sec-webview-kt',
    filename: 'WebViewSecurityConfig.kt',
    path: 'app/src/main/java/id/karsa/browser/security/WebViewSecurityConfig.kt',
    language: 'Kotlin',
    category: 'security',
    module: 'Play Protect · WebView Hardening, SSL Lockdown & Isolasi Script',
    summary: 'Mengunci file/content access, mengaktifkan Safe Browsing, menolak error SSL secara ketat dengan handler.cancel(), mematikan debugging di Release, dan memblokir injeksi JS pada OAuth/Wallet.',
    code: `package id.karsa.browser.security

import android.net.Uri
import android.net.http.SslError
import android.os.Build
import android.webkit.SafeBrowsingResponse
import android.webkit.SslErrorHandler
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import id.karsa.browser.BuildConfig

enum class BrowserWindowRole {
    STANDARD_TAB,
    OAUTH_POPUP,
    WALLET_DIALOG
}

data class SslWarningInfo(
    val host: String,
    val url: String,
    val primaryError: Int,
    val message: String
)

object WebViewSecurityConfig {

    /**
     * Terapkan konfigurasi keamanan tingkat produksi ke setiap instance WebView.
     */
    @Suppress("DEPRECATION")
    fun apply(webView: WebView) {
        // Matikan total WebView remote debugging pada build Release
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true

            // Kunci penuh akses file lokal & content URI untuk mencegah kebocoran file privat
            allowFileAccess = false
            allowContentAccess = false
            allowFileAccessFromFileURLs = false
            allowUniversalAccessFromFileURLs = false

            // Blokir konten campuran (HTTP di dalam halaman HTTPS)
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW

            // Jangan simpan sandi plaintext di database WebView bawaan (gunakan SecureVault)
            savePassword = false
            saveFormData = false

            // Aktifkan Google Safe Browsing (API 26+)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                safeBrowsingEnabled = true
            }
        }
    }
}

/**
 * Penjaga Isolasi Script:
 * Memblokir seluruh injeksi JavaScript dari Terminal / Userscript saat pengguna berada
 * di jendela pop-up login sensitif (OAuth X, Discord, Google) atau dialog WalletConnect.
 */
object ScriptIsolationGuard {

    private val sensitiveAuthHosts = setOf(
        "accounts.google.com",
        "x.com",
        "twitter.com",
        "api.twitter.com",
        "api.x.com",
        "discord.com",
        "oauth.telegram.org",
        "appleid.apple.com",
        "github.com"
    )

    private val sensitiveAuthPathKeywords = listOf(
        "/oauth", "/authorize", "/login", "/signin", "/i/flow/login", "/connect/wallet"
    )

    private val walletSchemes = setOf("wc", "rabby", "metamask", "phantom", "okx")

    fun isSensitiveContext(url: String?, windowRole: BrowserWindowRole): Boolean {
        if (windowRole == BrowserWindowRole.OAUTH_POPUP || windowRole == BrowserWindowRole.WALLET_DIALOG) {
            return true
        }
        val raw = url?.trim().orEmpty()
        if (raw.isEmpty()) return false

        val uri = runCatching { Uri.parse(raw) }.getOrNull() ?: return true
        val scheme = uri.scheme?.lowercase().orEmpty()
        if (scheme in walletSchemes) return true

        val host = uri.host?.lowercase().orEmpty()
        val path = uri.path?.lowercase().orEmpty()
        val isSensitiveHost = sensitiveAuthHosts.any { host == it || host.endsWith(".$it") }
        val isSensitivePath = sensitiveAuthPathKeywords.any { path.contains(it) }

        return isSensitiveHost && (isSensitivePath || host == "accounts.google.com")
    }

    /**
     * Jalankan skrip pengguna (Terminal / Userscript) hanya jika konteks aman.
     * Mengembalikan false dan memanggil [onBlocked] jika target adalah sesi OAuth/Wallet.
     */
    fun evaluateUserScriptSafely(
        webView: WebView,
        script: String,
        currentUrl: String?,
        windowRole: BrowserWindowRole,
        onResult: (String?) -> Unit = {},
        onBlocked: (reason: String) -> Unit
    ): Boolean {
        if (isSensitiveContext(currentUrl, windowRole)) {
            onBlocked(
                "Isolasi Script Aktif: Injeksi JS Terminal/Userscript diblokir pada jendela login OAuth atau dialog Wallet."
            )
            return false
        }
        webView.evaluateJavascript(script) { value -> onResult(value) }
        return true
    }
}

/**
 * WebViewClient ketat:
 * - WAJIB memanggil handler.cancel() pada onReceivedSslError (DILARANG memanggil handler.proceed()).
 * - Menampilkan dialog peringatan sertifikat kepada pengguna.
 */
open class KarsaSecureWebViewClient(
    private val onSslErrorBlocked: (SslWarningInfo) -> Unit
) : WebViewClient() {

    override fun onReceivedSslError(
        view: WebView?,
        handler: SslErrorHandler?,
        error: SslError?
    ) {
        // WAJIB: Selalu batalkan koneksi dengan sertifikat SSL tidak valid (kepatuhan Google Play)
        handler?.cancel()

        val failingUrl = error?.url.orEmpty()
        val host = runCatching { Uri.parse(failingUrl).host.orEmpty() }.getOrDefault("")
        val reason = when (error?.primaryError) {
            SslError.SSL_EXPIRED -> "Sertifikat keamanan situs ini telah kedaluwarsa."
            SslError.SSL_IDMISMATCH -> "Nama domain tidak cocok dengan sertifikat SSL."
            SslError.SSL_UNTRUSTED -> "Penerbit sertifikat SSL tidak dipercaya sistem."
            SslError.SSL_NOTYETVALID -> "Sertifikat SSL belum berlaku."
            else -> "Koneksi HTTPS diblokir karena sertifikat keamanan tidak valid."
        }

        onSslErrorBlocked(
            SslWarningInfo(
                host = host.ifBlank { failingUrl },
                url = failingUrl,
                primaryError = error?.primaryError ?: -1,
                message = reason
            )
        )
    }

    override fun onSafeBrowsingHit(
        view: WebView?,
        request: WebResourceRequest?,
        threatType: Int,
        callback: SafeBrowsingResponse?
    ) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            callback?.backToSafety(true)
        }
    }
}`,
  },
  {
    id: 'sec-vault-kt',
    filename: 'SecureVault.kt',
    path: 'app/src/main/java/id/karsa/browser/security/SecureVault.kt',
    language: 'Kotlin',
    category: 'security',
    module: 'Play Protect · Enkripsi Lokal Keystore & Zero Telemetry',
    summary: 'Brankas lokal menggunakan EncryptedSharedPreferences berbasis Android Keystore (AES256-GCM) untuk menyimpan sandi situs dan kredensial proxy tanpa mengirim data ke server mana pun.',
    code: `package id.karsa.browser.security

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import org.json.JSONArray
import org.json.JSONObject

data class SavedSiteCredential(
    val origin: String,
    val username: String,
    val password: String,
    val updatedAtEpochMs: Long = System.currentTimeMillis()
)

data class StoredProxyCredential(
    val protocol: String, // "HTTP", "HTTPS", "SOCKS5"
    val host: String,
    val port: Int,
    val username: String,
    val password: String
)

/**
 * SecureVault (100% Lokal · Zero Telemetry):
 * - Seluruh kredensial sandi & proxy dienkripsi di perangkat menggunakan Android Keystore (AES256-GCM).
 * - Tidak ada panggilan jaringan, tidak ada SDK analitik, dan tidak pernah mengirim data ke server luar.
 */
class SecureVault(context: Context) {

    private val appContext = context.applicationContext

    private val masterKey: MasterKey by lazy {
        MasterKey.Builder(appContext)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
    }

    private val encryptedPrefs: SharedPreferences by lazy {
        EncryptedSharedPreferences.create(
            appContext,
            VAULT_FILE_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    fun saveSiteCredential(credential: SavedSiteCredential) {
        val current = getAllSiteCredentials()
            .filterNot { it.origin == credential.origin && it.username == credential.username }
            .toMutableList()
        current.add(0, credential)

        val arr = JSONArray()
        current.forEach { item ->
            arr.put(
                JSONObject()
                    .put("origin", item.origin)
                    .put("username", item.username)
                    .put("password", item.password)
                    .put("updatedAtEpochMs", item.updatedAtEpochMs)
            )
        }
        encryptedPrefs.edit().putString(KEY_SITE_CREDENTIALS, arr.toString()).apply()
    }

    fun getAllSiteCredentials(): List<SavedSiteCredential> {
        val raw = encryptedPrefs.getString(KEY_SITE_CREDENTIALS, null) ?: return emptyList()
        val arr = runCatching { JSONArray(raw) }.getOrNull() ?: return emptyList()
        return buildList(arr.length()) {
            for (i in 0 until arr.length()) {
                val obj = arr.optJSONObject(i) ?: continue
                add(
                    SavedSiteCredential(
                        origin = obj.optString("origin"),
                        username = obj.optString("username"),
                        password = obj.optString("password"),
                        updatedAtEpochMs = obj.optLong("updatedAtEpochMs")
                    )
                )
            }
        }
    }

    fun deleteSiteCredential(origin: String, username: String) {
        val remaining = getAllSiteCredentials()
            .filterNot { it.origin == origin && it.username == username }
        val arr = JSONArray()
        remaining.forEach { item ->
            arr.put(
                JSONObject()
                    .put("origin", item.origin)
                    .put("username", item.username)
                    .put("password", item.password)
                    .put("updatedAtEpochMs", item.updatedAtEpochMs)
            )
        }
        encryptedPrefs.edit().putString(KEY_SITE_CREDENTIALS, arr.toString()).apply()
    }

    fun saveProxyCredential(profileId: String, proxy: StoredProxyCredential) {
        val payload = JSONObject()
            .put("protocol", proxy.protocol)
            .put("host", proxy.host)
            .put("port", proxy.port)
            .put("username", proxy.username)
            .put("password", proxy.password)
            .toString()
        encryptedPrefs.edit().putString("$KEY_PROXY_PREFIX$profileId", payload).apply()
    }

    fun getProxyCredential(profileId: String): StoredProxyCredential? {
        val raw = encryptedPrefs.getString("$KEY_PROXY_PREFIX$profileId", null) ?: return null
        val obj = runCatching { JSONObject(raw) }.getOrNull() ?: return null
        return StoredProxyCredential(
            protocol = obj.optString("protocol", "DIRECT"),
            host = obj.optString("host"),
            port = obj.optInt("port", 1080),
            username = obj.optString("username"),
            password = obj.optString("password")
        )
    }

    fun clearProxyCredential(profileId: String) {
        encryptedPrefs.edit().remove("$KEY_PROXY_PREFIX$profileId").apply()
    }

    fun wipeAllVaultData() {
        encryptedPrefs.edit().clear().apply()
    }

    private companion object {
        const val VAULT_FILE_NAME = "karsa_secure_vault_v1"
        const val KEY_SITE_CREDENTIALS = "site_credentials_json"
        const val KEY_PROXY_PREFIX = "proxy_cred_"
    }
}`,
  },
  {
    id: 'sec-gradle-kts',
    filename: 'app/build.gradle.kts',
    path: 'app/build.gradle.kts',
    language: 'Gradle',
    category: 'security',
    module: 'Play Protect · Release Build, R8 Shrink & Env Signing',
    summary: 'Konfigurasi Release build produksi (isDebuggable=false, isMinifyEnabled=true, isShrinkResources=true) dengan signingConfigs yang membaca keystore murni dari environment variables.',
    code: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

val releaseKeystorePath = System.getenv("KEYSTORE_FILE")
val releaseKeystorePassword = System.getenv("KEYSTORE_PASSWORD")
val releaseKeyAlias = System.getenv("KEY_ALIAS")
val releaseKeyPassword = System.getenv("KEY_PASSWORD")

val hasReleaseSigning = !releaseKeystorePath.isNullOrBlank() &&
    !releaseKeystorePassword.isNullOrBlank() &&
    !releaseKeyAlias.isNullOrBlank() &&
    !releaseKeyPassword.isNullOrBlank()

android {
    namespace = "id.karsa.browser"
    compileSdk = 35

    defaultConfig {
        applicationId = "id.karsa.browser"
        minSdk = 26
        targetSdk = 35
        versionCode = 4
        versionName = "1.0.3"

        vectorDrawables {
            useSupportLibrary = true
        }
    }

    signingConfigs {
        if (hasReleaseSigning) {
            create("release") {
                storeFile = file(releaseKeystorePath!!)
                storePassword = releaseKeystorePassword
                keyAlias = releaseKeyAlias
                keyPassword = releaseKeyPassword
                enableV1Signing = true
                enableV2Signing = true
                enableV3Signing = true
            }
        }
    }

    buildTypes {
        debug {
            isDebuggable = true
            isMinifyEnabled = false
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }

        release {
            isDebuggable = false
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            if (hasReleaseSigning) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.12.01"))
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
}`,
  },
  {
    id: 'sec-proguard-pro',
    filename: 'proguard-rules.pro',
    path: 'app/proguard-rules.pro',
    language: 'ProGuard',
    category: 'security',
    module: 'OWASP MASVS · R8 / ProGuard & Penghapusan Log Release',
    summary: 'Aturan ProGuard/R8 aman untuk Jetpack Compose, SecureJsBridge (@JavascriptInterface), Keystore/Tink, serta blok -assumenosideeffects android.util.Log yang menghapus seluruh Log.v/d/i di APK Release.',
    code: `# ===================================================================
# Karsa Browser — R8 / ProGuard Production Rules (OWASP MASVS)
# ===================================================================

# 1. Pertahankan anotasi & metode WebView @JavascriptInterface (SecureJsBridge)
-keepattributes JavascriptInterface
-keepattributes *Annotation*
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep public class id.karsa.browser.bridge.** { *; }
-keep public class id.karsa.browser.security.SecureJsBridge { *; }

# 2. Jetpack Compose & Material3 safety
-keep class androidx.compose.** { *; }
-dontwarn androidx.compose.**

# 3. AndroidX Security Crypto (EncryptedSharedPreferences / Tink / Keystore)
-keep class androidx.security.crypto.** { *; }
-keep class com.google.crypto.tink.** { *; }
-dontwarn com.google.crypto.tink.**
-dontwarn javax.annotation.**

# 4. Data model lokal yang diserialisasi
-keep class id.karsa.browser.security.SavedSiteCredential { *; }
-keep class id.karsa.browser.security.StoredProxyCredential { *; }
-keep class id.karsa.browser.session.TabSessionSnapshot { *; }

# 5. OWASP MASVS: Hapus otomatis seluruh Log.v, Log.d, dan Log.i pada build Release (R8)
#    Mencegah kebocoran URL, cookie, alamat wallet, atau token sesi ke sistem logcat Android.
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(java.lang.String, java.lang.String);
    public static int v(java.lang.String, java.lang.String, java.lang.Throwable);
    public static int d(java.lang.String, java.lang.String);
    public static int d(java.lang.String, java.lang.String, java.lang.Throwable);
    public static int i(java.lang.String, java.lang.String);
    public static int i(java.lang.String, java.lang.String, java.lang.Throwable);
}

# Hapus juga println() Kotlin yang mungkin tersisa saat pengembangan
-assumenosideeffects class kotlin.io.ConsoleKt {
    public static void println(...);
    public static void print(...);
}

# 6. Pertahankan nomor baris stacktrace yang bersih tanpa membocorkan nama berkas asli
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile`,
  },
  {
    id: 'sec-github-workflow',
    filename: 'build-apk.yml',
    path: '.github/workflows/build-apk.yml',
    language: 'YAML',
    category: 'security',
    module: 'CI/CD · Signed Release APK (Fallback Debug)',
    summary: 'GitHub Actions workflow otomatis men-decode KEYSTORE_BASE64 dari Secrets untuk menghasilkan KarsaBrowser-release.apk ter-sign, dengan fallback assembleDebug jika secret belum diisi.',
    code: `name: Build Karsa Browser APK

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-apk:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "17"

      - name: Setup Gradle cache
        uses: gradle/actions/setup-gradle@v4

      - name: Ensure gradlew executable
        run: chmod +x ./gradlew

      - name: Check Release Signing Secrets
        id: signing_check
        env:
          KEYSTORE_BASE64: \${{ secrets.KEYSTORE_BASE64 }}
          KEYSTORE_PASSWORD: \${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: \${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: \${{ secrets.KEY_PASSWORD }}
        run: |
          if [ -n "$KEYSTORE_BASE64" ] && [ -n "$KEYSTORE_PASSWORD" ] && [ -n "$KEY_ALIAS" ] && [ -n "$KEY_PASSWORD" ]; then
            echo "ready=true" >> "$GITHUB_OUTPUT"
          else
            echo "ready=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Decode Release Keystore from Secret
        if: steps.signing_check.outputs.ready == 'true'
        env:
          KEYSTORE_BASE64: \${{ secrets.KEYSTORE_BASE64 }}
        run: |
          echo "$KEYSTORE_BASE64" | base64 --decode > "\${{ runner.temp }}/karsa-release.jks"

      - name: Build Signed Release APK
        if: steps.signing_check.outputs.ready == 'true'
        env:
          KEYSTORE_FILE: \${{ runner.temp }}/karsa-release.jks
          KEYSTORE_PASSWORD: \${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: \${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: \${{ secrets.KEY_PASSWORD }}
        run: |
          ./gradlew assembleRelease --no-daemon
          mkdir -p dist
          cp app/build/outputs/apk/release/app-release.apk dist/KarsaBrowser-release.apk

      - name: Fallback Build Debug APK (Secrets Not Configured)
        if: steps.signing_check.outputs.ready != 'true'
        run: |
          ./gradlew assembleDebug --no-daemon
          mkdir -p dist
          cp app/build/outputs/apk/debug/app-debug.apk dist/KarsaBrowser-debug.apk

      - name: Cleanup Temporary Keystore
        if: always()
        run: rm -f "\${{ runner.temp }}/karsa-release.jks"

      - name: Upload Release APK Artifact
        if: steps.signing_check.outputs.ready == 'true'
        uses: actions/upload-artifact@v4
        with:
          name: KarsaBrowser-release
          path: dist/KarsaBrowser-release.apk
          retention-days: 30

      - name: Upload Debug APK Artifact (Fallback)
        if: steps.signing_check.outputs.ready != 'true'
        uses: actions/upload-artifact@v4
        with:
          name: KarsaBrowser-debug
          path: dist/KarsaBrowser-debug.apk
          retention-days: 14`,
  },
  {
    id: 'sec-clipboard-guard',
    filename: 'ClipboardGuard.kt',
    path: 'app/src/main/java/id/karsa/browser/security/ClipboardGuard.kt',
    language: 'Kotlin',
    category: 'security',
    module: 'Proteksi Clipboard · Anti-Hijacking & Auto-Clear Sensitif',
    summary: 'Memblokir pembacaan clipboard otomatis dari halaman web tanpa izin eksplisit pengguna, serta membersihkan clipboard otomatis setelah menyalin sandi/data sensitif (Android 13+ EXTRA_IS_SENSITIVE).',
    code: `package id.karsa.browser.security

import android.content.ClipData
import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.Context
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.PersistableBundle
import java.util.concurrent.ConcurrentHashMap

enum class ClipboardReadPolicy {
    BLOCK_AUTO, // Default aman: tolak pembacaan clipboard otomatis tanpa izin eksplisit
    ASK_ONCE,
    ALLOW_SITE
}

class ClipboardGuard(private val context: Context) {

    private val clipboardManager =
        context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    private val mainHandler = Handler(Looper.getMainLooper())
    private val hostPolicies = ConcurrentHashMap<String, ClipboardReadPolicy>()
    private var pendingClearRunnable: Runnable? = null

    fun getPolicyForHost(host: String): ClipboardReadPolicy {
        return hostPolicies[host.lowercase()] ?: ClipboardReadPolicy.BLOCK_AUTO
    }

    fun setPolicyForHost(host: String, policy: ClipboardReadPolicy) {
        hostPolicies[host.lowercase()] = policy
    }

    /**
     * Intersep permintaan baca clipboard dari WebView / halaman web.
     * Hanya izinkan jika pengguna secara eksplisit memberi izin untuk domain tersebut.
     */
    fun handleSiteClipboardReadRequest(
        host: String,
        onPromptUserConsent: (host: String, grantOnce: () -> Unit, deny: () -> Unit) -> Unit,
        onAllowedRead: (clipText: String) -> Unit,
        onBlocked: (reason: String) -> Unit
    ) {
        when (getPolicyForHost(host)) {
            ClipboardReadPolicy.BLOCK_AUTO -> {
                onBlocked("Proteksi Clipboard: akses baca otomatis dari $host diblokir.")
            }
            ClipboardReadPolicy.ALLOW_SITE -> {
                onAllowedRead(readCurrentPlainText())
            }
            ClipboardReadPolicy.ASK_ONCE -> {
                onPromptUserConsent(
                    host,
                    { onAllowedRead(readCurrentPlainText()) },
                    { onBlocked("Pengguna menolak akses baca clipboard untuk $host.") }
                )
            }
        }
    }

    /**
     * Salin kata sandi / kunci sensitif dengan tanda EXTRA_IS_SENSITIVE (Android 13+)
     * dan jadwalkan pembersihan otomatis (Auto-Clear) setelah [clearAfterMs] (default 30 detik).
     */
    fun copySensitiveWithAutoClear(
        label: String,
        secretText: String,
        autoClearEnabled: Boolean = true,
        clearAfterMs: Long = 30_000L,
        onCleared: () -> Unit = {}
    ) {
        val clip = ClipData.newPlainText(label, secretText)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            clip.description.extras = PersistableBundle().apply {
                putBoolean(ClipDescription.EXTRA_IS_SENSITIVE, true)
            }
        }
        clipboardManager.setPrimaryClip(clip)

        pendingClearRunnable?.let { mainHandler.removeCallbacks(it) }
        if (!autoClearEnabled) return

        val clearTask = Runnable {
            // Hanya hapus jika isi clipboard masih sama dengan data sensitif terakhir
            if (readCurrentPlainText() == secretText) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    clipboardManager.clearPrimaryClip()
                } else {
                    clipboardManager.setPrimaryClip(ClipData.newPlainText("", ""))
                }
                onCleared()
            }
        }
        pendingClearRunnable = clearTask
        mainHandler.postDelayed(clearTask, clearAfterMs)
    }

    private fun readCurrentPlainText(): String {
        val clip = clipboardManager.primaryClip ?: return ""
        if (clip.itemCount == 0) return ""
        return clip.getItemAt(0).coerceToText(context)?.toString().orEmpty()
    }

    companion object {
        /**
         * Skrip document-start ringan untuk mencegat navigator.clipboard.readText()
         * ketika kebijakan host adalah BLOCK_AUTO.
         */
        const val BLOCK_CLIPBOARD_READ_JS = """
            (() => {
              if (!navigator.clipboard) return;
              const deny = () => Promise.reject(
                new DOMException('Karsa ClipboardGuard memblokir pembacaan clipboard otomatis.', 'NotAllowedError')
              );
              try {
                Object.defineProperty(navigator.clipboard, 'readText', { value: deny, configurable: false });
                Object.defineProperty(navigator.clipboard, 'read', { value: deny, configurable: false });
              } catch (_) {}
            })();
        """
    }
}`,
  },
  {
    id: 'sec-url-punycode',
    filename: 'UrlSecurityParser.kt',
    path: 'app/src/main/java/id/karsa/browser/security/UrlSecurityParser.kt',
    language: 'Kotlin',
    category: 'security',
    module: 'Anti-Phishing · Highlight Domain Utama & Detektor Punycode',
    summary: 'Memisahkan subdomain, domain utama (eTLD+1), dan path untuk ditebalkan di URL Bar, sekaligus mendeteksi domain Punycode (xn--) / karakter Unicode mencurigakan dan halaman login non-HTTPS.',
    code: `package id.karsa.browser.security

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import java.net.IDN
import java.net.URI

data class ParsedUrlSecurity(
    val rawUrl: String,
    val scheme: String,
    val host: String,
    val subdomain: String,
    val primaryDomain: String,
    val pathAndQuery: String,
    val isPunycode: Boolean,
    val isNonHttps: Boolean,
    val isLoginLikePath: Boolean,
    val warningMessage: String?
) {
    val isSuspicious: Boolean get() = isPunycode || isNonHttps
}

object UrlSecurityParser {

    private val multiPartTlds = setOf(
        "co.id", "ac.id", "go.id", "or.id", "web.id",
        "co.uk", "org.uk", "com.au", "co.jp", "com.sg", "com.my"
    )

    private val loginKeywords = listOf(
        "/login", "/signin", "/oauth", "/authorize", "/connect", "/wallet", "/claim", "/verify"
    )

    fun parse(rawUrl: String): ParsedUrlSecurity {
        val trimmed = rawUrl.trim()
        val normalized = if ("://" in trimmed) trimmed else "https://$trimmed"
        val uri = runCatching { URI(normalized) }.getOrNull()

        val scheme = uri?.scheme?.lowercase().orEmpty().ifBlank { "https" }
        val rawHost = uri?.rawAuthority
            ?.substringAfterLast('@')
            ?.substringBefore(':')
            ?.lowercase()
            .orEmpty()

        val asciiHost = runCatching { IDN.toASCII(rawHost) }.getOrDefault(rawHost).lowercase()
        val hasNonAscii = rawHost.any { it.code > 127 }
        val isPunycode = hasNonAscii || asciiHost.split('.').any { it.startsWith("xn--") }
        val isLoopback = asciiHost == "localhost" || asciiHost == "127.0.0.1"
        val isNonHttps = scheme == "http" && !isLoopback

        val path = uri?.rawPath.orEmpty().let { if (it == "/") "" else it }
        val query = uri?.rawQuery?.let { "?$it" }.orEmpty()
        val pathAndQuery = "$path$query"
        val isLoginLikePath = loginKeywords.any { pathAndQuery.contains(it, ignoreCase = true) }

        val (subdomain, primaryDomain) = splitPrimaryDomain(asciiHost)

        val warning = when {
            isPunycode -> "Terdeteksi domain Punycode (xn--) / karakter Unicode mencurigakan. Waspada situs phishing tiruan."
            isNonHttps && isLoginLikePath -> "Halaman login atau wallet ini tidak menggunakan HTTPS. Jangan masukkan sandi atau tanda tangan."
            isNonHttps -> "Koneksi HTTP tidak terenkripsi. Hindari mengisi data sensitif."
            else -> null
        }

        return ParsedUrlSecurity(
            rawUrl = trimmed,
            scheme = scheme,
            host = asciiHost,
            subdomain = subdomain,
            primaryDomain = primaryDomain.ifBlank { trimmed },
            pathAndQuery = pathAndQuery,
            isPunycode = isPunycode,
            isNonHttps = isNonHttps,
            isLoginLikePath = isLoginLikePath,
            warningMessage = warning
        )
    }

    private fun splitPrimaryDomain(host: String): Pair<String, String> {
        if (host.isBlank() || host.all { it.isDigit() || it == '.' }) {
            return "" to host
        }
        val labels = host.split('.').filter { it.isNotBlank() }
        if (labels.size <= 2) return "" to host

        val lastTwo = "\${labels[labels.size - 2]}.\${labels.last()}"
        val takeCount = if (lastTwo in multiPartTlds && labels.size >= 3) 3 else 2
        val primary = labels.takeLast(takeCount).joinToString(".")
        val sub = labels.dropLast(takeCount).joinToString(".")
        return (if (sub.isNotEmpty()) "$sub." else "") to primary
    }

    /**
     * Format teks URL untuk Compose Top Bar: tebalkan domain utama & redupkan subdomain/path.
     */
    fun buildHighlightedDomainText(
        parsed: ParsedUrlSecurity,
        primaryColor: Color,
        mutedColor: Color,
        dangerColor: Color
    ): AnnotatedString = buildAnnotatedString {
        if (parsed.subdomain.isNotEmpty()) {
            withStyle(SpanStyle(color = mutedColor, fontWeight = FontWeight.Normal)) {
                append(parsed.subdomain)
            }
        }
        withStyle(
            SpanStyle(
                color = if (parsed.isSuspicious) dangerColor else primaryColor,
                fontWeight = FontWeight.Bold
            )
        ) {
            append(parsed.primaryDomain)
        }
        if (parsed.pathAndQuery.isNotEmpty()) {
            withStyle(SpanStyle(color = mutedColor, fontWeight = FontWeight.Normal)) {
                append(parsed.pathAndQuery)
            }
        }
    }
}`,
  },
  {
    id: 'sec-biometric-flag-secure',
    filename: 'BiometricLockHelper.kt',
    path: 'app/src/main/java/id/karsa/browser/security/BiometricLockHelper.kt',
    language: 'Kotlin',
    category: 'security',
    module: 'Privasi Layar · Kunci Biometrik/PIN & FLAG_SECURE',
    summary: 'Autentikasi Android BiometricPrompt (sidik jari + fallback PIN/Pola perangkat) untuk Passkey & Sandi serta manajemen WindowManager.LayoutParams.FLAG_SECURE otomatis di tab Penyamaran.',
    code: `package id.karsa.browser.security

import android.app.Activity
import android.content.Context
import android.view.WindowManager
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_STRONG
import androidx.biometric.BiometricManager.Authenticators.DEVICE_CREDENTIAL
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity

object ScreenPrivacyController {

    /**
     * Aktifkan FLAG_SECURE saat pengguna berada di Tab Penyamaran (Incognito)
     * atau membuka brankas Passkey & Sandi agar tersembunyi di Recent Apps dan blokir screenshot.
     */
    fun updateWindowPrivacy(activity: Activity, shouldProtectScreen: Boolean) {
        if (shouldProtectScreen) {
            activity.window.setFlags(
                WindowManager.LayoutParams.FLAG_SECURE,
                WindowManager.LayoutParams.FLAG_SECURE
            )
        } else {
            activity.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
        }
    }
}

object BiometricLockHelper {

    private const val ALLOWED_AUTHENTICATORS = BIOMETRIC_STRONG or DEVICE_CREDENTIAL

    fun isDeviceSecured(context: Context): Boolean {
        val status = BiometricManager.from(context).canAuthenticate(ALLOWED_AUTHENTICATORS)
        return status == BiometricManager.BIOMETRIC_SUCCESS
    }

    /**
     * Tampilkan dialog BiometricPrompt (dengan fallback otomatis ke PIN/Pola sistem).
     */
    fun authenticate(
        activity: FragmentActivity,
        title: String = "Buka Kunci Karsa Browser",
        subtitle: String = "Verifikasi sidik jari atau PIN untuk mengakses Passkey & Sandi",
        onAuthenticated: () -> Unit,
        onError: (String) -> Unit
    ) {
        if (!isDeviceSecured(activity)) {
            onError("Perangkat belum mengaktifkan kunci layar atau biometrik.")
            return
        }

        val executor = ContextCompat.getMainExecutor(activity)
        val callback = object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                super.onAuthenticationSucceeded(result)
                onAuthenticated()
            }

            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                super.onAuthenticationError(errorCode, errString)
                onError(errString.toString())
            }
        }

        val prompt = BiometricPrompt(activity, executor, callback)
        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle(title)
            .setSubtitle(subtitle)
            .setAllowedAuthenticators(ALLOWED_AUTHENTICATORS)
            .build()

        prompt.authenticate(promptInfo)
    }
}`,
  },
  {
    id: 'sec-terminal-script-guard',
    filename: 'TerminalScriptGuard.kt',
    path: 'app/src/main/java/id/karsa/browser/security/TerminalScriptGuard.kt',
    language: 'Kotlin',
    category: 'security',
    module: 'Pemindai Skrip Terminal · Anti-Pencuri Cookie & Token',
    summary: 'Memindai skrip JavaScript sebelum dieksekusi di Terminal; memunculkan peringatan kuning jika mendeteksi pembacaan document.cookie / localStorage / sessionStorage yang dikirim ke server eksternal.',
    code: `package id.karsa.browser.security

enum class ScriptRiskLevel {
    SAFE,
    HIGH_RISK
}

data class ScriptRiskReport(
    val level: ScriptRiskLevel,
    val matchedSources: List<String>,
    val matchedSinks: List<String>,
    val warningMessage: String?
)

object TerminalScriptGuard {

    private val sensitiveSourceRules: List<Pair<String, Regex>> = listOf(
        "document.cookie" to Regex("""\\bdocument\\s*\\.\\s*cookie\\b""", RegexOption.IGNORE_CASE),
        "localStorage" to Regex("""\\blocalStorage\\b""", RegexOption.IGNORE_CASE),
        "sessionStorage" to Regex("""\\bsessionStorage\\b""", RegexOption.IGNORE_CASE),
        "indexedDB" to Regex("""\\bindexedDB\\b""", RegexOption.IGNORE_CASE),
        "token/privateKey" to Regex(
            """\\b(private_?key|seed_?phrase|mnemonic|auth_?token)\\b""",
            RegexOption.IGNORE_CASE
        )
    )

    private val outboundSinkRules: List<Pair<String, Regex>> = listOf(
        "fetch()" to Regex("""\\bfetch\\s*\\(""", RegexOption.IGNORE_CASE),
        "XMLHttpRequest" to Regex("""\\bXMLHttpRequest\\b""", RegexOption.IGNORE_CASE),
        "navigator.sendBeacon()" to Regex("""\\bsendBeacon\\s*\\(""", RegexOption.IGNORE_CASE),
        "WebSocket" to Regex("""\\bnew\\s+WebSocket\\s*\\(""", RegexOption.IGNORE_CASE),
        "URL eksternal" to Regex(
            """(\\.src\\s*=|location\\.href\\s*=|https?://[^\\s"']+)""",
            RegexOption.IGNORE_CASE
        )
    )

    /**
     * Pindai skrip sebelum diserahkan ke WebView.evaluateJavascript().
     * Jika HIGH_RISK, UI WAJIB menampilkan dialog konfirmasi kuning dengan default "Batal".
     */
    fun analyze(script: String): ScriptRiskReport {
        val sources = sensitiveSourceRules
            .filter { (_, regex) -> regex.containsMatchIn(script) }
            .map { it.first }

        val sinks = outboundSinkRules
            .filter { (_, regex) -> regex.containsMatchIn(script) }
            .map { it.first }

        val isHighRisk = sources.isNotEmpty() && sinks.isNotEmpty()
        if (!isHighRisk) {
            return ScriptRiskReport(
                level = ScriptRiskLevel.SAFE,
                matchedSources = sources,
                matchedSinks = sinks,
                warningMessage = null
            )
        }

        val message = buildString {
            append("Peringatan Keamanan: Skrip mencoba mengakses data sensitif (")
            append(sources.joinToString(", "))
            append(") dan mengirimkannya keluar melalui ")
            append(sinks.joinToString(", "))
            append(". Jangan lanjutkan jika skrip berasal dari sumber tidak tepercaya.")
        }

        return ScriptRiskReport(
            level = ScriptRiskLevel.HIGH_RISK,
            matchedSources = sources,
            matchedSinks = sinks,
            warningMessage = message
        )
    }
}`,
  },
  {
    id: 'sec-wallet-intent-router',
    filename: 'WalletIntentRouter.kt',
    path: 'app/src/main/java/id/karsa/browser/security/WalletIntentRouter.kt',
    language: 'Kotlin',
    category: 'security',
    module: 'Verifikasi Wallet Resmi · Anti-Fake Wallet Intent Hijacking',
    summary: 'Meneruskan deep-link WalletConnect (wc:// / rabby://) menggunakan explicit intent.setPackage() dan verifikasi PackageManager agar aplikasi wallet palsu tidak pernah bisa membajak sesi.',
    code: `package id.karsa.browser.security

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build

enum class VerifiedWalletApp(
    val displayName: String,
    val packageName: String,
    val allowedSchemes: Set<String>
) {
    RABBY("Rabby Wallet", "com.debank.rabbymobile", setOf("rabby", "wc")),
    METAMASK("MetaMask Mobile", "io.metamask", setOf("metamask", "wc")),
    PHANTOM("Phantom", "app.phantom", setOf("phantom", "wc")),
    OKX("OKX Wallet", "com.okinc.okex.gp", setOf("okx", "wc"))
}

sealed class WalletLaunchResult {
    data class Ready(val explicitIntent: Intent, val targetWallet: VerifiedWalletApp) : WalletLaunchResult()
    data class AppNotInstalled(val targetWallet: VerifiedWalletApp) : WalletLaunchResult()
    data class Rejected(val reason: String) : WalletLaunchResult()
}

object WalletIntentRouter {

    /**
     * Bangun Explicit Intent yang mengunci target ke packageName resmi (contoh: com.debank.rabbymobile).
     * Memastikan aplikasi tiruan tidak dapat mencegat URI wc:// melalui chooser umum Android.
     */
    fun buildVerifiedWalletIntent(
        context: Context,
        deepLinkUri: String,
        targetWallet: VerifiedWalletApp
    ): WalletLaunchResult {
        val parsedUri = runCatching { Uri.parse(deepLinkUri.trim()) }.getOrNull()
            ?: return WalletLaunchResult.Rejected("URI WalletConnect tidak valid.")

        val scheme = parsedUri.scheme?.lowercase().orEmpty()
        if (scheme !in targetWallet.allowedSchemes) {
            return WalletLaunchResult.Rejected(
                "Skema '$scheme://' tidak diizinkan untuk \${targetWallet.displayName}."
            )
        }

        // Kunci eksplisit ke nama paket aplikasi wallet resmi
        val explicitIntent = Intent(Intent.ACTION_VIEW, parsedUri).apply {
            setPackage(targetWallet.packageName)
            addCategory(Intent.CATEGORY_BROWSABLE)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        val resolved = resolveExplicitActivity(context.packageManager, explicitIntent)
        return if (resolved != null && resolved.activityInfo?.packageName == targetWallet.packageName) {
            WalletLaunchResult.Ready(explicitIntent, targetWallet)
        } else {
            WalletLaunchResult.AppNotInstalled(targetWallet)
        }
    }

    private fun resolveExplicitActivity(pm: PackageManager, intent: Intent) =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            pm.resolveActivity(intent, PackageManager.ResolveInfoFlags.of(PackageManager.MATCH_DEFAULT_ONLY.toLong()))
        } else {
            @Suppress("DEPRECATION")
            pm.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY)
        }
}`,
  },
  {
    id: 'core-tab-lifecycle',
    filename: 'TabLifecycleManager.kt',
    path: 'app/src/main/java/id/karsa/browser/session/TabLifecycleManager.kt',
    language: 'Kotlin',
    category: 'security',
    module: 'Hibernasi Tab Otomatis & Pemulihan Sesi (Anti-Crash Low-RAM)',
    summary: 'Membekukan WebView tab latar belakang secara otomatis (onPause + RENDERER_PRIORITY_WAIVED) agar hemat RAM, serta menyimpan & memulihkan daftar tab terbuka lokal dalam JSON.',
    code: `package id.karsa.browser.session

import android.content.Context
import android.os.Build
import android.webkit.WebView
import org.json.JSONArray
import org.json.JSONObject

data class TabSessionSnapshot(
    val id: String,
    val title: String,
    val url: String,
    val desktopMode: Boolean,
    val isActive: Boolean
)

class TabLifecycleManager(context: Context) {

    private val prefs = context.applicationContext
        .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    /**
     * Bekukan WebView di latar belakang agar proses renderer dapat dilepas Android saat RAM menipis,
     * sementara tab yang sedang aktif tetap mendapat prioritas penuh.
     */
    fun applyHibernationPolicy(
        activeTabId: String,
        webViewsByTabId: Map<String, WebView>,
        autoHibernateEnabled: Boolean
    ) {
        webViewsByTabId.forEach { (tabId, webView) ->
            if (tabId == activeTabId) {
                webView.onResume()
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    webView.setRendererPriorityPolicy(
                        WebView.RENDERER_PRIORITY_IMPORTANT,
                        false
                    )
                }
            } else if (autoHibernateEnabled) {
                webView.onPause()
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    webView.setRendererPriorityPolicy(
                        WebView.RENDERER_PRIORITY_WAIVED,
                        true
                    )
                }
            }
        }
    }

    /**
     * Simpan seluruh tab non-incognito secara lokal agar tidak hilang jika OS menghentikan aplikasi.
     */
    fun saveSessionSnapshot(tabs: List<TabSessionSnapshot>) {
        val array = JSONArray()
        tabs.forEach { tab ->
            array.put(
                JSONObject().apply {
                    put("id", tab.id)
                    put("title", tab.title)
                    put("url", tab.url)
                    put("desktopMode", tab.desktopMode)
                    put("isActive", tab.isActive)
                }
            )
        }
        prefs.edit().putString(KEY_SAVED_TABS, array.toString()).apply()
    }

    /**
     * Pulihkan daftar tab terakhir saat Karsa Browser dibuka kembali.
     */
    fun restoreSessionSnapshot(): List<TabSessionSnapshot> {
        val raw = prefs.getString(KEY_SAVED_TABS, null) ?: return emptyList()
        return runCatching {
            val array = JSONArray(raw)
            buildList(array.length()) {
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    add(
                        TabSessionSnapshot(
                            id = obj.optString("id", "tab-$i"),
                            title = obj.optString("title", "Beranda"),
                            url = obj.optString("url", "karsa://home"),
                            desktopMode = obj.optBoolean("desktopMode", false),
                            isActive = obj.optBoolean("isActive", i == 0)
                        )
                    )
                }
            }
        }.getOrDefault(emptyList())
    }

    fun clearSessionSnapshot() {
        prefs.edit().remove(KEY_SAVED_TABS).apply()
    }

    companion object {
        private const val PREFS_NAME = "karsa_tab_session_store"
        private const val KEY_SAVED_TABS = "saved_tabs_json_v1"
    }
}`,
  },
  {
    id: 'owasp-safe-uri-validator',
    filename: 'SafeUriValidator.kt',
    path: 'app/src/main/java/id/karsa/browser/security/SafeUriValidator.kt',
    language: 'Kotlin',
    category: 'security',
    module: 'OWASP MASVS · Validasi URI Ketat (WebView & External Intent)',
    summary: 'Memvalidasi setiap URL/URI sebelum dimuat ke WebView atau dari intent luar: izinkan https://, http:// (dengan peringatan), whitelist wallet resmi (wc:/rabby:) lewat konfirmasi, dan tolak total file://, content://, intent:// tak dikenal, serta javascript: eksternal.',
    code: `package id.karsa.browser.security

import android.net.Uri

enum class UriSource {
    ADDRESS_BAR,
    WEBVIEW_NAVIGATION,
    EXTERNAL_INTENT
}

sealed class UriValidationResult {
    data class AllowHttps(val normalizedUrl: String) : UriValidationResult()
    data class AllowHttpWithWarning(val normalizedUrl: String, val host: String) : UriValidationResult()
    data class AllowInternal(val normalizedUrl: String) : UriValidationResult()
    data class RequireWalletConfirmation(
        val rawUri: String,
        val scheme: String,
        val targetWallet: VerifiedWalletApp
    ) : UriValidationResult()
    data class Reject(val rawUri: String, val scheme: String, val reason: String) : UriValidationResult()
}

object SafeUriValidator {

    private val hardBlockedSchemes = setOf(
        "file",
        "content",
        "javascript",
        "vbscript",
        "data",
        "blob",
        "intent",
        "android-app",
        "market"
    )

    private val walletSchemeMap = mapOf(
        "rabby" to VerifiedWalletApp.RABBY,
        "wc" to VerifiedWalletApp.RABBY,
        "metamask" to VerifiedWalletApp.METAMASK,
        "phantom" to VerifiedWalletApp.PHANTOM,
        "okx" to VerifiedWalletApp.OKX
    )

    /**
     * Validasi ketat sebelum memanggil webView.loadUrl() atau menangani Intent ACTION_VIEW.
     */
    fun validate(rawInput: String?, source: UriSource): UriValidationResult {
        val trimmed = rawInput?.trim().orEmpty()
        if (trimmed.isEmpty()) {
            return UriValidationResult.Reject("", "", "URI kosong ditolak.")
        }

        // Tolak karakter kontrol ASCII / newline injection pada header atau URL
        if (trimmed.any { it.code < 0x20 || it.code == 0x7F }) {
            return UriValidationResult.Reject(trimmed, "invalid", "URI mengandung karakter kontrol berbahaya.")
        }

        val uri = runCatching { Uri.parse(trimmed) }.getOrNull()
            ?: return UriValidationResult.Reject(trimmed, "invalid", "Format URI tidak valid.")

        val scheme = uri.scheme?.lowercase().orEmpty()

        // 1. Tolak TOTAL skema berbahaya: file://, content://, javascript:, intent:// tak dikenal
        if (scheme in hardBlockedSchemes) {
            return UriValidationResult.Reject(
                rawUri = trimmed,
                scheme = scheme,
                reason = "Skema '$scheme://' diblokir oleh SafeUriValidator (OWASP MASVS)."
            )
        }

        // 2. Halaman internal Karsa hanya boleh diakses dari dalam aplikasi (bukan intent luar)
        if (scheme == "karsa") {
            return if (source == UriSource.EXTERNAL_INTENT) {
                UriValidationResult.Reject(
                    rawUri = trimmed,
                    scheme = scheme,
                    reason = "Skema internal 'karsa://' tidak dapat dipicu dari intent eksternal."
                )
            } else {
                UriValidationResult.AllowInternal(trimmed)
            }
        }

        // 3. Whitelist skema aplikasi wallet resmi -> WAJIB lewat dialog konfirmasi eksplisit
        val matchedWallet = walletSchemeMap[scheme]
        if (matchedWallet != null) {
            return if (source == UriSource.EXTERNAL_INTENT) {
                UriValidationResult.Reject(
                    rawUri = trimmed,
                    scheme = scheme,
                    reason = "Deep-link wallet dari intent luar tidak diteruskan otomatis."
                )
            } else {
                UriValidationResult.RequireWalletConfirmation(
                    rawUri = trimmed,
                    scheme = "$scheme:",
                    targetWallet = matchedWallet
                )
            }
        }

        // 4. Hanya izinkan https:// dan http:// (dengan peringatan untuk non-localhost)
        val host = uri.host?.lowercase().orEmpty()
        if (host.isBlank()) {
            return UriValidationResult.Reject(trimmed, scheme, "Host tujuan kosong atau tidak valid.")
        }

        return when (scheme) {
            "https" -> UriValidationResult.AllowHttps(trimmed)
            "http" -> {
                val isLoopback = host == "localhost" || host == "127.0.0.1"
                if (isLoopback) {
                    UriValidationResult.AllowHttps(trimmed)
                } else {
                    UriValidationResult.AllowHttpWithWarning(trimmed, host)
                }
            }
            else -> UriValidationResult.Reject(
                rawUri = trimmed,
                scheme = scheme.ifBlank { "unknown" },
                reason = "Skema '$scheme' tidak termasuk daftar izin aman."
            )
        }
    }
}`,
  },
  {
    id: 'owasp-secure-js-bridge',
    filename: 'SecureJsBridge.kt',
    path: 'app/src/main/java/id/karsa/browser/security/SecureJsBridge.kt',
    language: 'Kotlin',
    category: 'security',
    module: 'OWASP MASVS · Penguncian @JavascriptInterface (Per-Session Nonce)',
    summary: 'Melindungi seluruh jembatan native (@JavascriptInterface) untuk DevTools, Terminal, dan FPS Monitor dengan token sesi acak 256-bit per-tab (nonce) serta validasi origin di Main Thread.',
    code: `package id.karsa.browser.security

import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.WebView
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

interface NativeBridgeDelegate {
    fun onFpsSampleReported(tabId: String, fps: Int)
    fun onDevToolsConsoleEvent(tabId: String, level: String, message: String)
    fun onDomElementInspected(tabId: String, selectorJson: String)
}

/**
 * Jembatan Native terkunci berbasis OWASP MASVS:
 * - Setiap tab memiliki [sessionNonce] kriptografis acak yang diganti setiap navigasi baru.
 * - Setiap panggilan dari JS WAJIB menyertakan token yang cocok (constant-time comparison)
 *   DAN origin WebView aktif WAJIB lolos validasi sebelum meneruskan ke delegate native.
 */
class SecureJsBridge(
    private val tabId: String,
    private val webView: WebView,
    private val delegate: NativeBridgeDelegate,
    private val isOriginAllowed: (origin: String) -> Boolean
) {
    private val mainHandler = Handler(Looper.getMainLooper())
    private val secureRandom = SecureRandom()

    @Volatile
    private var activeNonceBytes: ByteArray = generateFreshNonceBytes()

    @Volatile
    private var activeNonceToken: String = encodeToken(activeNonceBytes)

    /**
     * Rotasi token sesi setiap kali tab memuat halaman baru agar skrip lama tidak dapat memanggil bridge.
     */
    fun rotateSessionNonce(): String {
        val next = generateFreshNonceBytes()
        activeNonceBytes = next
        activeNonceToken = encodeToken(next)
        return activeNonceToken
    }

    @JavascriptInterface
    fun reportFps(token: String?, fps: Int) {
        if (!authorizeCall(token)) return
        val clampedFps = fps.coerceIn(1, 240)
        mainHandler.post { delegate.onFpsSampleReported(tabId, clampedFps) }
    }

    @JavascriptInterface
    fun postConsoleLog(token: String?, level: String?, message: String?) {
        if (!authorizeCall(token)) return
        val safeLevel = when (level?.lowercase()) {
            "warn", "error", "info" -> level.lowercase()
            else -> "log"
        }
        val safeMessage = message.orEmpty().take(MAX_PAYLOAD_CHARS)
        mainHandler.post { delegate.onDevToolsConsoleEvent(tabId, safeLevel, safeMessage) }
    }

    @JavascriptInterface
    fun reportInspectedNode(token: String?, selectorJson: String?) {
        if (!authorizeCall(token)) return
        val safeJson = selectorJson.orEmpty().take(MAX_PAYLOAD_CHARS)
        mainHandler.post { delegate.onDomElementInspected(tabId, safeJson) }
    }

    /**
     * Bangun skrip IIFE tertutup untuk menyuntikkan token tanpa membocorkannya ke objek global window.
     */
    fun buildScopedInstrumentationScript(): String {
        val token = activeNonceToken
        return """
            (() => {
              'use strict';
              const __karsaNonce = '$token';
              if (!window.$BRIDGE_NAME) return;
              let frames = 0;
              let last = performance.now();
              const tick = (now) => {
                frames++;
                if (now - last >= 1000) {
                  try { window.$BRIDGE_NAME.reportFps(__karsaNonce, frames); } catch (_) {}
                  frames = 0;
                  last = now;
                }
                requestAnimationFrame(tick);
              };
              requestAnimationFrame(tick);
            })();
        """.trimIndent()
    }

    private fun authorizeCall(providedToken: String?): Boolean {
        if (providedToken.isNullOrBlank()) return false

        // 1. Constant-time comparison untuk mencegah timing side-channel
        val providedBytes = providedToken.toByteArray(Charsets.UTF_8)
        val expectedBytes = activeNonceToken.toByteArray(Charsets.UTF_8)
        if (!MessageDigest.isEqual(providedBytes, expectedBytes)) return false

        // 2. Verifikasi origin aktif langsung di Main Thread (bukan mempercayai parameter dari JS)
        val currentOrigin = readCurrentOriginOnMainThread() ?: return false
        return isOriginAllowed(currentOrigin)
    }

    private fun readCurrentOriginOnMainThread(): String? {
        var resolvedUrl: String? = null
        if (Looper.myLooper() == Looper.getMainLooper()) {
            resolvedUrl = webView.url
        } else {
            val latch = CountDownLatch(1)
            mainHandler.post {
                resolvedUrl = webView.url
                latch.countDown()
            }
            latch.await(150, TimeUnit.MILLISECONDS)
        }
        val uri = resolvedUrl?.let { runCatching { Uri.parse(it) }.getOrNull() } ?: return null
        val scheme = uri.scheme?.lowercase() ?: return null
        val host = uri.host?.lowercase() ?: return null
        if (scheme != "https" && host != "localhost" && host != "127.0.0.1") return null
        return "$scheme://$host"
    }

    private fun generateFreshNonceBytes(): ByteArray =
        ByteArray(32).also { secureRandom.nextBytes(it) }

    private fun encodeToken(bytes: ByteArray): String =
        Base64.encodeToString(bytes, Base64.NO_WRAP or Base64.URL_SAFE or Base64.NO_PADDING)

    companion object {
        const val BRIDGE_NAME = "__KarsaSecureBridge"
        private const val MAX_PAYLOAD_CHARS = 4096
    }
}`,
  },
  {
    id: 'owasp-webview-health-checker',
    filename: 'WebViewHealthChecker.kt',
    path: 'app/src/main/java/id/karsa/browser/security/WebViewHealthChecker.kt',
    language: 'Kotlin',
    category: 'security',
    module: 'OWASP MASVS · Pemeriksa Kesehatan Engine WebView HP',
    summary: 'Memeriksa versi Android System WebView terpasang melalui WebViewCompat, mendeteksi engine usang, dan menyediakan tautan cepat pembaruan ke Google Play Store.',
    code: `package id.karsa.browser.security

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.webkit.WebViewCompat

data class WebViewHealthStatus(
    val packageName: String,
    val versionName: String,
    val majorVersion: Int,
    val isOutdated: Boolean,
    val summaryMessage: String
)

object WebViewHealthChecker {

    // Batas minimal Chromium WebView yang masih menerima patch keamanan aktif
    const val MIN_RECOMMENDED_MAJOR_VERSION = 126
    private const val DEFAULT_WEBVIEW_PACKAGE = "com.google.android.webview"

    /**
     * Periksa versi paket Android System WebView (atau Trichrome/Chrome) yang aktif di HP.
     */
    fun inspect(context: Context): WebViewHealthStatus {
        val pkgInfo = WebViewCompat.getCurrentWebViewPackage(context)
        if (pkgInfo == null) {
            return WebViewHealthStatus(
                packageName = DEFAULT_WEBVIEW_PACKAGE,
                versionName = "Tidak terdeteksi",
                majorVersion = 0,
                isOutdated = true,
                summaryMessage = "Engine Android System WebView tidak terdeteksi. Perbarui lewat Google Play Store."
            )
        }

        val versionName = pkgInfo.versionName.orEmpty().ifBlank { "0.0.0.0" }
        val major = versionName.substringBefore('.').toIntOrNull() ?: 0
        val outdated = major in 1 until MIN_RECOMMENDED_MAJOR_VERSION

        val summary = if (outdated) {
            "Android System WebView v$major sudah usang (minimal v$MIN_RECOMMENDED_MAJOR_VERSION). " +
                "Perbarui segera di Play Store untuk mendapatkan patch keamanan terbaru."
        } else {
            "Engine Android System WebView ($versionName) mutakhir dan mendukung patch keamanan terbaru."
        }

        return WebViewHealthStatus(
            packageName = pkgInfo.packageName ?: DEFAULT_WEBVIEW_PACKAGE,
            versionName = versionName,
            majorVersion = major,
            isOutdated = outdated,
            summaryMessage = summary
        )
    }

    /**
     * Buka halaman resmi pembaruan Android System WebView di Google Play Store
     * (dengan fallback ke halaman web Play Store jika aplikasi Play Store tidak tersedia).
     */
    fun openPlayStoreUpdate(context: Context, packageName: String = DEFAULT_WEBVIEW_PACKAGE) {
        val safePkg = packageName.ifBlank { DEFAULT_WEBVIEW_PACKAGE }
        val marketIntent = Intent(
            Intent.ACTION_VIEW,
            Uri.parse("market://details?id=$safePkg")
        ).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        try {
            context.startActivity(marketIntent)
        } catch (_: ActivityNotFoundException) {
            val webIntent = Intent(
                Intent.ACTION_VIEW,
                Uri.parse("https://play.google.com/store/apps/details?id=$safePkg")
            ).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(webIntent)
        }
    }
}`,
  },
  {
    id: 'perf-baseline-profile',
    filename: 'baseline-prof.txt',
    path: 'app/src/main/baseline-prof.txt',
    language: 'Profile',
    category: 'security',
    module: 'Android Best Practices · Baseline Profile Startup AOT',
    summary: 'Aturan ART Baseline Profile manual untuk mengompilasi AOT jalur kritis startup: Activity utama, KarsaTopBar, KarsaBottomBar, validasi URI, dan inisialisasi WebView agar buka aplikasi instan & bebas lag.',
    code: `# ===================================================================
# Karsa Browser — ART Baseline Profile (app/src/main/baseline-prof.txt)
# Kompilasi AOT saat instalasi untuk mempercepat cold startup & scroll Compose.
# ===================================================================

# 1. Jalur Kritis Startup: Application & MainActivity
HSPLid/karsa/browser/KarsaApplication;->onCreate()V
HSPLid/karsa/browser/MainActivity;->onCreate(Landroid/os/Bundle;)V
HSPLid/karsa/browser/MainActivity;->onNewIntent(Landroid/content/Intent;)V

# 2. Komponen UI Utama Jetpack Compose (Top Bar, Bottom Bar, Home)
HSPLid/karsa/browser/ui/KarsaBrowserScreenKt;->KarsaTopBar(**)V
HSPLid/karsa/browser/ui/KarsaBrowserScreenKt;->KarsaBottomBar(**)V
HSPLid/karsa/browser/ui/KarsaBrowserScreenKt;->KarsaSystemBarsEffect(ZZLandroidx/compose/runtime/Composer;II)V
HSPLid/karsa/browser/ui/KarsaHomeAndUaPolicyKt;->BookmarkFloatingToast(**)V

# 3. Inisialisasi & Hardening WebView (Jalur Navigasi Pertama)
HSPLid/karsa/browser/security/WebViewSecurityConfig;->apply(Landroid/webkit/WebView;)V
HSPLid/karsa/browser/security/KarsaSecureWebViewClient;->shouldOverrideUrlLoading(**)Z
HSPLid/karsa/browser/security/SafeUriValidator;->validate(Ljava/lang/String;Lid/karsa/browser/security/UriSource;)Lid/karsa/browser/security/UriValidationResult;
HSPLid/karsa/browser/security/UrlSecurityParser;->parse(Ljava/lang/String;)Lid/karsa/browser/security/ParsedUrlSecurity;
HSPLid/karsa/browser/ui/KarsaUserAgentPolicy;->applyToWebSettings(Landroid/webkit/WebSettings;Z)V

# 4. Pemulihan Sesi & Hibernasi Tab Ringan
HSPLid/karsa/browser/session/TabLifecycleManager;->restoreSessionSnapshot()Ljava/util/List;
HSPLid/karsa/browser/session/TabLifecycleManager;->applyHibernationPolicy(**)V
HSPLid/karsa/browser/security/WebViewHealthChecker;->inspect(Landroid/content/Context;)Lid/karsa/browser/security/WebViewHealthStatus;

# 5. Kelas Startup Compose Runtime & WebView AndroidX
Landroidx/webkit/WebViewCompat;
Landroidx/compose/runtime/ComposerImpl;
Landroidx/compose/ui/platform/AndroidComposeView;`,
  },
  {
    id: 'perf-lazy-panel-coordinator',
    filename: 'LazyPanelCoordinator.kt',
    path: 'app/src/main/java/id/karsa/browser/ui/LazyPanelCoordinator.kt',
    language: 'Kotlin',
    category: 'core',
    module: 'Optimasi Startup · Lazy Initialization Panel Sekunder',
    summary: 'Pola lazy initialization berbasis Compose & Kotlin lazy(NONE) agar panel DevTools, Terminal, dan Pengaturan baru diinisialisasi saat pertama kali dibuka pengguna — menjaga cold start tetap ringan.',
    code: `package id.karsa.browser.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

enum class SecondaryPanel {
    NONE,
    DEVTOOLS,
    TERMINAL,
    SETTINGS_MENU
}

/**
 * Koordinator Lazy-Init:
 * - State berat (buffer log Terminal, daftar request Network DevTools, daftar Pengaturan)
 *   TIDAK dialokasikan saat MainActivity.onCreate().
 * - Komponen hanya dikomposisi di tree Compose ketika pengguna mengetuk tombolnya.
 */
@Stable
class LazyPanelCoordinator {
    var activePanel by mutableStateOf(SecondaryPanel.NONE)
        private set

    // Alokasi memori berat ditunda hingga pertama kali diakses (LazyThreadSafetyMode.NONE untuk UI thread)
    val devToolsBuffer by lazy(LazyThreadSafetyMode.NONE) { ArrayDeque<String>(64) }
    val terminalHistory by lazy(LazyThreadSafetyMode.NONE) { ArrayDeque<String>(64) }

    fun open(panel: SecondaryPanel) {
        activePanel = panel
    }

    fun closeAll() {
        activePanel = SecondaryPanel.NONE
    }
}

@Composable
fun LazySecondaryPanelHost(
    coordinator: LazyPanelCoordinator,
    devToolsContent: @Composable () -> Unit,
    terminalContent: @Composable () -> Unit,
    settingsSheetContent: @Composable () -> Unit
) {
    // Zero composition overhead selama startup (activePanel == NONE)
    when (coordinator.activePanel) {
        SecondaryPanel.NONE -> Unit
        SecondaryPanel.DEVTOOLS -> devToolsContent()
        SecondaryPanel.TERMINAL -> terminalContent()
        SecondaryPanel.SETTINGS_MENU -> settingsSheetContent()
    }
}`,
  },
];
