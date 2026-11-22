import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Bookmark,
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
  ChevronRight,
  ChevronDown,
  Monitor,
} from 'lucide-react';
import {
  BookmarkItem,
  BrowserProfile,
  BrowserTab,
  buildSearchUrl,
  ChromeExtensionItem,
  DEFAULT_SEARCH_ENGINES,
  DeviceOrientation,
  DevToolsLayoutMode,
  DevToolsTab,
  DownloadItem,
  FlexiblePopupState,
  FpsLimit,
  HistoryItem,
  HomeShortcut,
  InspectableElement,
  NetworkRequestEntry,
  OrientationLockMode,
  PermissionValue,
  ProxyConfig,
  RenderConfig,
  SearchEngineConfig,
  SearchEngineId,
  SitePermissions,
  SiteStorageItem,
  StorageKeyValue,
  TerminalEntry,
  VaultCredential,
} from '../types/browser';
import { DesktopGameCanvas, INSPECTABLE_NODES } from './DesktopGameCanvas';
import { KarsaHomePage } from './KarsaHomePage';
import { FlexiblePopup } from './FlexiblePopup';
import { FloatingTerminal } from './FloatingTerminal';
import { MobileDevTools } from './MobileDevTools';
import { ActiveSheetType, BrowserSheets } from './BrowserSheets';
import { SiteInfoPopover } from './SiteInfoPopover';
import { ExtensionsPopover } from './ExtensionsPopover';
import { AddressBarOverlay } from './AddressBarOverlay';
import { SearchEngineBadge } from './SearchEngineBadge';

interface BrowserSimulatorProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

const createHomeTab = (id = 'tab-home', incognito = false): BrowserTab => ({
  id,
  title: incognito ? 'Penyamaran' : 'Beranda',
  url: incognito ? 'karsa://incognito' : 'karsa://home',
  group: 'Utama',
  type: 'home',
  desktopMode: false,
  hibernated: false,
  incognito,
  ramMb: 42,
  faviconLabel: incognito ? 'IN' : 'K',
});

const INITIAL_SHORTCUTS: HomeShortcut[] = [
  { id: 'sc-google', label: 'Google', url: 'https://www.google.com', badge: 'G' },
  { id: 'sc-x', label: 'X', url: 'https://x.com', badge: 'X' },
  { id: 'sc-youtube', label: 'YouTube', url: 'https://m.youtube.com', badge: 'YT' },
];

const INITIAL_PROFILES: BrowserProfile[] = [
  {
    id: 'prof-main',
    name: 'Profil Utama',
    badge: 'P1',
    walletLabel: null,
    proxySummary: 'DIRECT',
    cookieCount: 0,
    activeExtensions: 0,
  },
];

const INITIAL_CREDENTIALS: VaultCredential[] = [];

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
  const [orientation, setOrientation] = useState<DeviceOrientation>('portrait');
  const [orientationLock, setOrientationLock] = useState<OrientationLockMode>('auto');
  const [fullScreen, setFullScreen] = useState(false);

  // 100% Fresh Start: Only 1 Home Tab, ZERO dummy tabs
  const [tabs, setTabs] = useState<BrowserTab[]>(() => [createHomeTab('tab-home')]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-home');
  const [addressInput, setAddressInput] = useState('karsa://home');
  const [tabSwitcherOpen, setTabSwitcherOpen] = useState(false);

  // Original Karsa Home Quick Shortcuts (real sites, user editable)
  const [shortcuts, setShortcuts] = useState<HomeShortcut[]>(INITIAL_SHORTCUTS);

  // Per-site remembered Desktop Mode preferences (default = Mode Mobile)
  const [rememberDesktopSites, setRememberDesktopSites] = useState<Record<string, boolean>>({});

  // Mobile Address / Search Bar Focus Mode (Standard Chrome/Brave Mobile Flow)
  const [urlFocusMode, setUrlFocusMode] = useState(false);
  const [searchDraft, setSearchDraft] = useState('');
  const [clipboardUrl, setClipboardUrl] = useState('');
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Multi Search Engine & Smart Autocomplete State (Default: Google)
  const [searchEngines, setSearchEngines] = useState<SearchEngineConfig[]>(DEFAULT_SEARCH_ENGINES);
  const [activeSearchEngineId, setActiveSearchEngineId] = useState<SearchEngineId>('google');
  const [enginePickerOpen, setEnginePickerOpen] = useState(false);
  const [searchSuggestionsEnabled, setSearchSuggestionsEnabled] = useState(true);

  // Floating Bookmark Toast Card (2.5s auto-hide above Bottom Bar)
  const [bookmarkToast, setBookmarkToast] = useState<{
    message: string;
    badge: string;
    showArrow: boolean;
  } | null>(null);
  const bookmarkToastTimerRef = useRef<number | null>(null);

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
  const [savedSiteZooms, setSavedSiteZooms] = useState<Record<string, number>>({});
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
    title: 'Hubungkan Wallet Web3',
    url: 'wc://walletconnect.karsa/session',
    interceptedIntent: 'Whitelist WalletConnect aktif (Rabby Wallet) · Sosmed tetap 100% terkunci',
    x: 44,
    y: 26,
    width: 350,
    height: 360,
    connected: false,
  });

  // Floating Terminal & Proxy State (Fresh: 0 logs)
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalMinimized, setTerminalMinimized] = useState(false);
  const [terminalDocked, setTerminalDocked] = useState(false);
  const [proxy, setProxy] = useState<ProxyConfig>({
    enabled: false,
    protocol: 'DIRECT',
    host: '',
    port: '1080',
    username: '',
    password: '',
    perSession: true,
    latencyMs: null,
  });
  const [terminalEntries, setTerminalEntries] = useState<TerminalEntry[]>([]);

  // Mobile-First DevTools State (Fresh: 0 network / 0 storage entries)
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [devToolsMinimized, setDevToolsMinimized] = useState(false);
  const [devToolsLayout, setDevToolsLayout] = useState<DevToolsLayoutMode>('split');
  const [devToolsTab, setDevToolsTab] = useState<DevToolsTab>('elements');
  const [touchInspectActive, setTouchInspectActive] = useState(false);
  const [inspectedElement, setInspectedElement] = useState<InspectableElement>(
    INSPECTABLE_NODES.walletBtn
  );
  const [networkEntries, setNetworkEntries] = useState<NetworkRequestEntry[]>([]);
  const [kvStorage, setKvStorage] = useState<StorageKeyValue[]>([]);
  const [perfOverlayEnabled, setPerfOverlayEnabled] = useState(false);

  // Sheets, Site Info Popover, Extensions Popover, Permissions & Browser Utilities (Fresh: 0 extensions/bookmarks/history/downloads)
  const [activeSheet, setActiveSheet] = useState<ActiveSheetType>(null);
  const [siteInfoOpen, setSiteInfoOpen] = useState(false);
  const [extensionsOpen, setExtensionsOpen] = useState(false);
  const [antiRedirectForSite, setAntiRedirectForSite] = useState(true);
  const [walletWhitelistEnabled, setWalletWhitelistEnabled] = useState(true);
  const [whitelistedWallets, setWhitelistedWallets] = useState<string[]>(['Rabby Wallet']);
  const [extensions, setExtensions] = useState<ChromeExtensionItem[]>([]);
  const [externalPassManager, setExternalPassManager] = useState('Karsa Vault (Terenkripsi)');
  const [adBlockEnabled, setAdBlockEnabled] = useState(true);
  const [adsBlockedCount, setAdsBlockedCount] = useState(0);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [siteStorage, setSiteStorage] = useState<SiteStorageItem[]>([]);
  const [sitePermissions, setSitePermissions] = useState<SitePermissions>(INITIAL_PERMISSIONS);
  const [findBarOpen, setFindBarOpen] = useState(false);
  const [findQuery, setFindQuery] = useState('');

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) || tabs[0],
    [tabs, activeTabId]
  );

  const isHomeTab = activeTab.type === 'home';
  const isCurrentTabBookmarked =
    !isHomeTab && bookmarks.some((b) => b.url === activeTab.url);

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeProfileId) || profiles[0],
    [profiles, activeProfileId]
  );

  const activeSearchEngine = useMemo(
    () => searchEngines.find((e) => e.id === activeSearchEngineId) || searchEngines[0],
    [searchEngines, activeSearchEngineId]
  );

  const currentOrigin = useMemo(() => {
    if (activeTab.type === 'home') return 'karsa://home';
    try {
      const parsed = new URL(activeTab.url);
      return parsed.hostname || activeTab.url;
    } catch {
      return activeTab.url;
    }
  }, [activeTab.url, activeTab.type]);
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

  const handleEnterUrlFocus = (openEnginePicker = false) => {
    setSiteInfoOpen(false);
    setExtensionsOpen(false);
    setTabSwitcherOpen(false);
    setActiveSheet(null);
    setSearchDraft('');
    setEnginePickerOpen(openEnginePicker);
    setUrlFocusMode(true);
  };

  const handleCancelUrlFocus = () => {
    setUrlFocusMode(false);
    setEnginePickerOpen(false);
    setSearchDraft('');
  };

  const handleSelectSearchEngine = (id: SearchEngineId) => {
    setActiveSearchEngineId(id);
    setEnginePickerOpen(false);
    const chosen = searchEngines.find((e) => e.id === id);
    if (chosen) {
      showNotice(`Mesin pencari aktif: ${chosen.name}`);
      appendLog('success', `[SearchEngine] Diubah ke ${chosen.name} (${chosen.urlTemplate})`);
    }
    if (urlFocusMode) {
      window.setTimeout(() => urlInputRef.current?.focus(), 10);
    }
  };

  const handleUpdateCustomSearchEngine = (name: string, urlTemplate: string) => {
    let customDomain = 'custom';
    try {
      customDomain = new URL(urlTemplate.replace(/%s/g, 'test')).hostname;
    } catch {
      customDomain = 'custom';
    }
    setSearchEngines((prev) =>
      prev.map((e) =>
        e.id === 'custom'
          ? {
              ...e,
              name,
              urlTemplate,
              domain: customDomain,
              description: `URL Kustom aktif (${customDomain})`,
            }
          : e
      )
    );
    setActiveSearchEngineId('custom');
    setEnginePickerOpen(false);
    showNotice(`Mesin pencari kustom "${name}" disimpan & diaktifkan.`);
    appendLog('success', `[SearchEngine] URL Kustom disimpan: ${name} -> ${urlTemplate}`);
  };

  const showBookmarkToastCard = useCallback(
    (message: string, badge: string, showArrow: boolean) => {
      if (bookmarkToastTimerRef.current) {
        window.clearTimeout(bookmarkToastTimerRef.current);
      }
      setBookmarkToast({ message, badge, showArrow });
      bookmarkToastTimerRef.current = window.setTimeout(() => {
        setBookmarkToast(null);
      }, 2500);
    },
    []
  );

  const handleToggleCurrentBookmark = () => {
    if (activeTab.type === 'home') return;
    const existing = bookmarks.find((b) => b.url === activeTab.url);
    if (existing) {
      setBookmarks((prev) => prev.filter((b) => b.id !== existing.id));
      showBookmarkToastCard('Bookmark dihapus', activeTab.faviconLabel, false);
      appendLog('output', `[Bookmark] Dihapus: ${activeTab.title}`);
    } else {
      setBookmarks((prev) => [
        {
          id: `bm-${Date.now()}`,
          title: activeTab.title,
          url: activeTab.url,
          folder: 'Tersimpan',
        },
        ...prev,
      ]);
      showBookmarkToastCard('Bookmark disimpan', activeTab.faviconLabel, true);
      appendLog('success', `[Bookmark] Disimpan: ${activeTab.title} (${activeTab.url})`);
    }
  };

  const handleToggleActiveTabDesktopMode = () => {
    const nextDesktop = !activeTab.desktopMode;
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id
          ? {
              ...t,
              desktopMode: nextDesktop,
              ramMb: nextDesktop ? Math.max(t.ramMb, 148) : 72,
            }
          : t
      )
    );
    showNotice(
      nextDesktop
        ? 'Mode Desktop aktif · UA Chrome Desktop + Wide Viewport dimuat ulang.'
        : 'Mode Mobile aktif · UA Chrome Mobile bersih (tanpa "; wv").'
    );
    appendLog(
      'success',
      nextDesktop
        ? `[Viewport] ${currentOrigin} dimuat ulang dalam Mode Desktop (useWideViewPort=true).`
        : `[Viewport] ${currentOrigin} kembali ke Mode Mobile standar.`
    );
  };

  const handleNavigateActiveTab = (rawInput: string, explicitTitle?: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      handleCancelUrlFocus();
      return;
    }

    if (trimmed === 'karsa://home') {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTab.id
            ? {
                ...t,
                title: 'Beranda',
                url: 'karsa://home',
                type: 'home',
                desktopMode: false,
                faviconLabel: 'K',
              }
            : t
        )
      );
      setAddressInput('karsa://home');
      setUrlFocusMode(false);
      setSearchDraft('');
      return;
    }

    let finalUrl = trimmed;
    let derivedTitle = explicitTitle || trimmed;
    let hostname = '';

    if (/^(https?:\/\/|karsa:\/\/|chrome-extension:\/\/)/i.test(trimmed)) {
      finalUrl = trimmed;
      try {
        hostname = new URL(trimmed).hostname;
        if (!explicitTitle) derivedTitle = hostname.replace(/^www\./i, '');
      } catch {
        hostname = trimmed;
      }
    } else if (trimmed.includes('.') && !trimmed.includes(' ')) {
      finalUrl = `https://${trimmed}`;
      hostname = trimmed.split('/')[0];
      if (!explicitTitle) derivedTitle = hostname.replace(/^www\./i, '');
    } else {
      finalUrl = buildSearchUrl(activeSearchEngine, trimmed);
      try {
        hostname = new URL(finalUrl).hostname;
      } catch {
        hostname = activeSearchEngine.domain;
      }
      derivedTitle = `${trimmed} — ${activeSearchEngine.name}`;
    }

    const isGameArena = finalUrl.includes('aetherfrontier.gg');
    const shouldUseDesktop = Boolean(rememberDesktopSites[hostname]) || isGameArena;
    const badge = isGameArena
      ? 'AF'
      : derivedTitle.replace(/^www\./i, '').slice(0, 2).toUpperCase() || 'WB';

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id
          ? {
              ...t,
              url: finalUrl,
              title: isGameArena ? 'Aether Frontier — Desktop Web3 Tactics' : derivedTitle,
              type: isGameArena ? 'game' : 'docs',
              desktopMode: shouldUseDesktop,
              ramMb: shouldUseDesktop ? 168 : 78,
              faviconLabel: badge,
            }
          : t
      )
    );
    setAddressInput(finalUrl);
    setUrlFocusMode(false);
    setEnginePickerOpen(false);
    setSearchDraft('');

    if (!activeTab.incognito) {
      setHistory((prev) => [
        {
          id: `hist-${Date.now()}`,
          title: isGameArena ? 'Aether Frontier — Desktop Web3 Tactics' : derivedTitle,
          url: finalUrl,
          visitedAt: nowStamp().slice(0, 5),
        },
        ...prev.slice(0, 29),
      ]);
    }
    appendLog(
      'output',
      `[Nav] ${finalUrl} (${shouldUseDesktop ? 'Mode Desktop' : 'Mode Mobile · UA Bersih'})`
    );
    appendNetwork({
      method: 'GET',
      url: finalUrl,
      host: hostname || finalUrl,
      status: 200,
      type: 'document',
      sizeKb: '14,2 KB',
      durationMs: 42,
      requestHeaders: {
        'User-Agent': shouldUseDesktop
          ? 'Chrome/131.0 Windows NT 10.0 (Desktop)'
          : 'Chrome/131.0 Android 14 Mobile (Clean)',
        'Sec-CH-UA-Mobile': shouldUseDesktop ? '?0' : '?1',
      },
      responseHeaders: { 'Content-Type': 'text/html; charset=utf-8' },
      payload: '(GET document navigation)',
      responsePreview: `{"url":"${finalUrl}","mode":"${shouldUseDesktop ? 'desktop' : 'mobile'}"}`,
    });
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
    if (!text) {
      showNotice('Papan klip masih kosong. Salin tautan terlebih dahulu.');
      return;
    }
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
    setSearchDraft(activeTab.type === 'home' ? '' : activeTab.url);
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
      showNotice('Orientasi Full Screen dikunci Vertikal (Portrait) · Auto-reflow tanpa reload.');
      appendLog('output', '[FullScreen] OrientationLock -> PORTRAIT.');
    } else if (lock === 'landscape') {
      setOrientation('landscape');
      showNotice('Orientasi Full Screen dikunci Horizontal (Landscape) · Auto-reflow tanpa reload.');
      appendLog('output', '[FullScreen] OrientationLock -> LANDSCAPE.');
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
          title: `Mobile DevTools — ${activeTab.title}`,
          url: `karsa://devtools/inspect?target=${activeTab.id}`,
          group: 'Utilitas',
          type: 'devtools',
          desktopMode: false,
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
      const fallback = tabs.find((t) => t.type !== 'devtools') || tabs[0];
      setActiveTabId(fallback.id);
      setAddressInput(fallback.url);
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
      desktopMode: activeTab.desktopMode,
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
        showNotice(`Koneksi berhasil: ${label} aktif tanpa memuat ulang halaman.`);
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
    if (activeTab.type === 'wallet-connect' || activeTab.type === 'oauth-x' || activeTab.type === 'oauth-discord') {
      const originTab = tabs.find((t) => t.id !== activeTab.id) || tabs[0];
      setActiveTabId(originTab.id);
      setAddressInput(originTab.url);
    }
    appendLog('success', `[Auth] Berhasil terhubung (${kind}): ${label}. Sesi dikembalikan tanpa reload.`);
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
    const newTab = createHomeTab(id, incognito);
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
        const fallback = tabs.find((t) => t.type !== 'devtools') || tabs[0];
        setActiveTabId(fallback.id);
        setAddressInput(fallback.url);
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
            {/* Android System Status Bar (Edge-to-Edge Safe Area, Hidden in Full Screen) */}
            {!fullScreen && (
              <div className="flex h-7 shrink-0 items-center justify-between bg-[#FAF8F4] px-4 text-[11px] font-mono font-medium text-[#1F1E1B] select-none dark:bg-[#21201D] dark:text-[#F2EFE9]">
                <span className="tabular-nums">23:45 · {activeProfile.badge}</span>
                <div className="flex items-center gap-2.5 tabular-nums opacity-85">
                  {proxy.enabled && (
                    <span className="text-[#2E7D4F] dark:text-[#86CFA0]">
                      {proxy.protocol} · {proxy.latencyMs}ms
                    </span>
                  )}
                  <span>{liveFps} FPS</span>
                  <span>5G · 92%</span>
                </div>
              </div>
            )}

            {/* Clean Standard Mobile Top Bar — 56px, 3 Elements Only (Hidden in Full Screen) */}
            {!fullScreen && (
              <div className="flex h-14 shrink-0 items-center gap-2 border-b border-[#E5E0D6] bg-[#FAF8F4] px-3 dark:border-[#2E2C28] dark:bg-[#21201D]">
                {urlFocusMode ? (
                  /* FOCUSED MOBILE SEARCH / ADDRESS BAR MODE (Back <- + Empty Input + Clear/Paste + Go) */
                  <>
                    <button
                      type="button"
                      onClick={handleCancelUrlFocus}
                      title="Batal dan kembali ke halaman aktif (tanpa muat ulang)"
                      aria-label="Kembali tanpa memuat ulang"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#4A4741] transition-colors hover:bg-black/5 dark:text-[#D4CEC3] dark:hover:bg-white/10 cursor-pointer"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleNavigateActiveTab(searchDraft);
                      }}
                      className="flex h-10 flex-1 min-w-0 items-center gap-1.5 rounded-full border border-[#C86442] bg-white pl-1.5 pr-1.5 text-sm shadow-sm ring-2 ring-[#C86442]/15 dark:border-[#D97757] dark:bg-[#171614] dark:ring-[#D97757]/15"
                    >
                      {/* Quick-Switch Active Search Engine Icon Button */}
                      <button
                        type="button"
                        onClick={() => setEnginePickerOpen((v) => !v)}
                        title={`Mesin pencari aktif: ${activeSearchEngine.name} (ketuk untuk ganti cepat)`}
                        aria-label={`Ganti cepat mesin pencari, aktif ${activeSearchEngine.name}`}
                        aria-expanded={enginePickerOpen}
                        className={`flex h-7 shrink-0 items-center gap-0.5 rounded-full pl-1 pr-1 transition-colors cursor-pointer ${
                          enginePickerOpen
                            ? 'bg-[#C86442]/14 ring-1 ring-[#C86442]/40 dark:bg-[#D97757]/20 dark:ring-[#D97757]/40'
                            : 'hover:bg-black/5 dark:hover:bg-white/10'
                        }`}
                      >
                        <SearchEngineBadge engineId={activeSearchEngine.id} size="sm" />
                        <ChevronDown
                          className={`h-3 w-3 text-[#7A746B] transition-transform dark:text-[#A6A198] ${
                            enginePickerOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      <input
                        ref={urlInputRef}
                        type="text"
                        value={searchDraft}
                        onChange={(e) => {
                          setSearchDraft(e.target.value);
                          if (enginePickerOpen && e.target.value.length > 0) {
                            setEnginePickerOpen(false);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            handleCancelUrlFocus();
                          }
                        }}
                        placeholder={`Telusuri ${activeSearchEngine.name} atau ketik URL`}
                        aria-label="Telusuri atau ketik URL baru"
                        className="min-w-0 flex-1 bg-transparent text-[13px] text-[#1F1E1B] placeholder:text-[#8E887E] outline-none dark:text-[#EFECE6] dark:placeholder:text-[#807A70]"
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
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#6C675E] hover:bg-black/5 dark:text-[#A6A198] dark:hover:bg-white/10 cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <button
                            type="submit"
                            className="flex h-8 items-center gap-1 rounded-full bg-[#C86442] px-3 text-xs font-semibold text-white hover:bg-[#B25435] cursor-pointer dark:bg-[#D97757] dark:text-[#181715]"
                          >
                            <span>Buka</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handlePasteOnly}
                          title="Tempel tautan dari papan klip"
                          className="flex h-8 shrink-0 items-center gap-1 rounded-full border border-[#DFD9CE] bg-[#FAF8F4] px-2.5 text-xs font-medium text-[#5C5953] hover:bg-[#EFECE6] cursor-pointer dark:border-[#36342E] dark:bg-[#23221F] dark:text-[#D4CEC3]"
                        >
                          <ClipboardPaste className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
                          <span>Tempel</span>
                        </button>
                      )}
                    </form>
                  </>
                ) : (
                  /* STANDARD 3-ELEMENT MOBILE TOP BAR: [Wide URL Pill (Vector Lock)] -> [Vector Extensions] -> [Vector Full Screen] */
                  <>
                    <div className="flex h-[42px] flex-1 min-w-0 items-center gap-1.5 rounded-full border border-[#DFD9CE] bg-white pl-1.5 pr-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:border-[#36342E] dark:bg-[#171614]">
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
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer ${
                          siteInfoOpen
                            ? 'bg-[#2E7D4F]/18 text-[#21633D] ring-1 ring-[#2E7D4F]/40 dark:bg-[#86CFA0]/20 dark:text-[#86CFA0] dark:ring-[#86CFA0]/40'
                            : 'text-[#4A4741] hover:bg-black/5 dark:text-[#D4CEC3] dark:hover:bg-white/10'
                        }`}
                      >
                        <Lock className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEnterUrlFocus(false)}
                        title="Ketuk untuk mencari atau menempel URL baru"
                        aria-label="Buka kolom pencarian dan alamat URL"
                        className={`min-w-0 flex-1 py-1 text-left text-[13.5px] truncate cursor-text ${
                          isHomeTab
                            ? 'font-normal text-[#8A8479] dark:text-[#868075]'
                            : 'font-medium text-[#1F1E1B] dark:text-[#EFECE6]'
                        }`}
                      >
                        {isHomeTab
                          ? `Telusuri ${activeSearchEngine.name} atau ketik URL`
                          : (addressInput || activeTab.url).replace(/^https?:\/\//, '')}
                      </button>
                    </div>

                    {/* Right Monochrome Vector Actions: [Ekstensi/Userscript] -> [Full Layar] */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSiteInfoOpen(false);
                          setTabSwitcherOpen(false);
                          setActiveSheet(null);
                          setExtensionsOpen((v) => !v);
                        }}
                        title="Ekstensi & Userscript"
                        aria-label="Toggle daftar ekstensi dan userscript"
                        aria-expanded={extensionsOpen}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors cursor-pointer ${
                          extensionsOpen
                            ? 'bg-[#C86442]/15 text-[#964226] dark:text-[#F2A68C]'
                            : 'text-[#3E3B35] hover:bg-black/5 dark:text-[#DDD7CB] dark:hover:bg-white/10'
                        }`}
                      >
                        <Puzzle className="h-[20px] w-[20px]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSiteInfoOpen(false);
                          setExtensionsOpen(false);
                          setTabSwitcherOpen(false);
                          setActiveSheet(null);
                          setUrlFocusMode(false);
                          setFullScreen(true);
                        }}
                        title="Mode Layar Penuh (Sembunyikan Bar Atas, Bawah & Sistem)"
                        aria-label="Masuk mode layar penuh"
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-[#3E3B35] transition-colors hover:bg-black/5 dark:text-[#DDD7CB] dark:hover:bg-white/10 cursor-pointer"
                      >
                        <Maximize className="h-[20px] w-[20px]" />
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
                {activeTab.type === 'home' ? (
                  <KarsaHomePage
                    shortcuts={shortcuts}
                    activeSearchEngine={activeSearchEngine}
                    onOpenSearchFocus={(openPicker) => handleEnterUrlFocus(Boolean(openPicker))}
                    onNavigateShortcut={(url, label) => handleNavigateActiveTab(url, label)}
                    onAddShortcut={(label, url) => {
                      const badge = label.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'WB';
                      setShortcuts((prev) => [
                        ...prev,
                        { id: `sc-${Date.now()}`, label, url, badge },
                      ]);
                      showNotice(`Pintasan "${label}" ditambahkan ke Beranda.`);
                    }}
                    onRemoveShortcut={(id) => {
                      setShortcuts((prev) => prev.filter((item) => item.id !== id));
                    }}
                  />
                ) : activeTab.type === 'devtools' ? (
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
                          onClick={() => {
                            const originTab = tabs.find((t) => t.id !== activeTab.id) || tabs[0];
                            setActiveTabId(originTab.id);
                            setAddressInput(originTab.url);
                          }}
                          className="rounded-lg border border-[#D8D2C5] px-4 py-2 text-xs font-medium hover:bg-black/5 cursor-pointer dark:border-[#3D3A34]"
                        >
                          Kembali ke Tab Sebelumnya
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
                  <div className="thin-scrollbar flex h-full w-full flex-col overflow-y-auto bg-[#FAF8F4] text-[#1F1E1B] dark:bg-[#191816] dark:text-[#F2EFE9]">
                    {/* Simulated Clean Website Header reflecting Mobile (default) vs Desktop Mode */}
                    <div className="border-b border-[#E5E0D6] bg-white px-4 py-3.5 dark:border-[#2E2C28] dark:bg-[#201F1C]">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EFECE6] font-mono text-xs font-bold text-[#8E3C21] dark:bg-[#2D2B27] dark:text-[#E59377]">
                            {activeTab.faviconLabel}
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold truncate">{activeTab.title}</h3>
                            <p className="font-mono text-[10px] text-[#7A746B] truncate dark:text-[#9D978E]">
                              {activeTab.url}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleToggleActiveTabDesktopMode}
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors cursor-pointer ${
                            activeTab.desktopMode
                              ? 'border-[#C86442] bg-[#C86442]/10 text-[#964226] dark:border-[#D97757] dark:text-[#F2A68C]'
                              : 'border-[#DFD9CE] bg-[#FAF8F4] text-[#4A4741] hover:bg-[#EFECE6] dark:border-[#36342E] dark:bg-[#181715] dark:text-[#D4CEC3]'
                          }`}
                        >
                          {activeTab.desktopMode ? (
                            <>
                              <Monitor className="h-3.5 w-3.5" />
                              <span>Desktop</span>
                            </>
                          ) : (
                            <>
                              <Smartphone className="h-3.5 w-3.5" />
                              <span>Mobile</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Adaptive Mobile vs Desktop Viewport Preview */}
                    <div className="flex-1 p-4 space-y-4">
                      <div
                        className={`rounded-xl border border-[#E5E0D6] bg-white p-4 shadow-sm dark:border-[#302E29] dark:bg-[#21201D] ${
                          activeTab.desktopMode ? 'grid grid-cols-12 gap-3' : 'space-y-3'
                        }`}
                      >
                        <div className={activeTab.desktopMode ? 'col-span-8 space-y-2' : 'space-y-2'}>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8E3C21] dark:text-[#E59377]">
                            {activeTab.desktopMode
                              ? 'Mode Desktop Aktif · Wide Viewport (Chrome Desktop UA)'
                              : 'Mode Mobile (Default) · UA Chrome Mobile Bersih (Tanpa "; wv")'}
                          </p>
                          <p className="text-sm font-semibold leading-snug">
                            {activeTab.incognito
                              ? 'Sesi Penyamaran aktif — cookie & riwayat dihapus otomatis saat tab ditutup.'
                              : activeTab.desktopMode
                              ? 'Halaman dirender dalam lebar tata letak desktop penuh dengan dukungan zoom bebas.'
                              : 'Teks dan tata letak menyesuaikan lebar layar HP secara proporsional seperti Chrome Mobile.'}
                          </p>
                          <p className="text-xs leading-relaxed text-[#5C5953] dark:text-[#A6A198]">
                            Ketuk ikon <strong>Bookmark</strong> di bar bawah untuk menyimpan halaman ini dalam satu ketukan, atau buka <strong>⋮ → Mode Desktop</strong> untuk beralih tampilan kapan saja.
                          </p>
                        </div>

                        {activeTab.desktopMode && (
                          <div className="col-span-4 rounded-lg border border-[#E7E2D8] bg-[#FAF8F4] p-2.5 text-[11px] space-y-1.5 dark:border-[#34322C] dark:bg-[#191816]">
                            <p className="font-semibold">Sidebar Desktop</p>
                            <p className="text-[#6C675E] dark:text-[#9D978E]">
                              Viewport: 1280px
                            </p>
                            <p className="text-[#6C675E] dark:text-[#9D978E]">
                              Zoom: {renderConfig.autoFitDesktop ? 'Fit' : `${renderConfig.manualZoom}%`}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Quick interactive test triggers directly from any visited page */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => openFlexiblePopup('wallet')}
                          className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#E2DCD0] bg-white px-3 py-2 text-xs font-medium text-[#1F1E1B] hover:bg-[#F3EFE7] cursor-pointer dark:border-[#34322C] dark:bg-[#21201D] dark:text-[#F2EFE9]"
                        >
                          <Puzzle className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
                          <span>Hubungkan Wallet</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openFlexiblePopup('oauth-x')}
                          className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#E2DCD0] bg-white px-3 py-2 text-xs font-medium text-[#1F1E1B] hover:bg-[#F3EFE7] cursor-pointer dark:border-[#34322C] dark:bg-[#21201D] dark:text-[#F2EFE9]"
                        >
                          <ShieldAlert className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
                          <span>Uji Login X</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleNavigateActiveTab('karsa://home')}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#DDD7CB] bg-white px-3 py-1.5 text-xs font-medium hover:bg-[#EFECE6] cursor-pointer dark:border-[#34322C] dark:bg-[#21201D]"
                        >
                          <Home className="h-3.5 w-3.5" />
                          <span>Kembali ke Beranda</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleNavigateActiveTab('https://play.aetherfrontier.gg', 'Aether Frontier')
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8E3C21] hover:underline cursor-pointer dark:text-[#E59377]"
                        >
                          <span>Buka Demo Web3 Arena</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
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

              {/* Floating Bookmark Saved/Removed Toast Card (2.5s auto-hide right above Bottom Bar) */}
              {bookmarkToast && !fullScreen && (
                <div className="pointer-events-none absolute inset-x-3 bottom-2.5 z-30 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (bookmarkToast.showArrow) {
                        setBookmarkToast(null);
                        setSiteInfoOpen(false);
                        setExtensionsOpen(false);
                        setTabSwitcherOpen(false);
                        setUrlFocusMode(false);
                        setActiveSheet('bookmarks');
                      }
                    }}
                    className={`pointer-events-auto flex w-full max-w-[360px] items-center justify-between gap-3 rounded-2xl border border-[#E0D9CD] bg-white/98 px-3.5 py-2.5 text-left text-[#1F1E1B] shadow-xl backdrop-blur dark:border-[#3A3731] dark:bg-[#262420]/98 dark:text-[#F2EFE9] ${
                      bookmarkToast.showArrow ? 'cursor-pointer hover:bg-[#FAF8F4] dark:hover:bg-[#2E2C27]' : 'cursor-default'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EFECE6] font-mono text-[11px] font-bold text-[#141413] dark:bg-[#34322C] dark:text-white">
                        {bookmarkToast.badge}
                      </span>
                      <span className="text-xs font-semibold truncate">{bookmarkToast.message}</span>
                    </span>
                    {bookmarkToast.showArrow && (
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#6C675E] dark:text-[#A6A198]" />
                    )}
                  </button>
                </div>
              )}

              {/* Mobile Focused Address / Search Bar Overlay (Quick Engine Switcher + Smart Autocomplete + Current Page Card) */}
              <AddressBarOverlay
                open={urlFocusMode && !fullScreen}
                searchDraft={searchDraft}
                activeTab={activeTab}
                clipboardUrl={clipboardUrl}
                copiedFeedback={copiedFeedback}
                bookmarks={bookmarks}
                history={history}
                activeSearchEngine={activeSearchEngine}
                searchEngines={searchEngines}
                enginePickerOpen={enginePickerOpen}
                searchSuggestionsEnabled={searchSuggestionsEnabled}
                onCancel={handleCancelUrlFocus}
                onNavigate={handleNavigateActiveTab}
                onFillSearchDraft={(val) => {
                  setSearchDraft(val);
                  setEnginePickerOpen(false);
                  urlInputRef.current?.focus();
                }}
                onSelectSearchEngine={handleSelectSearchEngine}
                onOpenCustomEngineSettings={() => {
                  setUrlFocusMode(false);
                  setEnginePickerOpen(false);
                  setActiveSheet('searchEngine');
                }}
                onPasteOnly={handlePasteOnly}
                onPasteAndGo={handlePasteAndGo}
                onShareCurrent={handleShareCurrentUrl}
                onCopyCurrent={handleCopyCurrentUrl}
                onEditCurrentUrl={handleEditCurrentUrl}
              />

              {/* Site Info & Quick Controls Popover (opened via Lock icon on left of URL bar) */}
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
                rememberDesktopForSite={Boolean(rememberDesktopSites[currentOrigin])}
                activeProfile={activeProfile}
                proxy={proxy}
                onClose={() => setSiteInfoOpen(false)}
                onToggleRememberDesktopForSite={() => {
                  if (isHomeTab) return;
                  const next = !rememberDesktopSites[currentOrigin];
                  setRememberDesktopSites((prev) => ({ ...prev, [currentOrigin]: next }));
                  setTabs((prev) =>
                    prev.map((t) =>
                      t.id === activeTab.id ? { ...t, desktopMode: next } : t
                    )
                  );
                  showNotice(
                    next
                      ? `Mode Desktop diingat otomatis untuk ${currentOrigin}.`
                      : `Preferensi Mode Desktop untuk ${currentOrigin} dihapus (kembali Mode Mobile).`
                  );
                }}
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

              {/* 1-Column Vertical Dropdown for Three-Dots Menu & Sub-Menus */}
              <BrowserSheets
                activeSheet={activeSheet}
                currentOrigin={currentOrigin}
                isHomeTab={isHomeTab}
                desktopMode={activeTab.desktopMode}
                onToggleDesktopMode={handleToggleActiveTabDesktopMode}
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
                    activeExtensions: 0,
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
                currentTabTitle={activeTab.title}
                currentTabUrl={activeTab.url}
                onAddCurrentBookmark={handleToggleCurrentBookmark}
                onRemoveBookmark={(id) => {
                  setBookmarks((prev) => prev.filter((b) => b.id !== id));
                  showBookmarkToastCard('Bookmark dihapus', 'BM', false);
                }}
                history={history}
                downloads={downloads}
                siteStorage={siteStorage}
                onClearSiteStorage={(origin) => {
                  setSiteStorage((prev) => prev.filter((s) => s.origin !== origin));
                  appendLog('success', `[Storage] Cookie & cache untuk ${origin} telah dibersihkan.`);
                }}
                onNavigateBookmark={(url, title) => {
                  handleNavigateActiveTab(url, title);
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
                searchEngines={searchEngines}
                activeSearchEngineId={activeSearchEngineId}
                searchSuggestionsEnabled={searchSuggestionsEnabled}
                onSelectSearchEngine={handleSelectSearchEngine}
                onUpdateCustomSearchEngine={handleUpdateCustomSearchEngine}
                onToggleSearchSuggestions={() =>
                  setSearchSuggestionsEnabled((v) => {
                    const next = !v;
                    showNotice(
                      next
                        ? 'Saran pencarian otomatis (Autocomplete) diaktifkan.'
                        : 'Saran pencarian otomatis dimatikan.'
                    );
                    return next;
                  })
                }
              />
            </div>

            {/* Standard 5-Icon Mobile Bottom Navigation Bar (56px + Safe Area above Gesture Bar, Hidden in Full Screen) */}
            {!fullScreen && (
              <nav
                aria-label="Navigasi bawah browser"
                className="grid h-14 shrink-0 grid-cols-5 items-center border-t border-[#E5E0D6] bg-[#FAF8F4] px-1 dark:border-[#2E2C28] dark:bg-[#21201D]"
              >
                {/* 1. Home */}
                <button
                  type="button"
                  onClick={() => {
                    setSiteInfoOpen(false);
                    setExtensionsOpen(false);
                    setTabSwitcherOpen(false);
                    setActiveSheet(null);
                    setUrlFocusMode(false);
                    handleNavigateActiveTab('karsa://home');
                  }}
                  title="Beranda Karsa (Home)"
                  aria-label="Kembali ke beranda"
                  className={`flex h-11 items-center justify-center rounded-xl transition-colors cursor-pointer ${
                    isHomeTab
                      ? 'text-[#141413] dark:text-white'
                      : 'text-[#3E3B35] hover:bg-black/5 dark:text-[#DDD7CB] dark:hover:bg-white/10'
                  }`}
                >
                  <Home className="h-[21px] w-[21px]" />
                </button>

                {/* 2. 1-Tap Bookmark Toggle (Outline -> Solid Black in Light / Solid White in Dark) */}
                <button
                  type="button"
                  onClick={() => {
                    setSiteInfoOpen(false);
                    setExtensionsOpen(false);
                    setTabSwitcherOpen(false);
                    setActiveSheet(null);
                    setUrlFocusMode(false);
                    handleToggleCurrentBookmark();
                  }}
                  title={
                    isHomeTab
                      ? 'Buka situs terlebih dahulu untuk menyimpan Bookmark'
                      : isCurrentTabBookmarked
                      ? 'Hapus halaman ini dari Bookmark'
                      : 'Simpan halaman ini ke Bookmark (1-ketuk)'
                  }
                  aria-label={isCurrentTabBookmarked ? 'Hapus bookmark' : 'Simpan bookmark'}
                  aria-pressed={isCurrentTabBookmarked}
                  className={`flex h-11 items-center justify-center rounded-xl transition-colors ${
                    isHomeTab
                      ? 'text-[#A09A8E] dark:text-[#666159] cursor-default'
                      : isCurrentTabBookmarked
                      ? 'text-[#141413] hover:bg-black/5 dark:text-white dark:hover:bg-white/10 cursor-pointer'
                      : 'text-[#3E3B35] hover:bg-black/5 dark:text-[#DDD7CB] dark:hover:bg-white/10 cursor-pointer'
                  }`}
                >
                  <Bookmark
                    className="h-[21px] w-[21px]"
                    fill={isCurrentTabBookmarked ? 'currentColor' : 'none'}
                  />
                </button>

                {/* 3. Tambah Tab (+) */}
                <button
                  type="button"
                  onClick={() => {
                    setSiteInfoOpen(false);
                    setExtensionsOpen(false);
                    setTabSwitcherOpen(false);
                    setActiveSheet(null);
                    setUrlFocusMode(false);
                    handleAddTab(false);
                  }}
                  title="Buka Tab Baru ke Beranda (+)"
                  aria-label="Tambah tab baru"
                  className="flex h-11 items-center justify-center rounded-xl text-[#3E3B35] transition-colors hover:bg-black/5 dark:text-[#DDD7CB] dark:hover:bg-white/10 cursor-pointer"
                >
                  <Plus className="h-[22px] w-[22px]" />
                </button>

                {/* 4. Menu Tab ([N]) — Thin Rounded Box with Centered Tab Count */}
                <button
                  type="button"
                  onClick={() => {
                    setSiteInfoOpen(false);
                    setExtensionsOpen(false);
                    setActiveSheet(null);
                    setUrlFocusMode(false);
                    setTabSwitcherOpen((v) => !v);
                  }}
                  title={`Daftar Tab (${tabs.length} tab aktif)`}
                  aria-label={`Buka daftar tab (${tabs.length} tab)`}
                  className={`flex h-11 items-center justify-center rounded-xl transition-colors cursor-pointer ${
                    tabSwitcherOpen
                      ? 'bg-[#C86442]/15 text-[#964226] dark:text-[#F2A68C]'
                      : 'text-[#3E3B35] hover:bg-black/5 dark:text-[#DDD7CB] dark:hover:bg-white/10'
                  }`}
                >
                  <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-[4px] border-[1.75px] border-current px-1 font-mono text-[11px] font-bold leading-none tabular-nums">
                    {tabs.length}
                  </span>
                </button>

                {/* 5. Menu Titik Tiga (⋮) */}
                <button
                  type="button"
                  onClick={() => {
                    setSiteInfoOpen(false);
                    setExtensionsOpen(false);
                    setTabSwitcherOpen(false);
                    setUrlFocusMode(false);
                    setActiveSheet((s) => (s === 'menu' ? null : 'menu'));
                  }}
                  title="Menu Browser (Mode Desktop, Bookmark, Zoom, DevTools, Terminal & Utilitas)"
                  aria-label="Buka menu browser"
                  className={`flex h-11 items-center justify-center rounded-xl transition-colors cursor-pointer ${
                    activeSheet !== null
                      ? 'bg-[#C86442]/15 text-[#964226] dark:text-[#F2A68C]'
                      : 'text-[#3E3B35] hover:bg-black/5 dark:text-[#DDD7CB] dark:hover:bg-white/10'
                  }`}
                >
                  <MoreVertical className="h-[21px] w-[21px]" />
                </button>
              </nav>
            )}

            {/* Android Bottom Gesture Navigation Bar (navigationBarsPadding Safe Area, Hidden in Full Screen) */}
            {!fullScreen && (
              <div className="flex h-5 shrink-0 items-center justify-center bg-[#FAF8F4] dark:bg-[#21201D]">
                <div className="h-1 w-24 rounded-full bg-[#B9B2A5] dark:bg-[#534E46]" />
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
                <dt className="text-[#5C5953] dark:text-[#A6A198]">Mesin Pencari</dt>
                <dd className="flex items-center gap-1.5 font-mono font-medium truncate max-w-[155px]">
                  <SearchEngineBadge engineId={activeSearchEngine.id} size="sm" />
                  <span className="truncate">{activeSearchEngine.name}</span>
                </dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-[#5C5953] dark:text-[#A6A198]">Mode Tampilan</dt>
                <dd className="font-mono font-medium">
                  {activeTab.desktopMode ? 'Desktop (Wide)' : 'Mobile (Default)'}
                </dd>
              </div>
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
