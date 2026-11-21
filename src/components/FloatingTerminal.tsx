import React, { useRef, useState } from 'react';
import {
  Terminal as TerminalIcon,
  Play,
  Minus,
  X,
  PanelBottom,
  Move,
  Globe,
  ClipboardPaste,
} from 'lucide-react';
import { ProxyConfig, ProxyProtocol, TerminalEntry } from '../types/browser';

interface FloatingTerminalProps {
  open: boolean;
  minimized: boolean;
  docked: boolean;
  entries: TerminalEntry[];
  proxy: ProxyConfig;
  onClose: () => void;
  onToggleMinimize: () => void;
  onToggleDock: () => void;
  onRunCommand: (cmd: string) => void;
  onRunScript: (scriptName: string, code: string) => void;
  onUpdateProxy: (next: ProxyConfig) => void;
}

const PRESET_SCRIPTS = [
  {
    name: 'Auto-Panen Kristal (3x)',
    code: `// Injeksi automasi panen sumber daya ke tab game aktif\nfor (let i = 0; i < 3; i++) {\n  window.__KARSA_GAME__.harvest(75);\n}\nconsole.log("Selesai panen +225 Kristal");`,
  },
  {
    name: 'Cek Spoofing Desktop',
    code: `console.log({\n  ua: navigator.userAgent,\n  platform: "Win32",\n  pointerFine: matchMedia("(pointer: fine)").matches,\n  dpr: window.devicePixelRatio\n});`,
  },
  {
    name: 'Inspeksi Provider EIP-6963',
    code: `console.log("Provider Web3 terdeteksi: MetaMask, Rabby Wallet, Phantom (Isolated CRX World)");`,
  },
];

export const FloatingTerminal: React.FC<FloatingTerminalProps> = ({
  open,
  minimized,
  docked,
  entries,
  proxy,
  onClose,
  onToggleMinimize,
  onToggleDock,
  onRunCommand,
  onRunScript,
  onUpdateProxy,
}) => {
  const [tab, setTab] = useState<'console' | 'proxy'>('console');
  const [cmdInput, setCmdInput] = useState('');
  const [scriptText, setScriptText] = useState(PRESET_SCRIPTS[0].code);
  const [showScriptEditor, setShowScriptEditor] = useState(false);

  const [pos, setPos] = useState({ x: 16, y: 54 });
  const [size, setSize] = useState({ w: 410, h: 270 });
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const resizeRef = useRef<{ sx: number; sy: number; ow: number; oh: number } | null>(null);

  const [proxyForm, setProxyForm] = useState<ProxyConfig>(proxy);

  if (!open) return null;

  if (minimized) {
    return (
      <button
        type="button"
        onClick={onToggleMinimize}
        className="absolute bottom-3 left-3 z-30 flex items-center gap-2 rounded-lg border border-[#3E3B35] bg-[#1D1C1A]/95 px-3 py-2 font-mono text-xs text-[#F2EFE9] shadow-lg backdrop-blur hover:bg-[#292723] cursor-pointer"
      >
        <TerminalIcon className="h-3.5 w-3.5 text-[#D97757]" />
        <span>Terminal</span>
        <span className="text-[#9E988E]">·</span>
        <span className="text-[11px] text-[#A8D5BA]">
          {proxy.enabled ? `${proxy.protocol} Aktif` : 'DIRECT'}
        </span>
      </button>
    );
  }

  const startDrag = (e: React.PointerEvent) => {
    if (docked) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
  };

  const onDrag = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setPos({
      x: Math.max(8, Math.min(260, dragRef.current.ox + (e.clientX - dragRef.current.sx))),
      y: Math.max(8, Math.min(220, dragRef.current.oy + (e.clientY - dragRef.current.sy))),
    });
  };

  const startResize = (e: React.PointerEvent) => {
    if (docked) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeRef.current = { sx: e.clientX, sy: e.clientY, ow: size.w, oh: size.h };
  };

  const onResize = (e: React.PointerEvent) => {
    if (!resizeRef.current) return;
    setSize({
      w: Math.max(290, Math.min(580, resizeRef.current.ow + (e.clientX - resizeRef.current.sx))),
      h: Math.max(190, Math.min(360, resizeRef.current.oh + (e.clientY - resizeRef.current.sy))),
    });
  };

  const handleSubmitCmd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;
    onRunCommand(cmdInput.trim());
    setCmdInput('');
  };

  const handleApplyProxyForm = (e: React.FormEvent) => {
    e.preventDefault();
    const isDirect = proxyForm.protocol === 'DIRECT';
    onUpdateProxy({
      ...proxyForm,
      enabled: !isDirect && Boolean(proxyForm.host.trim()),
      latencyMs: !isDirect ? 38 : null,
    });
    setTab('console');
  };

  const containerStyle: React.CSSProperties = docked
    ? { left: '8px', right: '8px', bottom: '8px', height: '215px' }
    : {
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${size.w}px`,
        height: `${size.h}px`,
        maxWidth: 'calc(100% - 16px)',
        maxHeight: 'calc(100% - 16px)',
      };

  return (
    <div
      style={containerStyle}
      className="absolute z-30 flex flex-col overflow-hidden rounded-xl border border-[#3B3832] bg-[#181715]/96 text-[#ECE8E0] shadow-2xl backdrop-blur-md"
    >
      {/* Header */}
      <div
        onPointerDown={startDrag}
        onPointerMove={onDrag}
        onPointerUp={() => {
          dragRef.current = null;
        }}
        className={`flex items-center justify-between gap-2 border-b border-[#2E2C27] bg-[#22201D] px-3 py-1.5 select-none ${
          docked ? '' : 'cursor-move'
        }`}
      >
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-3.5 w-3.5 text-[#D97757]" />
          <div className="flex items-center gap-1 rounded-md bg-[#161513] p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setTab('console')}
              className={`rounded px-2 py-0.5 transition-colors cursor-pointer ${
                tab === 'console' ? 'bg-[#312E29] text-white' : 'text-[#9E988E] hover:text-white'
              }`}
            >
              Console & Script
            </button>
            <button
              type="button"
              onClick={() => {
                setProxyForm(proxy);
                setTab('proxy');
              }}
              className={`flex items-center gap-1 rounded px-2 py-0.5 transition-colors cursor-pointer ${
                tab === 'proxy' ? 'bg-[#312E29] text-white' : 'text-[#9E988E] hover:text-white'
              }`}
            >
              <Globe className="h-3 w-3" />
              <span>Proxy Cepat</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onToggleDock}
            title={docked ? 'Mode Mengambang' : 'Dock ke Bawah'}
            className="rounded p-1 text-[#A6A198] hover:bg-white/10 hover:text-white cursor-pointer"
          >
            {docked ? <Move className="h-3.5 w-3.5" /> : <PanelBottom className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={onToggleMinimize}
            title="Minimalkan Terminal"
            className="rounded p-1 text-[#A6A198] hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Tutup Terminal"
            className="rounded p-1 text-[#A6A198] hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {tab === 'console' ? (
        <div className="flex flex-1 flex-col min-h-0">
          {/* Quick script injection bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[#2A2824] bg-[#1C1B18] px-2.5 py-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => setShowScriptEditor((v) => !v)}
              className={`flex items-center gap-1 rounded border px-2 py-0.5 whitespace-nowrap shrink-0 cursor-pointer ${
                showScriptEditor
                  ? 'border-[#D97757] bg-[#D97757]/20 text-[#F3B099]'
                  : 'border-[#393630] bg-[#24221F] text-[#D4CEC3] hover:border-[#555046]'
              }`}
            >
              <ClipboardPaste className="h-3 w-3" />
              <span>{showScriptEditor ? 'Tutup Editor Skrip' : 'Paste & Run Skrip JS'}</span>
            </button>
            {PRESET_SCRIPTS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => onRunScript(preset.name, preset.code)}
                className="rounded border border-[#34312C] bg-[#22201D] px-2 py-0.5 text-[#C7C1B6] hover:border-[#D97757]/60 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>

          {showScriptEditor ? (
            <div className="flex flex-1 flex-col gap-2 p-2.5 min-h-0">
              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                spellCheck={false}
                placeholder="Tempel skrip JavaScript otomatisasi untuk diinjeksi ke tab aktif..."
                className="thin-scrollbar flex-1 resize-none rounded-lg border border-[#35322C] bg-[#121110] p-2 font-mono text-[11px] leading-relaxed text-[#EDE8DE] outline-none focus:border-[#D97757]"
              />
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#9E988E]">Target: CDP Runtime.evaluate (Tab Aktif)</span>
                <button
                  type="button"
                  onClick={() => {
                    onRunScript('Skrip Kustom', scriptText);
                    setShowScriptEditor(false);
                  }}
                  className="flex items-center gap-1 rounded-md bg-[#D97757] px-3 py-1 font-medium text-[#181715] hover:bg-[#E58A6C] cursor-pointer"
                >
                  <Play className="h-3 w-3" />
                  <span>Jalankan Skrip</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Log Output */}
              <div className="thin-scrollbar flex-1 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-relaxed space-y-1">
                {entries.map((entry) => (
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
                ))}
              </div>

              {/* CLI Input */}
              <form
                onSubmit={handleSubmitCmd}
                className="flex items-center gap-2 border-t border-[#2D2B26] bg-[#141311] px-3 py-1.5"
              >
                <span className="font-mono text-xs text-[#D97757]">karsa$</span>
                <input
                  type="text"
                  value={cmdInput}
                  onChange={(e) => setCmdInput(e.target.value)}
                  placeholder="Ketik: proxy set socks5://user:pass@sg1.io:1080 | gc | fps 30 | help"
                  className="flex-1 bg-transparent font-mono text-[11px] text-[#F2EFE9] placeholder-[#6F6A62] outline-none"
                />
                <button
                  type="submit"
                  className="rounded bg-[#2E2C27] px-2 py-0.5 text-[11px] text-[#ECE8E0] hover:bg-[#3E3B34] cursor-pointer"
                >
                  Kirim
                </button>
              </form>
            </>
          )}
        </div>
      ) : (
        /* Quick Proxy UI */
        <form onSubmit={handleApplyProxyForm} className="thin-scrollbar flex-1 overflow-y-auto p-3 text-xs space-y-2.5">
          <div className="grid grid-cols-4 gap-1.5">
            {(['DIRECT', 'HTTP', 'HTTPS', 'SOCKS5'] as ProxyProtocol[]).map((proto) => (
              <button
                key={proto}
                type="button"
                onClick={() => setProxyForm((p) => ({ ...p, protocol: proto }))}
                className={`rounded-md border py-1 text-[11px] font-mono cursor-pointer ${
                  proxyForm.protocol === proto
                    ? 'border-[#D97757] bg-[#D97757]/20 text-[#F3B099]'
                    : 'border-[#35322C] bg-[#211F1C] text-[#BDB7AC]'
                }`}
              >
                {proto}
              </button>
            ))}
          </div>

          {proxyForm.protocol !== 'DIRECT' && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={proxyForm.host}
                  onChange={(e) => setProxyForm((p) => ({ ...p, host: e.target.value }))}
                  placeholder="Host (mis. sg1.proxy.io)"
                  className="col-span-2 rounded-md border border-[#35322C] bg-[#121110] px-2.5 py-1.5 font-mono text-[11px] text-white outline-none focus:border-[#D97757]"
                />
                <input
                  type="text"
                  value={proxyForm.port}
                  onChange={(e) => setProxyForm((p) => ({ ...p, port: e.target.value }))}
                  placeholder="Port"
                  className="rounded-md border border-[#35322C] bg-[#121110] px-2.5 py-1.5 font-mono text-[11px] text-white outline-none focus:border-[#D97757]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={proxyForm.username}
                  onChange={(e) => setProxyForm((p) => ({ ...p, username: e.target.value }))}
                  placeholder="Username (opsional)"
                  className="rounded-md border border-[#35322C] bg-[#121110] px-2.5 py-1.5 font-mono text-[11px] text-white outline-none focus:border-[#D97757]"
                />
                <input
                  type="password"
                  value={proxyForm.password}
                  onChange={(e) => setProxyForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Password (opsional)"
                  className="rounded-md border border-[#35322C] bg-[#121110] px-2.5 py-1.5 font-mono text-[11px] text-white outline-none focus:border-[#D97757]"
                />
              </div>
              <label className="flex items-center gap-2 text-[11px] text-[#C7C1B6] cursor-pointer">
                <input
                  type="checkbox"
                  checked={proxyForm.perSession}
                  onChange={(e) => setProxyForm((p) => ({ ...p, perSession: e.target.checked }))}
                  className="accent-[#D97757]"
                />
                <span>Isolasi konfigurasi proxy hanya untuk sesi tab ini (per-session)</span>
              </label>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setTab('console')}
              className="rounded-md border border-[#3A3731] px-2.5 py-1 text-[11px] text-[#C7C1B6] hover:bg-white/5 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#D97757] px-3 py-1 text-[11px] font-semibold text-[#181715] hover:bg-[#E58A6C] cursor-pointer"
            >
              Terapkan Proxy
            </button>
          </div>
        </form>
      )}

      {!docked && (
        <div
          onPointerDown={startResize}
          onPointerMove={onResize}
          onPointerUp={() => {
            resizeRef.current = null;
          }}
          title="Tarik untuk mengubah ukuran terminal"
          className="absolute bottom-0 right-0 flex h-4 w-4 cursor-nwse-resize items-end justify-end p-0.5 text-[#7A746B] hover:text-white"
        >
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-current">
            <path d="M11 1L1 11h2.5L11 3.5V1zm0 5L6 11h2.5L11 8.5V6z" />
          </svg>
        </div>
      )}
    </div>
  );
};
