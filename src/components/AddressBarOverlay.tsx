import React from 'react';
import {
  Share2,
  Copy,
  Check,
  Pencil,
  ClipboardPaste,
  Search,
  Globe,
  ArrowUpRight,
  Bookmark,
} from 'lucide-react';
import { BookmarkItem, BrowserTab } from '../types/browser';

interface AddressBarOverlayProps {
  open: boolean;
  searchDraft: string;
  activeTab: BrowserTab;
  clipboardUrl: string;
  copiedFeedback: boolean;
  bookmarks: BookmarkItem[];
  onCancel: () => void;
  onNavigate: (rawInput: string) => void;
  onPasteOnly: () => void;
  onPasteAndGo: () => void;
  onShareCurrent: () => void;
  onCopyCurrent: () => void;
  onEditCurrentUrl: () => void;
}

export const AddressBarOverlay: React.FC<AddressBarOverlayProps> = ({
  open,
  searchDraft,
  activeTab,
  clipboardUrl,
  copiedFeedback,
  bookmarks,
  onCancel,
  onNavigate,
  onPasteOnly,
  onPasteAndGo,
  onShareCurrent,
  onCopyCurrent,
  onEditCurrentUrl,
}) => {
  if (!open) return null;

  const trimmed = searchDraft.trim();
  const isEmpty = trimmed.length === 0;
  const looksLikeUrl =
    /^https?:\/\//i.test(trimmed) ||
    /^karsa:\/\//i.test(trimmed) ||
    (trimmed.includes('.') && !trimmed.includes(' '));

  const matchingBookmarks = trimmed
    ? bookmarks.filter(
        (b) =>
          b.title.toLowerCase().includes(trimmed.toLowerCase()) ||
          b.url.toLowerCase().includes(trimmed.toLowerCase())
      )
    : bookmarks;

  return (
    <div className="absolute inset-0 z-35 flex flex-col">
      {/* Main Dropdown Card directly below the focused Address Bar */}
      <div className="relative z-10 max-h-[82%] overflow-y-auto thin-scrollbar border-b border-[#DFD9CE] bg-[#FAF8F4] text-[#1F1E1B] shadow-2xl dark:border-[#36342E] dark:bg-[#201F1C] dark:text-[#F2EFE9]">
        {/* 1. CURRENT PAGE CARD (Chrome/Brave Mobile Style) — shown when input is empty */}
        {isEmpty && (
          <div className="border-b border-[#E7E2D8] p-3 dark:border-[#312F2A]">
            <div className="flex items-center justify-between gap-2 rounded-xl border border-[#E5E0D6] bg-white px-3 py-2.5 dark:border-[#34322C] dark:bg-[#191816]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFECE6] font-mono text-[11px] font-bold text-[#8E3C21] dark:bg-[#2E2C27] dark:text-[#E59377]">
                  {activeTab.faviconLabel}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{activeTab.title}</p>
                  <p className="font-mono text-[10px] text-[#6C675E] truncate dark:text-[#9D978E]">
                    {activeTab.url}
                  </p>
                </div>
              </div>

              {/* 3 Quick Action Icon Buttons: Share, Copy, Edit (Pencil) */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={onShareCurrent}
                  title="Bagikan tautan halaman ini"
                  aria-label="Bagikan URL"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#5C5953] transition-colors hover:bg-black/5 hover:text-[#1F1E1B] dark:text-[#A6A198] dark:hover:bg-white/10 dark:hover:text-white cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={onCopyCurrent}
                  title="Salin URL halaman ini"
                  aria-label="Salin URL"
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                    copiedFeedback
                      ? 'bg-[#3A7D54]/15 text-[#256640] dark:text-[#86CFA0]'
                      : 'text-[#5C5953] hover:bg-black/5 hover:text-[#1F1E1B] dark:text-[#A6A198] dark:hover:bg-white/10 dark:hover:text-white'
                  }`}
                >
                  {copiedFeedback ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={onEditCurrentUrl}
                  title="Edit URL halaman saat ini"
                  aria-label="Edit URL"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#C86442] transition-colors hover:bg-[#C86442]/12 dark:text-[#E59377] dark:hover:bg-[#D97757]/15 cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Clipboard Paste & Go Chip */}
            {clipboardUrl && (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-[#C86442]/35 bg-[#C86442]/[0.06] px-3 py-2 dark:border-[#D97757]/35 dark:bg-[#D97757]/10">
                <button
                  type="button"
                  onClick={onPasteAndGo}
                  className="flex flex-1 min-w-0 items-center gap-2.5 text-left cursor-pointer"
                >
                  <ClipboardPaste className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[#8E3C21] dark:text-[#F2A68C]">
                      Tempel & Buka tautan dari papan klip
                    </p>
                    <p className="font-mono text-[10px] text-[#5C5953] truncate dark:text-[#BDB7AC]">
                      {clipboardUrl}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onPasteOnly}
                  className="shrink-0 rounded-lg border border-[#C86442]/40 bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#964226] hover:bg-[#F5EFE6] cursor-pointer dark:border-[#D97757]/40 dark:bg-[#191816] dark:text-[#F2A68C]"
                >
                  Tempel
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. ACTIVE TYPING ACTION ROW */}
        {!isEmpty && (
          <div className="border-b border-[#E7E2D8] p-2 dark:border-[#312F2A]">
            <button
              type="button"
              onClick={() => onNavigate(trimmed)}
              className="flex min-h-[42px] w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06] cursor-pointer"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                {looksLikeUrl ? (
                  <Globe className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                ) : (
                  <Search className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                )}
                <span className="min-w-0">
                  <span className="block text-xs font-medium truncate">{trimmed}</span>
                  <span className="block text-[10px] text-[#6C675E] dark:text-[#9D978E]">
                    {looksLikeUrl
                      ? 'Buka alamat ini di tab aktif'
                      : 'Telusuri dengan mesin pencari di tab aktif'}
                  </span>
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-[#8E887E]" />
            </button>
          </div>
        )}

        {/* 3. QUICK BOOKMARKS / SUGGESTIONS */}
        {matchingBookmarks.length > 0 && (
          <div className="p-2">
            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#7A746B] dark:text-[#9D978E]">
              {isEmpty ? 'Akses Cepat & Bookmark' : 'Cocok dari Bookmark'}
            </p>
            <div className="space-y-0.5">
              {matchingBookmarks.map((bm) => (
                <button
                  key={bm.id}
                  type="button"
                  onClick={() => onNavigate(bm.url)}
                  className="flex min-h-[40px] w-full items-center justify-between gap-3 rounded-xl px-3 py-1.5 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Bookmark className="h-3.5 w-3.5 shrink-0 text-[#7A746B] dark:text-[#9D978E]" />
                    <span className="min-w-0">
                      <span className="block text-xs font-medium truncate">{bm.title}</span>
                      <span className="block font-mono text-[10px] text-[#7A746B] truncate dark:text-[#9D978E]">
                        {bm.url}
                      </span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#8E887E]" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subtle hint bar confirming cancel preserves game state */}
        <div className="border-t border-[#EAE5DC] bg-[#F3EFE7]/80 px-4 py-1.5 text-[10px] text-[#6C675E] dark:border-[#2E2C27] dark:bg-[#1A1917] dark:text-[#9D978E]">
          Ketuk <strong>←</strong> atau area gelap di bawah untuk batal — halaman/game aktif tetap berjalan tanpa muat ulang.
        </div>
      </div>

      {/* Click-outside dimmed backdrop to cancel focus mode without reloading active game */}
      <div
        className="flex-1 bg-black/40 backdrop-blur-[1.5px] cursor-pointer"
        onClick={onCancel}
        aria-label="Batal dan kembali ke halaman aktif"
      />
    </div>
  );
};
