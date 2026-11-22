import React, { useMemo } from 'react';
import {
  Share2,
  Copy,
  Check,
  Pencil,
  ClipboardPaste,
  Search,
  Globe,
  ArrowUpRight,
  ArrowUpLeft,
  Bookmark,
  Clock,
  SlidersHorizontal,
} from 'lucide-react';
import {
  BookmarkItem,
  BrowserTab,
  HistoryItem,
  SearchEngineConfig,
  SearchEngineId,
} from '../types/browser';
import { SearchEngineBadge } from './SearchEngineBadge';

interface AddressBarOverlayProps {
  open: boolean;
  searchDraft: string;
  activeTab: BrowserTab;
  clipboardUrl: string;
  copiedFeedback: boolean;
  bookmarks: BookmarkItem[];
  history: HistoryItem[];
  activeSearchEngine: SearchEngineConfig;
  searchEngines: SearchEngineConfig[];
  enginePickerOpen: boolean;
  searchSuggestionsEnabled: boolean;
  onCancel: () => void;
  onNavigate: (rawInput: string, explicitTitle?: string) => void;
  onFillSearchDraft: (value: string) => void;
  onSelectSearchEngine: (id: SearchEngineId) => void;
  onOpenCustomEngineSettings: () => void;
  onPasteOnly: () => void;
  onPasteAndGo: () => void;
  onShareCurrent: () => void;
  onCopyCurrent: () => void;
  onEditCurrentUrl: () => void;
}

interface SuggestionItem {
  id: string;
  text: string;
  subtitle?: string;
  isDomain?: boolean;
  url?: string;
}

const KNOWN_DOMAINS: { domain: string; label: string; keywords: string[] }[] = [
  { domain: 'google.com', label: 'Google', keywords: ['google', 'goo', 'search'] },
  { domain: 'x.com', label: 'X (Twitter)', keywords: ['x.com', 'twitter', 'twi', 'x'] },
  { domain: 'youtube.com', label: 'YouTube', keywords: ['youtube', 'you', 'yt', 'video'] },
  { domain: 'github.com', label: 'GitHub', keywords: ['github', 'git', 'repo', 'code'] },
  { domain: 'rabby.io', label: 'Rabby Wallet', keywords: ['rabby', 'wallet', 'web3'] },
  { domain: 'coingecko.com', label: 'CoinGecko', keywords: ['coin', 'coingecko', 'crypto', 'harga'] },
  { domain: 'defillama.com', label: 'DefiLlama', keywords: ['defi', 'llama', 'tvl', 'crypto'] },
  {
    domain: 'play.aetherfrontier.gg',
    label: 'Aether Frontier — Web3 Arena',
    keywords: ['aether', 'game', 'play', 'web3', 'arena'],
  },
  { domain: 'discord.com', label: 'Discord', keywords: ['discord', 'disc', 'chat'] },
  { domain: 'wikipedia.org', label: 'Wikipedia', keywords: ['wiki', 'wikipedia'] },
];

const TOPIC_SUGGESTIONS: { match: string[]; suggestions: string[] }[] = [
  {
    match: ['web3', 'wallet', 'rabby', 'metamask', 'crypto', 'eth', 'btc', 'sol', 'defi'],
    suggestions: [
      'walletconnect mobile android',
      'rabby wallet extension chrome',
      'harga ethereum hari ini',
      'airdrop web3 terbaru 2026',
      'gas fee arbitrum tracker',
    ],
  },
  {
    match: ['game', 'aether', 'fps', 'webgl', 'play', 'steam'],
    suggestions: [
      'game web3 browser ringan android',
      'webgl 60fps optimization mobile',
      'aether frontier guide pemula',
      'setting dpi browser gaming android',
    ],
  },
  {
    match: ['karsa', 'browser', 'android', 'chrome', 'brave', 'duck'],
    suggestions: [
      'karsa browser android apk',
      'cara pasang ekstensi chrome di android',
      'mode desktop browser android tanpa reload',
      'perbandingan brave search vs duckduckgo',
    ],
  },
  {
    match: ['berita', 'cuaca', 'kurs', 'translate', 'terjemah', 'belajar', 'cara'],
    suggestions: [
      'berita teknologi hari ini',
      'kurs dollar rupiah terbaru',
      'cuaca hari ini',
      'cara membersihkan cache situs tertentu',
    ],
  },
];

function buildSmartSuggestions(rawQuery: string, engineName: string): SuggestionItem[] {
  const q = rawQuery.trim();
  if (!q) return [];
  const lower = q.toLowerCase();
  const results: SuggestionItem[] = [];
  const seen = new Set<string>([lower]);

  // 1. Domain matches (fast URL autocomplete)
  for (const site of KNOWN_DOMAINS) {
    const matched =
      site.domain.startsWith(lower) ||
      site.label.toLowerCase().startsWith(lower) ||
      site.keywords.some((kw) => kw.startsWith(lower) || (lower.length >= 3 && kw.includes(lower)));
    if (matched && !seen.has(site.domain)) {
      seen.add(site.domain);
      results.push({
        id: `dom-${site.domain}`,
        text: site.domain,
        subtitle: `${site.label} · Kunjungi situs`,
        isDomain: true,
        url: `https://${site.domain}`,
      });
      if (results.length >= 2) break;
    }
  }

  // 2. Topic-matched curated suggestions
  for (const group of TOPIC_SUGGESTIONS) {
    if (group.match.some((m) => lower.includes(m) || m.startsWith(lower))) {
      for (const s of group.suggestions) {
        if (!seen.has(s.toLowerCase()) && (s.toLowerCase().includes(lower) || results.length < 4)) {
          seen.add(s.toLowerCase());
          results.push({
            id: `topic-${s}`,
            text: s,
            subtitle: `Saran ${engineName}`,
          });
        }
        if (results.length >= 5) break;
      }
    }
    if (results.length >= 5) break;
  }

  // 3. Dynamic query completions for any arbitrary text
  const looksLikeDomain = q.includes('.') && !q.includes(' ');
  const dynamicSuffixes = looksLikeDomain
    ? [`${q}/login`, `${q} alternatif`, `${q} review`]
    : [`${q} terbaru`, `${q} tutorial lengkap`, `${q} resmi`, `${q} download`];

  for (const candidate of dynamicSuffixes) {
    if (results.length >= 5) break;
    const key = candidate.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      results.push({
        id: `dyn-${key}`,
        text: candidate,
        subtitle: `Saran ${engineName}`,
      });
    }
  }

  return results.slice(0, 5);
}

export const AddressBarOverlay: React.FC<AddressBarOverlayProps> = ({
  open,
  searchDraft,
  activeTab,
  clipboardUrl,
  copiedFeedback,
  bookmarks,
  history,
  activeSearchEngine,
  searchEngines,
  enginePickerOpen,
  searchSuggestionsEnabled,
  onCancel,
  onNavigate,
  onFillSearchDraft,
  onSelectSearchEngine,
  onOpenCustomEngineSettings,
  onPasteOnly,
  onPasteAndGo,
  onShareCurrent,
  onCopyCurrent,
  onEditCurrentUrl,
}) => {
  const trimmed = searchDraft.trim();
  const isEmpty = trimmed.length === 0;
  const looksLikeUrl =
    /^https?:\/\//i.test(trimmed) ||
    /^karsa:\/\//i.test(trimmed) ||
    (trimmed.includes('.') && !trimmed.includes(' '));

  const matchingBookmarks = useMemo(() => {
    if (!trimmed) return bookmarks.slice(0, 4);
    const q = trimmed.toLowerCase();
    return bookmarks
      .filter(
        (b) =>
          b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q)
      )
      .slice(0, 3);
  }, [bookmarks, trimmed]);

  const matchingHistory = useMemo(() => {
    const bmUrls = new Set(matchingBookmarks.map((b) => b.url));
    const filtered = trimmed
      ? history.filter((h) => {
          const q = trimmed.toLowerCase();
          return (
            !bmUrls.has(h.url) &&
            (h.title.toLowerCase().includes(q) || h.url.toLowerCase().includes(q))
          );
        })
      : history.filter((h) => !bmUrls.has(h.url));

    // Deduplicate history by URL preserving newest
    const seen = new Set<string>();
    const deduped: HistoryItem[] = [];
    for (const item of filtered) {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        deduped.push(item);
      }
      if (deduped.length >= (trimmed ? 3 : 4)) break;
    }
    return deduped;
  }, [history, matchingBookmarks, trimmed]);

  const engineSuggestions = useMemo(() => {
    if (!searchSuggestionsEnabled || isEmpty) return [];
    return buildSmartSuggestions(trimmed, activeSearchEngine.name);
  }, [searchSuggestionsEnabled, isEmpty, trimmed, activeSearchEngine.name]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-35 flex flex-col">
      {/* Main Dropdown Card directly below the focused Address Bar */}
      <div className="relative z-10 max-h-[84%] overflow-y-auto thin-scrollbar border-b border-[#DFD9CE] bg-[#FAF8F4] text-[#1F1E1B] shadow-2xl dark:border-[#36342E] dark:bg-[#201F1C] dark:text-[#F2EFE9]">
        {/* 0. QUICK SEARCH ENGINE SWITCHER (Toggled by tapping the active engine icon in the search bar) */}
        {enginePickerOpen && (
          <div className="border-b border-[#E5E0D6] bg-[#F5F1E9] p-3 dark:border-[#312F2A] dark:bg-[#191816]">
            <div className="mb-2 flex items-center justify-between px-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7A746B] dark:text-[#9D978E]">
                Ganti Cepat Mesin Pencari
              </p>
              <button
                type="button"
                onClick={onOpenCustomEngineSettings}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-[#8E3C21] hover:bg-[#C86442]/10 cursor-pointer dark:text-[#E59377]"
              >
                <SlidersHorizontal className="h-3 w-3" />
                <span>Atur URL Kustom</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {searchEngines.map((eng) => {
                const isSelected = eng.id === activeSearchEngine.id;
                return (
                  <button
                    key={eng.id}
                    type="button"
                    onClick={() => onSelectSearchEngine(eng.id)}
                    className={`flex min-h-[38px] items-center justify-between gap-2 rounded-xl border px-2.5 py-1.5 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[#C86442] bg-white shadow-xs dark:border-[#D97757] dark:bg-[#252320]'
                        : 'border-[#E2DCD0] bg-white/75 hover:bg-white dark:border-[#302E29] dark:bg-[#21201D] dark:hover:bg-[#282622]'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <SearchEngineBadge engineId={eng.id} size="sm" />
                      <span className="text-[11px] font-medium truncate">
                        {eng.id === 'custom' ? 'Kustom' : eng.name}
                      </span>
                    </span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 1. CURRENT PAGE CARD (Chrome/Brave Mobile Style) — shown when input is empty on a web page */}
        {isEmpty && (activeTab.type !== 'home' || clipboardUrl) && (
          <div className="border-b border-[#E7E2D8] p-3 dark:border-[#312F2A]">
            {activeTab.type !== 'home' && (
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
            )}

            {/* Quick Clipboard Paste & Go Chip */}
            {clipboardUrl && (
              <div
                className={`${
                  activeTab.type !== 'home' ? 'mt-2' : ''
                } flex items-center justify-between gap-2 rounded-xl border border-[#C86442]/35 bg-[#C86442]/[0.06] px-3 py-2 dark:border-[#D97757]/35 dark:bg-[#D97757]/10`}
              >
                <button
                  type="button"
                  onClick={onPasteAndGo}
                  className="flex flex-1 min-w-0 items-center gap-2.5 text-left cursor-pointer"
                >
                  <ClipboardPaste className="h-4 w-4 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[#8E3C21] dark:text-[#F2A68C]">
                      Tempel &amp; Buka tautan dari papan klip
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

        {/* 2. ACTIVE TYPING PRIMARY ACTION ROW */}
        {!isEmpty && (
          <div className="border-b border-[#E7E2D8] p-2 dark:border-[#312F2A]">
            <button
              type="button"
              onClick={() => onNavigate(trimmed)}
              className="flex min-h-[42px] w-full items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06] cursor-pointer"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                {looksLikeUrl ? (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C86442]/12 text-[#C86442] dark:bg-[#D97757]/20 dark:text-[#E59377]">
                    <Globe className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  <SearchEngineBadge engineId={activeSearchEngine.id} size="sm" />
                )}
                <span className="min-w-0">
                  <span className="block text-xs font-semibold truncate">{trimmed}</span>
                  <span className="block text-[10px] text-[#6C675E] truncate dark:text-[#9D978E]">
                    {looksLikeUrl
                      ? 'Buka alamat ini langsung di tab aktif'
                      : `Telusuri dengan ${activeSearchEngine.name}`}
                  </span>
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-[#8E887E]" />
            </button>
          </div>
        )}

        {/* 3. SMART AUTOCOMPLETE: MATCHING BOOKMARKS & HISTORY */}
        {(matchingBookmarks.length > 0 || matchingHistory.length > 0) && (
          <div className="border-b border-[#E7E2D8] p-2 dark:border-[#312F2A]">
            <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#7A746B] dark:text-[#9D978E]">
              {isEmpty ? 'Bookmark & Riwayat Terbaru' : 'Dari Riwayat & Bookmark'}
            </p>
            <div className="space-y-0.5">
              {matchingBookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="flex min-h-[40px] items-center gap-1 rounded-xl transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
                >
                  <button
                    type="button"
                    onClick={() => onNavigate(bm.url, bm.title)}
                    className="flex flex-1 min-w-0 items-center gap-2.5 px-2.5 py-1.5 text-left cursor-pointer"
                  >
                    <Bookmark
                      className="h-3.5 w-3.5 shrink-0 text-[#1F1E1B] dark:text-[#F2EFE9]"
                      fill="currentColor"
                    />
                    <span className="min-w-0">
                      <span className="block text-xs font-medium truncate">{bm.title}</span>
                      <span className="block font-mono text-[10px] text-[#7A746B] truncate dark:text-[#9D978E]">
                        {bm.url.replace(/^https?:\/\//, '')}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onFillSearchDraft(bm.url.replace(/^https?:\/\//, ''))}
                    title="Masukkan ke kolom pencarian"
                    aria-label={`Masukkan ${bm.title} ke kolom pencarian`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#8E887E] hover:bg-black/5 hover:text-[#1F1E1B] dark:hover:bg-white/10 dark:hover:text-white cursor-pointer"
                  >
                    <ArrowUpLeft className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {matchingHistory.map((h) => (
                <div
                  key={h.id}
                  className="flex min-h-[40px] items-center gap-1 rounded-xl transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
                >
                  <button
                    type="button"
                    onClick={() => onNavigate(h.url, h.title)}
                    className="flex flex-1 min-w-0 items-center gap-2.5 px-2.5 py-1.5 text-left cursor-pointer"
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0 text-[#7A746B] dark:text-[#9D978E]" />
                    <span className="min-w-0">
                      <span className="block text-xs font-medium truncate">{h.title}</span>
                      <span className="block font-mono text-[10px] text-[#7A746B] truncate dark:text-[#9D978E]">
                        {h.url.replace(/^https?:\/\//, '')} · {h.visitedAt}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onFillSearchDraft(h.url.replace(/^https?:\/\//, ''))}
                    title="Masukkan ke kolom pencarian"
                    aria-label={`Masukkan ${h.title} ke kolom pencarian`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#8E887E] hover:bg-black/5 hover:text-[#1F1E1B] dark:hover:bg-white/10 dark:hover:text-white cursor-pointer"
                  >
                    <ArrowUpLeft className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. LIVE AUTOCOMPLETE SUGGESTIONS FROM ACTIVE SEARCH ENGINE */}
        {!isEmpty && engineSuggestions.length > 0 && (
          <div className="p-2">
            <div className="flex items-center justify-between px-2.5 py-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7A746B] dark:text-[#9D978E]">
                Saran Pencarian · {activeSearchEngine.name}
              </p>
            </div>
            <div className="space-y-0.5">
              {engineSuggestions.map((sug) => {
                const lowerSug = sug.text.toLowerCase();
                const lowerQuery = trimmed.toLowerCase();
                const matchIndex = lowerSug.indexOf(lowerQuery);

                return (
                  <div
                    key={sug.id}
                    className="flex min-h-[40px] items-center gap-1 rounded-xl transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
                  >
                    <button
                      type="button"
                      onClick={() => onNavigate(sug.url || sug.text)}
                      className="flex flex-1 min-w-0 items-center gap-2.5 px-2.5 py-1.5 text-left cursor-pointer"
                    >
                      {sug.isDomain ? (
                        <Globe className="h-3.5 w-3.5 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                      ) : (
                        <Search className="h-3.5 w-3.5 shrink-0 text-[#7A746B] dark:text-[#9D978E]" />
                      )}
                      <span className="min-w-0">
                        <span className="block text-xs truncate">
                          {matchIndex >= 0 ? (
                            <>
                              <span className="text-[#5C5953] dark:text-[#BDB7AC]">
                                {sug.text.slice(0, matchIndex)}
                              </span>
                              <span className="font-semibold text-[#1F1E1B] dark:text-[#F2EFE9]">
                                {sug.text.slice(matchIndex, matchIndex + trimmed.length)}
                              </span>
                              <span className="text-[#5C5953] dark:text-[#BDB7AC]">
                                {sug.text.slice(matchIndex + trimmed.length)}
                              </span>
                            </>
                          ) : (
                            <span className="font-medium">{sug.text}</span>
                          )}
                        </span>
                        {sug.subtitle && (
                          <span className="block text-[10px] text-[#7A746B] truncate dark:text-[#9D978E]">
                            {sug.subtitle}
                          </span>
                        )}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onFillSearchDraft(sug.text)}
                      title="Lengkapi di kolom pencarian"
                      aria-label={`Isi "${sug.text}" ke kolom pencarian`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#8E887E] hover:bg-black/5 hover:text-[#1F1E1B] dark:hover:bg-white/10 dark:hover:text-white cursor-pointer"
                    >
                      <ArrowUpLeft className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Subtle hint bar confirming engine & zero-reload cancel */}
        <div className="flex items-center justify-between gap-2 border-t border-[#EAE5DC] bg-[#F3EFE7]/80 px-3.5 py-1.5 text-[10px] text-[#6C675E] dark:border-[#2E2C27] dark:bg-[#1A1917] dark:text-[#9D978E]">
          <span className="truncate">
            Ketuk ikon mesin pencari di kiri kolom untuk ganti cepat · <strong>←</strong> batal tanpa reload.
          </span>
        </div>
      </div>

      {/* Click-outside dimmed backdrop to cancel focus mode without reloading active page */}
      <div
        className="flex-1 bg-black/40 backdrop-blur-[1.5px] cursor-pointer"
        onClick={onCancel}
        aria-label="Batal dan kembali ke halaman aktif"
      />
    </div>
  );
};
