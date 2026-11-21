import React, { useMemo, useRef, useState } from 'react';
import {
  Crosshair,
  Terminal as TerminalIcon,
  Network,
  Database,
  Activity,
  Minimize2,
  Maximize2,
  ExternalLink,
  X,
  Copy,
  Check,
  Trash2,
  ClipboardPaste,
  Play,
  ArrowLeft,
  Plus,
  Move,
  PanelBottom,
  Type,
} from 'lucide-react';
import {
  DeviceOrientation,
  DevToolsLayoutMode,
  DevToolsTab,
  InspectableElement,
  NetworkRequestEntry,
  RenderConfig,
  StorageKeyValue,
  TerminalEntry,
} from '../types/browser';

interface MobileDevToolsProps {
  open: boolean;
  minimized: boolean;
  layoutMode: DevToolsLayoutMode;
  orientation: DeviceOrientation;
  activeTab: DevToolsTab;
  touchInspectActive: boolean;
  inspectedElement: InspectableElement;
  consoleEntries: TerminalEntry[];
  networkEntries: NetworkRequestEntry[];
  storageItems: StorageKeyValue[];
  perfOverlayEnabled: boolean;
  liveFps: number;
  totalRamMb: number;
  renderConfig: RenderConfig;
  onSelectTab: (tab: DevToolsTab) => void;
  onChangeLayout: (mode: DevToolsLayoutMode) => void;
  onToggleMinimize: () => void;
  onClose: () => void;
  onToggleTouchInspect: () => void;
  onUpdateElementStyle: (prop: keyof InspectableElement['styles'], value: string) => void;
  onRunConsoleCommand: (cmd: string) => void;
  onClearConsole: () => void;
  onClearNetwork: () => void;
  onAddStorageItem: (item: Omit<StorageKeyValue, 'id'>) => void;
  onUpdateStorageValue: (id: string, value: string) => void;
  onDeleteStorageItem: (id: string) => void;
  onTogglePerfOverlay: () => void;
}

const SHORTCUT_TOKENS = [
  { label: '{ }', insert: '{}' },
  { label: '( )', insert: '()' },
  { label: ';', insert: ';' },
  { label: '=', insert: ' = ' },
  { label: '=>', insert: ' => ' },
  { label: 'Tab', insert: '  ' },
];

export const MobileDevTools: React.FC<MobileDevToolsProps> = ({
  open,
  minimized,
  layoutMode,
  orientation,
  activeTab,
  touchInspectActive,
  inspectedElement,
  consoleEntries,
  networkEntries,
  storageItems,
  perfOverlayEnabled,
  liveFps,
  totalRamMb,
  renderConfig,
  onSelectTab,
  onChangeLayout,
  onToggleMinimize,
  onClose,
  onToggleTouchInspect,
  onUpdateElementStyle,
  onRunConsoleCommand,
  onClearConsole,
  onClearNetwork,
  onAddStorageItem,
  onUpdateStorageValue,
  onDeleteStorageItem,
  onTogglePerfOverlay,
}) => {
  const [fontSize, setFontSize] = useState<number>(12);
  const [consoleFilter, setConsoleFilter] = useState<'all' | 'log' | 'warn' | 'error'>('all');
  const [consoleInput, setConsoleInput] = useState('');
  const [keyboardBarVisible, setKeyboardBarVisible] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const [storageStore, setStorageStore] = useState<StorageKeyValue['store']>('localStorage');
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');
  const [editingStorageId, setEditingStorageId] = useState<string | null>(null);
  const [editingStorageVal, setEditingStorageVal] = useState('');

  // Floating window geometry
  const [floatPos, setFloatPos] = useState({ x: 14, y: 38 });
  const [floatSize, setFloatSize] = useState({ w: 390, h: 320 });
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const resizeRef = useRef<{ sx: number; sy: number; ow: number; oh: number } | null>(null);
  const consoleInputRef = useRef<HTMLInputElement>(null);

  const filteredConsole = useMemo(() => {
    return consoleEntries.filter((entry) => {
      if (consoleFilter === 'all') return true;
      if (consoleFilter === 'log') return entry.kind === 'output' || entry.kind === 'success' || entry.kind === 'input';
      if (consoleFilter === 'warn') return entry.kind === 'warn';
      if (consoleFilter === 'error') return entry.kind === 'error';
      return true;
    });
  }, [consoleEntries, consoleFilter]);

  const filteredStorage = useMemo(
    () => storageItems.filter((item) => item.store === storageStore),
    [storageItems, storageStore]
  );

  const selectedRequest = useMemo(
    () => networkEntries.find((r) => r.id === selectedReqId) || null,
    [networkEntries, selectedReqId]
  );

  if (!open) return null;

  if (minimized && layoutMode !== 'tab') {
    return (
      <button
        type="button"
        onClick={onToggleMinimize}
        className="absolute bottom-3 right-3 z-35 flex min-h-[44px] items-center gap-2 rounded-xl border border-[#D97757]/60 bg-[#1B1A18]/95 px-3.5 py-2 font-mono text-xs text-[#F2EFE9] shadow-xl backdrop-blur hover:bg-[#2A2824] cursor-pointer"
      >
        <Crosshair className="h-4 w-4 text-[#D97757]" />
        <span>DevTools</span>
        <span className="text-[#8E887F]">·</span>
        <span className="text-[11px] text-[#8CD1A5] tabular-nums">{networkEntries.length} req</span>
      </button>
    );
  }

  const copyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore clipboard fallback errors in restricted iframes
    }
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1400);
  };

  const handleInsertToken = (token: string) => {
    setConsoleInput((prev) => prev + token);
    consoleInputRef.current?.focus();
  };

  const handlePasteSampleScript = () => {
    setConsoleInput('window.__KARSA_GAME__.harvest(100)');
    consoleInputRef.current?.focus();
  };

  const handleConsoleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!consoleInput.trim()) return;
    onRunConsoleCommand(consoleInput.trim());
    setConsoleInput('');
  };

  const startFloatDrag = (e: React.PointerEvent) => {
    if (layoutMode !== 'floating') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: floatPos.x, oy: floatPos.y };
  };

  const onFloatDrag = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setFloatPos({
      x: Math.max(8, Math.min(260, dragRef.current.ox + (e.clientX - dragRef.current.sx))),
      y: Math.max(8, Math.min(220, dragRef.current.oy + (e.clientY - dragRef.current.sy))),
    });
  };

  const startFloatResize = (e: React.PointerEvent) => {
    if (layoutMode !== 'floating') return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeRef.current = { sx: e.clientX, sy: e.clientY, ow: floatSize.w, oh: floatSize.h };
  };

  const onFloatResize = (e: React.PointerEvent) => {
    if (!resizeRef.current) return;
    setFloatSize({
      w: Math.max(300, Math.min(620, resizeRef.current.ow + (e.clientX - resizeRef.current.sx))),
      h: Math.max(240, Math.min(440, resizeRef.current.oh + (e.clientY - resizeRef.current.sy))),
    });
  };

  // Layout container classes depending on adaptive layoutMode & device orientation
  let wrapperClass =
    'flex flex-col overflow-hidden bg-[#181715] text-[#ECE8E0] border-[#36332D]';
  let wrapperStyle: React.CSSProperties | undefined;

  if (layoutMode === 'tab') {
    wrapperClass += ' h-full w-full';
  } else if (layoutMode === 'fullscreen') {
    wrapperClass += ' absolute inset-0 z-35';
  } else if (layoutMode === 'floating') {
    wrapperClass += ' absolute z-35 rounded-xl border shadow-2xl';
    wrapperStyle = {
      left: `${floatPos.x}px`,
      top: `${floatPos.y}px`,
      width: `${floatSize.w}px`,
      height: `${floatSize.h}px`,
      maxWidth: 'calc(100% - 16px)',
      maxHeight: 'calc(100% - 16px)',
    };
  } else {
    // Split-screen adaptive: bottom sheet in portrait, right split pane in landscape!
    if (orientation === 'portrait') {
      wrapperClass += ' h-[52%] w-full shrink-0 border-t';
    } else {
      wrapperClass += ' h-full w-[46%] min-w-[320px] shrink-0 border-l';
    }
  }

  return (
    <div style={wrapperStyle} className={wrapperClass}>
      {/* Top Ergonomic Mobile DevTools Header */}
      <div
        onPointerDown={startFloatDrag}
        onPointerMove={onFloatDrag}
        onPointerUp={() => {
          dragRef.current = null;
        }}
        className={`flex items-center justify-between gap-2 border-b border-[#2E2C27] bg-[#22201D] px-2.5 py-1.5 select-none ${
          layoutMode === 'floating' ? 'cursor-move' : ''
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            onClick={onToggleTouchInspect}
            title="Mode Sentuh-untuk-Inspeksi (Touch-to-Inspect)"
            className={`flex min-h-[36px] min-w-[36px] items-center justify-center gap-1 rounded-lg border px-2 text-[11px] font-medium transition-colors cursor-pointer ${
              touchInspectActive
                ? 'border-[#D97757] bg-[#D97757]/20 text-[#F5B9A4]'
                : 'border-[#3A3731] bg-[#1A1917] text-[#C8C2B7] hover:text-white'
            }`}
          >
            <Crosshair className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">
              {touchInspectActive ? 'Inspeksi Aktif' : 'Sentuh Elemen'}
            </span>
          </button>

          {/* Code Font Size Control */}
          <div className="hidden sm:flex items-center gap-1 rounded-lg border border-[#32302B] bg-[#191816] px-2 py-1 text-[10px] text-[#ABA59B]">
            <Type className="h-3 w-3 shrink-0" />
            <input
              type="range"
              min={10}
              max={17}
              step={1}
              value={fontSize}
              aria-label="Ukuran teks kode DevTools"
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-14 accent-[#D97757]"
            />
            <span className="font-mono tabular-nums w-6 text-right">{fontSize}px</span>
          </div>
        </div>

        {/* Adaptive Layout Switcher + Minimize/Close */}
        <div className="flex items-center gap-1 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onChangeLayout('split')}
            title={orientation === 'portrait' ? 'Mode Bottom Sheet (Atas-Bawah)' : 'Mode Split (Kiri-Kanan)'}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer ${
              layoutMode === 'split'
                ? 'bg-[#D97757]/20 text-[#F2A68C]'
                : 'text-[#A6A198] hover:bg-white/10 hover:text-white'
            }`}
          >
            <PanelBottom className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChangeLayout('floating')}
            title="Mode Mengambang (Floating Resizable)"
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer ${
              layoutMode === 'floating'
                ? 'bg-[#D97757]/20 text-[#F2A68C]'
                : 'text-[#A6A198] hover:bg-white/10 hover:text-white'
            }`}
          >
            <Move className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChangeLayout('fullscreen')}
            title="Layar Penuh Khusus DevTools"
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer ${
              layoutMode === 'fullscreen'
                ? 'bg-[#D97757]/20 text-[#F2A68C]'
                : 'text-[#A6A198] hover:bg-white/10 hover:text-white'
            }`}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChangeLayout('tab')}
            title="Buka DevTools di Tab Terpisah"
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer ${
              layoutMode === 'tab'
                ? 'bg-[#D97757]/20 text-[#F2A68C]'
                : 'text-[#A6A198] hover:bg-white/10 hover:text-white'
            }`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
          {layoutMode !== 'tab' && (
            <button
              type="button"
              onClick={onToggleMinimize}
              title="Minimalkan DevTools"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#A6A198] hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            title="Tutup DevTools"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#A6A198] hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Large Touch-Friendly Panel Tabs (44px min height) */}
      <div className="flex items-center overflow-x-auto border-b border-[#2E2C27] bg-[#1C1B19] px-1.5">
        {(
          [
            { id: 'elements', label: 'Elements', icon: Crosshair },
            { id: 'console', label: 'Console', icon: TerminalIcon },
            { id: 'network', label: `Network (${networkEntries.length})`, icon: Network },
            { id: 'storage', label: 'Storage', icon: Database },
            { id: 'performance', label: 'FPS / Perf', icon: Activity },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative flex min-h-[44px] items-center gap-1.5 px-3 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                active ? 'text-[#F5EFE6]' : 'text-[#9B958C] hover:text-[#DFDAD0]'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#D97757]' : ''}`} />
              <span>{item.label}</span>
              {active && <span className="absolute inset-x-2 bottom-0 h-[2px] bg-[#D97757]" />}
            </button>
          );
        })}
      </div>

      {/* Panel Body */}
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        {/* 1. ELEMENTS / INSPECTOR */}
        {activeTab === 'elements' && (
          <div className="thin-scrollbar flex-1 overflow-y-auto p-3 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#302E29] bg-[#211F1C] px-3 py-2">
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold text-[#F2A68C] truncate">
                  {inspectedElement.selector}
                </p>
                <p className="text-[11px] text-[#9E988E]">
                  Tag &lt;{inspectedElement.tagName}&gt; · Dimensi {inspectedElement.boundsLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleTouchInspect}
                className={`min-h-[38px] rounded-lg px-3 text-[11px] font-medium cursor-pointer ${
                  touchInspectActive
                    ? 'bg-[#D97757] text-[#181715]'
                    : 'border border-[#3D3A34] bg-[#181715] text-[#ECE8E0]'
                }`}
              >
                {touchInspectActive ? 'Ketuk Elemen di Game...' : 'Bidik dengan Jari'}
              </button>
            </div>

            {/* HTML Tree Snippet */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#9E988E]">
                <span>HTML Terpilih</span>
                <button
                  type="button"
                  onClick={() => copyText('el-html', inspectedElement.html)}
                  className="flex items-center gap-1 hover:text-white cursor-pointer"
                >
                  {copiedId === 'el-html' ? <Check className="h-3 w-3 text-[#8CD1A5]" /> : <Copy className="h-3 w-3" />}
                  <span>Salin HTML</span>
                </button>
              </div>
              <pre
                style={{ fontSize: `${fontSize}px` }}
                className="overflow-x-auto rounded-lg border border-[#2F2D28] bg-[#121110] p-2.5 font-mono leading-relaxed text-[#D9E6F2]"
              >
                {inspectedElement.html}
              </pre>
            </div>

            {/* Editable CSS Rules */}
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-[#ABA59B]">
                Editor CSS Inline (Perubahan Langsung ke Elemen Game)
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(Object.entries(inspectedElement.styles) as [
                  keyof InspectableElement['styles'],
                  string
                ][]).map(([prop, val]) => (
                  <label
                    key={prop}
                    className="flex items-center gap-2 rounded-lg border border-[#2F2D28] bg-[#1F1E1B] px-2.5 py-2"
                  >
                    <span className="font-mono text-[11px] text-[#E59377] shrink-0">{prop}:</span>
                    <input
                      type="text"
                      value={val}
                      style={{ fontSize: `${fontSize}px` }}
                      onChange={(e) => onUpdateElementStyle(prop, e.target.value)}
                      className="min-w-0 flex-1 bg-transparent font-mono text-[#F2EFE9] outline-none"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. CONSOLE (Synced with Terminal + Smart Mobile Keyboard Bar) */}
        {activeTab === 'console' && (
          <div className="flex flex-1 flex-col min-h-0">
            {/* Quick Filters & One-Tap Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2B2925] bg-[#1F1D1A] px-2.5 py-1.5 text-[11px]">
              <div className="flex items-center gap-1">
                {(['all', 'log', 'warn', 'error'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setConsoleFilter(f)}
                    className={`min-h-[32px] rounded-md px-2.5 capitalize cursor-pointer ${
                      consoleFilter === f
                        ? 'bg-[#34312C] text-white font-medium'
                        : 'text-[#9E988E] hover:text-white'
                    }`}
                  >
                    {f === 'all' ? 'Semua' : f}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePasteSampleScript}
                  className="flex min-h-[32px] items-center gap-1 rounded-md border border-[#36332D] px-2 text-[#DCD6CB] hover:bg-white/10 cursor-pointer"
                >
                  <ClipboardPaste className="h-3 w-3" />
                  <span>Paste</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      'console-all',
                      filteredConsole.map((c) => `[${c.timestamp}] ${c.text}`).join('\n')
                    )
                  }
                  className="flex min-h-[32px] items-center gap-1 rounded-md border border-[#36332D] px-2 text-[#DCD6CB] hover:bg-white/10 cursor-pointer"
                >
                  {copiedId === 'console-all' ? (
                    <Check className="h-3 w-3 text-[#8CD1A5]" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  <span>Copy</span>
                </button>
                <button
                  type="button"
                  onClick={onClearConsole}
                  className="flex min-h-[32px] items-center gap-1 rounded-md border border-[#36332D] px-2 text-[#DCD6CB] hover:bg-white/10 cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Log Stream */}
            <div
              style={{ fontSize: `${fontSize}px` }}
              className="thin-scrollbar flex-1 overflow-y-auto px-3 py-2 font-mono leading-relaxed space-y-1.5"
            >
              {filteredConsole.length === 0 ? (
                <p className="text-[#7A746B]">Tidak ada log untuk filter ini.</p>
              ) : (
                filteredConsole.map((entry) => (
                  <div key={entry.id} className="flex gap-2">
                    <span className="shrink-0 text-[#6F6A62] tabular-nums">{entry.timestamp}</span>
                    <span
                      className={
                        entry.kind === 'input'
                          ? 'text-[#F3B099]'
                          : entry.kind === 'success'
                          ? 'text-[#8CD1A5]'
                          : entry.kind === 'warn'
                          ? 'text-[#F2CA7E]'
                          : entry.kind === 'error'
                          ? 'text-[#F28B82]'
                          : 'text-[#DCD6CB]'
                      }
                    >
                      {entry.text}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Smart Mobile Keyboard Code Shortcut Bar (Above Input) */}
            {keyboardBarVisible && (
              <div className="flex items-center gap-1.5 overflow-x-auto border-t border-[#2E2C27] bg-[#22201D] px-2 py-1.5">
                {SHORTCUT_TOKENS.map((tok) => (
                  <button
                    key={tok.label}
                    type="button"
                    onClick={() => handleInsertToken(tok.insert)}
                    className="flex min-h-[38px] min-w-[42px] shrink-0 items-center justify-center rounded-lg border border-[#3B3832] bg-[#181715] px-2.5 font-mono text-xs text-[#F2EFE9] active:scale-95 cursor-pointer"
                  >
                    {tok.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handlePasteSampleScript}
                  className="flex min-h-[38px] shrink-0 items-center gap-1 rounded-lg border border-[#3B3832] bg-[#2C2A26] px-2.5 text-xs text-[#F2EFE9] cursor-pointer"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  <span>Paste</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleConsoleSubmit()}
                  className="flex min-h-[38px] shrink-0 items-center gap-1 rounded-lg bg-[#D97757] px-3 text-xs font-semibold text-[#181715] cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Run</span>
                </button>
              </div>
            )}

            {/* Console Input */}
            <form
              onSubmit={handleConsoleSubmit}
              className="flex items-center gap-2 border-t border-[#2C2A25] bg-[#131210] px-3 py-2"
            >
              <span className="font-mono text-xs text-[#D97757]">&gt;</span>
              <input
                ref={consoleInputRef}
                type="text"
                value={consoleInput}
                onFocus={() => setKeyboardBarVisible(true)}
                onChange={(e) => setConsoleInput(e.target.value)}
                style={{ fontSize: `${fontSize}px` }}
                placeholder="Jalankan JS atau perintah terminal (proxy, fps, gc)..."
                className="min-w-0 flex-1 bg-transparent font-mono text-[#F2EFE9] placeholder-[#6F6A62] outline-none"
              />
            </form>
          </div>
        )}

        {/* 3. NETWORK MONITOR */}
        {activeTab === 'network' && (
          <div className="flex flex-1 flex-col min-h-0">
            {selectedRequest ? (
              <div className="thin-scrollbar flex-1 overflow-y-auto p-3 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-[#2E2C27] pb-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReqId(null)}
                    className="flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#262420] px-3 text-xs font-medium text-[#F2EFE9] cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Daftar Request</span>
                  </button>
                  <span className="font-mono text-[11px] text-[#8CD1A5] tabular-nums">
                    {selectedRequest.method} · HTTP {selectedRequest.status} · {selectedRequest.durationMs}ms
                  </span>
                </div>

                <div>
                  <p className="text-[11px] text-[#9E988E]">URL Endpoint</p>
                  <p className="mt-0.5 font-mono text-[11px] break-all text-[#F2EFE9]">
                    {selectedRequest.url}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-[#9E988E]">Request Headers</p>
                  <div className="rounded-lg border border-[#2F2D28] bg-[#121110] p-2.5 font-mono text-[11px] space-y-1">
                    {Object.entries(selectedRequest.requestHeaders).map(([k, v]) => (
                      <div key={k} className="break-all">
                        <span className="text-[#E59377]">{k}:</span>{' '}
                        <span className="text-[#DCD6CB]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-[#9E988E]">Payload / Request Body</p>
                  <pre
                    style={{ fontSize: `${fontSize}px` }}
                    className="overflow-x-auto rounded-lg border border-[#2F2D28] bg-[#121110] p-2.5 font-mono text-[#E8DFCE]"
                  >
                    {selectedRequest.payload}
                  </pre>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-[#9E988E]">Response Preview</p>
                  <pre
                    style={{ fontSize: `${fontSize}px` }}
                    className="overflow-x-auto rounded-lg border border-[#2F2D28] bg-[#121110] p-2.5 font-mono text-[#A8D5BA]"
                  >
                    {selectedRequest.responsePreview}
                  </pre>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#2B2925] bg-[#1F1D1A] px-3 py-1.5 text-[11px] text-[#9E988E]">
                  <span>Ketuk baris untuk detail Header, Payload & WebSocket</span>
                  <button
                    type="button"
                    onClick={onClearNetwork}
                    className="flex min-h-[30px] items-center gap-1 rounded px-2 text-[#DCD6CB] hover:bg-white/10 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Bersihkan</span>
                  </button>
                </div>
                <div className="thin-scrollbar flex-1 divide-y divide-[#282622] overflow-y-auto">
                  {networkEntries.map((req) => (
                    <button
                      key={req.id}
                      type="button"
                      onClick={() => setSelectedReqId(req.id)}
                      className="flex min-h-[50px] w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-[#24221E] cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span
                            className={
                              req.method === 'WS'
                                ? 'text-[#C6A7F0]'
                                : req.method === 'POST'
                                ? 'text-[#F2CA7E]'
                                : 'text-[#8CD1A5]'
                            }
                          >
                            {req.method}
                          </span>
                          <span className="truncate text-[#F2EFE9]">{req.url}</span>
                        </div>
                        <p className="mt-0.5 font-mono text-[10px] text-[#8E887F] tabular-nums">
                          {req.host} · {req.type} · {req.sizeKb} · {req.timestamp}
                        </p>
                      </div>
                      <div className="shrink-0 text-right font-mono text-[11px] tabular-nums">
                        <p className={req.status >= 400 ? 'text-[#F28B82]' : 'text-[#8CD1A5]'}>
                          {req.status}
                        </p>
                        <p className="text-[10px] text-[#8E887F]">{req.durationMs}ms</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* 4. APPLICATION / STORAGE */}
        {activeTab === 'storage' && (
          <div className="flex flex-1 flex-col min-h-0">
            <div className="flex items-center gap-1 overflow-x-auto border-b border-[#2B2925] bg-[#1F1D1A] px-2.5 py-1.5 text-[11px]">
              {(
                [
                  { id: 'cookies', label: 'Cookies' },
                  { id: 'localStorage', label: 'LocalStorage' },
                  { id: 'sessionStorage', label: 'SessionStorage' },
                  { id: 'indexedDB', label: 'IndexedDB' },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStorageStore(st.id)}
                  className={`min-h-[34px] rounded-md px-2.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    storageStore === st.id
                      ? 'bg-[#D97757] font-semibold text-[#181715]'
                      : 'text-[#B5AFA5] hover:bg-white/10'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Add Key/Value Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newKey.trim()) return;
                onAddStorageItem({
                  store: storageStore,
                  origin: 'play.aetherfrontier.gg',
                  key: newKey.trim(),
                  value: newVal.trim() || 'true',
                });
                setNewKey('');
                setNewVal('');
              }}
              className="flex items-center gap-1.5 border-b border-[#282622] bg-[#161513] p-2 text-xs"
            >
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Key baru"
                className="w-1/3 rounded border border-[#34312C] bg-[#1E1D1A] px-2 py-1.5 font-mono text-[11px] outline-none focus:border-[#D97757]"
              />
              <input
                type="text"
                value={newVal}
                onChange={(e) => setNewVal(e.target.value)}
                placeholder="Value"
                className="flex-1 rounded border border-[#34312C] bg-[#1E1D1A] px-2 py-1.5 font-mono text-[11px] outline-none focus:border-[#D97757]"
              />
              <button
                type="submit"
                className="flex min-h-[34px] items-center gap-1 rounded bg-[#2F2D28] px-2.5 text-[11px] text-white hover:bg-[#3E3B34] cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah</span>
              </button>
            </form>

            {/* Key-Value List */}
            <div className="thin-scrollbar flex-1 divide-y divide-[#282622] overflow-y-auto">
              {filteredStorage.length === 0 ? (
                <p className="p-3 text-xs text-[#8E887F]">Belum ada data pada {storageStore}.</p>
              ) : (
                filteredStorage.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs font-medium text-[#F2A68C] truncate">{item.key}</p>
                      {editingStorageId === item.id ? (
                        <div className="mt-1 flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingStorageVal}
                            onChange={(e) => setEditingStorageVal(e.target.value)}
                            className="flex-1 rounded border border-[#D97757] bg-[#121110] px-2 py-1 font-mono text-[11px] text-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateStorageValue(item.id, editingStorageVal);
                              setEditingStorageId(null);
                            }}
                            className="rounded bg-[#D97757] px-2 py-1 text-[11px] font-semibold text-[#181715] cursor-pointer"
                          >
                            Simpan
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStorageId(item.id);
                            setEditingStorageVal(item.value);
                          }}
                          style={{ fontSize: `${fontSize}px` }}
                          title="Ketuk untuk mengedit nilai"
                          className="mt-0.5 block max-w-full truncate text-left font-mono text-[#D8D3C9] hover:text-white cursor-pointer"
                        >
                          {item.value}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyText(item.id, `${item.key}=${item.value}`)}
                        title="Salin nilai"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#ABA59B] hover:bg-white/10 hover:text-white cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-3.5 w-3.5 text-[#8CD1A5]" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteStorageItem(item.id)}
                        title="Hapus item"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#E59377] hover:bg-[#D97757]/15 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 5. PERFORMANCE / FPS MONITOR */}
        {activeTab === 'performance' && (
          <div className="thin-scrollbar flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-[#2F2D28] bg-[#211F1C] p-2.5">
                <p className="text-[10px] text-[#9E988E]">FPS Live</p>
                <p className="mt-0.5 font-mono text-lg font-semibold text-[#8CD1A5] tabular-nums">
                  {liveFps}
                </p>
              </div>
              <div className="rounded-lg border border-[#2F2D28] bg-[#211F1C] p-2.5">
                <p className="text-[10px] text-[#9E988E]">Frame Time</p>
                <p className="mt-0.5 font-mono text-lg font-semibold text-[#F2EFE9] tabular-nums">
                  {(1000 / Math.max(1, liveFps)).toFixed(1)}ms
                </p>
              </div>
              <div className="rounded-lg border border-[#2F2D28] bg-[#211F1C] p-2.5">
                <p className="text-[10px] text-[#9E988E]">Memori RAM</p>
                <p className="mt-0.5 font-mono text-lg font-semibold text-[#F2CA7E] tabular-nums">
                  {totalRamMb} MB
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[#302E29] bg-[#211F1C] p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-[#F2EFE9]">Overlay Mini Transparan (HUD Game)</p>
                  <p className="text-[11px] text-[#9E988E]">
                    Pantau FPS, RAM, dan beban render langsung di sudut layar game meski DevTools ditutup.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onTogglePerfOverlay}
                  className={`min-h-[40px] shrink-0 rounded-lg px-3.5 text-xs font-semibold cursor-pointer ${
                    perfOverlayEnabled
                      ? 'bg-[#D97757] text-[#181715]'
                      : 'border border-[#3D3A34] bg-[#181715] text-[#ECE8E0]'
                  }`}
                >
                  {perfOverlayEnabled ? 'Aktif' : 'Aktifkan'}
                </button>
              </div>
              <p className="font-mono text-[11px] text-[#ABA59B]">
                Render Scale: {renderConfig.renderScale.toFixed(2)}x · Target FPS:{' '}
                {renderConfig.fpsLimit === 'unlimited' ? 'Unlimited' : renderConfig.fpsLimit} · GPU:{' '}
                {renderConfig.hardwareAcceleration ? 'ANGLE Vulkan' : 'Software'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Resize Handle */}
      {layoutMode === 'floating' && (
        <div
          onPointerDown={startFloatResize}
          onPointerMove={onFloatResize}
          onPointerUp={() => {
            resizeRef.current = null;
          }}
          title="Tarik untuk mengubah ukuran jendela DevTools"
          className="absolute bottom-0 right-0 flex h-5 w-5 cursor-nwse-resize items-end justify-end p-1 text-[#8E887F] hover:text-white"
        >
          <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current">
            <path d="M11 1L1 11h2.5L11 3.5V1zm0 5L6 11h2.5L11 8.5V6z" />
          </svg>
        </div>
      )}
    </div>
  );
};
