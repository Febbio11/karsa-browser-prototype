import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  ShieldCheck,
  Puzzle,
  Terminal as TerminalIcon,
  Gauge,
  Maximize,
  Minimize,
  MoreVertical,
  Plus,
  X,
  Moon,
  Sun,
  Smartphone,
  Tablet,
  Search,
  Lock,
  Snowflake,
  EyeOff,
  Globe,
  ShieldAlert,
  KeyRound,
  Code2,
  Users,
  RotateCcw,
  ClipboardPaste,
} from 'lucide-react';
import {
  BookmarkItem,
  BrowserProfile,
  BrowserTab,
  ChromeExtensionItem,
  DeviceOrientation,
  DevToolsLayoutMode,
  DevToolsTab,
  DownloadItem,
  FlexiblePopupState,
  FpsLimit,
  HistoryItem,
  InspectableElement,
  NetworkRequestEntry,
  OrientationLockMode,
  PermissionValue,
  ProxyConfig,
  RenderConfig,
  SitePermissions,
  SiteStorageItem,
  StorageKeyValue,
  TerminalEntry,
  VaultCredential,
} from '../types/browser';
import { DesktopGameCanvas, INSPECTABLE_NODES } from './DesktopGameCanvas';
import { FlexiblePopup } from './FlexiblePopup';
import { FloatingTerminal } from './FloatingTerminal';
import { MobileDevTools } from './MobileDevTools';
import { ActiveSheetType, BrowserSheets } from './BrowserSheets';
import { SiteInfoPopover } from './SiteInfoPopover';
import { ExtensionsPopover } from './ExtensionsPopover';
import { AddressBarOverlay } from './AddressBarOverlay';

interface BrowserSimulatorProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

const INITIAL_TABS: BrowserTab[] = [
  {
    id: 'tab-game',
    title: 'Aether Frontier — Desktop Web3 Tactics',
    url: 'https://play.aetherfrontier.gg/arena?mode=desktop',
    group: 'Game Web3',
    type: 'game',
    hibernated: false,
    ramMb: 268,
    faviconLabel: 'AF',
  },
  {
    id: 'tab-market',
    title: 'Aether Marketplace — Arbitrum',
    url: 'https://market.aetherfrontier.gg/inventory',
    group: 'Game Web3',
    type: 'docs',
    hibernated: true,
    ramMb: 18,
    faviconLabel: 'MK',
  },
  {
    id: 'tab-portfolio',
    title: 'DeBank Portfolio Dashboard',
    url: 'https://debank.com/profile/0x71c...94a2',
    group: 'Wallet & Sosial',
    type: 'docs',
    hibernated: true,
    ramMb: 16,
    faviconLabel: 'DB',
  },
];

const INITIAL_PROFILES: BrowserProfile[] = [
  {
    id: 'prof-main',
    name: 'Utama · Akun Guild',
    badge: 'P1',
    walletLabel: 'Rabby · 0x71C...94A2',
    proxySummary: 'DIRECT',
    cookieCount: 14,
    activeExtensions: 4,
  },
  {
    id: 'prof-alt1',
    name: 'Farming Alt #1 (Terisolasi)',
    badge: 'P2',
    walletLabel: 'MetaMask · 0x9F2...18D4',
    proxySummary: 'SOCKS5 sg1:1080',
    cookieCount: 6,
    activeExtensions: 2,
  },
  {
    id: 'prof-alt2',
    name: 'Airdrop Alt #2 (Terisolasi)',
    badge: 'P3',
    walletLabel: 'Phantom · 8xK...3pQ',
    proxySummary: 'HTTPS jp2:8443',
    cookieCount: 4,
    activeExtensions: 2,
  },
];

const INITIAL_EXTENSIONS: ChromeExtensionItem[] = [
  {
    id: 'ext-rabby',
    name: 'Rabby Wallet',
    version: '0.92.84',
    category: 'Web3 Wallet',
    description: 'Dompet EVM multi-chain dengan simulasi transaksi pra-tanda tangan.',
    enabled: true,
    ramMb: 42,
    source: 'Chrome Web Store',
    permissions: ['activeTab', 'storage', 'EIP-6963'],
  },
  {
    id: 'ext-metamask',
    name: 'MetaMask',
    version: '12.6.1',
    category: 'Web3 Wallet',
    description: 'Ekstensi wallet Ethereum & L2 standar dari Chrome Web Store.',
    enabled: true,
    ramMb: 48,
    source: 'Chrome Web Store',
    permissions: ['activeTab', 'storage', 'EIP-6963'],
  },
  {
    id: 'ext-phantom',
    name: 'Phantom Wallet',
    version: '24.18.0',
    category: 'Web3 Wallet',
    description: 'Dompet Solana & multichain untuk game Web3 berbasis browser.',
    enabled: false,
    ramMb: 39,
    source: 'Chrome Web Store',
    permissions: ['activeTab', 'storage'],
  },
  {
    id: 'ext-ublock',
    name: 'uBlock Origin Lite',
    version: '2026.11',
    category: 'Keamanan',
    description: 'Pemblokir pelacak & skrip iklan Manifest V3 hemat memori.',
    enabled: true,
    ramMb: 14,
    source: 'Chrome Web Store',
    permissions: ['declarativeNetRequest'],
  },
  {
    id: 'ext-runner',
    name: 'Karsa Automation Helper (.crx)',
    version: '1.4.0',
    category: 'Automasi',
    description: 'Ekstensi utilitas lokal untuk menyimpan makro & hot-key game.',
    enabled: true,
    ramMb: 11,
    source: 'File .crx Lokal',
    permissions: ['scripting', 'activeTab'],
  },
];

const INITIAL_CREDENTIALS: VaultCredential[] = [
  {
    id: 'cred-1',
    site: 'x.com (Twitter OAuth)',
    username: '@arief_karsa',
    type: 'Passkey (FIDO2)',
    lastUsed: 'Hari ini, 23:12',
    biometricProtected: true,
  },
  {
    id: 'cred-2',
    site: 'discord.com',
    username: 'karsa.player#4821',
    type: 'Passkey (FIDO2)',
    lastUsed: 'Kemarin',
    biometricProtected: true,
  },
  {
    id: 'cred-3',
    site: 'play.aetherfrontier.gg',
    username: 'arief.frontier@karsa.id',
    type: 'Kata Sandi Terenkripsi',
    lastUsed: '2 hari lalu',
    biometricProtected: true,
  },
];

const INITIAL_BOOKMARKS: BookmarkItem[] = [
  { id: 'b1', title: 'Aether Frontier Arena', url: 'https://play.aetherfrontier.gg/arena?mode=desktop', folder: 'Game Web3' },
  { id: 'b2', title: 'Pixels Online (Desktop)', url: 'https://play.pixels.xyz/', folder: 'Game Web3' },
  { id: 'b3', title: 'Chrome Web Store (.crx)', url: 'https://chromewebstore.google.com/', folder: 'Ekstensi' },
  { id: 'b4', title: 'Arbitrum Bridge', url: 'https://bridge.arbitrum.io/', folder: 'Wallet' },
];

const INITIAL_HISTORY: HistoryItem[] = [
  { id: 'h1', title: 'Aether Frontier — Desktop Web3 Tactics', url: 'https://play.aetherfrontier.gg/arena', visitedAt: '23:41' },
  { id: 'h2', title: 'OAuth X (Diblokir ke Pop-up Internal)', url: 'https://x.com/i/oauth2/authorize', visitedAt: '23:38' },
  { id: 'h3', title: 'Chrome Web Store — Rabby Wallet', url: 'https://chromewebstore.google.com/detail/rabby', visitedAt: '22:55' },
];

const INITIAL_DOWNLOADS: DownloadItem[] = [
  { id: 'd1', filename: 'rabby-wallet-0.92.84.crx', size: '6,4 MB', progress: 100, status: 'Selesai' },
  { id: 'd2', filename: 'aether-auto-harvest.user.js', size: '14 KB', progress: 100, status: 'Selesai' },
];

const INITIAL_STORAGE: SiteStorageItem[] = [
  { origin: 'play.aetherfrontier.gg', cookies: 14, cacheMb: 48.2, indexedDbMb: 21.5 },
  { origin: 'x.com', cookies: 9, cacheMb: 6.4, indexedDbMb: 1.2 },
  { origin: 'discord.com', cookies: 7, cacheMb: 11.8, indexedDbMb: 3.4 },
];

const INITIAL_NETWORK: NetworkRequestEntry[] = [
  {
    id: 'net-1',
    method: 'WS',
    url: 'wss://rpc.aetherfrontier.gg/ws/arena',
    host: 'rpc.aetherfrontier.gg',
    status: 101,
    type: 'websocket',
    sizeKb: '4,2 KB',
    durationMs: 28,
    timestamp: '23:45:01',
    requestHeaders: { Upgrade: 'websocket', Origin: 'https://play.aetherfrontier.gg', 'User-Agent': 'Chrome/131.0 Windows NT 10.0' },
    responseHeaders: { Upgrade: 'websocket', Connection: 'Upgrade' },
    payload: '{"op":"subscribe","channel":"island_nodes","chainId":42161}',
    responsePreview: '{"event":"tick","activeMines":4,"serverFps":60,"status":"synced"}',
  },
  {
    id: 'net-2',
    method: 'POST',
    url: 'https://arb1.arbitrum.io/rpc',
    host: 'arb1.arbitrum.io',
    status: 200,
    type: 'fetch',
    sizeKb: '1,1 KB',
    durationMs: 64,
    timestamp: '23:45:04',
    requestHeaders: { 'Content-Type': 'application/json', 'Sec-CH-UA-Mobile': '?0' },
    responseHeaders: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    payload: '{"jsonrpc":"2.0","id":1,"method":"eth_getBalance","params":["0x71C...94A2","latest"]}',
    responsePreview: '{"jsonrpc":"2.0","id":1,"result":"0x18e2a4b0900000"}',
  },
  {
    id: 'net-3',
    method: 'GET',
    url: 'https://play.aetherfrontier.gg/api/v2/profile',
    host: 'play.aetherfrontier.gg',
    status: 200,
    type: 'fetch',
    sizeKb: '2,8 KB',
    durationMs: 42,
    timestamp: '23:45:06',
    requestHeaders: { Accept: 'application/json', 'Sec-CH-UA-Platform': '"Windows"' },
    responseHeaders: { 'Content-Type': 'application/json' },
    payload: '(GET request — tanpa body)',
    responsePreview: '{"player":"arief_karsa","tier":"Citadel IV","crystals":1420}',
  },
];

const INITIAL_KV_STORAGE: StorageKeyValue[] = [
  { id: 'kv-1', store: 'localStorage', origin: 'play.aetherfrontier.gg', key: 'karsa.viewportMode', value: 'desktop-1600x900' },
  { id: 'kv-2', store: 'localStorage', origin: 'play.aetherfrontier.gg', key: 'aether.graphicsQuality', value: 'high-webgl2' },
  { id: 'kv-3', store: 'cookies', origin: 'play.aetherfrontier.gg', key: 'af_session_id', value: 'eyJhbGciOiJFUzI1NiJ9.karsa_p1' },
  { id: 'kv-4', store: 'sessionStorage', origin: 'play.aetherfrontier.gg', key: 'oauth_pkce_verifier', value: 'v9K2mPqR8xL1nT4wB7' },
  { id: 'kv-5', store: 'indexedDB', origin: 'play.aetherfrontier.gg', key: 'tilemap_cache_v4', value: 'Blob(18.4 MB · Arbitrum Arena)' },
];

const INITIAL_PERMISSIONS: SitePermissions = {
  clipboard: 'allow',
  notifications: 'ask',
  camera: 'block',
  microphone: 'block',
  location: 'block',
  popups: 'allow',
  autoplay: 'allow',
};

function nowStamp(): string {
  return new Date().toTimeString().slice(0, 8);
}

export const BrowserSimulator: React.FC<BrowserSimulatorProps> = ({ isDark, onToggleTheme }) => {
  const [orientation, setOrientation] = useState<DeviceOrientation>('landscape');
  const [orientationLock, setOrientationLock] = useState<OrientationLockMode>('auto');
  const [fullScreen, setFullScreen] = useState(false);

  // Tabs & Navigation
  const [tabs, setTabs] = useState<BrowserTab[]>(INITIAL_TABS);
  const [activeTabId, setActiveTabId] = useState<string>('tab-game');
  const [addressInput, setAddressInput] = useState(INITIAL_TABS[0].url);
  const [tabSwitcherOpen, setTabSwitcherOpen] = useState(false);

  // Mobile Address / Search Bar Focus Mode (Standard Chrome/Brave Mobile Flow)
  const [urlFocusMode, setUrlFocusMode] = useState(false);
  const [searchDraft, setSearchDraft] = useState('');
  const [clipboardUrl, setClipboardUrl] = useState('https://play.pixels.xyz/?mode=desktop');
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Multi-Profile Container State (Spec 14)
  const [profiles, setProfiles] = useState<BrowserProfile[]>(INITIAL_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string>(INITIAL_PROFILES[0].id);

  // Render, Viewport, Smart Zoom & Anti-Pull-to-Refresh Config
  const [renderConfig, setRenderConfig] = useState<RenderConfig>({
    renderScale: 1.0,
    fpsLimit: 60,
    hardwareAcceleration: true,
    graphicsSaver: false,
    autoFitDesktop: true,
    manualZoom: 100,
    forceZoom: true,
    dpiScale: 1.0,
    virtualResolution: '1600x900',
    virtualMouse: false,
    disablePullToRefreshGlobal: true,
    disablePullToRefreshPerSite: true,
    forceDarkMode: false,
    translation: {
      enabled: false,
      sourceLang: 'auto',
      targetLang: 'id',
      detectedLang: 'en',
      autoTranslateForeign: true,
    },
  });
  const [savedSiteZooms, setSavedSiteZooms] = useState<Record<string, number>>({
    'play.aetherfrontier.gg': 100,
  });
  const [liveFps, setLiveFps] = useState<number>(60);

  // Game & Auth State (preserved across Full Screen Orientation changes without reload!)
  const [crystals, setCrystals] = useState<number>(1420);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [connectedX, setConnectedX] = useState<string | null>(null);
  const [connectedDiscord, setConnectedDiscord] = useState<string | null>(null);

  // Notice Banner
  const [redirectNotice, setRedirectNotice] = useState<string | null>(null);

  // Flexible Pop-up State
  const [popup, setPopup] = useState<FlexiblePopupState>({
    open: false,
    kind: 'wallet',
    title: 'Rabby Wallet',
    url: 'chrome-extension://acmacodkjbdgmoleebolmdjonilkdbch/notification.html',
    interceptedIntent: 'Intent metamask://wc diblokir — tetap di Pop-up internal',
    x: 44,
    y: 26,
    width: 350,
    height: 315,
    connected: false,
  });

  // Floating Terminal & Proxy State
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalMinimized, setTerminalMinimized] = useState(false);
  const [terminalDocked, setTerminalDocked] = useState(false);
  const [proxy, setProxy] = useState<ProxyConfig>({
    enabled: false,
    protocol: 'DIRECT',
    host: 'sg1.karsa-proxy.io',
    port: '1080',
    username: 'karsa_user',
    password: '',
    perSession: true,
    latencyMs: null,
  });
  const [terminalEntries, setTerminalEntries] = useState<TerminalEntry[]>([
    {
      id: 't0',
      timestamp: '23:45:01',
      kind: 'output',
      text: 'Karsa Local CDP Terminal & DevTools Console tersinkron. Ketik "help" untuk perintah proxy, FPS, GC, atau paste JS.',
    },
    {
      id: 't1',
      timestamp: '23:45:02',
      kind: 'success',
      text: 'Desktop UA + Force Zoom + Anti-Pull-to-Refresh + Anti-Redirect Lockdown aktif.',
    },
  ]);

  // Mobile-First DevTools State (Spec 12)
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [devToolsMinimized, setDevToolsMinimized] = useState(false);
  const [devToolsLayout, setDevToolsLayout] = useState<DevToolsLayoutMode>('split');
  const [devToolsTab, setDevToolsTab] = useState<DevToolsTab>('elements');
  const [touchInspectActive, setTouchInspectActive] = useState(false);
  const [inspectedElement, setInspectedElement] = useState<InspectableElement>(
    INSPECTABLE_NODES.walletBtn
  );
  const [networkEntries, setNetworkEntries] = useState<NetworkRequestEntry[]>(INITIAL_NETWORK);
  const [kvStorage, setKvStorage] = useState<StorageKeyValue[]>(INITIAL_KV_STORAGE);
  const [perfOverlayEnabled, setPerfOverlayEnabled] = useState(false);

  // Sheets, Site Info Popover, Extensions Popover, Permissions & Browser Utilities
  const [activeSheet, setActiveSheet] = useState<ActiveSheetType>(null);
  const [siteInfoOpen, setSiteInfoOpen] = useState(false);
  const [extensionsOpen, setExtensionsOpen] = useState(false);
  const [antiRedirectForSite, setAntiRedirectForSite] = useState(true);
  const [walletWhitelistEnabled, setWalletWhitelistEnabled] = useState(true);
  const [whitelistedWallets, setWhitelistedWallets] = useState<string[]>(['Rabby Wallet']);
  const [extensions, setExtensions] = useState<ChromeExtensionItem[]>(INITIAL_EXTENSIONS);
  const [externalPassManager, setExternalPassManager] = useState('Karsa Vault (Terenkripsi)');
  const [adBlockEnabled, setAdBlockEnabled] = useState(true);
  const [adsBlockedCount, setAdsBlockedCount] = useState(37);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(INITIAL_BOOKMARKS);
  const [downloads, setDownloads] = useState<DownloadItem[]>(INITIAL_DOWNLOADS);
  const [siteStorage, setSiteStorage] = useState<SiteStorageItem[]>(INITIAL_STORAGE);
  const [sitePermissions, setSitePermissions] = useState<SitePermissions>(INITIAL_PERMISSIONS);
  const [findBarOpen, setFindBarOpen] = useState(false);
  const [findQuery, setFindQuery] = useState('');

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) || tabs[0],
    [tabs, activeTabId]
  );

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeProfileId) || profiles[0],
    [profiles, activeProfileId]
  );

  const currentOrigin = useMemo(() => {
    try {
      const parsed = new URL(activeTab.url);
      return parsed.hostname || 'play.aetherfrontier.gg';
    } catch {
      return 'play.aetherfrontier.gg';
    }
  }, [activeTab.url]);
  const currentSavedZoom = savedSiteZooms[currentOrigin] ?? 100;

  const totalRamMb = useMemo(() => {
    const tabRam = tabs.reduce((acc, t) => acc + (t.hibernated ? 16 : t.ramMb), 0);
    const extRam = extensions.reduce((acc, e) => acc + (e.enabled ? e.ramMb : 0), 0);
    const dtRam = devToolsOpen && !devToolsMinimized ? 34 : 0;
    const scaleFactor = 0.78 + renderConfig.renderScale * 0.22;
    return Math.round((tabRam + extRam + dtRam) * scaleFactor);
  }, [tabs, extensions, renderConfig.renderScale, devToolsOpen, devToolsMinimized]);

  const appendLog = useCallback((kind: TerminalEntry['kind'], text: string) => {
    setTerminalEntries((prev) => [
      ...prev.slice(-45),
      { id: `${Date.now()}-${Math.random()}`, timestamp: nowStamp(), kind, text },
    ]);
  }, []);

  const appendNetwork = useCallback((entry: Omit<NetworkRequestEntry, 'id' | 'timestamp'>) => {
    setNetworkEntries((prev) => [
      { ...entry, id: `net-${Date.now()}-${Math.random()}`, timestamp: nowStamp() },
      ...prev.slice(0, 29),
    ]);
  }, []);

  const showNotice = useCallback((msg: string) => {
    setRedirectNotice(msg);
    window.setTimeout(() => {
      setRedirectNotice((curr) => (curr === msg ? null : curr));
    }, 3800);
  }, []);

  // Auto-focus input whenever mobile Address Bar Focus Mode opens
  useEffect(() => {
    if (urlFocusMode) {
      window.setTimeout(() => {
        urlInputRef.current?.focus();
      }, 10);
    }
  }, [urlFocusMode]);

  const handleEnterUrlFocus = () => {
    setSiteInfoOpen(false);
    setExtensionsOpen(false);
    setTabSwitcherOpen(false);
    setActiveSheet(null);
    setSearchDraft('');
    setUrlFocusMode(true);
  };

  const handleCancelUrlFocus = () => {
    setUrlFocusMode(false);
    setSearchDraft('');
  };

  const handleNavigateActiveTab = (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      handleCancelUrlFocus();
      return;
    }

    let finalUrl = trimmed;
    let derivedTitle = trimmed;

    if (/^(https?:\/\/|karsa:\/\/|chrome-extension:\/\/)/i.test(trimmed)) {
      finalUrl = trimmed;
      try {
        derivedTitle = new URL(trimmed).hostname;
      } catch {
        derivedTitle = trimmed;
      }
    } else if (trimmed.includes('.') && !trimmed.includes(' ')) {
      finalUrl = `https://${trimmed}`;
      derivedTitle = trimmed.split('/')[0];
    } else {
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
      derivedTitle = `Pencarian: ${trimmed}`;
    }

    const isGameArena = finalUrl.includes('aetherfrontier.gg/arena');

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id
          ? {
              ...t,
              url: finalUrl,
              title: isGameArena ? 'Aether Frontier — Desktop Web3 Tactics' : derivedTitle,
              type: isGameArena ? 'game' : 'docs',
              faviconLabel: isGameArena
                ? 'AF'
                : derivedTitle.replace(/^www\./i, '').slice(0, 2).toUpperCase() || 'WB',
            }
          : t
      )
    );
    setAddressInput(finalUrl);
    setUrlFocusMode(false);
    setSearchDraft('');
    appendLog('output', `[Nav] Tab aktif berpindah -> ${finalUrl}`);
  };

  const readClipboardWithFallback = async (): Promise<string> => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = (await navigator.clipboard.readText()).trim();
        if (text) {
          setClipboardUrl(text);
          return text;
        }
      }
    } catch {
      // Clipboard API may be restricted inside sandboxed iframe; fall back smoothly
    }
    return clipboardUrl;
  };

  const handlePasteOnly = async () => {
    const text = await readClipboardWithFallback();
    setSearchDraft(text);
    window.setTimeout(() => {
      urlInputRef.current?.focus();
    }, 10);
  };

  const handlePasteAndGo = async () => {
    const text = await readClipboardWithFallback();
    if (text) {
      handleNavigateActiveTab(text);
    }
  };

  const handleCopyCurrentUrl = async () => {
    const current = activeTab.url;
    setClipboardUrl(current);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(current);
      }
    } catch {
      // Graceful fallback inside iframe
    }
    setCopiedFeedback(true);
    showNotice(`URL disalin ke papan klip: ${current}`);
    window.setTimeout(() => setCopiedFeedback(false), 1800);
  };

  const handleShareCurrentUrl = () => {
    showNotice(`Tautan halaman siap dibagikan: ${activeTab.title} (${activeTab.url})`);
    appendLog('output', `[Share] Membagikan URL aktif: ${activeTab.url}`);
  };

  const handleEditCurrentUrl = () => {
    setSearchDraft(activeTab.url);
    window.setTimeout(() => {
      if (urlInputRef.current) {
        urlInputRef.current.focus();
        urlInputRef.current.select();
      }
    }, 10);
  };

  // Full Screen Orientation Lock Handler (Spec 13 — Auto-reflow without reload!)
  const handleOrientationLock = (lock: OrientationLockMode) => {
    setOrientationLock(lock);
    if (lock === 'portrait') {
      setOrientation('portrait');
      showNotice('Orientasi Full Screen dikunci Vertikal (Portrait) · Auto-reflow tanpa reload game.');
      appendLog('output', '[FullScreen] OrientationLock -> PORTRAIT (auto-reflow WebContents & DevTools).');
    } else if (lock === 'landscape') {
      setOrientation('landscape');
      showNotice('Orientasi Full Screen dikunci Horizontal (Landscape) · Auto-reflow tanpa reload game.');
      appendLog('output', '[FullScreen] OrientationLock -> LANDSCAPE (auto-reflow WebContents & DevTools).');
    } else {
      showNotice('Orientasi Full Screen diatur ke Auto (mengikuti sensor perangkat).');
      appendLog('output', '[FullScreen] OrientationLock -> AUTO.');
    }
  };

  // DevTools Layout Switcher (including promoting DevTools to Separate Tab!)
  const handleChangeDevToolsLayout = (mode: DevToolsLayoutMode) => {
    setDevToolsLayout(mode);
    setDevToolsMinimized(false);
    if (mode === 'tab') {
      const existing = tabs.find((t) => t.type === 'devtools');
      if (existing) {
        setActiveTabId(existing.id);
        setAddressInput(existing.url);
      } else {
        const dtTab: BrowserTab = {
          id: 'tab-devtools',
          title: 'Mobile DevTools — Aether Frontier',
          url: 'karsa://devtools/inspect?target=tab-game',
          group: 'Utilitas',
          type: 'devtools',
          hibernated: false,
          ramMb: 42,
          faviconLabel: 'DT',
        };
        setTabs((prev) => [...prev, dtTab]);
        setActiveTabId(dtTab.id);
        setAddressInput(dtTab.url);
      }
      appendLog('output', '[DevTools] Dipindahkan ke Tab Terpisah.');
    } else if (activeTab.type === 'devtools') {
      setActiveTabId('tab-game');
      setAddressInput(INITIAL_TABS[0].url);
    }
  };

  const handlePinchZoomChange = (nextZoom: number) => {
    setRenderConfig((prev) => ({
      ...prev,
      autoFitDesktop: false,
      manualZoom: nextZoom,
    }));
    setSavedSiteZooms((prev) => ({ ...prev, [currentOrigin]: nextZoom }));
  };

  const enabledExtensionWallets = useMemo(
    () => extensions.filter((e) => e.enabled && e.category === 'Web3 Wallet').map((e) => e.name),
    [extensions]
  );

  const handleEnableWalletWhitelist = useCallback(
    (walletName?: string) => {
      setWalletWhitelistEnabled(true);
      if (walletName) {
        setWhitelistedWallets((prev) => (prev.includes(walletName) ? prev : [...prev, walletName]));
        showNotice(`Whitelist Anti-Redirect: ${walletName} diizinkan via WalletConnect (Sosmed tetap 100% terkunci).`);
        appendLog('success', `[NavGuard] Whitelist WalletConnect diaktifkan untuk ${walletName}.`);
      } else {
        showNotice('Whitelist Aplikasi Wallet Eksternal diaktifkan.');
      }
    },
    [showNotice, appendLog]
  );

  const handleToggleWhitelistedWallet = useCallback(
    (walletName: string) => {
      setWhitelistedWallets((prev) => {
        const exists = prev.includes(walletName);
        const next = exists ? prev.filter((w) => w !== walletName) : [...prev, walletName];
        appendLog(
          'output',
          `[NavGuard] Whitelist ${walletName} -> ${exists ? 'DIHAPUS' : 'DIIZINKAN'} (Sosmed tetap 100% terkunci)`
        );
        return next;
      });
    },
    [appendLog]
  );

  const handleCopyWalletConnectUri = useCallback(
    async (uri: string) => {
      setClipboardUrl(uri);
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(uri);
        }
      } catch {
        // Fallback smoothly inside sandboxed iframe
      }
      showNotice('URI WalletConnect disalin. Tempel di aplikasi Rabby / Wallet lain di HP.');
      appendLog('output', `[WalletConnect] URI sesi disalin ke papan klip: ${uri.slice(0, 44)}...`);
    },
    [showNotice, appendLog]
  );

  const openFlexiblePopup = useCallback(
    (kind: FlexiblePopupState['kind']) => {
      const walletWhitelistText = walletWhitelistEnabled
        ? `Whitelist WalletConnect aktif (${
            whitelistedWallets.length > 0 ? whitelistedWallets.join(', ') : 'Belum dipilih'
          }) · Sosmed tetap 100% terkunci`
        : 'Anti-Redirect ketat: deep-link wallet eksternal diblokir — aktifkan di ikon gembok 🔒';

      const configMap = {
        wallet: {
          title: 'Hubungkan Wallet Web3',
          url: walletWhitelistEnabled
            ? 'wc://walletconnect.karsa/session?dapp=play.aetherfrontier.gg'
            : 'chrome-extension://rabby-wallet/notification.html#connect',
          interceptedIntent: walletWhitelistText,
          toast: walletWhitelistEnabled
            ? 'Anti-Redirect Pintar: Whitelist WalletConnect aktif (Rabby Wallet). Login sosmed tetap 100% terkunci.'
            : 'Anti-Redirect ketat: deep-link wallet luar diblokir. Anda bisa mengizinkan Whitelist di ikon gembok 🔒.',
        },
        'oauth-x': {
          title: 'Login & Otorisasi X',
          url: 'https://x.com/i/oauth2/authorize?client_id=aether_frontier&scope=users.read',
          interceptedIntent: 'Anti-Redirect 100%: Intent twitter:// diblokir — aplikasi X luar tidak dibuka',
          toast: 'Anti-Redirect 100%: intent twitter:// & App Link X diblokir. OAuth wajib tetap di Karsa Browser.',
        },
        'oauth-discord': {
          title: 'Otorisasi Akun Discord',
          url: 'https://discord.com/oauth2/authorize?client_id=984210412&scope=identify',
          interceptedIntent: 'Anti-Redirect 100%: Intent discord:// diblokir — tetap di Pop-up internal',
          toast: 'Anti-Redirect 100%: intent discord:// diblokir dan dialihkan ke Pop-up Fleksibel.',
        },
      }[kind];

      const isWallet = kind === 'wallet';

      setPopup({
        open: true,
        kind,
        title: configMap.title,
        url: configMap.url,
        interceptedIntent:
          isWallet || antiRedirectForSite
            ? configMap.interceptedIntent
            : 'Proteksi Anti-Redirect media sosial sedang dijeda untuk situs ini (tetap disimulasikan internal)',
        x: orientation === 'landscape' ? 56 : 14,
        y: orientation === 'landscape' ? 18 : 28,
        width: isWallet
          ? orientation === 'landscape'
            ? 404
            : 332
          : orientation === 'landscape'
          ? 375
          : 318,
        height: isWallet
          ? orientation === 'landscape'
            ? 378
            : 405
          : orientation === 'landscape'
          ? 310
          : 340,
        connected: false,
      });
      showNotice(
        isWallet || antiRedirectForSite
          ? configMap.toast
          : 'Peringatan: Anti-Redirect media sosial situs ini sedang nonaktif (aktifkan kembali lewat ikon gembok 🔒).'
      );
      appendLog(
        isWallet && walletWhitelistEnabled ? 'success' : 'warn',
        isWallet || antiRedirectForSite
          ? `[NavGuard] ${configMap.interceptedIntent}`
          : `[NavGuard] Anti-Redirect dijeda untuk ${currentOrigin} — deep link diizinkan keluar.`
      );
      appendNetwork({
        method: 'GET',
        url: configMap.url,
        host:
          kind === 'oauth-x'
            ? 'x.com'
            : kind === 'oauth-discord'
            ? 'discord.com'
            : walletWhitelistEnabled
            ? 'relay.walletconnect.com'
            : 'chrome-extension',
        status: 200,
        type: 'document',
        sizeKb: '3,4 KB',
        durationMs: 31,
        requestHeaders: {
          'X-Karsa-NavGuard':
            isWallet && walletWhitelistEnabled
              ? 'Wallet-Whitelist-Allowed'
              : antiRedirectForSite
              ? 'Social-Internal-Locked-100%'
              : 'Pass-Through',
          'Sec-Fetch-Dest': 'document',
        },
        responseHeaders: { 'Content-Type': 'text/html; charset=utf-8' },
        payload: isWallet
          ? '(Wallet connection modal — supports Rabby Mobile / WalletConnect v2 & EIP-6963)'
          : '(Intercepted external social intent converted to internal Flexible Popup)',
        responsePreview: `{"popup":"${configMap.title}","openerAlive":true}`,
      });
    },
    [
      orientation,
      antiRedirectForSite,
      walletWhitelistEnabled,
      whitelistedWallets,
      currentOrigin,
      showNotice,
      appendLog,
      appendNetwork,
    ]
  );

  const handlePromotePopupToTab = () => {
    const newId = `tab-promoted-${Date.now()}`;
    const nextTab: BrowserTab = {
      id: newId,
      title: `${popup.title} (Sesi OAuth Aktif)`,
      url: popup.url,
      group: 'Wallet & Sosial',
      type: popup.kind === 'wallet' ? 'wallet-connect' : popup.kind,
      hibernated: false,
      ramMb: 74,
      faviconLabel: popup.kind === 'wallet' ? 'WL' : popup.kind === 'oauth-x' ? 'X' : 'DC',
    };
    setTabs((prev) => [...prev, nextTab]);
    setActiveTabId(newId);
    setAddressInput(nextTab.url);
    setPopup((p) => ({ ...p, open: false }));
    appendLog('success', `[Reparent] WebContents "${popup.title}" dipindahkan ke Tab Baru tanpa reload.`);
  };

  const handleCompleteAuth = (kind: FlexiblePopupState['kind'], label: string) => {
    if (kind === 'wallet') {
      setConnectedWallet(label);
      if (label.includes('Mobile')) {
        showNotice(`Koneksi berhasil: ${label} aktif tanpa memuat ulang halaman game.`);
        appendNetwork({
          method: 'POST',
          url: 'https://relay.walletconnect.com/v2/session/sign',
          host: 'relay.walletconnect.com',
          status: 200,
          type: 'fetch',
          sizeKb: '0,9 KB',
          durationMs: 48,
          requestHeaders: { 'Content-Type': 'application/json', 'X-Karsa-DeepLink': 'Wallet-Whitelist' },
          responseHeaders: { 'Content-Type': 'application/json' },
          payload: JSON.stringify({ method: 'personal_sign', wallet: label, chainId: 42161 }),
          responsePreview: JSON.stringify({ connected: true, status: label, reloadRequired: false }),
        });
      }
    }
    if (kind === 'oauth-x') setConnectedX(label);
    if (kind === 'oauth-discord') setConnectedDiscord(label);

    setPopup((p) => ({ ...p, open: false }));
    setActiveTabId('tab-game');
    setAddressInput(INITIAL_TABS[0].url);
    appendLog('success', `[Auth] Berhasil terhubung (${kind}): ${label}. Sesi dikembalikan ke tab game tanpa reload.`);
  };

  const handleHarvest = (amount: number) => {
    setCrystals((c) => c + amount);
    appendNetwork({
      method: 'POST',
      url: 'https://play.aetherfrontier.gg/api/v2/harvest',
      host: 'play.aetherfrontier.gg',
      status: 200,
      type: 'fetch',
      sizeKb: '0,6 KB',
      durationMs: 29,
      requestHeaders: { 'Content-Type': 'application/json', 'X-Profile-Container': activeProfile.badge },
      responseHeaders: { 'Content-Type': 'application/json' },
      payload: JSON.stringify({ action: 'harvest', amount, profile: activeProfile.id }),
      responsePreview: JSON.stringify({ ok: true, added: amount, totalCrystals: crystals + amount }),
    });
  };

  const handleSelectTab = (tab: BrowserTab) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === tab.id ? { ...t, hibernated: false, ramMb: t.ramMb < 40 ? 96 : t.ramMb } : t
      )
    );
    setActiveTabId(tab.id);
    setAddressInput(tab.url);
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length <= 1) return;
    const target = tabs.find((t) => t.id === id);
    if (target?.type === 'devtools') {
      setDevToolsOpen(false);
      setDevToolsLayout('split');
    }
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      setActiveTabId(remaining[0].id);
      setAddressInput(remaining[0].url);
    }
  };

  const handleAddTab = (incognito = false) => {
    const id = `tab-${Date.now()}`;
    const newTab: BrowserTab = {
      id,
      title: incognito ? 'Tab Penyamaran (Desktop)' : 'Tab Desktop Baru',
      url: incognito ? 'karsa://incognito-desktop' : 'https://play.aetherfrontier.gg/arena?mode=desktop',
      group: incognito ? 'Utilitas' : 'Game Web3',
      type: incognito ? 'docs' : 'game',
      hibernated: false,
      incognito,
      ramMb: 64,
      faviconLabel: incognito ? 'IN' : 'NW',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
    setAddressInput(newTab.url);
  };

  const handleSelectProfile = (profileId: string) => {
    const next = profiles.find((p) => p.id === profileId);
    if (!next) return;
    setActiveProfileId(profileId);
    setConnectedWallet(next.walletLabel);
    showNotice(`Beralih ke Profil "${next.name}" — Cookie, Ekstensi & Proxy terisolasi.`);
    appendLog(
      'success',
      `[ProfileContainer] Aktif: ${next.name} (${next.badge}) · StoragePartition & Proxy (${next.proxySummary}) dimuat.`
    );
  };

  const handleRunGcAndHibernate = useCallback(() => {
    let hibernatedCount = 0;
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== activeTabId && !t.hibernated) {
          hibernatedCount += 1;
          return { ...t, hibernated: true, ramMb: 16 };
        }
        return t;
      })
    );
    appendLog(
      'success',
      `[Memory] V8 GC selesai. ${hibernatedCount} tab latar dihibernasi (SetPageFrozen). RAM terjaga ringan.`
    );
  }, [activeTabId, appendLog]);

  const handleRunTerminalCommand = (raw: string) => {
    appendLog('input', `$ ${raw}`);
    const parts = raw.trim().split(/\s+/);
    const cmd = parts[0]?.toLowerCase();

    if (cmd === 'help') {
      appendLog(
        'output',
        'Perintah: proxy set <http|https|socks5://[user:pass@]host:port> | proxy status | proxy off | fps <30|45|60|max> | dpr <0.5-1.5> | gc | clear'
      );
      return;
    }
    if (cmd === 'clear') {
      setTerminalEntries([]);
      return;
    }
    if (cmd === 'gc' || (cmd === 'tab' && parts[1] === 'hibernate')) {
      handleRunGcAndHibernate();
      return;
    }
    if (cmd === 'fps') {
      const val = parts[1]?.toLowerCase();
      if (val === '30' || val === '45' || val === '60') {
        setRenderConfig((r) => ({ ...r, fpsLimit: Number(val) as FpsLimit }));
        appendLog('success', `[Render] Batas FPS dikunci ke ${val} FPS.`);
      } else if (val === 'max' || val === 'unlimited') {
        setRenderConfig((r) => ({ ...r, fpsLimit: 'unlimited' }));
        appendLog('success', '[Render] Batas FPS diatur ke Unlimited.');
      } else {
        appendLog('error', 'Gunakan: fps 30 | fps 45 | fps 60 | fps max');
      }
      return;
    }
    if (cmd === 'dpr') {
      const n = parseFloat(parts[1] || '');
      if (!Number.isNaN(n) && n >= 0.5 && n <= 1.5) {
        setRenderConfig((r) => ({ ...r, renderScale: n }));
        appendLog('success', `[Render] Skala resolusi render (DPR) diatur ke ${n.toFixed(2)}x.`);
      } else {
        appendLog('error', 'Rentang DPR valid: 0.5 hingga 1.5 (contoh: dpr 0.75)');
      }
      return;
    }
    if (cmd === 'proxy') {
      const sub = parts[1]?.toLowerCase();
      if (sub === 'off') {
        setProxy((p) => ({ ...p, enabled: false, protocol: 'DIRECT', latencyMs: null }));
        appendLog('success', '[Proxy] Dimatikan. Sesi kembali ke koneksi DIRECT.');
      } else if (sub === 'status') {
        appendLog(
          'output',
          !proxy.enabled
            ? '[Proxy] Status: DIRECT (tanpa proxy).'
            : `[Proxy] Aktif: ${proxy.protocol}://${proxy.host}:${proxy.port} (per-sesi)`
        );
      } else if (sub === 'set' && parts[2]) {
        const match = parts[2].match(/^(http|https|socks5):\/\/(?:([^:@]+):?([^@]*)@)?([^:/]+):?(\d+)?$/i);
        if (!match) {
          appendLog('error', 'Format URI salah. Contoh: proxy set socks5://user:pass@sg1.proxy.io:1080');
          return;
        }
        const protocol = match[1].toUpperCase() as ProxyConfig['protocol'];
        const host = match[4];
        const port = match[5] || '1080';
        setProxy({
          enabled: true,
          protocol,
          host,
          port,
          username: match[2] || '',
          password: match[3] || '',
          perSession: true,
          latencyMs: 36,
        });
        appendLog('success', `[Proxy] Diterapkan per-sesi: ${protocol}://${host}:${port} · 36ms`);
      } else {
        appendLog('error', 'Gunakan: proxy set <uri> | proxy status | proxy off');
      }
      return;
    }

    if (raw.includes('harvest')) {
      handleHarvest(100);
      appendLog('success', '[CDP Runtime.evaluate] Dieksekusi -> +100 Kristal dipanen di tab aktif.');
    } else {
      appendLog('output', `[CDP Runtime.evaluate] Hasil evaluasi: "${raw}"`);
    }
  };

  const handleRunScript = (scriptName: string, code: string) => {
    appendLog('input', `[ScriptRunner] Menjalankan "${scriptName}"...`);
    if (code.includes('harvest')) {
      handleHarvest(225);
      appendLog('success', '[CDP] Selesai panen otomatis +225 Kristal di tab Aether Frontier.');
    } else if (code.includes('userAgent')) {
      appendLog(
        'output',
        `[CDP] { ua: "Windows NT 10.0 Chrome/131", pointerFine: true, dpr: ${renderConfig.renderScale.toFixed(
          2
        )}, forceZoom: ${renderConfig.forceZoom} }`
      );
    } else {
      appendLog(
        'success',
        `[CDP] Provider EIP-6963 aktif: ${extensions
          .filter((e) => e.enabled && e.category === 'Web3 Wallet')
          .map((e) => e.name)
          .join(', ') || 'Tidak ada wallet aktif'}`
      );
    }
  };

  const handleSavePagePdf = () => {
    const filename = `aether-frontier-${Date.now().toString().slice(-4)}.pdf`;
    setDownloads((prev) => [
      { id: `dl-${Date.now()}`, filename, size: '1,8 MB', progress: 100, status: 'Selesai' },
      ...prev,
    ]);
    showNotice(`Halaman disimpan offline sebagai ${filename}.`);
    appendLog('success', `[PDF Offline] Disimpan ke Unduhan: ${filename}`);
  };

  const handleExportSettingsJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: activeProfile.name,
      renderConfig,
      savedSiteZooms,
      sitePermissions,
      bookmarks,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'karsa-browser-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    showNotice('Bookmark & pengaturan diekspor ke karsa-browser-backup.json.');
    appendLog('success', '[Backup] Ekspor JSON bookmark & pengaturan berhasil.');
  };

  const handleImportSettingsJson = (rawJson: string) => {
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed.renderConfig) setRenderConfig((prev) => ({ ...prev, ...parsed.renderConfig }));
      if (Array.isArray(parsed.bookmarks)) setBookmarks(parsed.bookmarks);
      if (parsed.sitePermissions) setSitePermissions((prev) => ({ ...prev, ...parsed.sitePermissions }));
      showNotice('Impor bookmark & pengaturan JSON berhasil diterapkan.');
      appendLog('success', '[Backup] Impor konfigurasi JSON selesai.');
    } catch {
      showNotice('File JSON tidak valid — gagal mengimpor pengaturan.');
      appendLog('error', '[Backup] Gagal mem-parsing file JSON.');
    }
  };

  const handleFpsUpdate = useCallback((fps: number) => {
    setLiveFps(fps);
  }, []);

  const showSplitDevTools =
    devToolsOpen && !devToolsMinimized && devToolsLayout === 'split' && activeTab.type !== 'devtools';

  const devToolsProps = {
    open: devToolsOpen,
    minimized: devToolsMinimized,
    layoutMode: devToolsLayout,
    orientation,
    activeTab: devToolsTab,
    touchInspectActive,
    inspectedElement,
    consoleEntries: terminalEntries,
    networkEntries,
    storageItems: kvStorage,
    perfOverlayEnabled,
    liveFps,
    totalRamMb,
    renderConfig,
    onSelectTab: setDevToolsTab,
    onChangeLayout: handleChangeDevToolsLayout,
    onToggleMinimize: () => setDevToolsMinimized((m) => !m),
    onClose: () => {
      setDevToolsOpen(false);
      setTouchInspectActive(false);
      if (activeTab.type === 'devtools') {
        setActiveTabId('tab-game');
        setAddressInput(INITIAL_TABS[0].url);
      }
    },
    onToggleTouchInspect: () => {
      setTouchInspectActive((v) => !v);
      setDevToolsTab('elements');
    },
    onUpdateElementStyle: (prop: keyof InspectableElement['styles'], value: string) => {
      setInspectedElement((prev) => ({
        ...prev,
        styles: { ...prev.styles, [prop]: value },
      }));
    },
    onRunConsoleCommand: handleRunTerminalCommand,
    onClearConsole: () => setTerminalEntries([]),
    onClearNetwork: () => setNetworkEntries([]),
    onAddStorageItem: (item: Omit<StorageKeyValue, 'id'>) => {
      setKvStorage((prev) => [{ ...item, id: `kv-${Date.now()}` }, ...prev]);
      appendLog('success', `[Storage] Ditambahkan ${item.store}: ${item.key}=${item.value}`);
    },
    onUpdateStorageValue: (id: string, value: string) => {
      setKvStorage((prev) => prev.map((it) => (it.id === id ? { ...it, value } : it)));
    },
    onDeleteStorageItem: (id: string) => {
      setKvStorage((prev) => prev.filter((it) => it.id !== id));
    },
    onTogglePerfOverlay: () => setPerfOverlayEnabled((v) => !v),
  };

  return (
    <section className="space-y-6">
      {/* Compact Editorial Intro + Workspace Toolbar */}
      <div className="flex flex-col gap-4 border-b border-[#E5E0D6] pb-6 lg:flex-row lg:items-end lg:justify-between dark:border-[#2E2C28]">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-medium text-[#8E3C21] dark:text-[#E28A6C]">
            Prototipe Interaktif · 14 Spesifikasi Lengkap · Target Android Chromium Kustom
          </p>
          <h1 className="font-editorial text-3xl font-semibold tracking-tight text-[#1F1E1B] sm:text-4xl [text-wrap:balance] dark:text-[#F2EFE9]">
            Mobile browser kelas desktop yang tenang, ringan, dan siap untuk game Web3.
          </h1>
          <p className="text-sm leading-relaxed text-[#5C5953] dark:text-[#A6A198]">
            Uji langsung Mobile-First DevTools (Touch-to-Inspect dengan kaca pembesar, bar simbol keyboard, Network & Storage), kunci orientasi Full Screen Vertikal/Horizontal tanpa reload, Force Zoom, Multi-Profil terisolasi, Pop-up Fleksibel, serta Terminal/Proxy.
          </p>
        </div>

        {/* Workspace Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center rounded-lg border border-[#DDD7CB] bg-[#EFECE6] p-1 text-xs font-medium dark:border-[#34322C] dark:bg-[#23221F]">
            <button
              type="button"
              onClick={() => {
                setOrientation('landscape');
                setOrientationLock('landscape');
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                orientation === 'landscape'
                  ? 'bg-white text-[#1F1E1B] shadow-sm dark:bg-[#32302B] dark:text-[#F2EFE9]'
                  : 'text-[#5C5953] hover:text-[#1F1E1B] dark:text-[#A6A198]'
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
              <span>Horizontal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOrientation('portrait');
                setOrientationLock('portrait');
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                orientation === 'portrait'
                  ? 'bg-white text-[#1F1E1B] shadow-sm dark:bg-[#32302B] dark:text-[#F2EFE9]'
                  : 'text-[#5C5953] hover:text-[#1F1E1B] dark:text-[#A6A198]'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Vertikal</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 rounded-lg border border-[#DDD7CB] bg-white px-3 py-2 text-xs font-medium text-[#1F1E1B] transition-colors hover:bg-[#EFECE6] whitespace-nowrap cursor-pointer dark:border-[#34322C] dark:bg-[#23221F] dark:text-[#F2EFE9] dark:hover:bg-[#2E2C28]"
          >
            {isDark ? <Sun className="h-3.5 w-3.5 text-[#E59377]" /> : <Moon className="h-3.5 w-3.5 text-[#8E3C21]" />}
            <span>{isDark ? 'Mode Terang' : 'Mode Gelap'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Interactive Studio */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
        {/* Android Mobile Browser Device Viewport */}
        <div className="xl:col-span-9 flex justify-center">
          <div
            className={`relative flex flex-col overflow-hidden rounded-[26px] border-[6px] border-[#292723] bg-[#FAF8F4] shadow-2xl transition-all duration-200 dark:border-[#3A3731] dark:bg-[#1C1B19] ${
              orientation === 'landscape'
                ? 'w-full h-[570px] sm:h-[610px]'
                : 'w-full max-w-[430px] h-[740px]'
            }`}
          >
            {/* Android System Status Bar (Hidden in Full Screen) */}
            {!fullScreen && (
              <div className="flex h-6 shrink-0 items-center justify-between bg-[#EFECE6] px-4 text-[10px] font-mono text-[#5C5953] select-none dark:bg-[#171614] dark:text-[#A6A198]">
                <span className="tabular-nums">23:45 · {activeProfile.badge}</span>
                <div className="flex items-center gap-2.5 tabular-nums">
                  {proxy.enabled && (
                    <span className="text-[#2E7D4F] dark:text-[#86CFA0]">
                      {proxy.protocol} · {proxy.latencyMs}ms
                    </span>
                  )}
                  <span>{liveFps} FPS</span>
                  <span>RAM {totalRamMb} MB</span>
                  <span>5G · 92%</span>
                </div>
              </div>
            )}

            {/* Single Modern Mobile Top Bar (Hidden in Full Screen) */}
            {!fullScreen && (
              <div className="flex items-center gap-2 border-b border-[#E5E0D6] bg-[#FAF8F4] px-2.5 py-2 dark:border-[#2E2C28] dark:bg-[#21201D]">
                {urlFocusMode ? (
                  /* FOCUSED MOBILE SEARCH / ADDRESS BAR MODE (Back <- + Empty Input + Clear/Paste + Go) */
                  <>
                    <button
                      type="button"
                      onClick={handleCancelUrlFocus}
                      title="Batal dan kembali ke halaman aktif (tanpa muat ulang)"
                      aria-label="Kembali tanpa memuat ulang"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#4A4741] transition-colors hover:bg-black/5 dark:text-[#D4CEC3] dark:hover:bg-white/10 cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleNavigateActiveTab(searchDraft);
                      }}
                      className="flex flex-1 min-w-0 items-center gap-1.5 rounded-xl border border-[#C86442] bg-white pl-3 pr-1.5 py-1 text-xs shadow-sm ring-2 ring-[#C86442]/15 dark:border-[#D97757] dark:bg-[#171614] dark:ring-[#D97757]/15"
                    >
                      <Search className="h-3.5 w-3.5 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                      <input
                        ref={urlInputRef}
                        type="text"
                        value={searchDraft}
                        onChange={(e) => setSearchDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            handleCancelUrlFocus();
                          }
                        }}
                        placeholder="Telusuri atau ketik URL"
                        aria-label="Telusuri atau ketik URL baru"
                        className="min-w-0 flex-1 bg-transparent font-mono text-xs text-[#1F1E1B] placeholder:font-sans placeholder:text-[#8E887E] outline-none dark:text-[#EFECE6] dark:placeholder:text-[#807A70]"
                      />

                      {searchDraft.length > 0 ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSearchDraft('');
                              urlInputRef.current?.focus();
                            }}
                            title="Hapus teks"
                            aria-label="Hapus teks pencarian"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6C675E] hover:bg-black/5 dark:text-[#A6A198] dark:hover:bg-white/10 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="submit"
                            className="flex h-7 items-center gap-1 rounded-lg bg-[#C86442] px-2.5 text-[11px] font-semibold text-white hover:bg-[#B25435] cursor-pointer dark:bg-[#D97757] dark:text-[#181715]"
                          >
                            <span>Buka</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handlePasteOnly}
                          title="Tempel tautan dari papan klip"
                          className="flex h-7 shrink-0 items-center gap-1 rounded-lg border border-[#DFD9CE] bg-[#FAF8F4] px-2 text-[11px] font-medium text-[#5C5953] hover:bg-[#EFECE6] cursor-pointer dark:border-[#36342E] dark:bg-[#23221F] dark:text-[#D4CEC3]"
                        >
                          <ClipboardPaste className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
                          <span>Tempel</span>
                        </button>
                      )}
                    </form>
                  </>
                ) : (
                  /* STANDARD SINGLE MOBILE TOP BAR */
                  <>
                    <div className="hidden sm:flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSiteInfoOpen(false);
                          setExtensionsOpen(false);
                          setTabSwitcherOpen(false);
                          setActiveTabId('tab-game');
                        }}
                        aria-label="Kembali"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5C5953] hover:bg-black/5 dark:text-[#A6A198] dark:hover:bg-white/10 cursor-pointer"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => appendLog('output', '[Nav] Halaman dimuat ulang dengan Desktop UA.')}
                        aria-label="Muat ulang"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5C5953] hover:bg-black/5 dark:text-[#A6A198] dark:hover:bg-white/10 cursor-pointer"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Spacious Main URL Omnibox with Interactive Lock Icon (🔒) & Tap-to-Search Trigger */}
                    <div className="flex flex-1 min-w-0 items-center gap-1.5 rounded-xl border border-[#DFD9CE] bg-white pl-1.5 pr-3 py-1 text-xs shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:border-[#36342E] dark:bg-[#171614]">
                      <button
                        type="button"
                        onClick={() => {
                          setExtensionsOpen(false);
                          setTabSwitcherOpen(false);
                          setActiveSheet(null);
                          setSiteInfoOpen((v) => !v);
                        }}
                        title="Info & Kontrol Situs (HTTPS, Cache, Izin & Proteksi)"
                        aria-label="Info dan kontrol situs"
                        aria-expanded={siteInfoOpen}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                          siteInfoOpen
                            ? 'bg-[#2E7D4F]/18 text-[#21633D] ring-1 ring-[#2E7D4F]/40 dark:bg-[#86CFA0]/20 dark:text-[#86CFA0] dark:ring-[#86CFA0]/40'
                            : 'text-[#2E7D4F] hover:bg-[#2E7D4F]/10 dark:text-[#86CFA0] dark:hover:bg-[#86CFA0]/10'
                        }`}
                      >
                        <Lock className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleEnterUrlFocus}
                        title="Ketuk untuk mencari atau menempel URL baru"
                        aria-label="Buka kolom pencarian dan alamat URL"
                        className="min-w-0 flex-1 py-1 text-left font-mono text-xs text-[#1F1E1B] truncate cursor-text dark:text-[#EFECE6]"
                      >
                        {addressInput || activeTab.url}
                      </button>
                      {adBlockEnabled && (
                        <span
                          title="Ad & Tracker Blocker aktif"
                          className="hidden sm:inline-flex items-center gap-1 shrink-0 text-[10px] font-mono text-[#6C675E] tabular-nums dark:text-[#9D978E]"
                        >
                          <ShieldCheck className="h-3 w-3 text-[#C86442] dark:text-[#D97757]" />
                          {adsBlockedCount}
                        </span>
                      )}
                    </div>

                    {/* Balanced Single-Row Right Actions: [Ekstensi 🧩] -> [Full Layar ⛶] -> [Tab Switcher [N]] -> [Menu ⋮] */}
                    <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSiteInfoOpen(false);
                          setTabSwitcherOpen(false);
                          setActiveSheet(null);
                          setExtensionsOpen((v) => !v);
                        }}
                        title="Ekstensi Chrome & Wallet Web3 (.crx)"
                        aria-label="Toggle daftar ekstensi Chrome"
                        aria-expanded={extensionsOpen}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                          extensionsOpen
                            ? 'bg-[#C86442]/15 text-[#964226] dark:text-[#F2A68C]'
                            : 'text-[#4A4741] hover:bg-black/5 dark:text-[#D4CEC3] dark:hover:bg-white/10'
                        }`}
                      >
                        <Puzzle className="h-4 w-4" />
                      </button>

                      {/* Full Screen Button (between Extensions & Tab Switcher) */}
                      <button
                        type="button"
                        onClick={() => {
                          setSiteInfoOpen(false);
                          setExtensionsOpen(false);
                          setTabSwitcherOpen(false);
                          setActiveSheet(null);
                          setFullScreen(true);
                        }}
                        title="Mode Layar Penuh (Horizontal & Vertikal)"
                        aria-label="Masuk mode layar penuh"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#4A4741] transition-colors hover:bg-black/5 dark:text-[#D4CEC3] dark:hover:bg-white/10 cursor-pointer"
                      >
                        <Maximize className="h-4 w-4" />
                      </button>

                      {/* Numbered Tab Switcher Button [N] */}
                      <button
                        type="button"
                        onClick={() => {
                          setSiteInfoOpen(false);
                          setExtensionsOpen(false);
                          setActiveSheet(null);
                          setTabSwitcherOpen((v) => !v);
                        }}
                        title={`Daftar Tab (${tabs.length} tab aktif)`}
                        aria-label={`Buka daftar tab (${tabs.length} tab)`}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                          tabSwitcherOpen
                            ? 'bg-[#C86442]/15 text-[#964226] dark:text-[#F2A68C]'
                            : 'text-[#4A4741] hover:bg-black/5 dark:text-[#D4CEC3] dark:hover:bg-white/10'
                        }`}
                      >
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-[5px] border-[1.75px] border-current px-1 font-mono text-[10px] font-bold leading-none tabular-nums">
                          {tabs.length}
                        </span>
                      </button>

                      {/* Three-Dots Menu (⋮) containing Zoom, DevTools, Terminal, Render, Profiles & Utilities */}
                      <button
                        type="button"
                        onClick={() => {
                          setSiteInfoOpen(false);
                          setExtensionsOpen(false);
                          setTabSwitcherOpen(false);
                          setActiveSheet((s) => (s === 'menu' ? null : 'menu'));
                        }}
                        title="Menu Browser (Zoom, DevTools, Terminal, Render, Profil & Utilitas)"
                        aria-label="Menu utama browser"
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                          activeSheet !== null
                            ? 'bg-[#C86442]/15 text-[#964226] dark:text-[#F2A68C]'
                            : 'text-[#5C5953] hover:bg-black/5 dark:text-[#A6A198] dark:hover:bg-white/10'
                        }`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Find in Page Inline Bar */}
            {!fullScreen && findBarOpen && (
              <div className="flex items-center gap-2 border-b border-[#E5E0D6] bg-[#F3EFE7] px-3 py-1.5 text-xs dark:border-[#2E2C28] dark:bg-[#1B1A18]">
                <Search className="h-3.5 w-3.5 text-[#7A746B]" />
                <input
                  type="text"
                  value={findQuery}
                  onChange={(e) => setFindQuery(e.target.value)}
                  placeholder="Cari teks di halaman (contoh: Aether, Wallet, X)..."
                  className="flex-1 bg-transparent text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFindBarOpen(false);
                    setFindQuery('');
                  }}
                  className="rounded p-0.5 text-[#6C675E] hover:bg-black/10 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Main Web Content + Adaptive Split-Screen Mobile DevTools Container */}
            <div
              className={`relative flex flex-1 min-h-0 overflow-hidden bg-[#12161D] ${
                orientation === 'portrait' ? 'flex-col' : 'flex-row'
              }`}
            >
              {/* Web Viewport Area */}
              <div className="relative flex-1 min-h-0 min-w-0 overflow-hidden">
                {/* Anti-Redirect & System Notice Toast */}
                {redirectNotice && (
                  <div className="absolute left-3 right-3 top-3 z-25 flex items-center justify-between gap-2 rounded-lg border border-[#D97757]/50 bg-[#1B1A17]/95 px-3 py-2 text-xs text-[#F5EDE1] shadow-lg backdrop-blur">
                    <span className="flex items-center gap-2 min-w-0">
                      <ShieldAlert className="h-4 w-4 shrink-0 text-[#E59377]" />
                      <span className="truncate">{redirectNotice}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setRedirectNotice(null)}
                      className="shrink-0 text-[#A6A198] hover:text-white cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Active Tab Renderer */}
                {activeTab.type === 'devtools' ? (
                  <MobileDevTools {...devToolsProps} open={true} minimized={false} layoutMode="tab" />
                ) : activeTab.type === 'game' ? (
                  <DesktopGameCanvas
                    renderConfig={renderConfig}
                    crystals={crystals}
                    connectedWallet={connectedWallet}
                    connectedX={connectedX}
                    connectedDiscord={connectedDiscord}
                    findQuery={findQuery}
                    touchInspectActive={touchInspectActive}
                    inspectedElement={inspectedElement}
                    perfOverlayEnabled={perfOverlayEnabled}
                    liveFps={liveFps}
                    totalRamMb={totalRamMb}
                    savedSiteZoom={currentSavedZoom}
                    onInspectElement={(el) => {
                      setInspectedElement(el);
                      setDevToolsOpen(true);
                      setDevToolsMinimized(false);
                      setDevToolsTab('elements');
                      appendLog('output', `[Inspector] Elemen terpilih: ${el.selector} (${el.boundsLabel})`);
                    }}
                    onPinchZoomChange={handlePinchZoomChange}
                    onHarvest={handleHarvest}
                    onTriggerWallet={() => openFlexiblePopup('wallet')}
                    onTriggerXAuth={() => openFlexiblePopup('oauth-x')}
                    onTriggerDiscordAuth={() => openFlexiblePopup('oauth-discord')}
                    onFpsUpdate={handleFpsUpdate}
                  />
                ) : activeTab.type === 'oauth-x' || activeTab.type === 'wallet-connect' || activeTab.type === 'oauth-discord' ? (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-[#FAF8F4] p-6 text-center text-[#1F1E1B] dark:bg-[#1C1B19] dark:text-[#F2EFE9]">
                    <div className="max-w-md space-y-4">
                      <p className="text-xs font-medium text-[#8E3C21] dark:text-[#E59377]">
                        Dipromosikan dari Pop-up Fleksibel · window.opener tetap tersambung
                      </p>
                      <h3 className="font-editorial text-2xl font-semibold">{activeTab.title}</h3>
                      <p className="font-mono text-xs text-[#6C675E] break-all dark:text-[#A6A198]">
                        {activeTab.url}
                      </p>
                      <p className="text-sm text-[#5C5953] dark:text-[#A6A198]">
                        Seluruh proses otorisasi tetap berada di dalam Karsa Browser dengan mode tampilan tab penuh.
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setActiveTabId('tab-game')}
                          className="rounded-lg border border-[#D8D2C5] px-4 py-2 text-xs font-medium hover:bg-black/5 cursor-pointer dark:border-[#3D3A34]"
                        >
                          Kembali ke Tab Game
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const k =
                              activeTab.type === 'wallet-connect'
                                ? 'wallet'
                                : activeTab.type === 'oauth-x'
                                ? 'oauth-x'
                                : 'oauth-discord';
                            const label =
                              k === 'wallet'
                                ? 'Rabby · 0x71C...94A2'
                                : k === 'oauth-x'
                                ? '@arief_karsa'
                                : 'karsa.player';
                            handleCompleteAuth(k, label);
                          }}
                          className="rounded-lg bg-[#C86442] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B25435] cursor-pointer dark:bg-[#D97757] dark:text-[#191816]"
                        >
                          Selesaikan Otorisasi & Kembali
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-[#FAF8F4] p-6 text-center text-[#1F1E1B] dark:bg-[#1C1B19] dark:text-[#F2EFE9]">
                    <div className="max-w-md space-y-3">
                      <p className="text-xs font-medium text-[#7A746B] dark:text-[#A6A198]">
                        Profil {activeProfile.name} · Grup Tab: {activeTab.group}
                      </p>
                      <h3 className="font-editorial text-2xl font-semibold">{activeTab.title}</h3>
                      <p className="font-mono text-xs text-[#6C675E] dark:text-[#9D978E]">{activeTab.url}</p>
                      <p className="text-sm text-[#5C5953] dark:text-[#A6A198]">
                        {activeTab.incognito
                          ? 'Mode penyamaran aktif: cookie, riwayat, dan cache sesi akan dihapus otomatis saat tab ditutup.'
                          : 'Tab ini sebelumnya dihibernasi otomatis untuk menjaga penggunaan RAM di bawah 450 MB dan langsung terbangun saat dipilih.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTabId('tab-game');
                          setAddressInput(INITIAL_TABS[0].url);
                        }}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#1F1E1B] px-4 py-2 text-xs font-medium text-white hover:bg-[#35332E] cursor-pointer dark:bg-[#D97757] dark:text-[#191816]"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                        <span>Kembali ke Game Aether Frontier</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Manual Full Screen Semi-Transparent Floating Bar with Orientation Lock (Spec 13) */}
                {fullScreen && (
                  <div className="absolute right-3 top-3 z-40 flex flex-wrap items-center gap-1 rounded-xl border border-white/20 bg-black/60 p-1 text-[11px] font-medium text-white/95 backdrop-blur-md shadow-xl">
                    {(
                      [
                        { id: 'auto', label: 'Auto' },
                        { id: 'portrait', label: 'Vertikal' },
                        { id: 'landscape', label: 'Horizontal' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleOrientationLock(opt.id)}
                        className={`min-h-[34px] rounded-lg px-2.5 transition-colors cursor-pointer ${
                          orientationLock === opt.id
                            ? 'bg-[#D97757] font-semibold text-[#181715]'
                            : 'text-white/85 hover:bg-white/15'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setDevToolsOpen((v) => !v);
                        setDevToolsMinimized(false);
                      }}
                      title="Buka/Tutup Mobile DevTools"
                      className="flex min-h-[34px] items-center gap-1 rounded-lg px-2 text-white/90 hover:bg-white/15 cursor-pointer"
                    >
                      <Code2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">DevTools</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFullScreen(false)}
                      className="flex min-h-[34px] items-center gap-1 rounded-lg bg-white/15 px-2.5 text-white hover:bg-white/25 cursor-pointer"
                    >
                      <Minimize className="h-3.5 w-3.5" />
                      <span>Keluar</span>
                    </button>
                  </div>
                )}

                {/* Tab Switcher Grid Overlay (opened via numbered [N] button in Single Top Bar) */}
                {tabSwitcherOpen && (
                  <div className="absolute inset-0 z-35 flex flex-col bg-[#F7F5F0]/98 text-[#1F1E1B] backdrop-blur-md dark:bg-[#191816]/98 dark:text-[#F2EFE9]">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E0D6] px-4 py-3 dark:border-[#2E2C28]">
                      <div>
                        <h3 className="font-editorial text-base font-semibold">
                          Tab Terbuka ({tabs.length})
                        </h3>
                        <p className="text-[11px] text-[#6C675E] dark:text-[#9D978E]">
                          Profil {activeProfile.name} · Estimasi RAM {totalRamMb} MB
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            handleAddTab(false);
                            setTabSwitcherOpen(false);
                          }}
                          className="flex min-h-[36px] items-center gap-1 rounded-lg bg-[#1F1E1B] px-3 text-xs font-medium text-[#FAF8F4] hover:bg-[#35332E] cursor-pointer dark:bg-[#D97757] dark:text-[#191816]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Tab Baru</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleAddTab(true);
                            setTabSwitcherOpen(false);
                          }}
                          className="flex min-h-[36px] items-center gap-1 rounded-lg border border-[#D8D2C5] bg-white px-2.5 text-xs font-medium hover:bg-[#EFECE6] cursor-pointer dark:border-[#3A3732] dark:bg-[#23221F]"
                        >
                          <EyeOff className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Penyamaran</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRunGcAndHibernate}
                          title="Hibernasi tab tidak aktif untuk hemat RAM"
                          className="flex min-h-[36px] items-center gap-1 rounded-lg border border-[#D8D2C5] bg-white px-2.5 text-xs font-medium hover:bg-[#EFECE6] cursor-pointer dark:border-[#3A3732] dark:bg-[#23221F]"
                        >
                          <Snowflake className="h-3.5 w-3.5 text-[#5B87A8]" />
                          <span className="hidden sm:inline">Hibernasi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTabSwitcherOpen(false)}
                          aria-label="Tutup daftar tab"
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6C675E] hover:bg-black/5 dark:text-[#A6A198] dark:hover:bg-white/10 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="thin-scrollbar flex-1 overflow-y-auto p-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {tabs.map((tab) => {
                          const isActive = tab.id === activeTab.id;
                          return (
                            <div
                              key={tab.id}
                              onClick={() => {
                                handleSelectTab(tab);
                                setTabSwitcherOpen(false);
                              }}
                              className={`flex flex-col justify-between gap-3 rounded-xl border p-3.5 transition-colors cursor-pointer ${
                                isActive
                                  ? 'border-[#C86442] bg-white shadow-sm dark:border-[#D97757] dark:bg-[#252320]'
                                  : 'border-[#E2DCD0] bg-white/80 hover:border-[#C86442]/50 dark:border-[#32302B] dark:bg-[#201F1C]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EFECE6] font-mono text-[10px] font-semibold text-[#8E3C21] dark:bg-[#2E2C27] dark:text-[#E59377]">
                                    {tab.incognito ? <EyeOff className="h-3.5 w-3.5" /> : tab.faviconLabel}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold truncate">{tab.title}</p>
                                    <p className="font-mono text-[10px] text-[#7A746B] truncate dark:text-[#9D978E]">
                                      {tab.url}
                                    </p>
                                  </div>
                                </div>
                                {tabs.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCloseTab(tab.id);
                                    }}
                                    aria-label={`Tutup tab ${tab.title}`}
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#7A746B] hover:bg-black/10 hover:text-[#1F1E1B] dark:hover:bg-white/10 dark:hover:text-white cursor-pointer"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-[#6C675E] dark:text-[#9D978E]">
                                <span>Grup: {tab.group}</span>
                                <span className="flex items-center gap-1.5 font-mono tabular-nums">
                                  {tab.hibernated && (
                                    <span className="inline-flex items-center gap-1 text-[#5B87A8]">
                                      <Snowflake className="h-3 w-3" />
                                      Hibernasi
                                    </span>
                                  )}
                                  <span>{tab.hibernated ? 16 : tab.ramMb} MB</span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Flexible Resizable & Draggable Pop-up Overlay */}
                <FlexiblePopup
                  popup={popup}
                  walletWhitelistEnabled={walletWhitelistEnabled}
                  whitelistedWallets={whitelistedWallets}
                  enabledExtensionWallets={enabledExtensionWallets}
                  onUpdatePopup={(patch) => setPopup((p) => ({ ...p, ...patch }))}
                  onPromoteToTab={handlePromotePopupToTab}
                  onKeepInPopup={() =>
                    appendLog('output', `[Popup] Pengguna memilih tetap di jendela Pop-up (${popup.title}).`)
                  }
                  onClose={() => setPopup((p) => ({ ...p, open: false }))}
                  onCompleteAuth={handleCompleteAuth}
                  onEnableWalletWhitelist={handleEnableWalletWhitelist}
                  onCopyWalletConnectUri={handleCopyWalletConnectUri}
                />

                {/* Floating / Dockable / Resizable Terminal & Script Runner */}
                <FloatingTerminal
                  open={terminalOpen}
                  minimized={terminalMinimized}
                  docked={terminalDocked}
                  entries={terminalEntries}
                  proxy={proxy}
                  onClose={() => setTerminalOpen(false)}
                  onToggleMinimize={() => setTerminalMinimized((m) => !m)}
                  onToggleDock={() => setTerminalDocked((d) => !d)}
                  onRunCommand={handleRunTerminalCommand}
                  onRunScript={handleRunScript}
                  onUpdateProxy={(next) => {
                    setProxy(next);
                    appendLog(
                      'success',
                      next.enabled
                        ? `[Proxy UI] Aktif: ${next.protocol}://${next.host}:${next.port} (${
                            next.perSession ? 'per-sesi' : 'global'
                          })`
                        : '[Proxy UI] Koneksi kembali ke DIRECT.'
                    );
                  }}
                />
              </div>

              {/* Adaptive Split-Screen Mobile DevTools (Bottom Sheet in Portrait / Side Pane in Landscape) */}
              {showSplitDevTools && <MobileDevTools {...devToolsProps} />}

              {/* Floating, FullScreen, or Minimized Mobile DevTools Overlay */}
              {devToolsOpen &&
                activeTab.type !== 'devtools' &&
                (devToolsMinimized || devToolsLayout === 'floating' || devToolsLayout === 'fullscreen') && (
                  <MobileDevTools {...devToolsProps} />
                )}

              {/* Mobile Focused Address / Search Bar Overlay (Current Page Card + Quick Paste & Go + Zero-Reload Cancel) */}
              <AddressBarOverlay
                open={urlFocusMode && !fullScreen}
                searchDraft={searchDraft}
                activeTab={activeTab}
                clipboardUrl={clipboardUrl}
                copiedFeedback={copiedFeedback}
                bookmarks={bookmarks}
                onCancel={handleCancelUrlFocus}
                onNavigate={handleNavigateActiveTab}
                onPasteOnly={handlePasteOnly}
                onPasteAndGo={handlePasteAndGo}
                onShareCurrent={handleShareCurrentUrl}
                onCopyCurrent={handleCopyCurrentUrl}
                onEditCurrentUrl={handleEditCurrentUrl}
              />

              {/* Site Info & Quick Controls Popover (opened via Lock icon 🔒 on left of URL bar) */}
              <SiteInfoPopover
                open={siteInfoOpen && !fullScreen}
                url={activeTab.url}
                origin={currentOrigin}
                siteStorageItem={siteStorage.find((s) => s.origin === currentOrigin)}
                sitePermissions={sitePermissions}
                antiRedirectForSite={antiRedirectForSite}
                walletWhitelistEnabled={walletWhitelistEnabled}
                whitelistedWallets={whitelistedWallets}
                disablePullToRefreshForSite={renderConfig.disablePullToRefreshPerSite}
                activeProfile={activeProfile}
                proxy={proxy}
                onClose={() => setSiteInfoOpen(false)}
                onClearThisSiteData={(origin) => {
                  setSiteStorage((prev) => prev.filter((s) => s.origin !== origin));
                  setKvStorage((prev) => prev.filter((k) => k.origin !== origin));
                  showNotice(`Cache, cookie & data situs ${origin} dibersihkan tanpa menyentuh situs lain.`);
                  appendLog('success', `[SiteInfo] Cache & data khusus situs ${origin} berhasil dihapus.`);
                }}
                onResetSitePermissions={() => {
                  setSitePermissions(INITIAL_PERMISSIONS);
                  setAntiRedirectForSite(true);
                  setWalletWhitelistEnabled(true);
                  setWhitelistedWallets(['Rabby Wallet']);
                  setRenderConfig((prev) => ({ ...prev, disablePullToRefreshPerSite: true }));
                  showNotice(`Seluruh izin & proteksi untuk ${currentOrigin} dikembalikan ke pengaturan awal.`);
                  appendLog('output', `[SiteInfo] Reset seluruh izin situs untuk ${currentOrigin} (Rabby Whitelist ON).`);
                }}
                onToggleQuickPermission={(key, next) => {
                  setSitePermissions((prev) => ({ ...prev, [key]: next }));
                  appendLog('output', `[SiteInfo] Izin ${key} (${currentOrigin}) -> ${next.toUpperCase()}`);
                }}
                onToggleAntiRedirectForSite={() => {
                  setAntiRedirectForSite((prev) => {
                    const next = !prev;
                    showNotice(
                      next
                        ? `Anti-Redirect Media Sosial dikunci 100% untuk ${currentOrigin}.`
                        : `Anti-Redirect Media Sosial dijeda untuk ${currentOrigin}.`
                    );
                    appendLog(
                      'warn',
                      `[SiteInfo] Anti-Redirect Sosmed (${currentOrigin}) -> ${next ? 'TERKUNCI 100%' : 'NONAKTIF'}`
                    );
                    return next;
                  });
                }}
                onToggleWalletWhitelist={() => {
                  setWalletWhitelistEnabled((prev) => {
                    const next = !prev;
                    showNotice(
                      next
                        ? 'Whitelist Aplikasi Wallet Eksternal (WalletConnect) diaktifkan. Sosmed tetap 100% terkunci.'
                        : 'Whitelist Wallet Eksternal dimatikan — semua deep-link wallet ditahan di dalam browser.'
                    );
                    appendLog(
                      'output',
                      `[SiteInfo] Whitelist WalletConnect (${currentOrigin}) -> ${next ? 'AKTIF' : 'NONAKTIF'}`
                    );
                    return next;
                  });
                }}
                onToggleWhitelistedWallet={handleToggleWhitelistedWallet}
                onTogglePullToRefreshForSite={() => {
                  setRenderConfig((prev) => {
                    const next = !prev.disablePullToRefreshPerSite;
                    showNotice(
                      next
                        ? `Pull-to-Refresh dimatikan di ${currentOrigin} (aman dari reload tidak sengaja).`
                        : `Pull-to-Refresh diizinkan kembali di ${currentOrigin}.`
                    );
                    appendLog(
                      'output',
                      `[SiteInfo] Matikan Pull-to-Refresh (${currentOrigin}) -> ${next ? 'AKTIF' : 'NONAKTIF'}`
                    );
                    return { ...prev, disablePullToRefreshPerSite: next };
                  });
                }}
                onOpenProfilesSheet={() => {
                  setSiteInfoOpen(false);
                  setActiveSheet('profiles');
                }}
                onOpenProxyTerminal={() => {
                  setSiteInfoOpen(false);
                  setTerminalOpen(true);
                  setTerminalMinimized(false);
                }}
              />

              {/* Direct-Toggle Extensions Pop-over (opened via top bar 🧩 icon, closes on icon click or tap outside) */}
              <ExtensionsPopover
                open={extensionsOpen && !fullScreen}
                extensions={extensions}
                onClose={() => setExtensionsOpen(false)}
                onToggleExtension={(id) =>
                  setExtensions((prev) =>
                    prev.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e))
                  )
                }
                onRemoveExtension={(id) => {
                  const target = extensions.find((e) => e.id === id);
                  setExtensions((prev) => prev.filter((e) => e.id !== id));
                  if (target) {
                    appendLog('warn', `[Extensions] Ekstensi "${target.name}" dihapus dari profil ${activeProfile.badge}.`);
                  }
                }}
                onInstallExtension={(ext) => {
                  setExtensions((prev) => [
                    {
                      ...ext,
                      id: `ext-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    },
                    ...prev,
                  ]);
                  showNotice(`Ekstensi "${ext.name}" (${ext.source}) berhasil dipasang.`);
                  appendLog(
                    'success',
                    `[Extensions] "${ext.name}" v${ext.version} (${ext.source}) dipasang di isolated world.`
                  );
                }}
              />

              {/* Full-Width Horizontal Bottom Sheet for Three-Dots Menu & Sub-Menus */}
              <BrowserSheets
                activeSheet={activeSheet}
                currentOrigin={currentOrigin}
                onClose={() => setActiveSheet(null)}
                onBackToMenu={() => setActiveSheet('menu')}
                renderConfig={renderConfig}
                savedSiteZoom={currentSavedZoom}
                liveFps={liveFps}
                totalRamMb={totalRamMb}
                onUpdateRender={(patch) => {
                  setRenderConfig((prev) => ({ ...prev, ...patch }));
                  if (typeof patch.manualZoom === 'number') {
                    setSavedSiteZooms((prev) => ({ ...prev, [currentOrigin]: patch.manualZoom! }));
                  }
                }}
                onResetSiteZoom={() => {
                  setRenderConfig((prev) => ({ ...prev, autoFitDesktop: true, manualZoom: 100 }));
                  setSavedSiteZooms((prev) => ({ ...prev, [currentOrigin]: 100 }));
                }}
                onRunGcAndHibernate={handleRunGcAndHibernate}
                credentials={INITIAL_CREDENTIALS}
                externalPassManager={externalPassManager}
                onChangeExternalPassManager={setExternalPassManager}
                profiles={profiles}
                activeProfileId={activeProfileId}
                onSelectProfile={handleSelectProfile}
                onCreateProfile={(name) => {
                  const nextNum = profiles.length + 1;
                  const created: BrowserProfile = {
                    id: `prof-${Date.now()}`,
                    name,
                    badge: `P${nextNum}`,
                    walletLabel: null,
                    proxySummary: 'DIRECT',
                    cookieCount: 0,
                    activeExtensions: 1,
                  };
                  setProfiles((prev) => [...prev, created]);
                  setActiveProfileId(created.id);
                  setConnectedWallet(null);
                  showNotice(`Kontainer Profil "${name}" dibuat dengan cookie & proxy terisolasi.`);
                }}
                sitePermissions={sitePermissions}
                onUpdatePermission={(key: keyof SitePermissions, val: PermissionValue) => {
                  setSitePermissions((prev) => ({ ...prev, [key]: val }));
                  appendLog('output', `[Permissions] ${key} untuk ${currentOrigin} -> ${val.toUpperCase()}`);
                }}
                adBlockEnabled={adBlockEnabled}
                adsBlockedCount={adsBlockedCount}
                onToggleAdBlock={() => {
                  setAdBlockEnabled((v) => !v);
                  setAdsBlockedCount((c) => c + 4);
                }}
                bookmarks={bookmarks}
                history={INITIAL_HISTORY}
                downloads={downloads}
                siteStorage={siteStorage}
                onClearSiteStorage={(origin) => {
                  setSiteStorage((prev) => prev.filter((s) => s.origin !== origin));
                  appendLog('success', `[Storage] Cookie & cache untuk ${origin} telah dibersihkan.`);
                }}
                onNavigateBookmark={(url, title) => {
                  setActiveTabId('tab-game');
                  setAddressInput(url);
                  appendLog('output', `[Bookmark] Membuka ${title} (${url})`);
                }}
                onOpenIncognitoTab={() => handleAddTab(true)}
                onToggleFindBar={() => setFindBarOpen(true)}
                onSavePagePdf={handleSavePagePdf}
                onExportSettingsJson={handleExportSettingsJson}
                onImportSettingsJson={handleImportSettingsJson}
                devToolsOpen={devToolsOpen}
                terminalOpen={terminalOpen}
                activeProfileBadge={activeProfile.badge}
                onOpenDevTools={() => {
                  setDevToolsOpen(true);
                  setDevToolsMinimized(false);
                }}
                onOpenTerminal={() => {
                  setTerminalOpen(true);
                  setTerminalMinimized(false);
                }}
                onSwitchSheet={(sheet) => setActiveSheet(sheet)}
                onPinchZoomChange={handlePinchZoomChange}
              />
            </div>

            {/* Android Bottom Gesture Navigation Bar (Hidden in Full Screen) */}
            {!fullScreen && (
              <div className="flex h-5 shrink-0 items-center justify-center bg-[#EFECE6] dark:bg-[#171614]">
                <div className="h-1 w-24 rounded-full bg-[#B9B2A5] dark:bg-[#49453E]" />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Scenario Launcher & Live Engine State */}
        <aside className="xl:col-span-3 space-y-5">
          <div className="rounded-xl border border-[#E5E0D6] bg-white p-5 space-y-3 dark:border-[#2E2C28] dark:bg-[#22201D]">
            <div>
              <h2 className="font-editorial text-lg font-semibold">Uji Skenario Kunci</h2>
              <p className="mt-0.5 text-xs text-[#5C5953] dark:text-[#A6A198]">
                Picu fitur utama termasuk 3 pembaruan terbaru langsung di simulator.
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setDevToolsOpen(true);
                  setDevToolsMinimized(false);
                  setDevToolsTab('elements');
                  setTouchInspectActive(true);
                }}
                className="flex w-full items-center justify-between rounded-lg border border-[#C86442]/40 bg-[#C86442]/5 px-3 py-2.5 text-left text-xs font-medium transition-colors hover:border-[#C86442] cursor-pointer dark:border-[#D97757]/40 dark:bg-[#D97757]/10"
              >
                <span>Buka Mobile DevTools & Touch Inspect</span>
                <Code2 className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSiteInfoOpen(false);
                  setExtensionsOpen(false);
                  setTabSwitcherOpen(false);
                  setActiveSheet(null);
                  setFullScreen(true);
                  handleOrientationLock(orientation === 'landscape' ? 'portrait' : 'landscape');
                }}
                className="flex w-full items-center justify-between rounded-lg border border-[#E5E0D6] px-3 py-2.5 text-left text-xs font-medium transition-colors hover:border-[#C86442] hover:bg-[#FAF8F4] cursor-pointer dark:border-[#34322C] dark:hover:border-[#D97757] dark:hover:bg-[#2A2824]"
              >
                <span>Full Screen + Kunci Orientasi</span>
                <RotateCcw className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSiteInfoOpen(false);
                  setExtensionsOpen(false);
                  setTabSwitcherOpen(false);
                  setActiveSheet('profiles');
                }}
                className="flex w-full items-center justify-between rounded-lg border border-[#E5E0D6] px-3 py-2.5 text-left text-xs font-medium transition-colors hover:border-[#C86442] hover:bg-[#FAF8F4] cursor-pointer dark:border-[#34322C] dark:hover:border-[#D97757] dark:hover:bg-[#2A2824]"
              >
                <span>Multi-Profil & Kontainer Sesi</span>
                <Users className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
              </button>

              <button
                type="button"
                onClick={() => openFlexiblePopup('oauth-x')}
                className="flex w-full items-center justify-between rounded-lg border border-[#E5E0D6] px-3 py-2.5 text-left text-xs font-medium transition-colors hover:border-[#C86442] hover:bg-[#FAF8F4] cursor-pointer dark:border-[#34322C] dark:hover:border-[#D97757] dark:hover:bg-[#2A2824]"
              >
                <span>Uji Login X (Anti-Redirect)</span>
                <ShieldAlert className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
              </button>

              <button
                type="button"
                onClick={() => openFlexiblePopup('wallet')}
                className="flex w-full items-center justify-between rounded-lg border border-[#E5E0D6] px-3 py-2.5 text-left text-xs font-medium transition-colors hover:border-[#C86442] hover:bg-[#FAF8F4] cursor-pointer dark:border-[#34322C] dark:hover:border-[#D97757] dark:hover:bg-[#2A2824]"
              >
                <span>Uji Koneksi Wallet (Rabby / WC)</span>
                <Puzzle className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setTerminalOpen(true);
                  setTerminalMinimized(false);
                }}
                className="flex w-full items-center justify-between rounded-lg border border-[#E5E0D6] px-3 py-2.5 text-left text-xs font-medium transition-colors hover:border-[#C86442] hover:bg-[#FAF8F4] cursor-pointer dark:border-[#34322C] dark:hover:border-[#D97757] dark:hover:bg-[#2A2824]"
              >
                <span>Buka Terminal & Proxy</span>
                <TerminalIcon className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSiteInfoOpen(false);
                  setExtensionsOpen(false);
                  setTabSwitcherOpen(false);
                  setActiveSheet('render');
                }}
                className="flex w-full items-center justify-between rounded-lg border border-[#E5E0D6] px-3 py-2.5 text-left text-xs font-medium transition-colors hover:border-[#C86442] hover:bg-[#FAF8F4] cursor-pointer dark:border-[#34322C] dark:hover:border-[#D97757] dark:hover:bg-[#2A2824]"
              >
                <span>Zoom Pintar, Anti-Refresh & FPS</span>
                <Gauge className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSiteInfoOpen(false);
                  setExtensionsOpen(false);
                  setTabSwitcherOpen(false);
                  setActiveSheet('security');
                }}
                className="flex w-full items-center justify-between rounded-lg border border-[#E5E0D6] px-3 py-2.5 text-left text-xs font-medium transition-colors hover:border-[#C86442] hover:bg-[#FAF8F4] cursor-pointer dark:border-[#34322C] dark:hover:border-[#D97757] dark:hover:bg-[#2A2824]"
              >
                <span>Brankas Passkey & Sandi</span>
                <KeyRound className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
              </button>
            </div>
          </div>

          {/* Live Engine State Summary */}
          <div className="rounded-xl border border-[#E5E0D6] bg-white p-5 space-y-3 dark:border-[#2E2C28] dark:bg-[#22201D]">
            <h2 className="font-editorial text-lg font-semibold">Status Mesin Aktif</h2>
            <dl className="divide-y divide-[#EFECE6] text-xs dark:divide-[#302E29]">
              <div className="flex items-center justify-between py-2">
                <dt className="text-[#5C5953] dark:text-[#A6A198]">Profil Kontainer</dt>
                <dd className="font-mono font-medium truncate max-w-[140px]">{activeProfile.name}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-[#5C5953] dark:text-[#A6A198]">Orientasi / Kunci</dt>
                <dd className="font-mono font-medium capitalize">
                  {orientation === 'landscape' ? 'Horiz' : 'Vert'} · {orientationLock}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-[#5C5953] dark:text-[#A6A198]">FPS / DPR</dt>
                <dd className="font-mono font-medium tabular-nums">
                  {liveFps} fps · {renderConfig.renderScale.toFixed(2)}x
                </dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-[#5C5953] dark:text-[#A6A198]">Zoom / Paksa Zoom</dt>
                <dd className="font-mono font-medium tabular-nums">
                  {renderConfig.autoFitDesktop ? 'Auto-Fit' : `${renderConfig.manualZoom}%`} ·{' '}
                  {renderConfig.forceZoom ? 'Paksa' : 'Normal'}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-[#5C5953] dark:text-[#A6A198]">Anti Pull-to-Refresh</dt>
                <dd className="font-medium text-[#2E7D4F] dark:text-[#86CFA0]">
                  {renderConfig.disablePullToRefreshGlobal || renderConfig.disablePullToRefreshPerSite
                    ? 'Terkunci Aman'
                    : 'Nonaktif'}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-[#5C5953] dark:text-[#A6A198]">Anti-Redirect Pintar</dt>
                <dd className="font-medium text-right text-[#2E7D4F] dark:text-[#86CFA0]">
                  Sosmed 100% · WC {walletWhitelistEnabled ? `${whitelistedWallets.length} App` : 'Blokir'}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-[#5C5953] dark:text-[#A6A198]">Proxy / RAM</dt>
                <dd className="flex items-center gap-1 font-mono font-medium tabular-nums">
                  <Globe className="h-3 w-3 text-[#7A746B]" />
                  <span>{proxy.enabled ? proxy.protocol : 'DIRECT'}</span>
                  <span className="text-[#7A746B]">·</span>
                  <span>{totalRamMb} MB</span>
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </section>
  );
};
