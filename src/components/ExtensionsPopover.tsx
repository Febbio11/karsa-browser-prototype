import React, { useRef, useState } from 'react';
import {
  Puzzle,
  Plus,
  Trash2,
  Store,
  FolderUp,
  FileArchive,
  Check,
  ShieldCheck,
  Wrench,
  Sparkles,
  Search,
} from 'lucide-react';
import { ChromeExtensionItem } from '../types/browser';

interface ExtensionsPopoverProps {
  open: boolean;
  extensions: ChromeExtensionItem[];
  onClose: () => void;
  onToggleExtension: (id: string) => void;
  onRemoveExtension: (id: string) => void;
  onInstallExtension: (ext: Omit<ChromeExtensionItem, 'id'>) => void;
}

interface StorePreset {
  storeId: string;
  name: string;
  version: string;
  category: ChromeExtensionItem['category'];
  ramMb: number;
  description: string;
  permissions: string[];
}

interface PendingSideload {
  filename: string;
  name: string;
  format: '.zip' | '.crx' | '.user.js';
  sizeLabel: string;
  manifestVersion: 3;
  version: string;
  entryScript: string;
  source: ChromeExtensionItem['source'];
  category: ChromeExtensionItem['category'];
  description: string;
  permissions: string[];
}

const STORE_PRESETS: StorePreset[] = [
  {
    storeId: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
    name: 'MetaMask',
    version: '12.6.1',
    category: 'Web3 Wallet',
    ramMb: 48,
    description: 'Dompet Ethereum & L2 standar dari Chrome Web Store.',
    permissions: ['activeTab', 'storage', 'EIP-6963'],
  },
  {
    storeId: 'acmacodkjbdgmoleebolmdjonilkdbch',
    name: 'Rabby Wallet',
    version: '0.92.84',
    category: 'Web3 Wallet',
    ramMb: 42,
    description: 'Dompet EVM multi-chain dengan simulasi transaksi pra-tanda tangan.',
    permissions: ['activeTab', 'storage', 'EIP-6963'],
  },
  {
    storeId: 'bfnaelmomeimhlpmgjnjophhpkkoljpa',
    name: 'Phantom Wallet',
    version: '24.18.0',
    category: 'Web3 Wallet',
    ramMb: 39,
    description: 'Dompet Solana & multichain untuk game Web3 berbasis browser.',
    permissions: ['activeTab', 'storage', 'EIP-6963'],
  },
  {
    storeId: 'cjpalhdlnbpafiamejdnhcphjbkeiagm',
    name: 'uBlock Origin',
    version: '1.61.2',
    category: 'Keamanan',
    ramMb: 16,
    description: 'Pemblokir iklan, pelacak & skrip berat berkinerja tinggi.',
    permissions: ['declarativeNetRequest', 'storage'],
  },
  {
    storeId: 'mcohilncbfahbmgdjkbpemcciiolgcge',
    name: 'OKX Wallet',
    version: '3.29.0',
    category: 'Web3 Wallet',
    ramMb: 44,
    description: 'Dompet Web3 multichain untuk EVM, Solana, TON & Bitcoin.',
    permissions: ['activeTab', 'storage', 'EIP-6963'],
  },
  {
    storeId: 'dmkamcknogkgcdfhhbddcghachkejeap',
    name: 'Keplr Wallet',
    version: '0.12.142',
    category: 'Web3 Wallet',
    ramMb: 36,
    description: 'Dompet ekosistem Cosmos & IBC untuk dApp dan game on-chain.',
    permissions: ['activeTab', 'storage'],
  },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function buildPendingFromFile(fileName: string, sizeBytes: number): PendingSideload {
  const lower = fileName.toLowerCase();
  const format: PendingSideload['format'] = lower.endsWith('.crx')
    ? '.crx'
    : lower.endsWith('.js')
    ? '.user.js'
    : '.zip';

  const cleanBase = fileName
    .replace(/\.(zip|crx|user\.js|js)$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim();

  const prettyName = cleanBase
    ? cleanBase.replace(/\b\w/g, (ch) => ch.toUpperCase())
    : 'Ekstensi Lokal Karsa';

  if (format === '.user.js') {
    return {
      filename: fileName,
      name: prettyName,
      format,
      sizeLabel: formatFileSize(sizeBytes),
      manifestVersion: 3,
      version: '1.0.0',
      entryScript: fileName,
      source: 'UserScript (.user.js)',
      category: 'Automasi',
      description: `UserScript lokal (${fileName}) dijalankan otomatis di isolated world.`,
      permissions: ['scripting', 'activeTab', 'storage'],
    };
  }

  return {
    filename: fileName,
    name: prettyName,
    format,
    sizeLabel: formatFileSize(sizeBytes),
    manifestVersion: 3,
    version: format === '.zip' ? '2.4.0' : '1.8.2',
    entryScript: 'background/service_worker.js',
    source: format === '.zip' ? 'File .zip Lokal' : 'File .crx Lokal',
    category: 'Automasi',
    description: `Ekstensi sideload (${format}) dimuat melalui Mode Pengembang Karsa.`,
    permissions: ['activeTab', 'storage', 'scripting', 'webRequest'],
  };
}

export const ExtensionsPopover: React.FC<ExtensionsPopoverProps> = ({
  open,
  extensions,
  onClose,
  onToggleExtension,
  onRemoveExtension,
  onInstallExtension,
}) => {
  const [view, setView] = useState<'installed' | 'install'>('installed');
  const [installTab, setInstallTab] = useState<'store' | 'local'>('store');
  const [storeQuery, setStoreQuery] = useState('');
  const [storeFeedback, setStoreFeedback] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(true);
  const [pendingSideload, setPendingSideload] = useState<PendingSideload | null>(null);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const activeCount = extensions.filter((e) => e.enabled).length;
  const totalExtRam = extensions.reduce((acc, e) => acc + (e.enabled ? e.ramMb : 0), 0);

  const showBanner = (msg: string) => {
    setBannerMsg(msg);
    window.setTimeout(() => {
      setBannerMsg((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  const isAlreadyInstalled = (name: string) =>
    extensions.some((ext) => ext.name.toLowerCase() === name.toLowerCase());

  const handleInstallPreset = (preset: StorePreset) => {
    if (isAlreadyInstalled(preset.name)) {
      showBanner(`${preset.name} sudah ada di daftar terinstal.`);
      return;
    }
    onInstallExtension({
      name: preset.name,
      version: preset.version,
      category: preset.category,
      description: preset.description,
      enabled: true,
      ramMb: preset.ramMb,
      source: 'Chrome Web Store',
      permissions: preset.permissions,
    });
    showBanner(`${preset.name} berhasil dipasang dari Chrome Web Store.`);
  };

  const handleStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = storeQuery.trim();
    if (!raw) {
      setStoreFeedback('Tempel URL/ID Chrome Web Store atau pilih preset populer di bawah.');
      return;
    }
    setStoreFeedback(null);

    const matchedPreset = STORE_PRESETS.find(
      (p) =>
        p.name.toLowerCase().includes(raw.toLowerCase()) ||
        p.storeId.toLowerCase() === raw.toLowerCase() ||
        raw.toLowerCase().includes(p.storeId.toLowerCase())
    );

    if (matchedPreset) {
      handleInstallPreset(matchedPreset);
      setStoreQuery('');
      return;
    }

    // Parse custom Chrome Web Store URL or extension ID/name
    let derivedName = raw;
    if (raw.includes('chromewebstore.google.com') || raw.includes('chrome.google.com')) {
      const segments = raw.split('/').filter(Boolean);
      const detailIdx = segments.findIndex((s) => s === 'detail');
      const slug = detailIdx >= 0 && segments[detailIdx + 1] ? segments[detailIdx + 1] : segments[segments.length - 1];
      derivedName = slug
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (ch) => ch.toUpperCase());
    }

    onInstallExtension({
      name: derivedName,
      version: '1.0.0',
      category: 'Produktivitas',
      description: `Dipasang dari Chrome Web Store (${raw.length > 28 ? `${raw.slice(0, 28)}…` : raw}).`,
      enabled: true,
      ramMb: 19,
      source: 'Chrome Web Store',
      permissions: ['activeTab', 'storage'],
    });
    setStoreQuery('');
    showBanner(`"${derivedName}" dipasang dari Chrome Web Store.`);
    setView('installed');
  };

  const handlePickLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingSideload(buildPendingFromFile(file.name, file.size || 245760));
    e.target.value = '';
  };

  const handleTrySampleZip = () => {
    if (!devMode) setDevMode(true);
    setPendingSideload(buildPendingFromFile('aether-auto-quest-v2.4.zip', 418200));
  };

  const handleConfirmSideload = () => {
    if (!pendingSideload) return;
    onInstallExtension({
      name: pendingSideload.name,
      version: pendingSideload.version,
      category: pendingSideload.category,
      description: pendingSideload.description,
      enabled: true,
      ramMb: pendingSideload.format === '.user.js' ? 8 : 22,
      source: pendingSideload.source,
      permissions: pendingSideload.permissions,
    });
    showBanner(`"${pendingSideload.name}" (${pendingSideload.format}) berhasil di-sideload.`);
    setPendingSideload(null);
    setView('installed');
  };

  const filteredPresets = storeQuery.trim()
    ? STORE_PRESETS.filter(
        (p) =>
          p.name.toLowerCase().includes(storeQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(storeQuery.toLowerCase()) ||
          p.storeId.toLowerCase().includes(storeQuery.toLowerCase())
      )
    : STORE_PRESETS;

  return (
    <div className="absolute inset-0 z-35 flex items-start justify-end p-2 sm:p-3">
      {/* Click-outside backdrop to close directly */}
      <div
        className="absolute inset-0 bg-black/25 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Pop-over Card anchored near top-right Extensions icon (no Back/Close header buttons) */}
      <div
        role="dialog"
        aria-label="Ekstensi Chrome"
        className="relative z-10 flex max-h-[calc(100%-6px)] w-full max-w-[365px] flex-col overflow-hidden rounded-2xl border border-[#DFD9CE] bg-[#FAF8F4] text-[#1F1E1B] shadow-2xl dark:border-[#383530] dark:bg-[#22201D] dark:text-[#F2EFE9]"
      >
        {/* Clean Pop-over Header (Toggle-only via top bar icon or tap outside; NO Back/Close buttons) */}
        <div className="flex items-center justify-between gap-2 border-b border-[#E5E0D6] bg-[#F3EFE7] px-3.5 py-2.5 dark:border-[#32302B] dark:bg-[#1B1A18]">
          <div className="flex items-center gap-2 min-w-0">
            <Puzzle className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
            <div className="min-w-0">
              <h3 className="font-editorial text-sm font-semibold leading-tight truncate">
                Ekstensi Chrome
              </h3>
              <p className="font-mono text-[10px] text-[#6C675E] tabular-nums dark:text-[#9D978E]">
                {activeCount}/{extensions.length} aktif · {totalExtRam} MB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setView((v) => (v === 'installed' ? 'install' : 'installed'));
              setStoreFeedback(null);
            }}
            className={`flex min-h-[34px] shrink-0 items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold transition-colors cursor-pointer ${
              view === 'install'
                ? 'border border-[#D8D2C5] bg-white text-[#1F1E1B] hover:bg-[#EFECE6] dark:border-[#3D3A34] dark:bg-[#2A2824] dark:text-[#F2EFE9]'
                : 'bg-[#1F1E1B] text-[#FAF8F4] hover:bg-[#35332E] dark:bg-[#D97757] dark:text-[#181715]'
            }`}
          >
            {view === 'install' ? (
              <span>Terinstal ({extensions.length})</span>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>Pasang</span>
              </>
            )}
          </button>
        </div>

        {/* Inline Confirmation Notice */}
        {bannerMsg && (
          <div className="flex items-center gap-1.5 border-b border-[#3A7D54]/25 bg-[#3A7D54]/10 px-3.5 py-2 text-[11px] font-medium text-[#215A38] dark:text-[#86CFA0]">
            <Check className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{bannerMsg}</span>
          </div>
        )}

        {/* VIEW 1: INSTALLED EXTENSIONS */}
        {view === 'installed' && (
          <div className="thin-scrollbar flex-1 overflow-y-auto p-3.5 text-xs space-y-3">
            {extensions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#D8D2C5] bg-white/70 px-4 py-7 text-center space-y-3 dark:border-[#383530] dark:bg-[#191816]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFECE6] text-[#7A746B] dark:bg-[#262420] dark:text-[#9D978E]">
                  <Puzzle className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <p className="font-medium text-[#1F1E1B] dark:text-[#F2EFE9]">
                    Belum ada ekstensi atau userscript terinstal
                  </p>
                  <p className="text-[11px] text-[#6C675E] dark:text-[#9D978E]">
                    Pasang ekstensi dari Chrome Web Store atau muat file lokal <code className="font-mono">.zip</code>, <code className="font-mono">.crx</code>, atau <code className="font-mono">.user.js</code>.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setView('install');
                      setInstallTab('store');
                    }}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#1F1E1B] px-3.5 py-1.5 text-xs font-semibold text-[#FAF8F4] hover:bg-[#35332E] cursor-pointer dark:bg-[#D97757] dark:text-[#181715]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Pasang Ekstensi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setView('install');
                      setInstallTab('local');
                    }}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#D8D2C5] bg-white px-3 py-1.5 text-xs font-medium text-[#3E3B35] hover:bg-[#EFECE6] cursor-pointer dark:border-[#3A3732] dark:bg-[#23221F] dark:text-[#DDD7CB]"
                  >
                    <FolderUp className="h-3.5 w-3.5" />
                    <span>File Lokal</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2 rounded-xl border border-[#E5E0D6] bg-white px-3 py-2 dark:border-[#34322C] dark:bg-[#191816]">
                  <p className="text-[11px] text-[#5C5953] dark:text-[#A6A198]">
                    Pasang dari Web Store atau file lokal <code className="font-mono">.zip/.crx</code>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setView('install');
                      setInstallTab('local');
                    }}
                    className="shrink-0 rounded-md border border-[#C86442]/40 bg-[#C86442]/10 px-2 py-1 text-[10px] font-semibold text-[#964226] hover:bg-[#C86442]/20 cursor-pointer dark:border-[#D97757]/40 dark:text-[#F2A68C]"
                  >
                    + File Lokal
                  </button>
                </div>

                <div className="divide-y divide-[#EAE5DC] dark:divide-[#2F2D28]">
                  {extensions.map((ext) => (
                    <div key={ext.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-[#1F1E1B] truncate dark:text-[#F2EFE9]">
                            {ext.name}
                          </p>
                          <p className="text-[10px] text-[#7A746B] truncate dark:text-[#9D978E]">
                            {ext.source} · v{ext.version} ·{' '}
                            <span className="font-mono tabular-nums">
                              {ext.enabled ? `${ext.ramMb} MB` : '0 MB'}
                            </span>
                          </p>
                        </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onToggleExtension(ext.id)}
                        className={`min-h-[32px] rounded-md border px-2 text-[11px] font-medium transition-colors cursor-pointer ${
                          ext.enabled
                            ? 'border-[#3A7D54] bg-[#3A7D54]/10 text-[#255C3B] dark:text-[#86CFA0]'
                            : 'border-[#D8D2C5] text-[#6C675E] hover:bg-black/5 dark:border-[#3D3A34] dark:text-[#9D978E]'
                        }`}
                      >
                        {ext.enabled ? 'Aktif' : 'Nonaktif'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onRemoveExtension(ext.id);
                          showBanner(`"${ext.name}" dihapus dari browser.`);
                        }}
                        title={`Hapus ${ext.name}`}
                        aria-label={`Hapus ${ext.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-[#7A746B] hover:bg-[#C86442]/12 hover:text-[#964226] cursor-pointer dark:text-[#9D978E] dark:hover:text-[#F2A68C]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#5C5953] dark:text-[#A6A198]">
                    {ext.description}
                  </p>
                </div>
              ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* VIEW 2: INSTALL PANEL (Chrome Web Store + Local File Sideload ala Mises Browser) */}
        {view === 'install' && (
          <div className="thin-scrollbar flex-1 overflow-y-auto p-3.5 text-xs space-y-3">
            {/* 2-Tab Switcher */}
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#EFECE6] p-1 dark:bg-[#171614]">
              <button
                type="button"
                onClick={() => setInstallTab('store')}
                className={`flex min-h-[34px] items-center justify-center gap-1.5 rounded-lg px-2 text-[11px] font-medium transition-colors cursor-pointer ${
                  installTab === 'store'
                    ? 'bg-white text-[#1F1E1B] shadow-sm dark:bg-[#2B2925] dark:text-[#F2EFE9]'
                    : 'text-[#6C675E] dark:text-[#9D978E]'
                }`}
              >
                <Store className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
                <span>Chrome Web Store</span>
              </button>
              <button
                type="button"
                onClick={() => setInstallTab('local')}
                className={`flex min-h-[34px] items-center justify-center gap-1.5 rounded-lg px-2 text-[11px] font-medium transition-colors cursor-pointer ${
                  installTab === 'local'
                    ? 'bg-white text-[#1F1E1B] shadow-sm dark:bg-[#2B2925] dark:text-[#F2EFE9]'
                    : 'text-[#6C675E] dark:text-[#9D978E]'
                }`}
              >
                <FolderUp className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
                <span>File Lokal (.zip/.crx)</span>
              </button>
            </div>

            {/* TAB A: CHROME WEB STORE */}
            {installTab === 'store' && (
              <div className="space-y-3">
                <form onSubmit={handleStoreSubmit} className="space-y-1.5">
                  <div className="flex gap-1.5">
                    <div className="flex flex-1 min-w-0 items-center gap-1.5 rounded-lg border border-[#DDD7CB] bg-white px-2.5 dark:border-[#3A3732] dark:bg-[#181715]">
                      <Search className="h-3.5 w-3.5 shrink-0 text-[#7A746B]" />
                      <input
                        type="text"
                        value={storeQuery}
                        onChange={(e) => {
                          setStoreQuery(e.target.value);
                          setStoreFeedback(null);
                        }}
                        placeholder="Cari nama atau tempel URL / ID Web Store"
                        className="min-w-0 flex-1 bg-transparent py-2 text-xs outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="flex min-h-[36px] shrink-0 items-center gap-1 rounded-lg bg-[#C86442] px-3 text-xs font-semibold text-white hover:bg-[#B25435] cursor-pointer dark:bg-[#D97757] dark:text-[#181715]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Pasang</span>
                    </button>
                  </div>
                  {storeFeedback && (
                    <p className="text-[11px] text-[#964226] dark:text-[#E59377]">{storeFeedback}</p>
                  )}
                </form>

                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-[#6C675E] dark:text-[#9D978E]">
                    Populer untuk Game Web3 & Privasi
                  </p>
                  <div className="divide-y divide-[#EAE5DC] rounded-xl border border-[#E5E0D6] bg-white px-3 dark:divide-[#2E2C27] dark:border-[#34322C] dark:bg-[#191816]">
                    {filteredPresets.map((preset) => {
                      const installed = isAlreadyInstalled(preset.name);
                      return (
                        <div key={preset.storeId} className="flex items-center justify-between gap-2 py-2.5">
                          <div className="min-w-0">
                            <p className="font-medium text-[#1F1E1B] truncate dark:text-[#F2EFE9]">
                              {preset.name}
                            </p>
                            <p className="text-[10px] text-[#7A746B] truncate dark:text-[#9D978E]">
                              {preset.category} · v{preset.version} · {preset.ramMb} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={installed}
                            onClick={() => handleInstallPreset(preset)}
                            className={`flex min-h-[32px] shrink-0 items-center gap-1 rounded-md px-2.5 text-[11px] font-medium transition-colors ${
                              installed
                                ? 'border border-[#3A7D54]/40 bg-[#3A7D54]/10 text-[#255C3B] cursor-default dark:text-[#86CFA0]'
                                : 'bg-[#1F1E1B] text-[#FAF8F4] hover:bg-[#35332E] cursor-pointer dark:bg-[#D97757] dark:text-[#181715]'
                            }`}
                          >
                            {installed ? (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Terpasang</span>
                              </>
                            ) : (
                              <span>Pasang</span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                    {filteredPresets.length === 0 && (
                      <div className="py-3 text-[11px] text-[#6C675E] dark:text-[#9D978E]">
                        Tidak ditemukan di preset. Tekan tombol <strong>Pasang</strong> di atas untuk langsung memasang URL/ID kustom Anda.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB B: SIDELOAD LOCAL FILE (.zip / .crx / .user.js) ALA MISES BROWSER */}
            {installTab === 'local' && (
              <div className="space-y-3">
                {/* Developer Mode Toggle */}
                <label className="flex items-center justify-between gap-2 rounded-xl border border-[#E5E0D6] bg-white px-3 py-2.5 cursor-pointer dark:border-[#34322C] dark:bg-[#191816]">
                  <div className="flex items-center gap-2 min-w-0">
                    <Wrench className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[11px]">Mode Pengembang (Developer Mode)</p>
                      <p className="text-[10px] text-[#6C675E] dark:text-[#9D978E]">
                        Izinkan sideload paket <code className="font-mono">.zip</code>, <code className="font-mono">.crx</code> & <code className="font-mono">.user.js</code>
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={devMode}
                    onChange={(e) => {
                      setDevMode(e.target.checked);
                      if (!e.target.checked) setPendingSideload(null);
                    }}
                    className="h-4 w-4 shrink-0 accent-[#C86442]"
                  />
                </label>

                {/* Real OS File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,.crx,.js"
                  onChange={handlePickLocalFile}
                  className="hidden"
                />

                {/* File Picker + Sample .zip Test Buttons */}
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={!devMode}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-dashed px-3 py-2 text-xs font-semibold transition-colors ${
                      devMode
                        ? 'border-[#C86442] bg-[#C86442]/8 text-[#964226] hover:bg-[#C86442]/15 cursor-pointer dark:border-[#D97757] dark:text-[#F2A68C]'
                        : 'border-[#D8D2C5] bg-[#EFECE6] text-[#8E887E] cursor-not-allowed dark:border-[#35332D] dark:bg-[#1B1A18]'
                    }`}
                  >
                    <FolderUp className="h-4 w-4 shrink-0" />
                    <span>Muat dari File (.zip / .crx / .user.js)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTrySampleZip}
                    className="flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-lg border border-[#DDD7CB] bg-white px-3 text-[11px] font-medium text-[#3E3B35] hover:bg-[#F3EFE7] cursor-pointer dark:border-[#3A3732] dark:bg-[#191816] dark:text-[#E2DDD3] dark:hover:bg-[#282622]"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
                    <span>Coba Contoh .zip (Simulasi Sideload)</span>
                  </button>
                </div>

                {!devMode && (
                  <p className="text-[11px] text-[#7A746B] dark:text-[#9D978E]">
                    Aktifkan <strong>Mode Pengembang</strong> di atas untuk memuat ekstensi lokal dari penyimpanan HP.
                  </p>
                )}

                {/* Sideload Manifest Inspection & Confirmation Card */}
                {pendingSideload && (
                  <div className="space-y-2.5 rounded-xl border border-[#C86442]/50 bg-white p-3 shadow-sm dark:border-[#D97757]/50 dark:bg-[#191816]">
                    <div className="flex items-start gap-2">
                      <FileArchive className="mt-0.5 h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs truncate">{pendingSideload.name}</p>
                        <p className="font-mono text-[10px] text-[#6C675E] truncate dark:text-[#9D978E]">
                          {pendingSideload.filename} · {pendingSideload.format} · {pendingSideload.sizeLabel}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-[#F5F2EC] p-2 font-mono text-[10px] text-[#4A4741] space-y-0.5 dark:bg-[#23221F] dark:text-[#C5C0B6]">
                      <p>manifest.json: MV{pendingSideload.manifestVersion} · v{pendingSideload.version}</p>
                      <p className="truncate">entry: {pendingSideload.entryScript}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="flex items-center gap-1 text-[10px] font-medium text-[#5C5953] dark:text-[#A6A198]">
                        <ShieldCheck className="h-3 w-3 text-[#2E7D4F] dark:text-[#86CFA0]" />
                        <span>Izin diminta (Isolated World):</span>
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {pendingSideload.permissions.map((perm) => (
                          <span
                            key={perm}
                            className="rounded border border-[#E2DCD0] bg-[#FAF8F4] px-1.5 py-0.5 font-mono text-[10px] text-[#5C5953] dark:border-[#34322C] dark:bg-[#22201D] dark:text-[#BDB7AC]"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setPendingSideload(null)}
                        className="min-h-[36px] rounded-lg border border-[#DDD7CB] bg-white px-2.5 text-[11px] font-medium hover:bg-[#F3EFE7] cursor-pointer dark:border-[#3A3732] dark:bg-[#23221F]"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmSideload}
                        className="min-h-[36px] rounded-lg bg-[#C86442] px-2.5 text-[11px] font-semibold text-white hover:bg-[#B25435] cursor-pointer dark:bg-[#D97757] dark:text-[#181715]"
                      >
                        Konfirmasi Pasang
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
