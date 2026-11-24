import React from 'react';
import {
  Lock,
  ShieldCheck,
  Trash2,
  RotateCcw,
  Globe,
  Users,
  X,
  ShieldAlert,
  Smartphone,
  Monitor,
  Check,
  ClipboardCheck,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import {
  BrowserProfile,
  PermissionValue,
  ProxyConfig,
  SitePermissions,
  SiteStorageItem,
} from '../types/browser';
import { ParsedUrlSecurity } from '../utils/urlSecurity';

const SUPPORTED_MOBILE_WALLETS = [
  { name: 'Rabby Wallet', scheme: 'rabby://', primary: true },
  { name: 'MetaMask Mobile', scheme: 'metamask://' },
  { name: 'Phantom', scheme: 'phantom://' },
  { name: 'OKX Wallet', scheme: 'okx://' },
];

interface SiteInfoPopoverProps {
  open: boolean;
  url: string;
  origin: string;
  urlSecurity: ParsedUrlSecurity;
  siteStorageItem: SiteStorageItem | undefined;
  sitePermissions: SitePermissions;
  clipboardAutoClear: boolean;
  webViewOutdated: boolean;
  antiRedirectForSite: boolean;
  walletWhitelistEnabled: boolean;
  whitelistedWallets: string[];
  rememberDesktopForSite: boolean;
  disablePullToRefreshForSite: boolean;
  activeProfile: BrowserProfile;
  proxy: ProxyConfig;
  onClose: () => void;
  onClearThisSiteData: (origin: string) => void;
  onResetSitePermissions: () => void;
  onToggleQuickPermission: (key: keyof SitePermissions, next: PermissionValue) => void;
  onToggleClipboardAutoClear: () => void;
  onOpenPlayStoreWebViewUpdate: () => void;
  onToggleAntiRedirectForSite: () => void;
  onToggleWalletWhitelist: () => void;
  onToggleWhitelistedWallet: (walletName: string) => void;
  onToggleRememberDesktopForSite: () => void;
  onTogglePullToRefreshForSite: () => void;
  onOpenProfilesSheet: () => void;
  onOpenProxyTerminal: () => void;
}

const QUICK_PERMISSIONS: { key: keyof SitePermissions; label: string }[] = [
  { key: 'popups', label: 'Pop-up Internal' },
  { key: 'notifications', label: 'Notifikasi' },
  { key: 'autoplay', label: 'Autoplay Audio / Video' },
];

export const SiteInfoPopover: React.FC<SiteInfoPopoverProps> = ({
  open,
  url,
  origin,
  urlSecurity,
  siteStorageItem,
  sitePermissions,
  clipboardAutoClear,
  webViewOutdated,
  antiRedirectForSite,
  walletWhitelistEnabled,
  whitelistedWallets,
  rememberDesktopForSite,
  disablePullToRefreshForSite,
  activeProfile,
  proxy,
  onClose,
  onClearThisSiteData,
  onResetSitePermissions,
  onToggleQuickPermission,
  onToggleClipboardAutoClear,
  onOpenPlayStoreWebViewUpdate,
  onToggleAntiRedirectForSite,
  onToggleWalletWhitelist,
  onToggleWhitelistedWallet,
  onToggleRememberDesktopForSite,
  onTogglePullToRefreshForSite,
  onOpenProfilesSheet,
  onOpenProxyTerminal,
}) => {
  if (!open) return null;

  const isSecure =
    !urlSecurity.isSuspicious &&
    (url.startsWith('https://') || url.startsWith('karsa://') || url.startsWith('chrome-extension://'));

  return (
    <div className="absolute inset-0 z-35 flex items-start justify-start p-2.5 sm:p-3">
      {/* Click-outside backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Pop-up Card anchored near top-left URL lock icon */}
      <div
        role="dialog"
        aria-label="Info dan Kontrol Situs"
        className="relative z-10 flex max-h-[calc(100%-8px)] w-full max-w-[355px] flex-col overflow-hidden rounded-2xl border border-[#DFD9CE] bg-[#FAF8F4] text-[#1F1E1B] shadow-2xl dark:border-[#383530] dark:bg-[#22201D] dark:text-[#F2EFE9]"
      >
        {/* Header: Connection Status & Active Domain */}
        <div className="flex items-start justify-between gap-2 border-b border-[#E5E0D6] bg-[#F3EFE7] px-4 py-3 dark:border-[#32302B] dark:bg-[#1B1A18]">
          <div className="flex items-start gap-2.5 min-w-0">
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                isSecure
                  ? 'bg-[#2E7D4F]/12 text-[#256640] dark:bg-[#86CFA0]/15 dark:text-[#86CFA0]'
                  : 'bg-[#DC2626]/14 text-[#B91C1C] dark:bg-[#EF4444]/20 dark:text-[#FCA5A5]'
              }`}
            >
              {isSecure ? <Lock className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            </span>
            <div className="min-w-0">
              <p className="font-mono text-xs truncate">
                {urlSecurity.isInternal ? (
                  <span className="font-semibold">{origin}</span>
                ) : (
                  <>
                    {urlSecurity.subdomain && (
                      <span className="text-[#7A746B] dark:text-[#9D978E]">{urlSecurity.subdomain}</span>
                    )}
                    <span
                      className={`font-bold ${
                        urlSecurity.isSuspicious
                          ? 'text-[#B91C1C] dark:text-[#FCA5A5]'
                          : 'text-[#1F1E1B] dark:text-[#F2EFE9]'
                      }`}
                    >
                      {urlSecurity.primaryDomain}
                    </span>
                  </>
                )}
              </p>
              <p
                className={`mt-0.5 text-[11px] font-medium ${
                  isSecure
                    ? 'text-[#256640] dark:text-[#86CFA0]'
                    : 'text-[#B91C1C] dark:text-[#FCA5A5]'
                }`}
              >
                {urlSecurity.isPunycode
                  ? 'Peringatan Phishing · Domain Punycode (xn--)'
                  : urlSecurity.isNonHttps
                  ? 'Peringatan · Koneksi Non-HTTPS Tidak Terenkripsi'
                  : 'Koneksi Aman · HTTPS / TLS 1.3'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup info situs"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6C675E] hover:bg-black/5 dark:text-[#A6A198] dark:hover:bg-white/10 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Controls Body */}
        <div className="thin-scrollbar flex-1 overflow-y-auto p-3.5 text-xs space-y-3.5">
          {/* Anti-Phishing / Punycode / Non-HTTPS Red Warning Card */}
          {urlSecurity.isSuspicious && urlSecurity.warningReason && (
            <div className="rounded-xl border border-[#DC2626]/40 bg-[#DC2626]/10 p-2.5 text-[11px] text-[#991B1B] space-y-1 dark:border-[#EF4444]/40 dark:bg-[#EF4444]/15 dark:text-[#FCA5A5]">
              <p className="flex items-center gap-1.5 font-semibold">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                <span>Deteksi Anti-Phishing Aktif ({urlSecurity.shortBadge})</span>
              </p>
              <p className="leading-snug opacity-95">{urlSecurity.warningReason}</p>
            </div>
          )}

          {/* Quick Maintenance: Clear Site Cache/Cookies + Reset Permissions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onClearThisSiteData(origin)}
              className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#DDD7CB] bg-white px-2.5 py-2 text-[11px] font-medium text-[#8E3C21] transition-colors hover:bg-[#F5EFE6] cursor-pointer dark:border-[#3A3732] dark:bg-[#191816] dark:text-[#E59377] dark:hover:bg-[#2B2925]"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Hapus Cache & Cookie</span>
            </button>

            <button
              type="button"
              onClick={onResetSitePermissions}
              className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#DDD7CB] bg-white px-2.5 py-2 text-[11px] font-medium text-[#3E3B35] transition-colors hover:bg-[#F5EFE6] cursor-pointer dark:border-[#3A3732] dark:bg-[#191816] dark:text-[#E2DDD3] dark:hover:bg-[#2B2925]"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Reset Izin Situs</span>
            </button>
          </div>

          {/* Site Storage Snapshot */}
          <p className="font-mono text-[10px] text-[#6C675E] tabular-nums dark:text-[#9D978E]">
            Data situs ini:{' '}
            {siteStorageItem
              ? `${siteStorageItem.cookies} cookie · Cache ${siteStorageItem.cacheMb} MB · IDB ${siteStorageItem.indexedDbMb} MB`
              : '0 cookie · Cache bersih (0 MB)'}
          </p>

          {/* Compact Production Security & Play Protect Status Summary */}
          <div className="rounded-xl border border-[#2E7D4F]/25 bg-[#2E7D4F]/[0.05] p-2.5 space-y-2 dark:border-[#86CFA0]/25 dark:bg-[#86CFA0]/[0.07]">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#21633D] dark:text-[#86CFA0]">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>Proteksi Produksi Aktif</span>
              </span>
              <span className="font-mono text-[9.5px] font-medium text-[#256640]/85 dark:text-[#86CFA0]/85">
                Play Protect Ready
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="rounded-lg bg-white/85 px-2 py-1.5 dark:bg-[#191816]/85">
                <p className="font-semibold text-[#1F1E1B] dark:text-[#F2EFE9]">HTTPS Strict</p>
                <p className="text-[#6C675E] dark:text-[#9D978E]">SSL Lockdown · Safe Browsing</p>
              </div>
              <div className="rounded-lg bg-white/85 px-2 py-1.5 dark:bg-[#191816]/85">
                <p className="font-semibold text-[#1F1E1B] dark:text-[#F2EFE9]">Keystore Lokal</p>
                <p className="text-[#6C675E] dark:text-[#9D978E]">AES-256 Enkripsi Perangkat</p>
              </div>
              <div className="rounded-lg bg-white/85 px-2 py-1.5 dark:bg-[#191816]/85">
                <p className="font-semibold text-[#1F1E1B] dark:text-[#F2EFE9]">Isolasi Script</p>
                <p className="text-[#6C675E] dark:text-[#9D978E]">OAuth &amp; Wallet Terkunci</p>
              </div>
              <div className="rounded-lg bg-white/85 px-2 py-1.5 dark:bg-[#191816]/85">
                <p className="font-semibold text-[#1F1E1B] dark:text-[#F2EFE9]">Zero Telemetry</p>
                <p className="text-[#6C675E] dark:text-[#9D978E]">R8 Log Strip · Izin Minimal</p>
              </div>
              <div className="rounded-lg bg-white/85 px-2 py-1.5 dark:bg-[#191816]/85">
                <p className="font-semibold text-[#1F1E1B] dark:text-[#F2EFE9]">SafeURI &amp; Nonce</p>
                <p className="text-[#6C675E] dark:text-[#9D978E]">Tolak file:// · JS Bridge</p>
              </div>
              <div className="rounded-lg bg-white/85 px-2 py-1.5 dark:bg-[#191816]/85">
                <p className="font-semibold text-[#1F1E1B] dark:text-[#F2EFE9]">WebView Engine</p>
                <p
                  className={
                    webViewOutdated
                      ? 'font-medium text-[#B45309] dark:text-[#FCD34D]'
                      : 'text-[#256640] dark:text-[#86CFA0]'
                  }
                >
                  {webViewOutdated ? 'v114 · Usang' : 'v131 · Mutakhir'}
                </p>
              </div>
            </div>

            {webViewOutdated && (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-[#D97706]/35 bg-[#FEF3C7]/80 px-2.5 py-1.5 text-[10px] text-[#92400E] dark:border-[#F59E0B]/35 dark:bg-[#F59E0B]/15 dark:text-[#FDE68A]">
                <span className="leading-snug">Android System WebView usang. Perbarui di Play Store.</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPlayStoreWebViewUpdate();
                  }}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#B45309] px-2 py-1 font-semibold text-white hover:bg-[#92400E] cursor-pointer dark:bg-[#F59E0B] dark:text-[#1C1917]"
                >
                  <span>Update</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </button>
              </div>
            )}
          </div>

          {/* Proteksi Situs (Gaming & Web3) — Smart Anti-Redirect */}
          <div className="space-y-2 border-t border-[#E5E0D6] pt-3 dark:border-[#312F2A]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
              <h4 className="font-editorial text-xs font-semibold">
                Proteksi Situs (Anti-Redirect Pintar)
              </h4>
            </div>

            {/* 1. Social Media Anti-Redirect — 100% Locked */}
            <label className="flex min-h-[40px] items-center justify-between gap-2 rounded-lg border border-[#E5E0D6] bg-white px-3 py-2 cursor-pointer dark:border-[#34322C] dark:bg-[#191816]">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-[11px]">Anti-Redirect Media Sosial</p>
                  {antiRedirectForSite && (
                    <span className="rounded bg-[#2E7D4F]/12 px-1.5 py-0.5 text-[9px] font-semibold text-[#256640] dark:bg-[#86CFA0]/15 dark:text-[#86CFA0]">
                      Terkunci 100%
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#6C675E] dark:text-[#9D978E]">
                  X/Twitter, Discord & Telegram selalu diblokir keluar dan tetap di Pop-up internal
                </p>
              </div>
              <input
                type="checkbox"
                checked={antiRedirectForSite}
                onChange={onToggleAntiRedirectForSite}
                className="h-4 w-4 shrink-0 accent-[#C86442]"
              />
            </label>

            {/* 2. External Mobile Wallet Whitelist (WalletConnect) */}
            <div className="rounded-lg border border-[#E5E0D6] bg-white px-3 py-2.5 space-y-2 dark:border-[#34322C] dark:bg-[#191816]">
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    <p className="font-medium text-[11px]">Whitelist Aplikasi Wallet Eksternal</p>
                  </div>
                  <p className="mt-0.5 text-[10px] text-[#6C675E] dark:text-[#9D978E]">
                    Izinkan penerusan deep-link (<span className="font-mono">rabby://</span>,{' '}
                    <span className="font-mono">wc://</span>) khusus ke aplikasi wallet resmi di HP
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={walletWhitelistEnabled}
                  onChange={onToggleWalletWhitelist}
                  className="h-4 w-4 shrink-0 accent-[#C86442]"
                />
              </label>

              {walletWhitelistEnabled && (
                <div className="flex flex-wrap gap-1.5 border-t border-[#EFECE6] pt-2 dark:border-[#2C2A25]">
                  {SUPPORTED_MOBILE_WALLETS.map((wallet) => {
                    const active = whitelistedWallets.includes(wallet.name);
                    return (
                      <button
                        key={wallet.name}
                        type="button"
                        onClick={() => onToggleWhitelistedWallet(wallet.name)}
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium transition-colors cursor-pointer ${
                          active
                            ? 'border-[#2E7D4F]/40 bg-[#2E7D4F]/10 text-[#256640] dark:border-[#86CFA0]/40 dark:bg-[#86CFA0]/15 dark:text-[#86CFA0]'
                            : 'border-[#E0DAD0] bg-[#FAF8F4] text-[#7A746B] hover:border-[#C86442]/50 dark:border-[#3A3732] dark:bg-[#23221F] dark:text-[#9D978E]'
                        }`}
                      >
                        {active && <Check className="h-2.5 w-2.5 shrink-0" />}
                        <span>{wallet.name}</span>
                        {wallet.primary && (
                          <span className="opacity-70">(Default)</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Ingat Mode Desktop untuk situs ini */}
            <label className="flex min-h-[38px] items-center justify-between gap-2 rounded-lg border border-[#E5E0D6] bg-white px-3 py-2 cursor-pointer dark:border-[#34322C] dark:bg-[#191816]">
              <div>
                <div className="flex items-center gap-1.5">
                  <Monitor className="h-3.5 w-3.5 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                  <p className="font-medium text-[11px]">Ingat Mode Desktop untuk situs ini</p>
                </div>
                <p className="text-[10px] text-[#6C675E] dark:text-[#9D978E]">
                  Otomatis muat {origin} dalam tampilan Desktop setiap kali dibuka
                </p>
              </div>
              <input
                type="checkbox"
                checked={rememberDesktopForSite}
                onChange={onToggleRememberDesktopForSite}
                className="h-4 w-4 shrink-0 accent-[#C86442]"
              />
            </label>

            {/* 4. Pull-to-Refresh */}
            <label className="flex min-h-[38px] items-center justify-between gap-2 rounded-lg border border-[#E5E0D6] bg-white px-3 py-2 cursor-pointer dark:border-[#34322C] dark:bg-[#191816]">
              <div>
                <p className="font-medium text-[11px]">Matikan Pull-to-Refresh</p>
                <p className="text-[10px] text-[#6C675E] dark:text-[#9D978E]">
                  Cegah reload tidak sengaja saat menggeser layar
                </p>
              </div>
              <input
                type="checkbox"
                checked={disablePullToRefreshForSite}
                onChange={onTogglePullToRefreshForSite}
                className="h-4 w-4 shrink-0 accent-[#C86442]"
              />
            </label>
          </div>

          {/* Proteksi Clipboard (Anti-Clipboard Hijacking) */}
          <div className="space-y-2 border-t border-[#E5E0D6] pt-3 dark:border-[#312F2A]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <ClipboardCheck className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
                <h4 className="font-editorial text-xs font-semibold">
                  Proteksi Clipboard (Anti-Hijacking)
                </h4>
              </div>
              <span
                className={`font-mono text-[9.5px] font-semibold ${
                  sitePermissions.clipboard === 'block'
                    ? 'text-[#256640] dark:text-[#86CFA0]'
                    : 'text-[#964226] dark:text-[#E59377]'
                }`}
              >
                {sitePermissions.clipboard === 'block'
                  ? 'Blokir Baca Auto'
                  : sitePermissions.clipboard === 'ask'
                  ? 'Tanya Izin'
                  : 'Diizinkan'}
              </span>
            </div>

            <div className="space-y-1.5 rounded-xl border border-[#E5E0D6] bg-white p-2.5 dark:border-[#34322C] dark:bg-[#191816]">
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <div className="min-w-0">
                  <p className="font-medium text-[11px]">Blokir Baca Clipboard Otomatis</p>
                  <p className="text-[10px] text-[#6C675E] dark:text-[#9D978E]">
                    Cegah situs mengintip alamat wallet / sandi di papan klip tanpa izin eksplisit
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={sitePermissions.clipboard === 'block'}
                  onChange={(e) =>
                    onToggleQuickPermission('clipboard', e.target.checked ? 'block' : 'ask')
                  }
                  className="h-4 w-4 shrink-0 accent-[#C86442]"
                />
              </label>

              <label className="flex items-center justify-between gap-2 border-t border-[#EFECE6] pt-2 cursor-pointer dark:border-[#2C2A25]">
                <div className="min-w-0">
                  <p className="font-medium text-[11px]">Auto-Clear Clipboard (30 dtk)</p>
                  <p className="text-[10px] text-[#6C675E] dark:text-[#9D978E]">
                    Bersihkan papan klip otomatis setelah menyalin sandi atau data sensitif
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={clipboardAutoClear}
                  onChange={onToggleClipboardAutoClear}
                  className="h-4 w-4 shrink-0 accent-[#C86442]"
                />
              </label>
            </div>
          </div>

          {/* Kontrol Izin Cepat */}
          <div className="space-y-1.5 border-t border-[#E5E0D6] pt-3 dark:border-[#312F2A]">
            <h4 className="font-editorial text-xs font-semibold">Kontrol Izin Cepat</h4>
            <div className="divide-y divide-[#EAE5DC] rounded-xl border border-[#E5E0D6] bg-white px-3 dark:divide-[#2E2C27] dark:border-[#34322C] dark:bg-[#191816]">
              {QUICK_PERMISSIONS.map(({ key, label }) => {
                const isAllowed = sitePermissions[key] === 'allow';
                return (
                  <label
                    key={key}
                    className="flex min-h-[38px] items-center justify-between gap-2 py-2 cursor-pointer"
                  >
                    <span className="text-[11px] font-medium">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#7A746B] dark:text-[#9D978E]">
                        {sitePermissions[key] === 'allow'
                          ? 'Izinkan'
                          : sitePermissions[key] === 'ask'
                          ? 'Tanya'
                          : 'Blokir'}
                      </span>
                      <input
                        type="checkbox"
                        checked={isAllowed}
                        onChange={(e) =>
                          onToggleQuickPermission(key, e.target.checked ? 'allow' : 'block')
                        }
                        className="h-4 w-4 accent-[#C86442]"
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Info Profil & Proxy Aktif */}
          <div className="space-y-2 border-t border-[#E5E0D6] pt-3 dark:border-[#312F2A]">
            <h4 className="font-editorial text-xs font-semibold">Profil & Proxy Sesi Aktif</h4>
            <div className="grid grid-cols-1 gap-2 rounded-xl border border-[#E5E0D6] bg-white p-2.5 dark:border-[#34322C] dark:bg-[#191816]">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[11px] min-w-0">
                  <Users className="h-3.5 w-3.5 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                  <span className="truncate font-medium">
                    {activeProfile.name} ({activeProfile.badge})
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenProfilesSheet();
                  }}
                  className="shrink-0 text-[11px] font-medium text-[#C86442] hover:underline cursor-pointer dark:text-[#E59377]"
                >
                  Ganti
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-[#EFECE6] pt-2 dark:border-[#2C2A25]">
                <span className="flex items-center gap-1.5 font-mono text-[11px] min-w-0">
                  <Globe className="h-3.5 w-3.5 shrink-0 text-[#6C675E] dark:text-[#A6A198]" />
                  <span className="truncate">
                    {proxy.enabled
                      ? `${proxy.protocol}://${proxy.host}:${proxy.port}${
                          proxy.latencyMs ? ` (${proxy.latencyMs}ms)` : ''
                        }`
                      : `DIRECT (${activeProfile.proxySummary})`}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenProxyTerminal();
                  }}
                  className="shrink-0 text-[11px] font-medium text-[#C86442] hover:underline cursor-pointer dark:text-[#E59377]"
                >
                  Atur
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
