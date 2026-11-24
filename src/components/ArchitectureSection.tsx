import React, { useState } from 'react';
import { ARCHITECTURE_MODULES, WORKFLOW_BLUEPRINTS, WorkflowBlueprint } from '../data/architectureData';

export const ArchitectureSection: React.FC = () => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(ARCHITECTURE_MODULES[0].id);
  const [selectedWorkflowId, setSelectedWorkflowId] =
    useState<WorkflowBlueprint['id']>('anti-redirect');

  const activeModule =
    ARCHITECTURE_MODULES.find((m) => m.id === selectedModuleId) || ARCHITECTURE_MODULES[0];
  const activeWorkflow =
    WORKFLOW_BLUEPRINTS.find((w) => w.id === selectedWorkflowId) || WORKFLOW_BLUEPRINTS[0];

  return (
    <section className="space-y-10">
      {/* Header */}
      <div className="max-w-3xl space-y-2.5 border-b border-[#E5E0D6] pb-6 dark:border-[#2E2C28]">
        <p className="text-xs font-medium text-[#8E3C21] dark:text-[#E28A6C]">
          02. Struktur Arsitektur & Alur Kerja Fitur Utama
        </p>
        <h1 className="font-editorial text-3xl font-semibold tracking-tight sm:text-4xl [text-wrap:balance]">
          Isolasi proses multi-lapisan untuk stabilitas game, keamanan navigasi, dan nol kebocoran intent.
        </h1>
        <p className="text-sm leading-relaxed text-[#5C5953] dark:text-[#A6A198]">
          Pilih modul sistem untuk memeriksa kontrak IPC dan batas prosesnya, lalu telusuri alur kerja langkah demi langkah untuk mekanisme anti-redirect, pop-up fleksibel, terminal/proxy, serta kontrol render manual.
        </p>
      </div>

      {/* Interactive Module Architecture Inspector */}
      <div className="space-y-4">
        <h2 className="font-editorial text-2xl font-semibold">Peta Modul & Batas Proses</h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Module Selector List */}
          <div className="lg:col-span-5 divide-y divide-[#E5E0D6] overflow-hidden rounded-xl border border-[#E5E0D6] bg-white dark:divide-[#2E2C28] dark:border-[#2E2C28] dark:bg-[#22201D]">
            {ARCHITECTURE_MODULES.map((mod, idx) => {
              const active = mod.id === activeModule.id;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setSelectedModuleId(mod.id)}
                  className={`block w-full px-5 py-4 text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#F5EFE6] dark:bg-[#2D2A26]'
                      : 'hover:bg-[#FAF8F4] dark:hover:bg-[#272521]'
                  }`}
                >
                  <p className="text-[11px] text-[#7A746B] dark:text-[#9D978E]">
                    0{idx + 1} · {mod.layer}
                  </p>
                  <p className="mt-0.5 font-editorial text-base font-semibold text-[#1F1E1B] dark:text-[#F2EFE9]">
                    {mod.name}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-[#8E3C21] dark:text-[#E59377]">
                    {mod.process}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Module Detail */}
          <div className="lg:col-span-7 rounded-xl border border-[#E5E0D6] bg-white p-6 space-y-5 dark:border-[#2E2C28] dark:bg-[#22201D]">
            <div className="space-y-1.5 border-b border-[#EFECE6] pb-4 dark:border-[#302E29]">
              <p className="text-xs text-[#7A746B] dark:text-[#9D978E]">
                {activeModule.layer} · {activeModule.process}
              </p>
              <h3 className="font-editorial text-2xl font-semibold">{activeModule.name}</h3>
              <p className="text-sm leading-relaxed text-[#5C5953] dark:text-[#A6A198]">
                {activeModule.summary}
              </p>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-[#1F1E1B] dark:text-[#F2EFE9]">
                Tanggung Jawab Utama Modul
              </h4>
              <ul className="space-y-2 text-sm leading-relaxed text-[#45423C] dark:text-[#CBC6BC]">
                {activeModule.responsibilities.map((resp, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="font-mono text-xs text-[#C86442] dark:text-[#D97757] pt-0.5">
                      0{i + 1}.
                    </span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-[#E5E0D6] bg-[#FAF8F4] px-4 py-3 dark:border-[#34322C] dark:bg-[#191816]">
              <p className="text-[11px] text-[#7A746B] dark:text-[#9D978E]">Kontrak Komunikasi (IPC / JNI)</p>
              <p className="mt-0.5 font-mono text-xs text-[#1F1E1B] dark:text-[#EFECE6]">
                {activeModule.ipcContract}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Deep-Dive Workflow Stepper */}
      <div className="space-y-5 pt-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-editorial text-2xl font-semibold">Alur Kerja 7 Mekanisme Kritikal</h2>
            <p className="text-sm text-[#5C5953] dark:text-[#A6A198]">
              Pilih mekanisme untuk melihat urutan eksekusi dari pemicu hingga hasil di perangkat Android.
            </p>
          </div>
        </div>

        {/* Interactive Segmented Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#E5E0D6] pb-3 dark:border-[#2E2C28]">
          {WORKFLOW_BLUEPRINTS.map((wf) => {
            const active = wf.id === activeWorkflow.id;
            return (
              <button
                key={wf.id}
                type="button"
                onClick={() => setSelectedWorkflowId(wf.id)}
                className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#1F1E1B] text-[#FAF8F4] dark:bg-[#D97757] dark:text-[#191816]'
                    : 'border border-[#DDD7CB] bg-white text-[#4A4741] hover:bg-[#EFECE6] dark:border-[#34322C] dark:bg-[#22201D] dark:text-[#C5C0B6] dark:hover:bg-[#2C2A26]'
                }`}
              >
                {wf.id === 'mobile-devtools' && 'Mobile DevTools & Inspector'}
                {wf.id === 'fullscreen-profiles' && 'Full Screen, Zoom & Multi-Profil'}
                {wf.id === 'anti-redirect' && 'Anti-Redirect Lockdown'}
                {wf.id === 'flexible-popup' && 'Pop-up Fleksibel & Reparenting'}
                {wf.id === 'terminal-proxy' && 'Terminal, CDP & Proxy'}
                {wf.id === 'render-fps' && 'Kontrol Render & FPS'}
                {wf.id === 'play-protect-security' && 'Keamanan & Play Protect'}
              </button>
            );
          })}
        </div>

        {/* Workflow Detail */}
        <div className="rounded-xl border border-[#E5E0D6] bg-white p-6 space-y-6 dark:border-[#2E2C28] dark:bg-[#22201D]">
          <div className="space-y-1.5">
            <h3 className="font-editorial text-2xl font-semibold">{activeWorkflow.title}</h3>
            <p className="text-sm text-[#5C5953] dark:text-[#A6A198]">{activeWorkflow.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 border-y border-[#EFECE6] py-4 text-xs dark:border-[#302E29]">
            <div>
              <p className="text-[#7A746B] dark:text-[#9D978E]">Pemicu (Trigger)</p>
              <p className="mt-1 font-mono leading-relaxed text-[#1F1E1B] dark:text-[#EFECE6]">
                {activeWorkflow.trigger}
              </p>
            </div>
            <div>
              <p className="text-[#7A746B] dark:text-[#9D978E]">Hasil Akhir yang Dijamin</p>
              <p className="mt-1 leading-relaxed text-[#1F1E1B] dark:text-[#EFECE6]">
                {activeWorkflow.outcome}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {activeWorkflow.steps.map((s) => (
              <div
                key={s.step}
                className="space-y-2 border-t border-[#E5E0D6] pt-3 dark:border-[#34322C]"
              >
                <p className="font-mono text-xs font-semibold text-[#C86442] dark:text-[#D97757]">
                  Tahap {s.step}
                </p>
                <h4 className="text-sm font-semibold text-[#1F1E1B] dark:text-[#F2EFE9]">
                  {s.component}
                </h4>
                <p className="text-xs leading-relaxed text-[#5C5953] dark:text-[#A6A198]">
                  {s.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
