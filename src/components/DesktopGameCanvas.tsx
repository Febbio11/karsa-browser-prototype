import React, { useEffect, useRef, useState } from 'react';
import {
  MousePointer2,
  Sparkles,
  ShieldCheck,
  Coins,
  Pickaxe,
  Crosshair,
  Languages,
} from 'lucide-react';
import { InspectableElement, RenderConfig, TRANSLATION_LANGUAGES } from '../types/browser';

interface DesktopGameCanvasProps {
  renderConfig: RenderConfig;
  crystals: number;
  connectedWallet: string | null;
  connectedX: string | null;
  connectedDiscord: string | null;
  findQuery: string;
  touchInspectActive: boolean;
  inspectedElement: InspectableElement;
  perfOverlayEnabled: boolean;
  liveFps: number;
  totalRamMb: number;
  savedSiteZoom: number;
  onInspectElement: (el: InspectableElement) => void;
  onPinchZoomChange: (nextZoom: number) => void;
  onHarvest: (amount: number) => void;
  onTriggerWallet: () => void;
  onTriggerXAuth: () => void;
  onTriggerDiscordAuth: () => void;
  onFpsUpdate: (fps: number) => void;
}

const RES_DIMENSIONS: Record<RenderConfig['virtualResolution'], { w: number; h: number }> = {
  '1280x720': { w: 1280, h: 720 },
  '1600x900': { w: 1600, h: 900 },
  '1920x1080': { w: 1920, h: 1080 },
};

const GAME_MAP_SRC = '/src/assets/images/desktop_web3_game_map_1795247285175.jpg';

export const INSPECTABLE_NODES: Record<string, InspectableElement> = {
  walletBtn: {
    id: 'walletBtn',
    selector: 'button#btn-connect-wallet.hud-cta',
    tagName: 'button',
    boundsLabel: '164 × 42 px',
    html: `<button id="btn-connect-wallet" class="hud-cta" data-eip6963="true">\n  Connect Wallet\n</button>`,
    styles: {
      color: '#191816',
      background: '#D97757',
      padding: '10px 20px',
      fontSize: '14px',
      opacity: '1',
    },
  },
  crystalCounter: {
    id: 'crystalCounter',
    selector: 'div.crystal-counter[data-resource="amber"]',
    tagName: 'div',
    boundsLabel: '198 × 44 px',
    html: `<div class="crystal-counter" data-resource="amber">\n  <span class="amount">1.420 Kristal</span>\n</div>`,
    styles: {
      color: '#F6F1E7',
      background: 'rgba(0,0,0,0.45)',
      padding: '8px 16px',
      fontSize: '16px',
      opacity: '1',
    },
  },
  xAuthBtn: {
    id: 'xAuthBtn',
    selector: 'button#btn-oauth-x[data-lock="internal"]',
    tagName: 'button',
    boundsLabel: '158 × 42 px',
    html: `<button id="btn-oauth-x" data-lock="internal" data-scheme-block="twitter://">\n  Hubungkan Akun X\n</button>`,
    styles: {
      color: '#FFFFFF',
      background: 'rgba(27,31,38,0.9)',
      padding: '10px 16px',
      fontSize: '14px',
      opacity: '1',
    },
  },
  mineWest: {
    id: 'mineWest',
    selector: 'button#mine-west.tactical-node',
    tagName: 'button',
    boundsLabel: '192 × 38 px',
    html: `<button id="mine-west" class="tactical-node" data-yield="45">\n  Panen Tambang Barat\n</button>`,
    styles: {
      color: '#FCE6B4',
      background: 'rgba(20,25,32,0.85)',
      padding: '8px 14px',
      fontSize: '14px',
      opacity: '1',
    },
  },
  citadelNode: {
    id: 'citadelNode',
    selector: 'button#citadel-tax.tactical-node',
    tagName: 'button',
    boundsLabel: '188 × 38 px',
    html: `<button id="citadel-tax" class="tactical-node" data-yield="120">\n  Klaim Pajak Benteng\n</button>`,
    styles: {
      color: '#FCE6B4',
      background: 'rgba(20,25,32,0.85)',
      padding: '8px 14px',
      fontSize: '14px',
      opacity: '1',
    },
  },
};

export const DesktopGameCanvas: React.FC<DesktopGameCanvasProps> = ({
  renderConfig,
  crystals,
  connectedWallet,
  connectedX,
  connectedDiscord,
  findQuery,
  touchInspectActive,
  inspectedElement,
  perfOverlayEnabled,
  liveFps,
  totalRamMb,
  savedSiteZoom,
  onInspectElement,
  onPinchZoomChange,
  onHarvest,
  onTriggerWallet,
  onTriggerXAuth,
  onTriggerDiscordAuth,
  onFpsUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 680, h: 380 });
  const [imgFailed, setImgFailed] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50, visible: false });
  const [hoveredInspectId, setHoveredInspectId] = useState<string | null>(null);
  const [lastHarvestToast, setLastHarvestToast] = useState<string | null>(null);

  const tr = renderConfig.translation;
  const activeLang = tr.enabled ? tr.targetLang : 'en';

  const L10N: Record<
    string,
    {
      subtitle: string;
      crystals: string;
      crystalsFrom: string;
      connectX: string;
      westMine: string;
      harvestWest: string;
      citadel: string;
      claimTax: string;
      eastMine: string;
      harvestEast: string;
      graphics: string;
      dailyQuest: string;
      dailyClaim: string;
    }
  > = {
    en: {
      subtitle: 'Desktop Web3 Tactics',
      crystals: 'Crystals',
      crystalsFrom: 'Crystals from',
      connectX: 'Connect X Account',
      westMine: 'West Mine',
      harvestWest: 'Harvest West Mine',
      citadel: 'Main Citadel',
      claimTax: 'Claim Citadel Tax',
      eastMine: 'East Mine',
      harvestEast: 'Harvest East Mine',
      graphics: 'Graphics:',
      dailyQuest: 'On-Chain Daily Quest',
      dailyClaim: 'Daily Claim (+250)',
    },
    id: {
      subtitle: 'Strategi Desktop Web3',
      crystals: 'Kristal',
      crystalsFrom: 'Kristal dari',
      connectX: 'Hubungkan Akun X',
      westMine: 'Tambang Barat',
      harvestWest: 'Panen Tambang Barat',
      citadel: 'Benteng Utama',
      claimTax: 'Klaim Pajak Benteng',
      eastMine: 'Tambang Timur',
      harvestEast: 'Panen Tambang Timur',
      graphics: 'Mode Grafis:',
      dailyQuest: 'Misi Harian On-Chain',
      dailyClaim: 'Klaim Harian (+250)',
    },
    ja: {
      subtitle: 'デスクトップWeb3戦術',
      crystals: 'クリスタル',
      crystalsFrom: 'クリスタル獲得:',
      connectX: 'Xアカウント連携',
      westMine: '西の鉱山',
      harvestWest: '西の鉱山を採掘',
      citadel: 'メイン城塞',
      claimTax: '城塞税を受け取る',
      eastMine: '東の鉱山',
      harvestEast: '東の鉱山を採掘',
      graphics: '描画モード:',
      dailyQuest: 'オンチェーン日次任務',
      dailyClaim: 'デイリー報酬 (+250)',
    },
    zh: {
      subtitle: '桌面端 Web3 策略',
      crystals: '水晶',
      crystalsFrom: '获得水晶来自',
      connectX: '连接 X 账号',
      westMine: '西部矿场',
      harvestWest: '采集西部矿场',
      citadel: '主城堡',
      claimTax: '领取城堡税收',
      eastMine: '东部矿场',
      harvestEast: '采集东部矿场',
      graphics: '画质模式:',
      dailyQuest: '链上每日任务',
      dailyClaim: '每日领取 (+250)',
    },
    ko: {
      subtitle: '데스크톱 Web3 전략',
      crystals: '크리스탈',
      crystalsFrom: '크리스탈 획득:',
      connectX: 'X 계정 연결',
      westMine: '서부 광산',
      harvestWest: '서부 광산 채굴',
      citadel: '메인 성채',
      claimTax: '성채 세금 수령',
      eastMine: '동부 광산',
      harvestEast: '동부 광산 채굴',
      graphics: '그래픽:',
      dailyQuest: '온체인 일일 퀘스트',
      dailyClaim: '일일 보상 (+250)',
    },
    es: {
      subtitle: 'Táctica Web3 de Escritorio',
      crystals: 'Cristales',
      crystalsFrom: 'Cristales de',
      connectX: 'Conectar Cuenta X',
      westMine: 'Mina Oeste',
      harvestWest: 'Cosechar Mina Oeste',
      citadel: 'Ciudadela Principal',
      claimTax: 'Reclamar Impuesto',
      eastMine: 'Mina Este',
      harvestEast: 'Cosechar Mina Este',
      graphics: 'Gráficos:',
      dailyQuest: 'Misión Diaria On-Chain',
      dailyClaim: 'Reclamo Diario (+250)',
    },
    fr: {
      subtitle: 'Tactique Web3 Bureau',
      crystals: 'Cristaux',
      crystalsFrom: 'Cristaux de',
      connectX: 'Connecter Compte X',
      westMine: 'Mine Ouest',
      harvestWest: 'Récolter Mine Ouest',
      citadel: 'Citadelle Principale',
      claimTax: 'Réclamer Taxe',
      eastMine: 'Mine Est',
      harvestEast: 'Récolter Mine Est',
      graphics: 'Graphismes :',
      dailyQuest: 'Quête Quotidienne',
      dailyClaim: 'Récompense (+250)',
    },
    de: {
      subtitle: 'Desktop Web3 Taktik',
      crystals: 'Kristalle',
      crystalsFrom: 'Kristalle aus',
      connectX: 'X-Konto verbinden',
      westMine: 'Westmine',
      harvestWest: 'Westmine ernten',
      citadel: 'Hauptzitadelle',
      claimTax: 'Steuer einfordern',
      eastMine: 'Ostmine',
      harvestEast: 'Ostmine ernten',
      graphics: 'Grafik:',
      dailyQuest: 'Tägliche Quest',
      dailyClaim: 'Tagesbonus (+250)',
    },
    ru: {
      subtitle: 'Десктоп Web3 Тактика',
      crystals: 'Кристаллы',
      crystalsFrom: 'Кристаллы из',
      connectX: 'Подключить X',
      westMine: 'Западная шахта',
      harvestWest: 'Собрать Западную шахту',
      citadel: 'Главная цитадель',
      claimTax: 'Собрать налог',
      eastMine: 'Восточная шахта',
      harvestEast: 'Собрать Восточную шахту',
      graphics: 'Графика:',
      dailyQuest: 'Ежедневный квест',
      dailyClaim: 'Награда (+250)',
    },
    ar: {
      subtitle: 'استراتيجية Web3 لسطح المكتب',
      crystals: 'كريستال',
      crystalsFrom: 'كريستال من',
      connectX: 'ربط حساب X',
      westMine: 'المنجم الغربي',
      harvestWest: 'حصاد المنجم الغربي',
      citadel: 'القلعة الرئيسية',
      claimTax: 'تحصيل ضريبة القلعة',
      eastMine: 'المنجم الشرقي',
      harvestEast: 'حصاد المنجم الشرقي',
      graphics: 'الرسومات:',
      dailyQuest: 'مهمة يومية',
      dailyClaim: 'مكافأة يومية (+250)',
    },
  };

  const t = L10N[activeLang] || L10N.id;
  const sourceLabel =
    tr.sourceLang === 'auto'
      ? `Auto (${TRANSLATION_LANGUAGES.find((l) => l.code === tr.detectedLang)?.label || 'Inggris'})`
      : TRANSLATION_LANGUAGES.find((l) => l.code === tr.sourceLang)?.label || tr.sourceLang;
  const targetLabel =
    TRANSLATION_LANGUAGES.find((l) => l.code === tr.targetLang)?.label || 'Bahasa Indonesia';

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          w: Math.max(220, entry.contentRect.width),
          h: Math.max(160, entry.contentRect.height),
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Real-time animated Canvas particle & tactical grid loop governed by fpsLimit, renderScale & graphicsSaver
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let lastReportTime = performance.now();

    const particles = Array.from({ length: 28 }, (_, i) => ({
      x: ((i * 73) % 100) / 100,
      y: ((i * 41) % 100) / 100,
      r: 1.5 + (i % 3) * 1.1,
      vx: (i % 2 === 0 ? 1 : -1) * (0.00018 + (i % 4) * 0.00005),
      vy: -(0.00025 + (i % 5) * 0.00006),
      alpha: 0.35 + (i % 4) * 0.15,
    }));

    const targetInterval =
      renderConfig.fpsLimit === 'unlimited' ? 0 : 1000 / renderConfig.fpsLimit;

    const draw = (now: number) => {
      animId = requestAnimationFrame(draw);

      const delta = now - lastFrameTime;
      if (targetInterval > 0 && delta < targetInterval - 0.8) {
        return;
      }
      lastFrameTime = now;
      frameCount += 1;

      if (now - lastReportTime >= 500) {
        const measured = Math.round((frameCount * 1000) / Math.max(1, now - lastReportTime));
        const clamped =
          renderConfig.fpsLimit === 'unlimited'
            ? Math.min(120, measured)
            : Math.min(renderConfig.fpsLimit, measured);
        onFpsUpdate(clamped);
        frameCount = 0;
        lastReportTime = now;
      }

      const scale = renderConfig.renderScale;
      const targetW = Math.max(160, Math.round(640 * scale));
      const targetH = Math.max(90, Math.round(360 * scale));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.clearRect(0, 0, targetW, targetH);

      const nodes = [
        { x: 0.16, y: 0.68 },
        { x: 0.59, y: 0.31 },
        { x: 0.83, y: 0.35 },
        { x: 0.82, y: 0.67 },
      ];

      const pulse = renderConfig.graphicsSaver ? 0.5 : (Math.sin(now * 0.0035) + 1) * 0.5;

      nodes.forEach((node) => {
        const nx = node.x * targetW;
        const ny = node.y * targetH;
        const baseR = 8 * scale;

        if (!renderConfig.graphicsSaver) {
          ctx.beginPath();
          ctx.arc(nx, ny, baseR + pulse * 10 * scale, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(245, 190, 92, ${0.55 - pulse * 0.45})`;
          ctx.lineWidth = Math.max(1, 1.5 * scale);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(nx, ny, Math.max(2.5, 4 * scale), 0, Math.PI * 2);
        ctx.fillStyle = '#F7C96E';
        ctx.fill();
      });

      if (!renderConfig.graphicsSaver) {
        particles.forEach((p) => {
          p.x = (p.x + p.vx * Math.min(delta, 50) + 1) % 1;
          p.y = (p.y + p.vy * Math.min(delta, 50) + 1) % 1;

          const px = p.x * targetW;
          const py = p.y * targetH;
          ctx.beginPath();
          ctx.arc(px, py, Math.max(1, p.r * scale), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 224, 150, ${p.alpha})`;
          ctx.fill();
        });
      }
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [renderConfig.fpsLimit, renderConfig.renderScale, renderConfig.graphicsSaver, onFpsUpdate]);

  const virtualDims = RES_DIMENSIONS[renderConfig.virtualResolution];
  const autoFitScale = Math.min(
    containerSize.w / virtualDims.w,
    containerSize.h / virtualDims.h
  );
  const manualScale = autoFitScale * (renderConfig.manualZoom / 100) * renderConfig.dpiScale;
  const effectiveScale = renderConfig.autoFitDesktop ? autoFitScale : manualScale;

  const handleMineClick = (label: string, reward: number) => {
    onHarvest(reward);
    setLastHarvestToast(`+${reward} ${t.crystalsFrom} ${label}`);
    window.setTimeout(() => setLastHarvestToast(null), 1800);
  };

  const highlightMatch = (text: string) => {
    const q = findQuery.trim().toLowerCase();
    if (!q || !text.toLowerCase().includes(q)) return text;
    return `★ ${text}`;
  };

  const getCustomStyle = (nodeId: string): React.CSSProperties | undefined => {
    if (inspectedElement.id !== nodeId) return undefined;
    return {
      color: inspectedElement.styles.color,
      backgroundColor: inspectedElement.styles.background,
      padding: inspectedElement.styles.padding,
      fontSize: inspectedElement.styles.fontSize,
      opacity: Number(inspectedElement.styles.opacity) || 1,
    };
  };

  const getInspectRing = (nodeId: string) => {
    if (!touchInspectActive) return '';
    if (inspectedElement.id === nodeId) {
      return 'ring-4 ring-[#D97757] ring-offset-2 ring-offset-[#12161D]';
    }
    if (hoveredInspectId === nodeId) {
      return 'ring-2 ring-[#69B4FF] ring-offset-1 ring-offset-[#12161D]';
    }
    return 'hover:ring-2 hover:ring-[#69B4FF]';
  };

  const handleNodeAction = (nodeId: string, normalAction: () => void) => {
    if (touchInspectActive) {
      const node = INSPECTABLE_NODES[nodeId];
      if (node) onInspectElement(node);
      return;
    }
    normalAction();
  };

  const hoveredInspectNode = hoveredInspectId ? INSPECTABLE_NODES[hoveredInspectId] : inspectedElement;

  return (
    <div
      ref={containerRef}
      onWheel={(e) => {
        if (!e.ctrlKey && !renderConfig.forceZoom) return;
        if (e.ctrlKey) {
          e.preventDefault();
          const delta = e.deltaY < 0 ? 10 : -10;
          onPinchZoomChange(Math.max(60, Math.min(200, renderConfig.manualZoom + delta)));
        }
      }}
      onMouseMove={(e) => {
        if (!renderConfig.virtualMouse && !touchInspectActive) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setCursorPos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
          visible: true,
        });
      }}
      onMouseLeave={() => setCursorPos((prev) => ({ ...prev, visible: false }))}
      className={`relative h-full w-full overflow-auto bg-[#12161D] flex items-center justify-center select-none ${
        renderConfig.virtualMouse ? 'cursor-none' : touchInspectActive ? 'cursor-crosshair' : ''
      }`}
    >
      {/* Scaled Virtual Desktop Viewport (Anti-Terpotong + Auto-Reflow) */}
      <div
        style={{
          width: `${virtualDims.w}px`,
          height: `${virtualDims.h}px`,
          transform: `scale(${effectiveScale})`,
          transformOrigin: 'center center',
          filter: renderConfig.forceDarkMode ? 'brightness(0.84) contrast(1.12)' : undefined,
        }}
        className="relative shrink-0 overflow-hidden bg-[#18212C] shadow-2xl transition-transform duration-150"
      >
        {/* Game World Background */}
        {!imgFailed ? (
          <img
            src={GAME_MAP_SRC}
            alt="Peta dunia game strategi desktop Web3 Aether Frontier"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            style={{
              filter:
                renderConfig.renderScale < 0.75
                  ? 'blur(1.2px) contrast(0.97)'
                  : renderConfig.graphicsSaver
                  ? 'saturate(0.85) contrast(0.95)'
                  : 'none',
            }}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#23394A] via-[#2B4B57] to-[#1D2A33] flex items-center justify-center text-[#E8DFCE] text-3xl font-editorial">
            Aether Frontier — Desktop World Canvas
          </div>
        )}

        {/* Live WebGL/Canvas Particle & Tactical Overlay */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{
            imageRendering: renderConfig.renderScale < 0.75 ? 'pixelated' : 'auto',
          }}
        />

        {/* Desktop Game Top HUD Bar */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-[#0E131A]/90 via-[#0E131A]/65 to-transparent px-7 py-5 text-[#F6F1E7]">
          <div className="flex items-center gap-6">
            <div>
              <p className="font-editorial text-2xl font-semibold tracking-tight">
                {highlightMatch('Aether Frontier')}
              </p>
              <p className="text-sm text-[#D6CFC2]">
                {t.subtitle} · Viewport{' '}
                {renderConfig.virtualResolution} · DPR {renderConfig.renderScale.toFixed(2)}x
              </p>
            </div>

            <div
              onClick={() => handleNodeAction('crystalCounter', () => {})}
              onMouseEnter={() => setHoveredInspectId('crystalCounter')}
              onMouseLeave={() => setHoveredInspectId(null)}
              style={getCustomStyle('crystalCounter')}
              className={`flex items-center gap-2 rounded-lg border border-white/15 bg-black/45 px-4 py-2 text-base font-mono tabular-nums transition-all ${getInspectRing(
                'crystalCounter'
              )}`}
            >
              <Coins className="h-5 w-5 text-[#F4C465]" />
              <span>
                {crystals.toLocaleString('id-ID')} {t.crystals}
              </span>
            </div>
          </div>

          {/* Interactive Desktop Wallet & Social Auth Triggers */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onMouseEnter={() => setHoveredInspectId('xAuthBtn')}
              onMouseLeave={() => setHoveredInspectId(null)}
              onClick={() => handleNodeAction('xAuthBtn', onTriggerXAuth)}
              style={getCustomStyle('xAuthBtn')}
              className={`rounded-lg border border-white/20 bg-[#1B1F26]/90 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2A303B] whitespace-nowrap cursor-pointer ${getInspectRing(
                'xAuthBtn'
              )}`}
            >
              {connectedX ? `X: ${connectedX}` : highlightMatch(t.connectX)}
            </button>

            <button
              type="button"
              onClick={onTriggerDiscordAuth}
              className="rounded-lg border border-white/20 bg-[#252A3D]/90 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#323A54] whitespace-nowrap cursor-pointer"
            >
              {connectedDiscord ? `Discord: ${connectedDiscord}` : highlightMatch('OAuth Discord')}
            </button>

            <button
              type="button"
              onMouseEnter={() => setHoveredInspectId('walletBtn')}
              onMouseLeave={() => setHoveredInspectId(null)}
              onClick={() => handleNodeAction('walletBtn', onTriggerWallet)}
              style={getCustomStyle('walletBtn')}
              className={`rounded-lg bg-[#D97757] px-5 py-2.5 text-sm font-semibold text-[#191816] transition-colors hover:bg-[#E4886A] whitespace-nowrap cursor-pointer ${getInspectRing(
                'walletBtn'
              )}`}
            >
              {connectedWallet ? connectedWallet : highlightMatch('Connect Wallet')}
            </button>
          </div>
        </div>

        {/* Clickable In-Game Crystal Mines */}
        <button
          type="button"
          onMouseEnter={() => setHoveredInspectId('mineWest')}
          onMouseLeave={() => setHoveredInspectId(null)}
          onClick={() =>
            handleNodeAction('mineWest', () => handleMineClick(t.westMine, 45))
          }
          style={{ left: '13%', top: '62%', ...(getCustomStyle('mineWest') || {}) }}
          className={`absolute flex items-center gap-2 rounded-lg border border-[#F7C96E]/60 bg-[#141920]/85 px-3.5 py-2 text-sm font-medium text-[#FCE6B4] transition-transform hover:scale-105 cursor-pointer ${getInspectRing(
            'mineWest'
          )}`}
        >
          <Pickaxe className="h-4 w-4 text-[#F4C465]" />
          <span>{t.harvestWest}</span>
        </button>

        <button
          type="button"
          onMouseEnter={() => setHoveredInspectId('citadelNode')}
          onMouseLeave={() => setHoveredInspectId(null)}
          onClick={() =>
            handleNodeAction('citadelNode', () => handleMineClick(t.citadel, 120))
          }
          style={{ left: '53%', top: '26%', ...(getCustomStyle('citadelNode') || {}) }}
          className={`absolute flex items-center gap-2 rounded-lg border border-[#F7C96E]/60 bg-[#141920]/85 px-3.5 py-2 text-sm font-medium text-[#FCE6B4] transition-transform hover:scale-105 cursor-pointer ${getInspectRing(
            'citadelNode'
          )}`}
        >
          <Sparkles className="h-4 w-4 text-[#F4C465]" />
          <span>{t.claimTax}</span>
        </button>

        <button
          type="button"
          onClick={() => handleMineClick(t.eastMine, 60)}
          style={{ left: '75%', top: '32%' }}
          className="absolute flex items-center gap-2 rounded-lg border border-[#F7C96E]/60 bg-[#141920]/85 px-3.5 py-2 text-sm font-medium text-[#FCE6B4] transition-transform hover:scale-105 cursor-pointer"
        >
          <Pickaxe className="h-4 w-4 text-[#F4C465]" />
          <span>{t.harvestEast}</span>
        </button>

        {/* Harvest feedback toast */}
        {lastHarvestToast && (
          <div className="absolute left-1/2 top-24 -translate-x-1/2 rounded-lg border border-[#F4C465]/40 bg-[#141920]/90 px-5 py-2.5 text-base font-medium text-[#FCE6B4] shadow-lg">
            {lastHarvestToast}
          </div>
        )}

        {/* Desktop Game Bottom Tactical Action Bar */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-[#0E131A]/95 via-[#0E131A]/75 to-transparent px-7 py-5 text-[#ECE6DB]">
          <div className="flex items-center gap-5 text-sm">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#7BC47F]" />
              {activeLang === 'id'
                ? 'Deteksi Browser: Desktop Windows Chrome 131 (pointer: fine)'
                : 'Browser Detection: Desktop Windows Chrome 131 (pointer: fine)'}
            </span>
            <span className="text-white/40">·</span>
            <span className="font-mono">
              GPU: {renderConfig.hardwareAcceleration ? 'ANGLE Vulkan WebGL2' : 'Software SwiftShader'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#C8C0B2]">
              {t.graphics}{' '}
              {renderConfig.graphicsSaver
                ? activeLang === 'id'
                  ? 'Hemat Daya'
                  : 'Power Saver'
                : activeLang === 'id'
                ? 'Standar Penuh'
                : 'Full Desktop'}
            </span>
            <button
              type="button"
              onClick={() => handleMineClick(t.dailyQuest, 250)}
              className="rounded-lg border border-[#F4C465]/50 bg-[#F4C465]/15 px-4 py-2 font-medium text-[#FCE6B4] hover:bg-[#F4C465]/25 cursor-pointer"
            >
              {t.dailyClaim}
            </button>
          </div>
        </div>
      </div>

      {/* Mini Transparent Performance / FPS Overlay (Spec 12) */}
      {perfOverlayEnabled && (
        <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-lg border border-white/15 bg-black/55 px-3 py-1.5 font-mono text-[11px] text-[#F2EFE9] backdrop-blur-md tabular-nums">
          <span className="text-[#8CD1A5] font-semibold">{liveFps} FPS</span>
          <span className="mx-1.5 text-white/35">·</span>
          <span>{(1000 / Math.max(1, liveFps)).toFixed(1)}ms</span>
          <span className="mx-1.5 text-white/35">·</span>
          <span className="text-[#F2CA7E]">{totalRamMb} MB</span>
          <span className="mx-1.5 text-white/35">·</span>
          <span>DPR {renderConfig.renderScale.toFixed(2)}x</span>
        </div>
      )}

      {/* Built-in All-Languages Translation Banner Indicator */}
      {tr.enabled && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-lg border border-white/15 bg-[#1B1A17]/88 px-3 py-1 text-[11px] text-[#EFECE6] shadow-lg backdrop-blur whitespace-nowrap">
          <Languages className="h-3.5 w-3.5 shrink-0 text-[#D97757]" />
          <span>
            Terjemahan Aktif: {sourceLabel} → {targetLabel}
          </span>
        </div>
      )}

      {/* Touch-to-Inspect Magnifying Loupe Overlay (Spec 12) */}
      {touchInspectActive && cursorPos.visible && (
        <div
          style={{
            left: `${Math.min(78, Math.max(8, cursorPos.x))}%`,
            top: `${Math.max(6, cursorPos.y - 16)}%`,
          }}
          className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full rounded-xl border border-[#D97757] bg-[#181715]/95 px-3 py-2 text-[11px] text-[#F5EFE6] shadow-2xl backdrop-blur"
        >
          <div className="flex items-center gap-1.5 font-mono text-[#F2A68C]">
            <Crosshair className="h-3.5 w-3.5 shrink-0" />
            <span className="max-w-[200px] truncate">{hoveredInspectNode.selector}</span>
          </div>
          <p className="mt-0.5 font-mono text-[10px] text-[#ABA59B] tabular-nums">
            Loupe 2.0x · {hoveredInspectNode.boundsLabel} · Ketuk untuk edit CSS
          </p>
        </div>
      )}

      {/* Virtual Desktop Mouse Pointer Overlay */}
      {renderConfig.virtualMouse && !touchInspectActive && cursorPos.visible && (
        <div
          style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
          className="pointer-events-none absolute z-20 -translate-x-1 -translate-y-1 flex items-center gap-1"
        >
          <MousePointer2 className="h-5 w-5 fill-white text-[#1F1E1B] drop-shadow" />
          <span className="rounded bg-black/75 px-1.5 py-0.5 font-mono text-[10px] text-white tabular-nums">
            Mouse Virtual
          </span>
        </div>
      )}
    </div>
  );
};
