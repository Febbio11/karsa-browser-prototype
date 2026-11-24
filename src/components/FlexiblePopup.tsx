import React, { useEffect, useRef, useState } from 'react';
import {
  ExternalLink,
  Maximize2,
  Minimize2,
  X,
  ShieldAlert,
  ShieldCheck,
  Fingerprint,
  CheckCircle2,
  GripHorizontal,
  Wallet,
  Smartphone,
  Puzzle,
  Copy,
  Check,
  ArrowLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  BadgeCheck,
} from 'lucide-react';
import { FlexiblePopupState } from '../types/browser';
import { ParsedUrlSecurity } from '../utils/urlSecurity';

interface MobileWalletOption {
  name: string;
  shortLabel: string;
  scheme: string;
  packageName: string;
  connectLabel: string;
  recommended?: boolean;
}

const MOBILE_WALLETS: MobileWalletOption[] = [
  {
    name: 'Rabby Wallet',
    shortLabel: 'Rabby Mobile',
    scheme: 'rabby://',
    packageName: 'com.debank.rabbymobile',
    connectLabel: 'Terhubung (Rabby Mobile)',
    recommended: true,
  },
  {
    name: 'MetaMask Mobile',
    shortLabel: 'MetaMask',
    scheme: 'metamask://',
    packageName: 'io.metamask',
    connectLabel: 'Terhubung (MetaMask Mobile)',
  },
  {
    name: 'Phantom',
    shortLabel: 'Phantom',
    scheme: 'phantom://',
    packageName: 'app.phantom',
    connectLabel: 'Terhubung (Phantom Mobile)',
  },
  {
    name: 'OKX Wallet',
    shortLabel: 'OKX Wallet',
    scheme: 'okx://',
    packageName: 'com.okinc.okex.gp',
    connectLabel: 'Terhubung (OKX Mobile)',
  },
];

const DEMO_WC_URI =
  'wc:8f4c29a1e7d5b309c6f82a41d0e5b9c3@2?relay-protocol=irn&symKey=karsa92a7c4e18f0b3d56e9a12c84f7b0';

interface FlexiblePopupProps {
  popup: FlexiblePopupState;
  requestingOrigin: string;
  urlSecurity: ParsedUrlSecurity;
  walletWhitelistEnabled: boolean;
  whitelistedWallets: string[];
  enabledExtensionWallets: string[];
  onUpdatePopup: (patch: Partial<FlexiblePopupState>) => void;
  onPromoteToTab: () => void;
  onKeepInPopup: () => void;
  onClose: () => void;
  onCompleteAuth: (kind: FlexiblePopupState['kind'], label: string) => void;
  onEnableWalletWhitelist: (walletName?: string) => void;
  onCopyWalletConnectUri: (uri: string) => void;
}

export const FlexiblePopup: React.FC<FlexiblePopupProps> = ({
  popup,
  requestingOrigin,
  urlSecurity,
  walletWhitelistEnabled,
  whitelistedWallets,
  enabledExtensionWallets,
  onUpdatePopup,
  onPromoteToTab,
  onKeepInPopup,
  onClose,
  onCompleteAuth,
  onEnableWalletWhitelist,
  onCopyWalletConnectUri,
}) => {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);
  const [walletStep, setWalletStep] = useState<'choose' | 'confirm-mobile' | 'extension'>('choose');
  const [selectedMobileWallet, setSelectedMobileWallet] = useState<MobileWalletOption>(MOBILE_WALLETS[0]);
  const [selectedExtWallet, setSelectedExtWallet] = useState<string>('Rabby Wallet');
  const [isHandingOff, setIsHandingOff] = useState(false);
  const [uriCopied, setUriCopied] = useState(false);
  const [username, setUsername] = useState('@arief_karsa');
  const [password, setPassword] = useState('••••••••••••');
  const [passkeyVerified, setPasskeyVerified] = useState(false);
  const [keepConfirmed, setKeepConfirmed] = useState(false);

  useEffect(() => {
    if (popup.open) {
      setWalletStep('choose');
      setSelectedMobileWallet(MOBILE_WALLETS[0]);
      setIsHandingOff(false);
      setUriCopied(false);
      if (enabledExtensionWallets.length > 0) {
        setSelectedExtWallet(enabledExtensionWallets[0]);
      }
    }
  }, [popup.open, popup.kind, enabledExtensionWallets]);

  if (!popup.open) return null;

  const isSelectedMobileWhitelisted =
    walletWhitelistEnabled && whitelistedWallets.includes(selectedMobileWallet.name);

  const startDrag = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: popup.x,
      origY: popup.y,
    };
  };

  const onDrag = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    onUpdatePopup({
      x: Math.max(8, Math.min(280, dragRef.current.origX + dx)),
      y: Math.max(8, Math.min(220, dragRef.current.origY + dy)),
    });
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const startResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origW: popup.width,
      origH: popup.height,
    };
  };

  const onResize = (e: React.PointerEvent) => {
    if (!resizeRef.current) return;
    const dx = e.clientX - resizeRef.current.startX;
    const dy = e.clientY - resizeRef.current.startY;
    onUpdatePopup({
      width: Math.max(270, Math.min(540, resizeRef.current.origW + dx)),
      height: Math.max(260, Math.min(470, resizeRef.current.origH + dy)),
    });
  };

  const endResize = () => {
    resizeRef.current = null;
  };

  const applyPreset = (w: number, h: number) => {
    onUpdatePopup({ width: w, height: h });
  };

  const handleTriggerMobileHandoff = () => {
    if (!isSelectedMobileWhitelisted || isHandingOff) return;
    setIsHandingOff(true);
    window.setTimeout(() => {
      setIsHandingOff(false);
      onCompleteAuth('wallet', selectedMobileWallet.connectLabel);
    }, 650);
  };

  const handleCopyUri = () => {
    onCopyWalletConnectUri(DEMO_WC_URI);
    setUriCopied(true);
    window.setTimeout(() => setUriCopied(false), 1800);
  };

  const isWalletWhitelistBanner = popup.kind === 'wallet' && walletWhitelistEnabled;

  return (
    <div
      style={{
        left: `${popup.x}px`,
        top: `${popup.y}px`,
        width: `${popup.width}px`,
        height: `${popup.height}px`,
        maxWidth: 'calc(100% - 16px)',
        maxHeight: 'calc(100% - 16px)',
      }}
      className="absolute z-30 flex flex-col overflow-hidden rounded-xl border border-[#D8D2C5] bg-[#FAF8F4] text-[#1F1E1B] shadow-2xl dark:border-[#3E3B35] dark:bg-[#23221F] dark:text-[#F2EFE9]"
    >
      {/* Mandatory Top Bar with Direct Choice: Buka di Tab Baru | Tetap di Pop-up */}
      <div
        onPointerDown={startDrag}
        onPointerMove={onDrag}
        onPointerUp={endDrag}
        className="flex items-center justify-between gap-2 border-b border-[#E5E0D6] bg-[#EFECE6] px-2.5 py-2 cursor-move select-none dark:border-[#36332E] dark:bg-[#2B2925]"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <GripHorizontal className="h-3.5 w-3.5 shrink-0 text-[#7A746B]" />
          <span className="truncate text-xs font-semibold">{popup.title}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onPromoteToTab}
            className="flex items-center gap-1 rounded-md bg-[#1F1E1B] px-2 py-1 text-[11px] font-medium text-[#FAF8F4] transition-colors hover:bg-[#3A3731] whitespace-nowrap cursor-pointer dark:bg-[#D97757] dark:text-[#191816] dark:hover:bg-[#E4886A]"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Buka di Tab Baru</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setKeepConfirmed(true);
              onKeepInPopup();
              window.setTimeout(() => setKeepConfirmed(false), 1600);
            }}
            className={`rounded-md border px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
              keepConfirmed
                ? 'border-[#3A7D54] bg-[#3A7D54]/15 text-[#275A3B] dark:text-[#8CD1A5]'
                : 'border-[#CFC9BC] bg-white/80 text-[#3E3B35] hover:bg-white dark:border-[#45413A] dark:bg-[#1E1D1A] dark:text-[#D8D3C9]'
            }`}
          >
            Tetap di Pop-up
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pop-up"
            className="rounded-md p-1 text-[#6C675E] hover:bg-black/5 dark:text-[#A6A198] dark:hover:bg-white/10 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* URL + Smart Anti-Redirect Notice + Size Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE5DC] bg-[#F5F2EC] px-3 py-1.5 text-[11px] dark:border-[#32302B] dark:bg-[#1D1C19]">
        <span
          className={`flex items-center gap-1.5 truncate ${
            isWalletWhitelistBanner
              ? 'text-[#256640] dark:text-[#86CFA0]'
              : 'text-[#8E3C21] dark:text-[#E59377]'
          }`}
        >
          {isWalletWhitelistBanner ? (
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          )}
          <span className="truncate">{popup.interceptedIntent}</span>
        </span>
        <div className="flex items-center gap-1 text-[10px] text-[#6C675E] dark:text-[#A6A198]">
          <button
            type="button"
            onClick={() => applyPreset(300, 300)}
            className="rounded px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
            title="Ukuran ringkas"
          >
            <Minimize2 className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => applyPreset(430, 410)}
            className="rounded px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
            title="Ukuran lega"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
          <span className="font-mono tabular-nums">
            {Math.round(popup.width)}×{Math.round(popup.height)}
          </span>
        </div>
      </div>

      {/* Scrollable Body Content — Buttons never clip */}
      <div className="thin-scrollbar flex-1 overflow-y-auto p-3.5 text-xs space-y-3">
        {/* Red Anti-Phishing / Punycode / Non-HTTPS Warning inside OAuth & Wallet Pop-up */}
        {urlSecurity.isSuspicious && (
          <div className="rounded-xl border-2 border-[#DC2626] bg-[#DC2626]/12 p-2.5 text-[11px] text-[#991B1B] space-y-1 dark:border-[#EF4444] dark:bg-[#EF4444]/18 dark:text-[#FECACA]">
            <p className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>
                Peringatan Phishing ({urlSecurity.shortBadge || 'BERISIKO'})
              </span>
            </p>
            <p className="leading-snug">
              Situs peminta <span className="font-mono font-bold underline">{requestingOrigin}</span>{' '}
              {urlSecurity.isPunycode
                ? 'menggunakan domain Punycode (xn--) / karakter Unicode mencurigakan.'
                : 'tidak menggunakan enkripsi HTTPS.'}{' '}
              Hindari otorisasi login atau tanda tangan wallet!
            </p>
          </div>
        )}

        <p className="font-mono text-[11px] text-[#6C675E] dark:text-[#9D978E] truncate">
          {popup.url}
        </p>

        {popup.kind === 'wallet' && walletStep === 'choose' && (
          <div className="space-y-3">
            <div>
              <h4 className="font-editorial text-sm font-semibold">
                Pilih Metode Koneksi Wallet
              </h4>
              <p className="mt-0.5 text-[11px] text-[#5C5953] dark:text-[#A6A198]">
                Domain peminta{' '}
                <span className="font-mono font-semibold text-[#1F1E1B] dark:text-[#F2EFE9]">
                  {requestingOrigin}
                </span>{' '}
                meminta tanda tangan sesi (0 ETH). Pilih aplikasi wallet resmi di HP atau ekstensi browser.
              </p>
            </div>

            {/* Option 1 (Primary v1): Hubungkan ke Aplikasi Rabby Wallet */}
            <button
              type="button"
              onClick={() => {
                setSelectedMobileWallet(MOBILE_WALLETS[0]);
                setWalletStep('confirm-mobile');
              }}
              className="flex w-full items-center justify-between gap-2.5 rounded-xl border-2 border-[#C86442] bg-[#C86442]/8 p-3 text-left transition-colors hover:bg-[#C86442]/14 cursor-pointer dark:border-[#D97757] dark:bg-[#D97757]/12 dark:hover:bg-[#D97757]/18"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C86442] text-white dark:bg-[#D97757] dark:text-[#191816]">
                  <Smartphone className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-semibold text-[#1F1E1B] dark:text-[#F2EFE9]">
                      Hubungkan ke Aplikasi Rabby Wallet
                    </span>
                    <span className="rounded bg-[#C86442]/18 px-1.5 py-0.5 text-[10px] font-semibold text-[#964226] dark:bg-[#D97757]/25 dark:text-[#F0A48A]">
                      Utama v1
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#5C5953] dark:text-[#A6A198]">
                    Aplikasi HP / WalletConnect (<span className="font-mono">rabby://</span> ·{' '}
                    <span className="font-mono">wc://</span>)
                  </p>
                  <p
                    className={`mt-1 text-[10px] font-medium ${
                      walletWhitelistEnabled && whitelistedWallets.includes('Rabby Wallet')
                        ? 'text-[#256640] dark:text-[#86CFA0]'
                        : 'text-[#964226] dark:text-[#E59377]'
                    }`}
                  >
                    {walletWhitelistEnabled && whitelistedWallets.includes('Rabby Wallet')
                      ? 'Diizinkan oleh Whitelist Anti-Redirect'
                      : 'Diblokir Anti-Redirect — dapat diizinkan 1 ketukan'}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#964226] dark:text-[#E59377]" />
            </button>

            {/* Option 2: Aplikasi Wallet Pihak Ketiga Lainnya (WalletConnect wc://) */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-[#5C5953] dark:text-[#A6A198]">
                Aplikasi Wallet Pihak Ketiga Lainnya (<span className="font-mono">wc://</span>)
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {MOBILE_WALLETS.slice(1).map((wallet) => {
                  const allowed = walletWhitelistEnabled && whitelistedWallets.includes(wallet.name);
                  return (
                    <button
                      key={wallet.name}
                      type="button"
                      onClick={() => {
                        setSelectedMobileWallet(wallet);
                        setWalletStep('confirm-mobile');
                      }}
                      className="flex flex-col items-start gap-1 rounded-lg border border-[#E0DAD0] bg-white p-2 text-left transition-colors hover:border-[#C86442] cursor-pointer dark:border-[#3A3732] dark:bg-[#1B1A18] dark:hover:border-[#D97757]"
                    >
                      <div className="flex w-full items-center justify-between gap-1">
                        <Wallet className="h-3.5 w-3.5 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            allowed ? 'bg-[#2E7D4F] dark:bg-[#86CFA0]' : 'bg-[#B9B2A5] dark:bg-[#5A564F]'
                          }`}
                          title={allowed ? 'Di Whitelist' : 'Belum di Whitelist'}
                        />
                      </div>
                      <span className="text-[11px] font-semibold leading-tight truncate w-full">
                        {wallet.shortLabel}
                      </span>
                      <span className="font-mono text-[9px] text-[#7A746B] truncate w-full">
                        {wallet.scheme}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Option 3: Ekstensi Browser (Mode v2 / Chromium EIP-6963) */}
            <div className="space-y-1.5 border-t border-[#E5E0D6] pt-2.5 dark:border-[#34322C]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5C5953] dark:text-[#A6A198]">
                  <Puzzle className="h-3.5 w-3.5 text-[#7A746B]" />
                  <span>Ekstensi Browser (Mode v2 / Chromium)</span>
                </span>
                <span className="font-mono text-[10px] text-[#7A746B]">
                  {enabledExtensionWallets.length} aktif
                </span>
              </div>

              {enabledExtensionWallets.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedExtWallet(enabledExtensionWallets[0]);
                    setWalletStep('extension');
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#E0DAD0] bg-white px-3 py-2 text-left transition-colors hover:border-[#C86442] cursor-pointer dark:border-[#3A3732] dark:bg-[#1B1A18] dark:hover:border-[#D97757]"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium truncate">
                      {enabledExtensionWallets.join(' · ')}
                    </p>
                    <p className="text-[10px] text-[#7A746B] dark:text-[#9D978E]">
                      Provider EIP-6963 terpasang di mesin Chromium v2
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#7A746B]" />
                </button>
              ) : (
                <p className="rounded-lg border border-dashed border-[#D8D2C5] px-3 py-2 text-[11px] text-[#7A746B] dark:border-[#3A3732]">
                  Belum ada ekstensi wallet aktif. Gunakan Aplikasi HP / WalletConnect di atas atau pasang via ikon Ekstensi.
                </p>
              )}
            </div>
          </div>
        )}

        {popup.kind === 'wallet' && walletStep === 'confirm-mobile' && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                setIsHandingOff(false);
                setWalletStep('choose');
              }}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6C675E] hover:text-[#1F1E1B] cursor-pointer dark:text-[#A6A198] dark:hover:text-[#F2EFE9]"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Pilih metode wallet lain</span>
            </button>

            <div>
              <h4 className="font-editorial text-sm font-semibold">
                Konfirmasi Koneksi ke {selectedMobileWallet.name}
              </h4>
              <p className="mt-1 text-[11px] leading-relaxed text-[#5C5953] dark:text-[#A6A198]">
                Karsa Browser akan meneruskan permintaan tanda tangan (deep-link{' '}
                <span className="font-mono text-[#1F1E1B] dark:text-[#F2EFE9]">
                  {selectedMobileWallet.scheme}
                </span>{' '}
                / <span className="font-mono text-[#1F1E1B] dark:text-[#F2EFE9]">wc://</span>) ke aplikasi
                resmi <strong className="font-semibold text-[#1F1E1B] dark:text-[#F2EFE9]">{selectedMobileWallet.name}</strong> di HP Anda. Tab game tetap aktif tanpa dimuat ulang.
              </p>
            </div>

            {/* Verified Official Target Package & Requesting Domain Card (Anti-Fake Wallet Intent) */}
            <div className="rounded-xl border border-[#2E7D4F]/35 bg-[#2E7D4F]/[0.06] p-2.5 text-[10.5px] space-y-2 dark:border-[#86CFA0]/35 dark:bg-[#86CFA0]/[0.08]">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-semibold text-[#21633D] dark:text-[#86CFA0]">
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
                  <span>Target Paket Resmi Terverifikasi</span>
                </span>
                <span className="font-mono text-[9.5px] text-[#256640] dark:text-[#86CFA0]">
                  Anti-Fake Wallet
                </span>
              </div>

              <div className="rounded-lg border border-[#E5E0D6] bg-white p-2 font-mono text-[10px] space-y-1.5 dark:border-[#383530] dark:bg-[#1A1917]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#7A746B]">Domain Peminta</span>
                  <span
                    className={`truncate font-bold ${
                      urlSecurity.isSuspicious
                        ? 'text-[#B91C1C] dark:text-[#FCA5A5]'
                        : 'text-[#1F1E1B] dark:text-[#F2EFE9]'
                    }`}
                  >
                    {urlSecurity.subdomain && (
                      <span className="font-normal text-[#7A746B]">{urlSecurity.subdomain}</span>
                    )}
                    {urlSecurity.isInternal ? requestingOrigin : urlSecurity.primaryDomain}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#7A746B]">Paket Android Resmi</span>
                  <span className="truncate font-semibold text-[#21633D] dark:text-[#86CFA0]">
                    {selectedMobileWallet.packageName}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#7A746B]">Skema Deep-Link</span>
                  <span className="text-[#256640] dark:text-[#86CFA0]">
                    {selectedMobileWallet.scheme}wc · Explicit Intent
                  </span>
                </div>
                <div className="rounded bg-[#F5F2EC] px-2 py-1 text-[10px] text-[#5C5953] truncate dark:bg-[#24221E] dark:text-[#A6A198]">
                  {DEMO_WC_URI}
                </div>
              </div>
            </div>

            {/* Smart Anti-Redirect Whitelist Check */}
            {!isSelectedMobileWhitelisted && (
              <div className="rounded-lg border border-[#C86442]/40 bg-[#C86442]/10 p-2.5 text-[11px] space-y-2 dark:border-[#D97757]/40 dark:bg-[#D97757]/12">
                <p className="text-[#8E3C21] dark:text-[#F0A48A]">
                  <strong>Anti-Redirect menahan deep-link ini:</strong> {selectedMobileWallet.name} belum
                  diizinkan di Whitelist Aplikasi Wallet Eksternal (ikon gembok 🔒).
                </p>
                <button
                  type="button"
                  onClick={() => onEnableWalletWhitelist(selectedMobileWallet.name)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#C86442] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#B25435] cursor-pointer dark:bg-[#D97757] dark:text-[#191816]"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Izinkan Whitelist {selectedMobileWallet.name}</span>
                </button>
              </div>
            )}

            {/* Primary & Secondary Actions */}
            <div className="space-y-2 pt-0.5">
              <button
                type="button"
                disabled={!isSelectedMobileWhitelisted || isHandingOff}
                onClick={handleTriggerMobileHandoff}
                className={`flex w-full min-h-[38px] items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                  isSelectedMobileWhitelisted && !isHandingOff
                    ? 'bg-[#C86442] text-white hover:bg-[#B25435] cursor-pointer dark:bg-[#D97757] dark:text-[#191816]'
                    : 'bg-[#DDD7CB] text-[#7A746B] cursor-not-allowed dark:bg-[#32302B] dark:text-[#7D7870]'
                }`}
              >
                {isHandingOff ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menunggu tanda tangan di {selectedMobileWallet.name}...</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Buka Aplikasi {selectedMobileWallet.name}</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyUri}
                  className="flex min-h-[34px] items-center justify-center gap-1.5 rounded-lg border border-[#D8D2C5] bg-white px-2.5 py-1.5 text-[11px] font-medium hover:bg-[#F3EFE7] cursor-pointer dark:border-[#3D3A34] dark:bg-[#1B1A18] dark:hover:bg-[#2B2925]"
                >
                  {uriCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#2E7D4F] dark:text-[#86CFA0]" />
                      <span>URI Disalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin URI WalletConnect</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex min-h-[34px] items-center justify-center rounded-lg border border-[#D8D2C5] px-2.5 py-1.5 text-[11px] font-medium hover:bg-black/5 cursor-pointer dark:border-[#3D3A34] dark:hover:bg-white/5"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {popup.kind === 'wallet' && walletStep === 'extension' && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setWalletStep('choose')}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6C675E] hover:text-[#1F1E1B] cursor-pointer dark:text-[#A6A198] dark:hover:text-[#F2EFE9]"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Pilih metode wallet lain</span>
            </button>

            <div>
              <h4 className="font-editorial text-sm font-semibold">
                Tanda Tangan Ekstensi Browser (Mode v2 · EIP-6963)
              </h4>
              <p className="mt-0.5 text-[#5C5953] dark:text-[#A6A198]">
                Aether Frontier meminta akses alamat dompet dan tanda tangan sesi tanpa biaya gas.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {enabledExtensionWallets.map((wallet) => (
                <button
                  key={wallet}
                  type="button"
                  onClick={() => setSelectedExtWallet(wallet)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedExtWallet === wallet
                      ? 'border-[#C86442] bg-[#C86442]/10 text-[#964226] dark:border-[#D97757] dark:text-[#F0A48A]'
                      : 'border-[#E0DAD0] bg-white text-[#4A4741] dark:border-[#3A3732] dark:bg-[#1B1A18] dark:text-[#C5C0B6]'
                  }`}
                >
                  <Wallet className="h-3 w-3 shrink-0" />
                  <span className="truncate">{wallet}</span>
                </button>
              ))}
            </div>

            <div className="rounded-lg border border-[#E5E0D6] bg-white p-2.5 font-mono text-[11px] space-y-1 dark:border-[#383530] dark:bg-[#1A1917]">
              <div className="flex justify-between">
                <span className="text-[#7A746B]">Jaringan</span>
                <span>Arbitrum One (42161)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A746B]">Alamat</span>
                <span>0x71C...94A2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A746B]">Biaya Gas</span>
                <span className="text-[#2E7D4F] dark:text-[#7CD19A]">0 ETH (Sign-In Only)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#D8D2C5] px-3 py-2 text-xs font-medium hover:bg-black/5 dark:border-[#3D3A34] dark:hover:bg-white/5 cursor-pointer"
              >
                Tolak
              </button>
              <button
                type="button"
                onClick={() => onCompleteAuth('wallet', `${selectedExtWallet.split(' ')[0]} · 0x71C...94A2`)}
                className="rounded-lg bg-[#C86442] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#B25435] cursor-pointer dark:bg-[#D97757] dark:text-[#191816]"
              >
                Konfirmasi & Hubungkan
              </button>
            </div>
          </div>
        )}

        {popup.kind === 'oauth-x' && (
          <div className="space-y-3">
            <div>
              <h4 className="font-editorial text-sm font-semibold">
                Otorisasi Akun X (Terkunci di Browser Internal)
              </h4>
              <p className="mt-0.5 text-[#5C5953] dark:text-[#A6A198]">
                Redirect ke aplikasi X Android diblokir otomatis. Anda dapat langsung login memakai Passkey atau membuka di Tab Baru.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block">
                <span className="text-[11px] text-[#6C675E] dark:text-[#A6A198]">Username / Email X</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#DDD7CB] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#C86442] dark:border-[#3D3A34] dark:bg-[#191816]"
                />
              </label>
              <label className="block">
                <span className="text-[11px] text-[#6C675E] dark:text-[#A6A198]">Kata Sandi</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#DDD7CB] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#C86442] dark:border-[#3D3A34] dark:bg-[#191816]"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                setPasskeyVerified(true);
                setUsername('@arief_karsa');
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#D8D2C5] bg-white px-3 py-2 text-xs font-medium hover:bg-[#F3EFE7] cursor-pointer dark:border-[#3D3A34] dark:bg-[#1B1A18] dark:hover:bg-[#2B2925]"
            >
              {passkeyVerified ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2E7D4F] dark:text-[#7CD19A]" />
                  <span>Passkey FIDO2 Terverifikasi (Biometrik)</span>
                </>
              ) : (
                <>
                  <Fingerprint className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
                  <span>Isi Otomatis dengan Passkey / Biometrik</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#D8D2C5] px-3 py-2 text-xs font-medium hover:bg-black/5 dark:border-[#3D3A34] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => onCompleteAuth('oauth-x', username || '@arief_karsa')}
                className="rounded-lg bg-[#1F1E1B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#35332E] cursor-pointer dark:bg-[#F2EFE9] dark:text-[#191816]"
              >
                Otorisasi Aplikasi
              </button>
            </div>
          </div>
        )}

        {popup.kind === 'oauth-discord' && (
          <div className="space-y-3">
            <div>
              <h4 className="font-editorial text-sm font-semibold">
                Otorisasi Discord (Anti-Redirect Aktif)
              </h4>
              <p className="mt-0.5 text-[#5C5953] dark:text-[#A6A198]">
                Aplikasi Discord eksternal dicegah terbuka. Izin hanya membaca profil & status keanggotaan guild.
              </p>
            </div>
            <div className="rounded-lg border border-[#E5E0D6] bg-white p-2.5 text-[11px] space-y-1 dark:border-[#383530] dark:bg-[#1A1917]">
              <p className="font-medium">Akun aktif: karsa.player#4821</p>
              <p className="text-[#6C675E] dark:text-[#A6A198]">
                Izin: identify · guilds.members.read
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#D8D2C5] px-3 py-2 text-xs font-medium hover:bg-black/5 dark:border-[#3D3A34] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => onCompleteAuth('oauth-discord', 'karsa.player')}
                className="rounded-lg bg-[#C86442] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#B25435] cursor-pointer dark:bg-[#D97757] dark:text-[#191816]"
              >
                Izinkan & Kembali ke Game
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Resize Drag Handle (Bottom-Right Corner) */}
      <div
        onPointerDown={startResize}
        onPointerMove={onResize}
        onPointerUp={endResize}
        title="Tarik untuk mengubah ukuran pop-up secara manual"
        className="absolute bottom-0 right-0 flex h-5 w-5 cursor-nwse-resize items-end justify-end p-1 text-[#8D867B] hover:text-[#1F1E1B] dark:hover:text-white"
      >
        <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current">
          <path d="M11 1L1 11h2.5L11 3.5V1zm0 5L6 11h2.5L11 8.5V6z" />
        </svg>
      </div>
    </div>
  );
};
