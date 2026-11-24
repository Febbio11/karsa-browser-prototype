import React, { useMemo, useState } from 'react';
import { Copy, Check, FileCode2, ShieldCheck } from 'lucide-react';
import { STARTER_CODE_FILES } from '../data/architectureData';

type CodeFilter = 'all' | 'security' | 'core';

export const CoreCodeSection: React.FC = () => {
  const [filter, setFilter] = useState<CodeFilter>('all');
  const [selectedFileId, setSelectedFileId] = useState<string>('sec-manifest-xml');
  const [copied, setCopied] = useState(false);

  const visibleFiles = useMemo(() => {
    if (filter === 'security') {
      return STARTER_CODE_FILES.filter((f) => f.category === 'security');
    }
    if (filter === 'core') {
      return STARTER_CODE_FILES.filter((f) => f.category !== 'security');
    }
    return STARTER_CODE_FILES;
  }, [filter]);

  const securityCount = useMemo(
    () => STARTER_CODE_FILES.filter((f) => f.category === 'security').length,
    []
  );

  const activeFile =
    visibleFiles.find((f) => f.id === selectedFileId) || visibleFiles[0] || STARTER_CODE_FILES[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#E5E0D6] pb-6 lg:flex-row lg:items-end lg:justify-between dark:border-[#2E2C28]">
        <div className="max-w-3xl space-y-2.5">
          <p className="text-xs font-medium text-[#8E3C21] dark:text-[#E28A6C]">
            04. Kode Inti &amp; Keamanan Produksi Android · Kotlin, XML, Gradle, ProGuard, YAML &amp; C++
          </p>
          <h1 className="font-editorial text-3xl font-semibold tracking-tight sm:text-4xl [text-wrap:balance]">
            Modul siap salin untuk Keamanan Play Protect, Enkripsi Keystore, R8 Release, CI/CD, dan komponen inti browser.
          </h1>
          <p className="text-sm leading-relaxed text-[#5C5953] dark:text-[#A6A198]">
            Seluruh berkas bersih dan bebas placeholder — siap langsung ditempel ke struktur repositori Android <span className="font-mono text-xs">karsa-browser-android</span>.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {(
            [
              { id: 'all', label: `Semua (${STARTER_CODE_FILES.length})` },
              { id: 'security', label: `Keamanan & Play Protect (${securityCount})` },
              { id: 'core', label: `UI & Engine (${STARTER_CODE_FILES.length - securityCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setFilter(tab.id);
                setCopied(false);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#1F1E1B] text-[#FAF8F4] dark:bg-[#D97757] dark:text-[#191816]'
                  : 'border border-[#DDD7CB] bg-white text-[#4A4741] hover:bg-[#EFECE6] dark:border-[#34322C] dark:bg-[#22201D] dark:text-[#C5C0B6] dark:hover:bg-[#2C2A26]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Code Browser Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* File Tree Sidebar */}
        <aside className="lg:col-span-4 thin-scrollbar max-h-[660px] overflow-y-auto divide-y divide-[#E5E0D6] rounded-xl border border-[#E5E0D6] bg-white dark:divide-[#2E2C28] dark:border-[#2E2C28] dark:bg-[#22201D]">
          {visibleFiles.map((file) => {
            const active = file.id === activeFile.id;
            const isSecurity = file.category === 'security';
            return (
              <button
                key={file.id}
                type="button"
                onClick={() => {
                  setSelectedFileId(file.id);
                  setCopied(false);
                }}
                className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#F5EFE6] dark:bg-[#2D2A26]'
                    : 'hover:bg-[#FAF8F4] dark:hover:bg-[#272521]'
                }`}
              >
                {isSecurity ? (
                  <ShieldCheck
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      active ? 'text-[#2E7D4F] dark:text-[#86CFA0]' : 'text-[#5D8A6E] dark:text-[#6FA885]'
                    }`}
                  />
                ) : (
                  <FileCode2
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      active ? 'text-[#C86442] dark:text-[#D97757]' : 'text-[#8C867B]'
                    }`}
                  />
                )}
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-[#1F1E1B] truncate dark:text-[#F2EFE9]">
                    {file.filename}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#6C675E] dark:text-[#9D978E]">
                    {file.module} · {file.language}
                  </p>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Code Viewer Pane */}
        <div className="lg:col-span-8 overflow-hidden rounded-xl border border-[#2E2C28] bg-[#181715] text-[#EDE8DE] shadow-sm">
          {/* File Meta Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2C2A25] bg-[#21201D] px-5 py-3.5">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold text-[#F5EFE6] truncate">
                {activeFile.path}
              </p>
              <p className="mt-1 text-xs text-[#ABA59B]">{activeFile.summary}</p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-[#3B3832] bg-[#2A2824] px-3 py-1.5 text-xs font-medium text-[#F2EFE9] transition-colors hover:bg-[#38352F] whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#8CD1A5]" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#D97757]" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>

          {/* Monospace Code Content with Line Numbers */}
          <div className="thin-scrollbar max-h-[600px] overflow-auto p-5 font-mono text-xs leading-6">
            <pre className="m-0">
              <code>
                {activeFile.code.split('\n').map((line, idx) => (
                  <div key={idx} className="table-row">
                    <span className="table-cell select-none pr-5 text-right text-[#66615A] tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="table-cell whitespace-pre text-[#E8E2D6]">{line}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};
