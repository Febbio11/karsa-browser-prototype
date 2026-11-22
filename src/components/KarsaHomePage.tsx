import React, { useState } from 'react';
import { Plus, X, Globe, Pencil, Check, ChevronDown } from 'lucide-react';
import { HomeShortcut, SearchEngineConfig } from '../types/browser';
import { SearchEngineBadge } from './SearchEngineBadge';

interface KarsaHomePageProps {
  shortcuts: HomeShortcut[];
  activeSearchEngine: SearchEngineConfig;
  onOpenSearchFocus: (openEnginePicker?: boolean) => void;
  onNavigateShortcut: (url: string, label: string) => void;
  onAddShortcut: (label: string, url: string) => void;
  onRemoveShortcut: (id: string) => void;
}

export const KarsaHomePage: React.FC<KarsaHomePageProps> = ({
  shortcuts,
  activeSearchEngine,
  onOpenSearchFocus,
  onNavigateShortcut,
  onAddShortcut,
  onRemoveShortcut,
}) => {
  const [adding, setAdding] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [labelInput, setLabelInput] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const handleSaveShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) return;
    const normalizedUrl = /^https?:\/\//i.test(cleanUrl) ? cleanUrl : `https://${cleanUrl}`;
    let derivedLabel = labelInput.trim();
    if (!derivedLabel) {
      try {
        derivedLabel = new URL(normalizedUrl).hostname.replace(/^www\./i, '').split('.')[0];
        derivedLabel = derivedLabel.charAt(0).toUpperCase() + derivedLabel.slice(1);
      } catch {
        derivedLabel = 'Pintasan';
      }
    }
    onAddShortcut(derivedLabel, normalizedUrl);
    setLabelInput('');
    setUrlInput('');
    setAdding(false);
  };

  return (
    <div className="thin-scrollbar flex h-full w-full flex-col items-center overflow-y-auto bg-[#FAF8F4] px-5 py-10 text-[#1F1E1B] dark:bg-[#1C1B19] dark:text-[#F2EFE9]">
      <div className="my-auto flex w-full max-w-[360px] flex-col items-center space-y-7">
        {/* Original Karsa Editorial Serif Wordmark */}
        <div className="text-center space-y-1">
          <h1 className="font-editorial text-4xl font-semibold tracking-tight text-[#1F1E1B] sm:text-[44px] dark:text-[#F2EFE9]">
            Karsa
          </h1>
          <p className="text-[11px] text-[#7A746B] dark:text-[#9D978E]">
            Mode Mobile · Cepat, tenang &amp; bebas gangguan
          </p>
        </div>

        {/* Quick Search Bar Trigger -> Opens Focused Address/Paste Overlay */}
        <div className="flex h-12 w-full items-center gap-1.5 rounded-full border border-[#DFD9CE] bg-white pl-2 pr-4 shadow-[0_2px_10px_rgba(31,30,27,0.04)] transition-colors hover:border-[#C86442]/60 dark:border-[#34322C] dark:bg-[#23221F] dark:hover:border-[#D97757]/60">
          <button
            type="button"
            onClick={() => onOpenSearchFocus(true)}
            title={`Ganti mesin pencari (aktif: ${activeSearchEngine.name})`}
            aria-label={`Ganti mesin pencari, aktif ${activeSearchEngine.name}`}
            className="flex h-8 shrink-0 items-center gap-0.5 rounded-full pl-1 pr-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
          >
            <SearchEngineBadge engineId={activeSearchEngine.id} size="sm" />
            <ChevronDown className="h-3 w-3 text-[#8E887E]" />
          </button>
          <button
            type="button"
            onClick={() => onOpenSearchFocus(false)}
            className="min-w-0 flex-1 py-2 text-left text-sm text-[#7A746B] truncate cursor-text dark:text-[#9D978E]"
          >
            Telusuri {activeSearchEngine.id === 'custom' ? activeSearchEngine.name : activeSearchEngine.name} atau tempel URL...
          </button>
        </div>

        {/* 4-Column Quick Shortcuts Grid */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-medium text-[#7A746B] dark:text-[#9D978E]">
              Pintasan Cepat
            </span>
            {shortcuts.length > 0 && (
              <button
                type="button"
                onClick={() => setEditMode((v) => !v)}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-[#7A746B] hover:bg-black/5 hover:text-[#1F1E1B] cursor-pointer dark:text-[#9D978E] dark:hover:bg-white/10 dark:hover:text-[#F2EFE9]"
              >
                {editMode ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Selesai</span>
                  </>
                ) : (
                  <>
                    <Pencil className="h-3 w-3" />
                    <span>Atur</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {shortcuts.map((item) => (
              <div key={item.id} className="relative flex flex-col items-center">
                {editMode && (
                  <button
                    type="button"
                    onClick={() => onRemoveShortcut(item.id)}
                    aria-label={`Hapus pintasan ${item.label}`}
                    className="absolute -right-0.5 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#1F1E1B] text-white shadow hover:bg-[#C86442] cursor-pointer dark:bg-[#F2EFE9] dark:text-[#191816]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => !editMode && onNavigateShortcut(item.url, item.label)}
                  className="group flex w-full flex-col items-center gap-1.5 rounded-xl p-1.5 transition-colors hover:bg-black/[0.035] cursor-pointer dark:hover:bg-white/[0.04]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E5E0D6] bg-white font-editorial text-base font-semibold text-[#1F1E1B] shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-transform group-hover:scale-[1.03] dark:border-[#34322C] dark:bg-[#242320] dark:text-[#F2EFE9]">
                    {item.badge}
                  </span>
                  <span className="w-full truncate text-center text-[11px] font-medium text-[#4A4741] dark:text-[#D4CEC3]">
                    {item.label}
                  </span>
                </button>
              </div>
            ))}

            {/* + Tambah Shortcut Tile */}
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setAdding(true);
              }}
              className="group flex w-full flex-col items-center gap-1.5 rounded-xl p-1.5 transition-colors hover:bg-black/[0.035] cursor-pointer dark:hover:bg-white/[0.04]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-[#CFC9BC] bg-transparent text-[#6C675E] transition-colors group-hover:border-[#C86442] group-hover:text-[#C86442] dark:border-[#3E3B35] dark:text-[#9D978E] dark:group-hover:border-[#D97757] dark:group-hover:text-[#D97757]">
                <Plus className="h-5 w-5" />
              </span>
              <span className="w-full truncate text-center text-[11px] font-medium text-[#6C675E] dark:text-[#9D978E]">
                Tambah
              </span>
            </button>
          </div>

          {/* Inline Add Shortcut Form */}
          {adding && (
            <form
              onSubmit={handleSaveShortcut}
              className="mt-2 rounded-2xl border border-[#DFD9CE] bg-white p-3.5 shadow-sm space-y-2.5 dark:border-[#34322C] dark:bg-[#23221F]"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <Globe className="h-3.5 w-3.5 text-[#C86442] dark:text-[#D97757]" />
                  <span>Tambah Pintasan Cepat</span>
                </span>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  aria-label="Tutup form pintasan"
                  className="rounded-md p-1 text-[#7A746B] hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="Nama situs (opsional, misal: GitHub)"
                className="w-full rounded-lg border border-[#DDD7CB] bg-[#FAF8F4] px-3 py-2 text-xs outline-none focus:border-[#C86442] dark:border-[#3A3732] dark:bg-[#191816] dark:focus:border-[#D97757]"
              />
              <input
                type="text"
                required
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="URL situs (misal: github.com)"
                className="w-full rounded-lg border border-[#DDD7CB] bg-[#FAF8F4] px-3 py-2 font-mono text-xs outline-none focus:border-[#C86442] dark:border-[#3A3732] dark:bg-[#191816] dark:focus:border-[#D97757]"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="rounded-lg border border-[#DDD7CB] px-3 py-1.5 text-xs font-medium text-[#5C5953] hover:bg-black/5 cursor-pointer dark:border-[#3A3732] dark:text-[#A6A198]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#1F1E1B] px-3.5 py-1.5 text-xs font-semibold text-[#FAF8F4] hover:bg-[#35332E] cursor-pointer dark:bg-[#D97757] dark:text-[#181715]"
                >
                  Simpan
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
