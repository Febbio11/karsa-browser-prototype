import React, { useRef, useState } from 'react';
import {
  X,
  Gauge,
  KeyRound,
  Trash2,
  ShieldCheck,
  Fingerprint,
  Plus,
  Cpu,
  Users,
  FileDown,
  Upload,
  Download,
  Languages,
  Moon,
  Sliders,
  Code2,
  Terminal as TerminalIcon,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  EyeOff,
  Search,
  Bookmark,
  Database,
  Shield,
  ChevronRight,
  Clock,
  Monitor,
  Check,
  Globe,
  RotateCcw,
  ClipboardCheck,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import {
  BookmarkItem,
  BrowserProfile,
  DownloadItem,
  FpsLimit,
  HistoryItem,
  PermissionValue,
  RenderConfig,
  SearchEngineConfig,
  SearchEngineId,
  SitePermissions,
  SiteStorageItem,
  TRANSLATION_LANGUAGES,
  VaultCredential,
  VirtualResolution,
} from '../types/browser';
import { SearchEngineBadge } from './SearchEngineBadge';

export type ActiveSheetType =
  | null
  | 'menu'
  | 'searchEngine'
  | 'render'
  | 'security'
  | 'profiles'
  | 'bookmarks'
  | 'downloads'
  | 'history'
  | 'permissions'
  | 'storage'
  | 'translate';

interface BrowserSheetsProps {
  activeSheet: ActiveSheetType;
  currentOrigin: string;
  onClose: () => void;
  renderConfig: RenderConfig;
  savedSiteZoom: number;
  liveFps: number;
  totalRamMb: number;
  onUpdateRender: (patch: Partial<RenderConfig>) => void;
  onResetSiteZoom: () => void;
  onRunGcAndHibernate: () => void;
  credentials: VaultCredential[];
  externalPassManager: string;
  onChangeExternalPassManager: (name: string) => void;
  profiles: BrowserProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onCreateProfile: (name: string) => void;
  sitePermissions: SitePermissions;
  onUpdatePermission: (key: keyof SitePermissions, value: PermissionValue) => void;
  adBlockEnabled: boolean;
  adsBlockedCount: number;
  onToggleAdBlock: () => void;
  bookmarks: BookmarkItem[];
  currentTabTitle: string;
  currentTabUrl: string;
  isHomeTab: boolean;
  desktopMode: boolean;
  onToggleDesktopMode: () => void;
  onAddCurrentBookmark: () => void;
  onRemoveBookmark: (id: string) => void;
  history: HistoryItem[];
  downloads: DownloadItem[];
  siteStorage: SiteStorageItem[];
  onClearSiteStorage: (origin: string) => void;
  onNavigateBookmark: (url: string, title: string) => void;
  onOpenIncognitoTab: () => void;
  onToggleFindBar: () => void;
  onSavePagePdf: () => void;
  onExportSettingsJson: () => void;
  onImportSettingsJson: (rawJson: string) => void;
  devToolsOpen: boolean;
  terminalOpen: boolean;
  activeProfileBadge: string;
  onOpenDevTools: () => void;
  onOpenTerminal: () => void;
  onSwitchSheet: (sheet: ActiveSheetType) => void;
  onBackToMenu: () => void;
  onPinchZoomChange: (nextZoom: number) => void;
  searchEngines: SearchEngineConfig[];
  activeSearchEngineId: SearchEngineId;
  searchSuggestionsEnabled: boolean;
  onSelectSearchEngine: (id: SearchEngineId) => void;
  onUpdateCustomSearchEngine: (name: string, urlTemplate: string) => void;
  onToggleSearchSuggestions: () => void;
  clipboardAutoClear: boolean;
  onToggleClipboardAutoClear: () => void;
  biometricAppLock: boolean;
  onToggleBiometricAppLock: () => void;
  flagSecureEnabled: boolean;
  onToggleFlagSecure: () => void;
  savedSessionCount: number;
  onRestoreSavedSession: () => void;
  webViewOutdated: boolean;
  onToggleSimulateOutdatedWebView: () => void;
  onOpenPlayStoreWebViewUpdate: () => void;
}

const PERMISSION_LABELS: { key: keyof SitePermissions; label: string }[] = [
  { key: 'clipboard', label: 'Clipboard (Salin/Tempel)' },
  { key: 'notifications', label: 'Notifikasi' },
  { key: 'camera', label: 'Kamera' },
  { key: 'microphone', label: 'Mikrofon' },
  { key: 'location', label: 'Lokasi (GPS)' },
  { key: 'popups', label: 'Pop-up Internal' },
  { key: 'autoplay', label: 'Autoplay Audio / Video' },
];

const TogglePill: React.FC<{ checked: boolean }> = ({ checked }) => (
  <span
    aria-hidden="true"
    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
      checked ? 'bg-[#C86442] dark:bg-[#D97757]' : 'bg-[#D6D0C4] dark:bg-[#3C3933]'
    }`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
        checked ? 'translate-x-4.5' : 'translate-x-0.5'
      }`}
    />
  </span>
);

export const BrowserSheets: React.FC<BrowserSheetsProps> = ({
  activeSheet,
  currentOrigin,
  onClose,
  renderConfig,
  savedSiteZoom,
  liveFps,
  totalRamMb,
  onUpdateRender,
  onResetSiteZoom,
  onRunGcAndHibernate,
  credentials,
  externalPassManager,
  onChangeExternalPassManager,
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
  sitePermissions,
  onUpdatePermission,
  adBlockEnabled,
  adsBlockedCount,
  onToggleAdBlock,
  bookmarks,
  currentTabTitle,
  currentTabUrl,
  isHomeTab,
  desktopMode,
  onToggleDesktopMode,
  onAddCurrentBookmark,
  onRemoveBookmark,
  history,
  downloads,
  siteStorage,
  onClearSiteStorage,
  onNavigateBookmark,
  onOpenIncognitoTab,
  onToggleFindBar,
  onSavePagePdf,
  onExportSettingsJson,
  onImportSettingsJson,
  devToolsOpen,
  terminalOpen,
  activeProfileBadge,
  onOpenDevTools,
  onOpenTerminal,
  onSwitchSheet,
  onBackToMenu,
  onPinchZoomChange,
  searchEngines,
  activeSearchEngineId,
  searchSuggestionsEnabled,
  onSelectSearchEngine,
  onUpdateCustomSearchEngine,
  onToggleSearchSuggestions,
  clipboardAutoClear,
  onToggleClipboardAutoClear,
  biometricAppLock,
  onToggleBiometricAppLock,
  flagSecureEnabled,
  onToggleFlagSecure,
  savedSessionCount,
  onRestoreSavedSession,
  webViewOutdated,
  onToggleSimulateOutdatedWebView,
  onOpenPlayStoreWebViewUpdate,
}) => {
  const [profileInput, setProfileInput] = useState('');
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const customEngine = searchEngines.find((e) => e.id === 'custom');
  const [customNameDraft, setCustomNameDraft] = useState(
    customEngine && customEngine.name !== 'Kustom (Custom URL)' ? customEngine.name : ''
  );
  const [customUrlDraft, setCustomUrlDraft] = useState(
    customEngine?.urlTemplate || 'https://example.com/?q=%s'
  );
  const [customError, setCustomError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!activeSheet) return null;

  const isSubMenu = activeSheet !== 'menu';
  const activeSearchEngine =
    searchEngines.find((e) => e.id === activeSearchEngineId) || searchEngines[0];

  const sheetTitle: Record<Exclude<ActiveSheetType, null>, string> = {
    menu: 'Menu Browser',
    searchEngine: 'Mesin Pencari',
    render: 'Render & FPS',
    security: 'Passkey & Sandi',
    profiles: 'Multi-Profil & Sesi',
    bookmarks: 'Bookmark',
    downloads: 'Unduhan',
    history: 'Riwayat Penjelajahan',
    permissions: 'Izin Situs',
    storage: 'Kelola Cookie & Data',
    translate: 'Terjemahan Semua Bahasa',
  };

  const tr = renderConfig.translation;
  const detectedLangLabel =
    TRANSLATION_LANGUAGES.find((l) => l.code === tr.detectedLang)?.label || 'Inggris';
  const targetLangLabel =
    TRANSLATION_LANGUAGES.find((l) => l.code === tr.targetLang)?.label || 'Bahasa Indonesia';

  return (
    <div className="absolute inset-0 z-35 flex items-end justify-end p-2 sm:p-3">
      {/* Click-outside backdrop */}
      <div
        className="absolute inset-0 bg-black/25 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom-Right Vertical Dropdown Panel (~80% width on mobile, anchored cleanly above Bottom Bar) */}
      <aside
        role="dialog"
        aria-label={sheetTitle[activeSheet]}
        className="relative z-10 flex max-h-[calc(100%-8px)] w-[80%] max-w-[332px] flex-col overflow-hidden rounded-2xl border border-[#DFD9CE] bg-[#FAF8F4] text-[#1F1E1B] shadow-2xl dark:border-[#383530] dark:bg-[#22201D] dark:text-[#F2EFE9]"
      >
        {/* Dropdown Header: Back (←) on top-left for all sub-menus, Close (×) on top-right */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#E5E0D6] bg-[#F3EFE7] px-3 py-2.5 dark:border-[#32302B] dark:bg-[#1B1A18]">
          <div className="flex items-center gap-1.5 min-w-0">
            {isSubMenu && (
              <button
                type="button"
                onClick={onBackToMenu}
                title="Kembali ke menu titik tiga"
                aria-label="Kembali ke menu titik tiga"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#4A4741] transition-colors hover:bg-black/5 dark:text-[#D4CEC3] dark:hover:bg-white/10 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className={`flex items-center gap-2 min-w-0 ${!isSubMenu ? 'pl-1' : ''}`}>
              {activeSheet === 'menu' && <Sliders className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />}
              {activeSheet === 'searchEngine' && <Search className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />}
              {activeSheet === 'render' && <Gauge className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />}
              {activeSheet === 'security' && <KeyRound className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />}
              {activeSheet === 'profiles' && <Users className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />}
              {activeSheet === 'bookmarks' && <Bookmark className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />}
              {activeSheet === 'downloads' && <Download className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />}
              {activeSheet === 'history' && <Clock className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />}
              {activeSheet === 'permissions' && <Shield className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />}
              {activeSheet === 'storage' && <Database className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />}
              {activeSheet === 'translate' && <Languages className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />}
              <h3 className="font-editorial text-sm font-semibold truncate">
                {sheetTitle[activeSheet]}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Tutup menu"
            aria-label="Tutup menu"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6C675E] transition-colors hover:bg-black/5 dark:text-[#A6A198] dark:hover:bg-white/10 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Dropdown Body */}
        <div className="thin-scrollbar flex-1 overflow-y-auto text-xs">
          {/* =================================================================
              MAIN THREE-DOTS MENU: STANDARD 1-COLUMN VERTICAL LIST (Chrome/Brave style)
          ================================================================= */}
          {activeSheet === 'menu' && (
            <div className="divide-y divide-[#E7E2D8] dark:divide-[#302E29]">
              {/* PRIMARY TOP TOGGLE: MODE DESKTOP (Default = Mode Mobile) */}
              <div className="p-2.5">
                <button
                  type="button"
                  onClick={onToggleDesktopMode}
                  className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl border border-[#E5E0D6] bg-white px-3 py-2 text-left transition-colors hover:border-[#C86442]/50 dark:border-[#34322C] dark:bg-[#191816] dark:hover:border-[#D97757]/50 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Monitor className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <span className="min-w-0">
                      <span className="block font-semibold text-[#1F1E1B] truncate dark:text-[#F2EFE9]">
                        Mode Desktop
                      </span>
                      <span className="block text-[10px] text-[#7A746B] truncate dark:text-[#9D978E]">
                        {desktopMode
                          ? 'Aktif · UA Chrome Desktop + Wide Viewport'
                          : 'Nonaktif · Default Mode Mobile (UA Bersih)'}
                      </span>
                    </span>
                  </span>
                  <TogglePill checked={desktopMode} />
                </button>
              </div>

              {/* GROUP 1: KONTROL CEPAT (Zoom Halaman & Paksa Zoom) */}
              <div className="p-3 space-y-2">
                <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-[#7A746B] dark:text-[#9D978E]">
                  Kontrol Cepat
                </p>

                <div className="flex items-center justify-between gap-2 rounded-xl border border-[#E5E0D6] bg-white px-2.5 py-2 dark:border-[#34322C] dark:bg-[#191816]">
                  <span className="text-[11px] font-medium shrink-0">Zoom Halaman</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onPinchZoomChange(Math.max(50, renderConfig.manualZoom - 10))}
                      aria-label="Perkecil zoom"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-[#DDD7CB] bg-[#FAF8F4] hover:bg-[#EFECE6] cursor-pointer dark:border-[#3A3732] dark:bg-[#242320]"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={onResetSiteZoom}
                      className={`flex h-7 min-w-[68px] items-center justify-center rounded-md border px-1.5 font-mono text-[11px] font-semibold tabular-nums cursor-pointer ${
                        renderConfig.autoFitDesktop
                          ? 'border-[#C86442] bg-[#C86442]/12 text-[#964226] dark:border-[#D97757] dark:text-[#F2A68C]'
                          : 'border-[#DDD7CB] bg-[#FAF8F4] hover:bg-[#EFECE6] dark:border-[#3A3732] dark:bg-[#242320]'
                      }`}
                    >
                      {renderConfig.autoFitDesktop ? 'Fit 100%' : `${renderConfig.manualZoom}%`}
                    </button>
                    <button
                      type="button"
                      onClick={() => onPinchZoomChange(Math.min(200, renderConfig.manualZoom + 10))}
                      aria-label="Perbesar zoom"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-[#DDD7CB] bg-[#FAF8F4] hover:bg-[#EFECE6] cursor-pointer dark:border-[#3A3732] dark:bg-[#242320]"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onUpdateRender({ forceZoom: !renderConfig.forceZoom })}
                  className="flex min-h-[38px] w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="text-[11px] font-medium text-[#4A4741] dark:text-[#D4CEC3]">
                    Paksa Zoom (Force Zoom)
                  </span>
                  <TogglePill checked={renderConfig.forceZoom} />
                </button>
              </div>

              {/* GROUP 2: ALAT GAMING & DEVELOPER */}
              <div className="py-1.5">
                <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#7A746B] dark:text-[#9D978E]">
                  Alat Gaming & Developer
                </p>

                <button
                  type="button"
                  onClick={() => {
                    onOpenDevTools();
                    onClose();
                  }}
                  className="flex min-h-[42px] w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Code2 className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <span className="font-medium truncate">Mobile DevTools</span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    {devToolsOpen && (
                      <span className="font-mono text-[10px] text-[#2E7D4F] dark:text-[#86CFA0]">Aktif</span>
                    )}
                    <ChevronRight className="h-4 w-4 text-[#8E887E]" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenTerminal();
                    onClose();
                  }}
                  className="flex min-h-[42px] w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <TerminalIcon className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <span className="font-medium truncate">Terminal & Proxy</span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    {terminalOpen && (
                      <span className="font-mono text-[10px] text-[#2E7D4F] dark:text-[#86CFA0]">Aktif</span>
                    )}
                    <ChevronRight className="h-4 w-4 text-[#8E887E]" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onSwitchSheet('render')}
                  className="flex min-h-[42px] w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Gauge className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <span className="font-medium truncate">Render & FPS</span>
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-[10px] text-[#7A746B] tabular-nums dark:text-[#9D978E]">
                      {liveFps} fps
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#8E887E]" />
                  </span>
                </button>
              </div>

              {/* GROUP 3: AKUN & PRIVASI */}
              <div className="py-1.5">
                <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#7A746B] dark:text-[#9D978E]">
                  Akun & Privasi
                </p>

                <button
                  type="button"
                  onClick={() => onSwitchSheet('profiles')}
                  className="flex min-h-[42px] w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Users className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <span className="font-medium truncate">Profil ({activeProfileBadge})</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#8E887E]" />
                </button>

                <button
                  type="button"
                  onClick={() => onSwitchSheet('security')}
                  className="flex min-h-[42px] w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <KeyRound className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <span className="font-medium truncate">Passkey & Sandi</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#8E887E]" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenIncognitoTab();
                    onClose();
                  }}
                  className="flex min-h-[42px] w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <EyeOff className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <span className="font-medium truncate">Tab Penyamaran Baru</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#8E887E]" />
                </button>
              </div>

              {/* GROUP 4: NAVIGASI & HALAMAN */}
              <div className="py-1.5">
                <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#7A746B] dark:text-[#9D978E]">
                  Navigasi & Halaman
                </p>

                <button
                  type="button"
                  onClick={() => onSwitchSheet('searchEngine')}
                  className="flex min-h-[42px] w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Search className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <span className="min-w-0">
                      <span className="block font-medium truncate">Mesin Pencari</span>
                      <span className="block text-[10px] text-[#7A746B] truncate dark:text-[#9D978E]">
                        Aktif: {activeSearchEngine.name}
                      </span>
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    <SearchEngineBadge engineId={activeSearchEngine.id} size="sm" />
                    <ChevronRight className="h-4 w-4 text-[#8E887E]" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onToggleFindBar();
                    onClose();
                  }}
                  className="flex min-h-[42px] w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Search className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <span className="font-medium truncate">Cari di Halaman</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#8E887E]" />
                </button>

                <button
                  type="button"
                  onClick={() => onSwitchSheet('bookmarks')}
                  className="flex min-h-[42px] w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Bookmark className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <span className="font-medium truncate">Bookmark</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#8E887E]" />
                </button>

                <button
                  type="button"
                  onClick={() => onSwitchSheet('downloads')}
                  className="flex min-h-[42px] w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Download className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <span className="font-medium truncate">Unduhan</span>
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-[10px] text-[#7A746B] tabular-nums">{downloads.length}</span>
                    <ChevronRight className="h-4 w-4 text-[#8E887E]" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onSwitchSheet('history')}
                  className="flex min-h-[42px] w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Clock className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <span className="font-medium truncate">Riwayat</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#8E887E]" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSavePagePdf();
                    onSwitchSheet('downloads');
                  }}
                  className="flex min-h-[42px] w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <FileDown className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <span className="font-medium truncate">Simpan Halaman (PDF / Offline)</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#8E887E]" />
                </button>
              </div>

              {/* GROUP 5: UTILITAS & IZIN */}
              <div className="py-1.5">
                <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#7A746B] dark:text-[#9D978E]">
                  Utilitas & Izin
                </p>

                <button
                  type="button"
                  onClick={() => onSwitchSheet('translate')}
                  className="flex min-h-[42px] w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Languages className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <span className="min-w-0 truncate">
                      <span className="block font-medium truncate">Terjemahkan Halaman</span>
                      <span className="block font-mono text-[10px] text-[#7A746B] truncate dark:text-[#9D978E]">
                        {tr.sourceLang === 'auto' ? 'Auto' : tr.sourceLang.toUpperCase()} →{' '}
                        {tr.targetLang.toUpperCase()}
                        {tr.enabled ? ' · Aktif' : ''}
                      </span>
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#8E887E]" />
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateRender({ forceDarkMode: !renderConfig.forceDarkMode })}
                  className="flex min-h-[42px] w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Moon className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <span className="font-medium truncate">Force Dark Mode</span>
                  </span>
                  <TogglePill checked={renderConfig.forceDarkMode} />
                </button>

                <button
                  type="button"
                  onClick={onToggleAdBlock}
                  className="flex min-h-[42px] w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <span className="min-w-0 truncate">
                      <span className="font-medium">Ad & Tracker Blocker</span>
                      <span className="ml-1.5 font-mono text-[10px] text-[#7A746B] tabular-nums">
                        ({adsBlockedCount})
                      </span>
                    </span>
                  </span>
                  <TogglePill checked={adBlockEnabled} />
                </button>

                <button
                  type="button"
                  onClick={() => onSwitchSheet('permissions')}
                  className="flex min-h-[42px] w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Shield className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <span className="font-medium truncate">Izin Situs</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#8E887E]" />
                </button>

                <button
                  type="button"
                  onClick={() => onSwitchSheet('storage')}
                  className="flex min-h-[42px] w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Database className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <span className="font-medium truncate">Kelola Cookie & Data</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#8E887E]" />
                </button>
              </div>

              {/* GROUP 6: CADANGAN PENGATURAN (JSON) */}
              <div className="py-1.5">
                <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#7A746B] dark:text-[#9D978E]">
                  Cadangan Pengaturan
                </p>

                <button
                  type="button"
                  onClick={onExportSettingsJson}
                  className="flex min-h-[40px] w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Download className="h-4 w-4 shrink-0 text-[#6C675E] dark:text-[#A6A198]" />
                    <span className="font-medium truncate">Ekspor Pengaturan (JSON)</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#8E887E]" />
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-[40px] w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Upload className="h-4 w-4 shrink-0 text-[#6C675E] dark:text-[#A6A198]" />
                    <span className="font-medium truncate">Impor Pengaturan (JSON)</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#8E887E]" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === 'string') {
                        onImportSettingsJson(reader.result);
                      }
                    };
                    reader.readAsText(file);
                    e.target.value = '';
                  }}
                />
              </div>
            </div>
          )}

          {/* =================================================================
              SUB-MENU 0: MESIN PENCARI (MULTI SEARCH ENGINE + CUSTOM URL)
          ================================================================= */}
          {activeSheet === 'searchEngine' && (
            <div className="p-3.5 space-y-3.5">
              <p className="text-[11px] leading-relaxed text-[#5C5953] dark:text-[#A6A198]">
                Pilih mesin pencari bawaan untuk kolom alamat. Anda juga dapat mengetuk ikon mesin pencari di sisi kiri kolom saat mengetik untuk berganti cepat.
              </p>

              <div className="space-y-1.5">
                {searchEngines.map((engine) => {
                  const selected = engine.id === activeSearchEngineId;
                  return (
                    <button
                      key={engine.id}
                      type="button"
                      onClick={() => {
                        onSelectSearchEngine(engine.id);
                        setCustomError(null);
                      }}
                      className={`flex w-full items-start justify-between gap-2.5 rounded-xl border p-2.5 text-left transition-colors cursor-pointer ${
                        selected
                          ? 'border-[#C86442] bg-[#C86442]/[0.08] dark:border-[#D97757] dark:bg-[#D97757]/12'
                          : 'border-[#E2DCD0] bg-white hover:bg-[#F5F2EC] dark:border-[#34322C] dark:bg-[#191816] dark:hover:bg-[#252320]'
                      }`}
                    >
                      <span className="flex items-start gap-2.5 min-w-0">
                        <SearchEngineBadge engineId={engine.id} size="md" />
                        <span className="min-w-0">
                          <span className="block text-xs font-semibold text-[#1F1E1B] truncate dark:text-[#F2EFE9]">
                            {engine.name}
                          </span>
                          <span className="block text-[10px] text-[#6C675E] leading-snug dark:text-[#9D978E]">
                            {engine.description}
                          </span>
                          <span className="mt-0.5 block font-mono text-[9.5px] text-[#8A8479] truncate dark:text-[#807A70]">
                            {engine.urlTemplate}
                          </span>
                        </span>
                      </span>

                      <span
                        className={`mt-1 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border ${
                          selected
                            ? 'border-[#C86442] bg-[#C86442] text-white dark:border-[#D97757] dark:bg-[#D97757] dark:text-[#181715]'
                            : 'border-[#CFC9BC] dark:border-[#49453E]'
                        }`}
                      >
                        {selected && <Check className="h-3 w-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Search Engine URL Template Editor */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const cleanTpl = customUrlDraft.trim();
                  if (!/^https?:\/\//i.test(cleanTpl)) {
                    setCustomError('Template URL harus diawali https:// atau http://');
                    return;
                  }
                  if (!cleanTpl.includes('%s')) {
                    setCustomError('Sertakan %s pada posisi kata kunci (misal: https://example.com/?q=%s)');
                    return;
                  }
                  setCustomError(null);
                  onUpdateCustomSearchEngine(
                    customNameDraft.trim() || 'Kustom (Custom URL)',
                    cleanTpl
                  );
                }}
                className="space-y-2 rounded-xl border border-[#DFD9CE] bg-white p-3 dark:border-[#34322C] dark:bg-[#191816]"
              >
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
                  <span className="text-[11px] font-semibold">Konfigurasi URL Kustom</span>
                </div>

                <input
                  type="text"
                  value={customNameDraft}
                  onChange={(e) => setCustomNameDraft(e.target.value)}
                  placeholder="Nama mesin (opsional, misal: Kagi / Startpage)"
                  className="w-full rounded-lg border border-[#DDD7CB] bg-[#FAF8F4] px-2.5 py-1.5 text-[11px] outline-none focus:border-[#C86442] dark:border-[#3A3732] dark:bg-[#22201D] dark:focus:border-[#D97757]"
                />

                <input
                  type="text"
                  value={customUrlDraft}
                  onChange={(e) => {
                    setCustomUrlDraft(e.target.value);
                    if (customError) setCustomError(null);
                  }}
                  placeholder="https://example.com/?q=%s"
                  className="w-full rounded-lg border border-[#DDD7CB] bg-[#FAF8F4] px-2.5 py-1.5 font-mono text-[11px] outline-none focus:border-[#C86442] dark:border-[#3A3732] dark:bg-[#22201D] dark:focus:border-[#D97757]"
                />

                <p className="text-[10px] text-[#7A746B] dark:text-[#9D978E]">
                  Gunakan <code className="rounded bg-black/5 px-1 py-0.5 font-mono dark:bg-white/10">%s</code> sebagai penanda posisi kata kunci pencarian.
                </p>

                {customError && (
                  <p className="text-[10px] font-medium text-[#B83B28] dark:text-[#F08C7B]">
                    {customError}
                  </p>
                )}

                <button
                  type="submit"
                  className="flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-lg bg-[#1F1E1B] px-3 text-[11px] font-semibold text-[#FAF8F4] transition-colors hover:bg-[#35332E] cursor-pointer dark:bg-[#D97757] dark:text-[#181715]"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Simpan &amp; Gunakan URL Kustom</span>
                </button>
              </form>

              {/* Smart Autocomplete Toggle */}
              <button
                type="button"
                onClick={onToggleSearchSuggestions}
                className="flex min-h-[42px] w-full items-center justify-between gap-3 rounded-xl border border-[#E5E0D6] bg-white px-3 py-2 text-left cursor-pointer dark:border-[#34322C] dark:bg-[#191816]"
              >
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold">
                    Saran Pencarian Otomatis
                  </span>
                  <span className="block text-[10px] text-[#7A746B] dark:text-[#9D978E]">
                    Autocomplete kata kunci, riwayat &amp; bookmark saat mengetik
                  </span>
                </span>
                <TogglePill checked={searchSuggestionsEnabled} />
              </button>
            </div>
          )}

          {/* =================================================================
              SUB-MENU 1: RENDER & FPS
          ================================================================= */}
          {activeSheet === 'render' && (
            <div className="p-3.5 space-y-3.5">
              {/* Live Metrics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-[#E5E0D6] bg-white p-2.5 dark:border-[#34322C] dark:bg-[#191816]">
                  <p className="text-[10px] text-[#7A746B]">FPS Aktif</p>
                  <p className="mt-0.5 font-mono text-base font-semibold tabular-nums">{liveFps} fps</p>
                </div>
                <div className="rounded-xl border border-[#E5E0D6] bg-white p-2.5 dark:border-[#34322C] dark:bg-[#191816]">
                  <p className="text-[10px] text-[#7A746B]">Estimasi RAM</p>
                  <p className="mt-0.5 font-mono text-base font-semibold tabular-nums">{totalRamMb} MB</p>
                </div>
              </div>

              {/* Render Scale / DPR */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Skala Resolusi Render (DPR)</span>
                  <span className="font-mono text-[#8E3C21] tabular-nums dark:text-[#E59377]">
                    {renderConfig.renderScale.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={1.5}
                  step={0.05}
                  value={renderConfig.renderScale}
                  onChange={(e) => onUpdateRender({ renderScale: Number(e.target.value) })}
                  className="w-full accent-[#C86442]"
                />
              </div>

              {/* FPS Cap */}
              <div className="space-y-1.5">
                <span className="font-medium">Batas Frame Rate (FPS Cap)</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {([30, 45, 60, 'unlimited'] as FpsLimit[]).map((cap) => (
                    <button
                      key={String(cap)}
                      type="button"
                      onClick={() => onUpdateRender({ fpsLimit: cap })}
                      className={`min-h-[34px] rounded-md border px-1.5 font-mono text-[11px] transition-colors cursor-pointer ${
                        renderConfig.fpsLimit === cap
                          ? 'border-[#C86442] bg-[#C86442]/12 font-semibold text-[#964226] dark:border-[#D97757] dark:text-[#F2A68C]'
                          : 'border-[#DFD9CE] bg-white text-[#5C5953] dark:border-[#383530] dark:bg-[#191816] dark:text-[#A6A198]'
                      }`}
                    >
                      {cap === 'unlimited' ? 'Max' : `${cap}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Virtual Desktop Resolution */}
              <div className="space-y-1.5">
                <span className="font-medium">Resolusi Desktop Virtual</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['1280x720', '1600x900', '1920x1080'] as VirtualResolution[]).map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => onUpdateRender({ virtualResolution: res })}
                      className={`min-h-[34px] rounded-md border px-1 font-mono text-[10px] transition-colors cursor-pointer ${
                        renderConfig.virtualResolution === res
                          ? 'border-[#C86442] bg-[#C86442]/12 font-semibold text-[#964226] dark:border-[#D97757] dark:text-[#F2A68C]'
                          : 'border-[#DFD9CE] bg-white text-[#5C5953] dark:border-[#383530] dark:bg-[#191816] dark:text-[#A6A198]'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              {/* Smart Zoom */}
              <div className="space-y-2 border-t border-[#E7E2D8] pt-3 dark:border-[#312F2A]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Zoom Pintar Situs</span>
                  <button
                    type="button"
                    onClick={onResetSiteZoom}
                    className="text-[11px] text-[#C86442] hover:underline cursor-pointer dark:text-[#E59377]"
                  >
                    Reset ({savedSiteZoom}%)
                  </button>
                </div>
                <label className="flex items-center justify-between gap-2 cursor-pointer">
                  <span>Auto-Fit Desktop (Anti-Terpotong)</span>
                  <input
                    type="checkbox"
                    checked={renderConfig.autoFitDesktop}
                    onChange={(e) => onUpdateRender({ autoFitDesktop: e.target.checked })}
                    className="h-4 w-4 accent-[#C86442]"
                  />
                </label>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Zoom Manual</span>
                    <span className="font-mono tabular-nums">{renderConfig.manualZoom}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={200}
                    step={5}
                    value={renderConfig.manualZoom}
                    onChange={(e) =>
                      onUpdateRender({
                        autoFitDesktop: false,
                        manualZoom: Number(e.target.value),
                      })
                    }
                    className="w-full accent-[#C86442]"
                  />
                </div>
              </div>

              {/* Anti-Refresh & Graphics */}
              <div className="space-y-2 border-t border-[#E7E2D8] pt-3 dark:border-[#312F2A]">
                <label className="flex items-center justify-between gap-2 cursor-pointer">
                  <span>Matikan Pull-to-Refresh (Global)</span>
                  <input
                    type="checkbox"
                    checked={renderConfig.disablePullToRefreshGlobal}
                    onChange={(e) => onUpdateRender({ disablePullToRefreshGlobal: e.target.checked })}
                    className="h-4 w-4 accent-[#C86442]"
                  />
                </label>
                <label className="flex items-center justify-between gap-2 cursor-pointer">
                  <span>Kunci Anti-Refresh Situs Ini</span>
                  <input
                    type="checkbox"
                    checked={renderConfig.disablePullToRefreshPerSite}
                    onChange={(e) => onUpdateRender({ disablePullToRefreshPerSite: e.target.checked })}
                    className="h-4 w-4 accent-[#C86442]"
                  />
                </label>
                <label className="flex items-center justify-between gap-2 cursor-pointer">
                  <span>Mode Hemat Grafis (Stabilkan FPS)</span>
                  <input
                    type="checkbox"
                    checked={renderConfig.graphicsSaver}
                    onChange={(e) => onUpdateRender({ graphicsSaver: e.target.checked })}
                    className="h-4 w-4 accent-[#C86442]"
                  />
                </label>
                <label className="flex items-center justify-between gap-2 cursor-pointer">
                  <span>Pointer Mouse Virtual</span>
                  <input
                    type="checkbox"
                    checked={renderConfig.virtualMouse}
                    onChange={(e) => onUpdateRender({ virtualMouse: e.target.checked })}
                    className="h-4 w-4 accent-[#C86442]"
                  />
                </label>
              </div>

              {/* Hibernasi Tab Otomatis & Pemulihan Sesi (Anti-Crash) */}
              <div className="space-y-2 border-t border-[#E7E2D8] pt-3 dark:border-[#312F2A]">
                <p className="text-[11px] font-semibold">Stabilitas RAM &amp; Pemulihan Sesi</p>

                <button
                  type="button"
                  onClick={() =>
                    onUpdateRender({ autoTabHibernation: !renderConfig.autoTabHibernation })
                  }
                  className="flex min-h-[42px] w-full items-center justify-between gap-2.5 rounded-xl border border-[#E5E0D6] bg-white px-3 py-2 text-left cursor-pointer dark:border-[#34322C] dark:bg-[#191816]"
                >
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold">
                      Hibernasi Tab Latar Belakang
                    </span>
                    <span className="block text-[10px] text-[#7A746B] dark:text-[#9D978E]">
                      Bekukan tab tidak aktif otomatis agar RAM HP tetap ringan
                    </span>
                  </span>
                  <TogglePill checked={renderConfig.autoTabHibernation} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onUpdateRender({ autoSessionRestore: !renderConfig.autoSessionRestore })
                  }
                  className="flex min-h-[42px] w-full items-center justify-between gap-2.5 rounded-xl border border-[#E5E0D6] bg-white px-3 py-2 text-left cursor-pointer dark:border-[#34322C] dark:bg-[#191816]"
                >
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold">
                      Pemulihan Sesi Otomatis
                    </span>
                    <span className="block text-[10px] text-[#7A746B] dark:text-[#9D978E]">
                      Simpan snapshot {savedSessionCount} tab lokal (anti-hilang saat HP kehabisan RAM)
                    </span>
                  </span>
                  <TogglePill checked={renderConfig.autoSessionRestore} />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={onRunGcAndHibernate}
                  className="flex min-h-[38px] w-full items-center justify-center gap-2 rounded-lg border border-[#D8D2C5] bg-white px-3 py-2 text-xs font-medium hover:bg-[#EFECE6] cursor-pointer dark:border-[#3D3A34] dark:bg-[#191816] dark:hover:bg-[#2B2925]"
                >
                  <Cpu className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
                  <span>Bersihkan RAM (GC) &amp; Hibernasi Tab</span>
                </button>

                <button
                  type="button"
                  onClick={onRestoreSavedSession}
                  className="flex min-h-[38px] w-full items-center justify-center gap-2 rounded-lg border border-[#D8D2C5] bg-white px-3 py-2 text-xs font-medium hover:bg-[#EFECE6] cursor-pointer dark:border-[#3D3A34] dark:bg-[#191816] dark:hover:bg-[#2B2925]"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-[#2E7D4F] dark:text-[#86CFA0]" />
                  <span>Uji Pemulihan Sesi Terakhir ({savedSessionCount} tab)</span>
                </button>
              </div>
            </div>
          )}

          {/* =================================================================
              SUB-MENU 2: MULTI-PROFIL & SESI
          ================================================================= */}
          {activeSheet === 'profiles' && (
            <div className="p-3.5 space-y-3">
              <p className="text-[11px] leading-relaxed text-[#5C5953] dark:text-[#A6A198]">
                Setiap profil kontainer memiliki Cookie, Cache, Wallet, dan Proxy yang 100% terisolasi.
              </p>

              <div className="space-y-2">
                {profiles.map((prof) => {
                  const active = prof.id === activeProfileId;
                  return (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => onSelectProfile(prof.id)}
                      className={`block w-full rounded-xl border p-2.5 text-left transition-colors cursor-pointer ${
                        active
                          ? 'border-[#C86442] bg-[#C86442]/10 dark:border-[#D97757]'
                          : 'border-[#E0DAD0] bg-white hover:bg-[#F5F2EC] dark:border-[#36332D] dark:bg-[#191816] dark:hover:bg-[#272521]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#1F1E1B] truncate dark:text-[#F2EFE9]">
                          {prof.name}
                        </span>
                        <span className="font-mono text-[10px] text-[#8E3C21] shrink-0 dark:text-[#E59377]">
                          {active ? 'Aktif' : prof.badge}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-[10px] text-[#5C5953] truncate dark:text-[#A6A198]">
                        {prof.walletLabel || 'Wallet kosong'} · {prof.proxySummary}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#7A746B] tabular-nums">
                        {prof.cookieCount} cookie · {prof.activeExtensions} ekstensi
                      </p>
                    </button>
                  );
                })}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!profileInput.trim()) return;
                  onCreateProfile(profileInput.trim());
                  setProfileInput('');
                }}
                className="space-y-2 border-t border-[#E7E2D8] pt-3 dark:border-[#312F2A]"
              >
                <p className="font-medium">Buat Kontainer Profil Baru</p>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={profileInput}
                    onChange={(e) => setProfileInput(e.target.value)}
                    placeholder="Contoh: Alt Guild #3"
                    className="flex-1 min-w-0 rounded-lg border border-[#DDD7CB] bg-white px-2.5 py-2 text-xs outline-none focus:border-[#C86442] dark:border-[#3A3732] dark:bg-[#181715]"
                  />
                  <button
                    type="submit"
                    className="flex min-h-[38px] shrink-0 items-center gap-1 rounded-lg bg-[#1F1E1B] px-3 text-xs font-medium text-white hover:bg-[#36342F] cursor-pointer dark:bg-[#D97757] dark:text-[#191816]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Buat</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =================================================================
              SUB-MENU 3: PASSKEY & SANDI
          ================================================================= */}
          {activeSheet === 'security' && (
            <div className="p-3.5 space-y-3.5">
              {/* Compact Production Security, Play Protect & OWASP MASVS Summary */}
              <div className="rounded-xl border border-[#2E7D4F]/25 bg-[#2E7D4F]/[0.06] p-3 space-y-2 dark:border-[#86CFA0]/25 dark:bg-[#86CFA0]/[0.08]">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#21633D] dark:text-[#86CFA0]">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>OWASP MASVS &amp; Play Protect</span>
                  </span>
                  <span className="font-mono text-[9.5px] font-semibold text-[#256640] dark:text-[#86CFA0]">
                    Aktif
                  </span>
                </div>
                <ul className="space-y-1.5 text-[10.5px] text-[#3E3B35] dark:text-[#D4CEC3]">
                  <li className="flex items-center justify-between gap-2">
                    <span>HTTPS Strict &amp; SSL Lockdown</span>
                    <span className="font-mono text-[10px] text-[#256640] dark:text-[#86CFA0]">Aktif</span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span>Validasi URI Ketat (SafeUriValidator)</span>
                    <span className="font-mono text-[10px] text-[#256640] dark:text-[#86CFA0]">Aktif</span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span>Jembatan Native (Per-Session Nonce)</span>
                    <span className="font-mono text-[10px] text-[#256640] dark:text-[#86CFA0]">Terkunci</span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span>Android Keystore Enkripsi Lokal</span>
                    <span className="font-mono text-[10px] text-[#256640] dark:text-[#86CFA0]">AES-256</span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span>R8 Log Stripping &amp; Baseline Profile</span>
                    <span className="font-mono text-[10px] text-[#256640] dark:text-[#86CFA0]">Release</span>
                  </li>
                </ul>
              </div>

              {/* Pemeriksa Kesehatan Engine WebView HP (WebViewHealthChecker) */}
              <div
                className={`rounded-xl border p-3 space-y-2 ${
                  webViewOutdated
                    ? 'border-[#D97706]/45 bg-[#FEF3C7]/70 dark:border-[#F59E0B]/40 dark:bg-[#F59E0B]/12'
                    : 'border-[#E5E0D6] bg-white dark:border-[#34322C] dark:bg-[#191816]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold">
                      {webViewOutdated ? (
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#B45309] dark:text-[#FCD34D]" />
                      ) : (
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#2E7D4F] dark:text-[#86CFA0]" />
                      )}
                      <span>Kesehatan Engine WebView HP</span>
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-[#6C675E] dark:text-[#9D978E]">
                      Android System WebView ·{' '}
                      <span
                        className={
                          webViewOutdated
                            ? 'font-semibold text-[#B45309] dark:text-[#FCD34D]'
                            : 'font-semibold text-[#256640] dark:text-[#86CFA0]'
                        }
                      >
                        {webViewOutdated ? '114.0.5735.196 (Usang)' : '131.0.6778.135 (Mutakhir)'}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleSimulateOutdatedWebView}
                    className="shrink-0 rounded-md border border-[#D8D2C5] bg-white/80 px-2 py-1 text-[9.5px] font-medium text-[#5C5953] hover:bg-[#EFECE6] cursor-pointer dark:border-[#3D3A34] dark:bg-[#242320] dark:text-[#C5C0B6]"
                  >
                    {webViewOutdated ? 'Set Mutakhir' : 'Simulasi Usang'}
                  </button>
                </div>

                {webViewOutdated ? (
                  <div className="space-y-2">
                    <p className="text-[10.5px] leading-snug text-[#92400E] dark:text-[#FDE68A]">
                      Engine WebView perangkat tertinggal dari batas aman (minimal v126). Perbarui lewat Google Play Store agar patch keamanan Chromium terbaru aktif.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenPlayStoreWebViewUpdate();
                      }}
                      className="flex min-h-[34px] w-full items-center justify-center gap-1.5 rounded-lg bg-[#B45309] px-3 text-[11px] font-semibold text-white transition-colors hover:bg-[#92400E] cursor-pointer dark:bg-[#F59E0B] dark:text-[#1C1917]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Perbarui WebView di Play Store</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-[10.5px] leading-snug text-[#6C675E] dark:text-[#9D978E]">
                    Versi engine mutakhir dan telah menerima patch keamanan Chromium terbaru.
                  </p>
                )}
              </div>

              {/* Kunci Biometrik / PIN & FLAG_SECURE Privasi Layar */}
              <div className="space-y-2 border-t border-[#E7E2D8] pt-3 dark:border-[#312F2A]">
                <p className="font-semibold">Kunci Biometrik &amp; Privasi Layar</p>

                <button
                  type="button"
                  onClick={onToggleBiometricAppLock}
                  className="flex min-h-[44px] w-full items-center justify-between gap-2.5 rounded-xl border border-[#E5E0D6] bg-white px-3 py-2 text-left cursor-pointer dark:border-[#34322C] dark:bg-[#191816]"
                >
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold">
                      Kunci Biometrik / PIN
                    </span>
                    <span className="block text-[10px] text-[#6C675E] dark:text-[#9D978E]">
                      Minta sidik jari / PIN saat membuka Passkey &amp; Sandi atau Karsa Browser
                    </span>
                  </span>
                  <TogglePill checked={biometricAppLock} />
                </button>

                <button
                  type="button"
                  onClick={onToggleFlagSecure}
                  className="flex min-h-[44px] w-full items-center justify-between gap-2.5 rounded-xl border border-[#E5E0D6] bg-white px-3 py-2 text-left cursor-pointer dark:border-[#34322C] dark:bg-[#191816]"
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                      <span>Mode Privasi Layar</span>
                      <span className="rounded bg-[#2E7D4F]/12 px-1 py-0.5 font-mono text-[9px] text-[#256640] dark:bg-[#86CFA0]/15 dark:text-[#86CFA0]">
                        FLAG_SECURE
                      </span>
                    </span>
                    <span className="block text-[10px] text-[#6C675E] dark:text-[#9D978E]">
                      Aktif otomatis di tab Penyamaran &amp; Passkey/Sandi (blokir screenshot &amp; Recent Apps)
                    </span>
                  </span>
                  <TogglePill checked={flagSecureEnabled} />
                </button>
              </div>

              <div className="space-y-2 border-t border-[#E7E2D8] pt-3 dark:border-[#312F2A]">
                <p className="font-semibold">Pengelola Sandi &amp; Passkey (FIDO2)</p>
                <p className="text-[11px] text-[#5C5953] dark:text-[#A6A198]">
                  Terintegrasi Android Credential Manager &amp; kunci perangkat keras TEE/StrongBox.
                </p>
                <div className="space-y-1.5 pt-1">
                  {['Karsa Vault (Terenkripsi)', 'Bitwarden', '1Password', 'Proton Pass'].map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => onChangeExternalPassManager(pm)}
                      className={`flex min-h-[36px] w-full items-center justify-between rounded-lg border px-3 text-[11px] text-left transition-colors cursor-pointer ${
                        externalPassManager === pm
                          ? 'border-[#C86442] bg-[#C86442]/10 font-semibold text-[#964226] dark:border-[#D97757] dark:text-[#F2A68C]'
                          : 'border-[#DFD9CE] bg-white text-[#4E4A44] dark:border-[#393630] dark:bg-[#191816] dark:text-[#C5C0B6]'
                      }`}
                    >
                      <span>{pm}</span>
                      {externalPassManager === pm && <span className="font-mono text-[10px]">Aktif</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t border-[#E7E2D8] pt-3 dark:border-[#312F2A]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Brankas Kredensial ({credentials.length})</span>
                  <button
                    type="button"
                    onClick={() => setVaultUnlocked((v) => !v)}
                    className="flex min-h-[32px] items-center gap-1 rounded-md border border-[#D8D2C5] bg-white px-2.5 text-[11px] font-medium hover:bg-[#EFECE6] cursor-pointer dark:border-[#3D3A34] dark:bg-[#191816]"
                  >
                    <Fingerprint className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
                    <span>{vaultUnlocked ? 'Kunci' : 'Buka Biometrik'}</span>
                  </button>
                </div>

                {!vaultUnlocked ? (
                  <p className="text-[11px] text-[#6C675E] dark:text-[#A6A198]">
                    Terkunci dengan Android BiometricPrompt &amp; EncryptedSharedPreferences. Ketuk <strong>Buka Biometrik</strong> untuk memeriksa brankas.
                  </p>
                ) : credentials.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#D8D2C5] bg-white/70 px-3 py-4 text-center text-[11px] text-[#6C675E] dark:border-[#383530] dark:bg-[#191816] dark:text-[#9D978E]">
                    Brankas terenkripsi bersih (0 kredensial tersimpan). Sandi situs &amp; proxy yang Anda simpan akan dienkripsi lokal via Android Keystore.
                  </div>
                ) : (
                  <div className="divide-y divide-[#EAE5DC] rounded-xl border border-[#E5E0D6] bg-white px-3 dark:divide-[#2F2D28] dark:border-[#34322C] dark:bg-[#191816]">
                    {credentials.map((cred) => (
                      <div key={cred.id} className="py-2 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{cred.site}</p>
                          <p className="font-mono text-[10px] text-[#6C675E] truncate dark:text-[#9D978E]">
                            {cred.username} · {cred.type}
                          </p>
                        </div>
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#2E7D4F] dark:text-[#86CFA0]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================
              SUB-MENU 4: BOOKMARK
          ================================================================= */}
          {activeSheet === 'bookmarks' && (
            <div className="p-3.5 space-y-3">
              {!isHomeTab && (
                <button
                  type="button"
                  onClick={onAddCurrentBookmark}
                  className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl border border-[#C86442]/40 bg-[#C86442]/10 px-3 py-2 text-xs font-semibold text-[#964226] transition-colors hover:bg-[#C86442]/15 cursor-pointer dark:border-[#D97757]/40 dark:bg-[#D97757]/15 dark:text-[#F0A48A]"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {bookmarks.some((b) => b.url === currentTabUrl)
                      ? `Tersimpan: ${currentTabTitle}`
                      : `Tambah Bookmark (${currentTabTitle})`}
                  </span>
                </button>
              )}

              {bookmarks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D8D2C5] bg-white/70 px-4 py-6 text-center space-y-1.5 dark:border-[#383530] dark:bg-[#191816]">
                  <Bookmark className="mx-auto h-5 w-5 text-[#8E887E]" />
                  <p className="font-medium text-[#1F1E1B] dark:text-[#F2EFE9]">Belum ada bookmark</p>
                  <p className="text-[11px] text-[#6C675E] dark:text-[#9D978E]">
                    Buka sebuah situs lalu ketuk ikon Bookmark di bilah bawah untuk menyimpannya.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#EAE5DC] dark:divide-[#2F2D28]">
                  {bookmarks.map((bm) => (
                    <div key={bm.id} className="flex items-center justify-between gap-2 py-2.5 first:pt-0">
                      <button
                        type="button"
                        onClick={() => {
                          onNavigateBookmark(bm.url, bm.title);
                          onClose();
                        }}
                        className="min-w-0 flex-1 text-left hover:text-[#C86442] cursor-pointer"
                      >
                        <p className="font-medium truncate">{bm.title}</p>
                        <p className="font-mono text-[10px] text-[#7A746B] truncate">
                          {bm.url}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveBookmark(bm.id)}
                        aria-label={`Hapus bookmark ${bm.title}`}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#7A746B] hover:bg-black/5 hover:text-[#964226] cursor-pointer dark:hover:bg-white/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              SUB-MENU 5: UNDUHAN
          ================================================================= */}
          {activeSheet === 'downloads' && (
            <div className="p-3.5">
              {downloads.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D8D2C5] bg-white/70 px-4 py-6 text-center space-y-1.5 dark:border-[#383530] dark:bg-[#191816]">
                  <Download className="mx-auto h-5 w-5 text-[#8E887E]" />
                  <p className="font-medium text-[#1F1E1B] dark:text-[#F2EFE9]">Belum ada unduhan</p>
                  <p className="text-[11px] text-[#6C675E] dark:text-[#9D978E]">
                    File atau halaman PDF yang Anda unduh akan muncul di sini.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#EAE5DC] dark:divide-[#2F2D28]">
                  {downloads.map((dl) => (
                    <div key={dl.id} className="py-2.5 first:pt-0 space-y-1.5">
                      <div className="flex justify-between gap-2">
                        <span className="font-mono text-[11px] font-medium truncate">{dl.filename}</span>
                        <span className="shrink-0 text-[10px] text-[#7A746B]">{dl.size}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E0D6] dark:bg-[#32302B]">
                        <div
                          style={{ width: `${dl.progress}%` }}
                          className="h-full bg-[#C86442] dark:bg-[#D97757]"
                        />
                      </div>
                      <p className="text-[10px] text-[#2E7D4F] dark:text-[#86CFA0]">{dl.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              SUB-MENU 6: RIWAYAT
          ================================================================= */}
          {activeSheet === 'history' && (
            <div className="p-3.5">
              {history.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D8D2C5] bg-white/70 px-4 py-6 text-center space-y-1.5 dark:border-[#383530] dark:bg-[#191816]">
                  <Clock className="mx-auto h-5 w-5 text-[#8E887E]" />
                  <p className="font-medium text-[#1F1E1B] dark:text-[#F2EFE9]">Riwayat masih kosong</p>
                  <p className="text-[11px] text-[#6C675E] dark:text-[#9D978E]">
                    Situs yang Anda kunjungi akan tercatat otomatis di sini.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#EAE5DC] dark:divide-[#2F2D28]">
                  {history.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => {
                        onNavigateBookmark(h.url, h.title);
                        onClose();
                      }}
                      className="flex w-full items-center justify-between gap-2 py-2.5 first:pt-0 text-left hover:text-[#C86442] cursor-pointer"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{h.title}</p>
                        <p className="font-mono text-[10px] text-[#7A746B] truncate">{h.url}</p>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] text-[#7A746B]">{h.visitedAt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              SUB-MENU 7: IZIN SITUS
          ================================================================= */}
          {activeSheet === 'permissions' && (
            <div className="p-3.5 space-y-3">
              <p className="font-mono text-[11px] text-[#6C675E] truncate dark:text-[#9D978E]">
                Domain: {currentOrigin}
              </p>

              {/* Proteksi Clipboard (Anti-Clipboard Hijacking) */}
              <div className="rounded-xl border border-[#E5E0D6] bg-white p-2.5 space-y-2 dark:border-[#34322C] dark:bg-[#191816]">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <ClipboardCheck className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
                    <span>Proteksi Clipboard (Anti-Hijacking)</span>
                  </span>
                  <span
                    className={`font-mono text-[9.5px] font-semibold ${
                      sitePermissions.clipboard === 'block'
                        ? 'text-[#256640] dark:text-[#86CFA0]'
                        : 'text-[#964226] dark:text-[#E59377]'
                    }`}
                  >
                    {sitePermissions.clipboard === 'block'
                      ? 'Blokir Auto'
                      : sitePermissions.clipboard === 'ask'
                      ? 'Tanya'
                      : 'Izinkan'}
                  </span>
                </div>
                <p className="text-[10px] leading-snug text-[#6C675E] dark:text-[#9D978E]">
                  Default memblokir baca papan klip otomatis tanpa izin eksplisit pengguna untuk melindungi alamat wallet &amp; kata sandi.
                </p>
                <button
                  type="button"
                  onClick={onToggleClipboardAutoClear}
                  className="flex min-h-[36px] w-full items-center justify-between gap-2 border-t border-[#EFECE6] pt-2 text-left cursor-pointer dark:border-[#2C2A25]"
                >
                  <span className="text-[11px] font-medium">
                    Auto-Clear Clipboard (30 dtk setelah salin sandi)
                  </span>
                  <TogglePill checked={clipboardAutoClear} />
                </button>
              </div>

              <div className="divide-y divide-[#EAE5DC] dark:divide-[#2F2D28]">
                {PERMISSION_LABELS.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between gap-2 py-2.5">
                    <span className="font-medium text-[11px] truncate">{label}</span>
                    <div className="flex shrink-0 items-center rounded-md border border-[#DFD9CE] bg-white p-0.5 text-[10px] dark:border-[#3A3732] dark:bg-[#191816]">
                      {(
                        [
                          { val: 'allow', lbl: 'Izinkan' },
                          { val: 'ask', lbl: 'Tanya' },
                          { val: 'block', lbl: 'Blokir' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => onUpdatePermission(key, opt.val)}
                          className={`rounded px-1.5 py-1 transition-colors cursor-pointer ${
                            sitePermissions[key] === opt.val
                              ? 'bg-[#C86442] font-semibold text-white dark:bg-[#D97757] dark:text-[#181715]'
                              : 'text-[#6C675E] hover:text-[#1F1E1B] dark:text-[#9D978E]'
                          }`}
                        >
                          {opt.lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================
              SUB-MENU 8: KELOLA COOKIE & DATA
          ================================================================= */}
          {activeSheet === 'storage' && (
            <div className="divide-y divide-[#EAE5DC] p-3.5 dark:divide-[#2F2D28]">
              {siteStorage.map((site) => (
                <div key={site.origin} className="flex items-center justify-between gap-2 py-2.5 first:pt-0">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] font-medium truncate">{site.origin}</p>
                    <p className="text-[10px] text-[#7A746B] tabular-nums">
                      {site.cookies} cookie · Cache {site.cacheMb} MB · IDB {site.indexedDbMb} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onClearSiteStorage(site.origin)}
                    title="Hapus cookie & cache situs ini"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#8E3C21] hover:bg-[#C86442]/10 cursor-pointer dark:text-[#E59377]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {siteStorage.length === 0 && (
                <p className="py-3 text-center text-[11px] text-[#7A746B]">
                  Seluruh cookie dan cache situs sudah dibersihkan.
                </p>
              )}
            </div>
          )}

          {/* =================================================================
              SUB-MENU 9: TERJEMAHAN SEMUA BAHASA (Auto-Deteksi -> Bahasa Indonesia)
          ================================================================= */}
          {activeSheet === 'translate' && (
            <div className="p-3.5 space-y-3.5">
              {/* Current Page Translation Status Card */}
              <div className="rounded-xl border border-[#E5E0D6] bg-white p-3 space-y-1 dark:border-[#34322C] dark:bg-[#191816]">
                <p className="text-[11px] font-semibold">
                  {tr.enabled ? 'Terjemahan Halaman Aktif' : 'Menampilkan Bahasa Asli'}
                </p>
                <p className="text-[11px] text-[#5C5953] dark:text-[#A6A198]">
                  {tr.enabled
                    ? `${
                        tr.sourceLang === 'auto'
                          ? `Auto-Deteksi (${detectedLangLabel})`
                          : TRANSLATION_LANGUAGES.find((l) => l.code === tr.sourceLang)?.label
                      } → ${targetLangLabel}`
                    : `Terdeteksi otomatis: ${detectedLangLabel} · Siap diterjemahkan ke ${targetLangLabel}`}
                </p>
              </div>

              {/* Source Language Selector */}
              <div className="space-y-1.5">
                <label
                  htmlFor="karsa-source-lang"
                  className="block text-[11px] font-semibold text-[#4A4741] dark:text-[#D4CEC3]"
                >
                  Bahasa Sumber
                </label>
                <select
                  id="karsa-source-lang"
                  value={tr.sourceLang}
                  onChange={(e) =>
                    onUpdateRender({
                      translation: { ...tr, sourceLang: e.target.value },
                    })
                  }
                  className="w-full min-h-[38px] rounded-xl border border-[#DDD7CB] bg-white px-3 py-2 text-xs text-[#1F1E1B] outline-none focus:border-[#C86442] dark:border-[#3A3732] dark:bg-[#191816] dark:text-[#F2EFE9]"
                >
                  <option value="auto">Auto-Deteksi Bahasa (Terdeteksi: {detectedLangLabel})</option>
                  {TRANSLATION_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label} ({lang.native})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Language Selector */}
              <div className="space-y-1.5">
                <label
                  htmlFor="karsa-target-lang"
                  className="block text-[11px] font-semibold text-[#4A4741] dark:text-[#D4CEC3]"
                >
                  Bahasa Tujuan
                </label>
                <select
                  id="karsa-target-lang"
                  value={tr.targetLang}
                  onChange={(e) =>
                    onUpdateRender({
                      translation: { ...tr, targetLang: e.target.value, enabled: true },
                    })
                  }
                  className="w-full min-h-[38px] rounded-xl border border-[#DDD7CB] bg-white px-3 py-2 text-xs text-[#1F1E1B] outline-none focus:border-[#C86442] dark:border-[#3A3732] dark:bg-[#191816] dark:text-[#F2EFE9]"
                >
                  {TRANSLATION_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label} ({lang.native})
                    </option>
                  ))}
                </select>

                {/* Quick 1-Tap Popular Target Languages */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { code: 'id', name: 'Indonesia' },
                    { code: 'en', name: 'Inggris' },
                    { code: 'ja', name: 'Jepang' },
                    { code: 'zh', name: 'Mandarin' },
                    { code: 'ko', name: 'Korea' },
                    { code: 'ar', name: 'Arab' },
                  ].map((q) => (
                    <button
                      key={q.code}
                      type="button"
                      onClick={() =>
                        onUpdateRender({
                          translation: { ...tr, targetLang: q.code, enabled: true },
                        })
                      }
                      className={`rounded-lg border px-2 py-1 text-[10px] font-medium transition-colors cursor-pointer ${
                        tr.targetLang === q.code && tr.enabled
                          ? 'border-[#C86442] bg-[#C86442]/12 text-[#964226] dark:border-[#D97757] dark:text-[#F2A68C]'
                          : 'border-[#DFD9CE] bg-white text-[#5C5953] hover:bg-[#F3EFE7] dark:border-[#36342E] dark:bg-[#191816] dark:text-[#A6A198]'
                      }`}
                    >
                      {q.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Action: Terjemahkan Halaman Ini / Tampilkan Asli */}
              <div className="grid grid-cols-1 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateRender({
                      translation: { ...tr, enabled: !tr.enabled },
                    })
                  }
                  className={`flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold transition-colors cursor-pointer ${
                    tr.enabled
                      ? 'border border-[#DDD7CB] bg-white text-[#1F1E1B] hover:bg-[#EFECE6] dark:border-[#3A3732] dark:bg-[#191816] dark:text-[#F2EFE9]'
                      : 'bg-[#C86442] text-white hover:bg-[#B25435] dark:bg-[#D97757] dark:text-[#181715]'
                  }`}
                >
                  <Languages className="h-4 w-4" />
                  <span>{tr.enabled ? 'Tampilkan Asli' : 'Terjemahkan Halaman Ini'}</span>
                </button>
              </div>

              {/* Auto-Translate Foreign Pages Toggle */}
              <button
                type="button"
                onClick={() =>
                  onUpdateRender({
                    translation: {
                      ...tr,
                      autoTranslateForeign: !tr.autoTranslateForeign,
                    },
                  })
                }
                className="flex min-h-[42px] w-full items-center justify-between gap-3 rounded-xl border border-[#E5E0D6] bg-white px-3 py-2 text-left cursor-pointer dark:border-[#34322C] dark:bg-[#191816]"
              >
                <span className="text-[11px] font-medium leading-snug">
                  Otomatis terjemahkan halaman asing ke Bahasa Indonesia
                </span>
                <TogglePill checked={tr.autoTranslateForeign} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
