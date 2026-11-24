export type AppSection = 'prototype' | 'stack' | 'architecture' | 'roadmap' | 'code';

export type DeviceOrientation = 'landscape' | 'portrait';

export type OrientationLockMode = 'auto' | 'portrait' | 'landscape';

export type VirtualResolution = '1280x720' | '1600x900' | '1920x1080';

export type FpsLimit = 30 | 45 | 60 | 'unlimited';

export type ProxyProtocol = 'DIRECT' | 'HTTP' | 'HTTPS' | 'SOCKS5';

export type DevToolsTab = 'elements' | 'console' | 'network' | 'storage' | 'performance';

export type DevToolsLayoutMode = 'split' | 'floating' | 'fullscreen' | 'tab';

export type PermissionValue = 'allow' | 'ask' | 'block';

export interface SitePermissions {
  clipboard: PermissionValue;
  notifications: PermissionValue;
  camera: PermissionValue;
  microphone: PermissionValue;
  location: PermissionValue;
  popups: PermissionValue;
  autoplay: PermissionValue;
}

export interface BrowserProfile {
  id: string;
  name: string;
  badge: string;
  walletLabel: string | null;
  proxySummary: string;
  cookieCount: number;
  activeExtensions: number;
}

export interface InspectableElement {
  id: string;
  selector: string;
  tagName: string;
  boundsLabel: string;
  html: string;
  styles: {
    color: string;
    background: string;
    padding: string;
    fontSize: string;
    opacity: string;
  };
}

export interface NetworkRequestEntry {
  id: string;
  method: 'GET' | 'POST' | 'WS';
  url: string;
  host: string;
  status: number;
  type: 'fetch' | 'websocket' | 'script' | 'document';
  sizeKb: string;
  durationMs: number;
  timestamp: string;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  payload: string;
  responsePreview: string;
}

export interface StorageKeyValue {
  id: string;
  store: 'cookies' | 'localStorage' | 'sessionStorage' | 'indexedDB';
  origin: string;
  key: string;
  value: string;
}

export interface HomeShortcut {
  id: string;
  label: string;
  url: string;
  badge: string;
}

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  group: 'Utama' | 'Game Web3' | 'Wallet & Sosial' | 'Utilitas';
  type: 'home' | 'game' | 'oauth-x' | 'wallet-connect' | 'oauth-discord' | 'docs' | 'devtools';
  desktopMode: boolean;
  hibernated: boolean;
  incognito?: boolean;
  ramMb: number;
  faviconLabel: string;
}

export interface ChromeExtensionItem {
  id: string;
  name: string;
  version: string;
  category: 'Web3 Wallet' | 'Keamanan' | 'Automasi' | 'Produktivitas';
  description: string;
  enabled: boolean;
  ramMb: number;
  source: 'Chrome Web Store' | 'File .crx Lokal' | 'File .zip Lokal' | 'UserScript (.user.js)';
  permissions: string[];
}

export interface ProxyConfig {
  enabled: boolean;
  protocol: ProxyProtocol;
  host: string;
  port: string;
  username: string;
  password: string;
  perSession: boolean;
  latencyMs: number | null;
}

export interface TranslationConfig {
  enabled: boolean;
  sourceLang: string; // 'auto' or ISO code
  targetLang: string; // default 'id' (Bahasa Indonesia)
  detectedLang: string; // simulated detected page language e.g. 'en'
  autoTranslateForeign: boolean;
}

export const TRANSLATION_LANGUAGES: { code: string; label: string; native: string }[] = [
  { code: 'id', label: 'Bahasa Indonesia', native: 'Indonesia' },
  { code: 'en', label: 'Inggris', native: 'English' },
  { code: 'zh', label: 'Mandarin', native: '中文' },
  { code: 'ja', label: 'Jepang', native: '日本語' },
  { code: 'ko', label: 'Korea', native: '한국어' },
  { code: 'ru', label: 'Rusia', native: 'Русский' },
  { code: 'es', label: 'Spanyol', native: 'Español' },
  { code: 'fr', label: 'Prancis', native: 'Français' },
  { code: 'de', label: 'Jerman', native: 'Deutsch' },
  { code: 'ar', label: 'Arab', native: 'العربية' },
  { code: 'th', label: 'Thailand', native: 'ไทย' },
  { code: 'vi', label: 'Vietnam', native: 'Tiếng Việt' },
  { code: 'pt', label: 'Portugis', native: 'Português' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'tr', label: 'Turki', native: 'Türkçe' },
  { code: 'nl', label: 'Belanda', native: 'Nederlands' },
];

export interface RenderConfig {
  renderScale: number; // 0.5 - 1.5
  fpsLimit: FpsLimit;
  hardwareAcceleration: boolean;
  graphicsSaver: boolean;
  autoFitDesktop: boolean;
  manualZoom: number; // 50 - 200
  forceZoom: boolean;
  dpiScale: number; // 0.75 - 1.5
  virtualResolution: VirtualResolution;
  virtualMouse: boolean;
  disablePullToRefreshGlobal: boolean;
  disablePullToRefreshPerSite: boolean;
  forceDarkMode: boolean;
  autoTabHibernation: boolean;
  autoSessionRestore: boolean;
  translation: TranslationConfig;
}

export interface FlexiblePopupState {
  open: boolean;
  kind: 'wallet' | 'oauth-x' | 'oauth-discord';
  title: string;
  url: string;
  interceptedIntent: string;
  x: number;
  y: number;
  width: number;
  height: number;
  connected: boolean;
  accountLabel?: string;
}

export interface TerminalEntry {
  id: string;
  timestamp: string;
  kind: 'input' | 'output' | 'success' | 'warn' | 'error';
  text: string;
}

export interface VaultCredential {
  id: string;
  site: string;
  username: string;
  type: 'Passkey (FIDO2)' | 'Kata Sandi Terenkripsi';
  lastUsed: string;
  biometricProtected: boolean;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  folder: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  visitedAt: string;
}

export interface DownloadItem {
  id: string;
  filename: string;
  size: string;
  progress: number;
  status: 'Selesai' | 'Mengunduh';
}

export interface SiteStorageItem {
  origin: string;
  cookies: number;
  cacheMb: number;
  indexedDbMb: number;
}

export type SearchEngineId =
  | 'google'
  | 'brave'
  | 'duckduckgo'
  | 'bing'
  | 'yandex'
  | 'custom';

export interface SearchEngineConfig {
  id: SearchEngineId;
  name: string;
  shortLabel: string;
  urlTemplate: string;
  description: string;
  domain: string;
}

export const DEFAULT_SEARCH_ENGINES: SearchEngineConfig[] = [
  {
    id: 'google',
    name: 'Google',
    shortLabel: 'G',
    urlTemplate: 'https://www.google.com/search?q=%s',
    description: 'Pencarian cepat dan hasil paling luas (Default)',
    domain: 'google.com',
  },
  {
    id: 'brave',
    name: 'Brave Search',
    shortLabel: 'Br',
    urlTemplate: 'https://search.brave.com/search?q=%s',
    description: 'Indeks independen, privat, tanpa pelacakan iklan',
    domain: 'search.brave.com',
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    shortLabel: 'DDG',
    urlTemplate: 'https://duckduckgo.com/?q=%s',
    description: 'Fokus privasi tanpa riwayat pencarian terpersonalisasi',
    domain: 'duckduckgo.com',
  },
  {
    id: 'bing',
    name: 'Bing',
    shortLabel: 'B',
    urlTemplate: 'https://www.bing.com/search?q=%s',
    description: 'Pencarian visual dan jawaban terstruktur Microsoft',
    domain: 'bing.com',
  },
  {
    id: 'yandex',
    name: 'Yandex',
    shortLabel: 'Ya',
    urlTemplate: 'https://yandex.com/search/?text=%s',
    description: 'Kuat untuk pencarian lintas wilayah & gambar',
    domain: 'yandex.com',
  },
  {
    id: 'custom',
    name: 'Kustom (Custom URL)',
    shortLabel: 'URL',
    urlTemplate: 'https://example.com/?q=%s',
    description: 'Gunakan template URL mesin pencari Anda sendiri (%s)',
    domain: 'custom',
  },
];

export function buildSearchUrl(engine: SearchEngineConfig, query: string): string {
  const encoded = encodeURIComponent(query.trim());
  const tpl = engine.urlTemplate.trim() || 'https://www.google.com/search?q=%s';
  if (tpl.includes('%s')) {
    return tpl.replace(/%s/g, encoded);
  }
  const separator = tpl.includes('?') ? (tpl.endsWith('?') || tpl.endsWith('&') ? '' : '&') : '?q=';
  return `${tpl}${separator}${encoded}`;
}

