import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { ROADMAP_PHASES } from '../data/architectureData';

export const RoadmapSection: React.FC = () => {
  const [filterPhase, setFilterPhase] = useState<string>('all');

  const visiblePhases =
    filterPhase === 'all'
      ? ROADMAP_PHASES
      : ROADMAP_PHASES.filter((p) => p.id === filterPhase);

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#E5E0D6] pb-6 lg:flex-row lg:items-end lg:justify-between dark:border-[#2E2C28]">
        <div className="max-w-3xl space-y-2.5">
          <p className="text-xs font-medium text-[#8E3C21] dark:text-[#E28A6C]">
            03. Rencana Pengembangan Bertahap · 24 Minggu (MVP ke Rilis Penuh)
          </p>
          <h1 className="font-editorial text-3xl font-semibold tracking-tight sm:text-4xl [text-wrap:balance]">
            Eksekusi terukur mulai dari engine desktop ringan hingga ekosistem ekstensi Web3 lengkap.
          </h1>
          <p className="text-sm leading-relaxed text-[#5C5953] dark:text-[#A6A198]">
            Setiap fase dikunci dengan target kinerja perangkat Android kelas menengah (RAM 6 GB, Snapdragon 680 / Dimensity 700) agar fitur baru tidak pernah mengorbankan stabilitas FPS atau memori.
          </p>
        </div>

        {/* Interactive Phase Filter */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#DDD7CB] bg-[#EFECE6] p-1 text-xs font-medium shrink-0 dark:border-[#34322C] dark:bg-[#23221F]">
          {[
            { id: 'all', label: 'Semua Fase' },
            { id: 'phase-1', label: 'Fase 1 (MVP)' },
            { id: 'phase-2', label: 'Fase 2' },
            { id: 'phase-3', label: 'Fase 3' },
            { id: 'phase-4', label: 'Fase 4' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilterPhase(item.id)}
              className={`rounded-md px-2.5 py-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                filterPhase === item.id
                  ? 'bg-white text-[#1F1E1B] shadow-sm dark:bg-[#32302B] dark:text-[#F2EFE9]'
                  : 'text-[#5C5953] hover:text-[#1F1E1B] dark:text-[#A6A198]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Benchmark Targets Strip */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 border-b border-[#E5E0D6] pb-6 dark:border-[#2E2C28]">
        <div>
          <p className="text-xs text-[#6C675E] dark:text-[#9D978E]">Target Cold Start (Mid-Range)</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">&lt; 1,2 dtk</p>
        </div>
        <div>
          <p className="text-xs text-[#6C675E] dark:text-[#9D978E]">Batas RAM (1 Game + 5 Tab Latar)</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">&lt; 520 MB</p>
        </div>
        <div>
          <p className="text-xs text-[#6C675E] dark:text-[#9D978E]">Kebocoran Redirect Aplikasi Luar</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">0%</p>
        </div>
        <div>
          <p className="text-xs text-[#6C675E] dark:text-[#9D978E]">Latensi Pergantian Proxy Sesi</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">&lt; 300 ms</p>
        </div>
      </div>

      {/* Phases List */}
      <div className="space-y-5">
        {visiblePhases.map((phase) => (
          <article
            key={phase.id}
            className="rounded-xl border border-[#E5E0D6] bg-white p-6 space-y-5 dark:border-[#2E2C28] dark:bg-[#22201D]"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between border-b border-[#EFECE6] pb-4 dark:border-[#302E29]">
              <div>
                <p className="text-xs font-medium text-[#8E3C21] dark:text-[#E59377]">
                  {phase.phase} · {phase.duration}
                </p>
                <h2 className="mt-1 font-editorial text-2xl font-semibold">{phase.title}</h2>
              </div>
              <p className="text-xs text-[#5C5953] max-w-md sm:text-right dark:text-[#A6A198]">
                {phase.target}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7 space-y-2.5">
                <h3 className="text-xs font-semibold text-[#1F1E1B] dark:text-[#F2EFE9]">
                  Ruang Lingkup & Deliverable Utama
                </h3>
                <ul className="space-y-2 text-sm text-[#45423C] dark:text-[#CBC6BC]">
                  {phase.deliverables.map((deliv, i) => (
                    <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                      <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-[#C86442] dark:text-[#D97757]" />
                      <span>{deliv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-5 rounded-lg border border-[#EAE5DC] bg-[#FAF8F4] p-4 space-y-2.5 dark:border-[#33312B] dark:bg-[#191816]">
                <h3 className="text-xs font-semibold text-[#1F1E1B] dark:text-[#F2EFE9]">
                  Kriteria Penerimaan (Exit Gate)
                </h3>
                <ul className="space-y-2 text-xs leading-relaxed text-[#5C5953] dark:text-[#A6A198]">
                  {phase.acceptanceCriteria.map((crit, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-mono text-[#8E3C21] dark:text-[#E59377]">0{i + 1}.</span>
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
