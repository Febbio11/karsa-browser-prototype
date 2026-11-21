import React from 'react';
import { AppSection } from '../types/browser';

interface TopNavProps {
  activeSection: AppSection;
  onSelectSection: (section: AppSection) => void;
}

const NAV_ITEMS: { id: AppSection; label: string }[] = [
  { id: 'prototype', label: 'Prototipe UI' },
  { id: 'stack', label: 'Tech Stack' },
  { id: 'architecture', label: 'Arsitektur' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'code', label: 'Kode Inti' },
];

export const TopNav: React.FC<TopNavProps> = ({ activeSection, onSelectSection }) => {
  const isCodeActive = activeSection === 'code';

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E0D6] bg-[#F7F5F0]/95 backdrop-blur-md dark:border-[#2E2C28] dark:bg-[#191816]/95">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onSelectSection('prototype')}
          className="font-editorial text-xl font-semibold tracking-tight text-[#1F1E1B] transition-colors hover:text-[#C86442] whitespace-nowrap shrink-0 cursor-pointer dark:text-[#F2EFE9] dark:hover:text-[#D97757]"
        >
          Karsa Browser
        </button>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav
          aria-label="Navigasi utama"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5C5953] dark:text-[#A6A198]"
        >
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'text-[#1F1E1B] dark:text-[#F2EFE9]'
                    : 'hover:text-[#1F1E1B] dark:hover:text-[#F2EFE9]'
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-0 -bottom-[21px] h-[2px] bg-[#C86442] dark:bg-[#D97757]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary CTA button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => onSelectSection(isCodeActive ? 'prototype' : 'code')}
            className="rounded-lg bg-[#1F1E1B] px-4 py-2 text-xs font-medium text-[#F7F5F0] transition-colors hover:bg-[#35332E] whitespace-nowrap shrink-0 cursor-pointer dark:bg-[#D97757] dark:text-[#191816] dark:hover:bg-[#E4886A]"
          >
            {isCodeActive ? 'Buka Prototipe' : 'Lihat Kode Inti'}
          </button>
        </div>
      </div>

      {/* Mobile single-row scrollable navigation below md */}
      <div className="flex md:hidden items-center gap-5 overflow-x-auto border-t border-[#E5E0D6] px-4 py-2 text-xs font-medium text-[#5C5953] dark:border-[#2E2C28] dark:text-[#A6A198]">
        {NAV_ITEMS.map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={`whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                active
                  ? 'text-[#C86442] dark:text-[#D97757] font-semibold'
                  : 'hover:text-[#1F1E1B] dark:hover:text-[#F2EFE9]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
