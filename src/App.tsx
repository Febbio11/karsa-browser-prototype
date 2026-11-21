import { useEffect, useState } from 'react';
import { AppSection } from './types/browser';
import { TopNav } from './components/TopNav';
import { BrowserSimulator } from './components/BrowserSimulator';
import { TechStackSection } from './components/TechStackSection';
import { ArchitectureSection } from './components/ArchitectureSection';
import { RoadmapSection } from './components/RoadmapSection';
import { CoreCodeSection } from './components/CoreCodeSection';

export default function App() {
  const [activeSection, setActiveSection] = useState<AppSection>('prototype');
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const handleSelectSection = (section: AppSection) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#1F1E1B] transition-colors duration-200 dark:bg-[#191816] dark:text-[#F2EFE9]">
      <TopNav activeSection={activeSection} onSelectSection={handleSelectSection} />

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {activeSection === 'prototype' && (
          <BrowserSimulator
            isDark={isDark}
            onToggleTheme={() => setIsDark((prev) => !prev)}
          />
        )}
        {activeSection === 'stack' && <TechStackSection />}
        {activeSection === 'architecture' && <ArchitectureSection />}
        {activeSection === 'roadmap' && <RoadmapSection />}
        {activeSection === 'code' && <CoreCodeSection />}
      </main>

      <footer className="border-t border-[#E5E0D6] bg-[#F7F5F0] py-6 dark:border-[#2E2C28] dark:bg-[#191816]">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-4 px-4 text-xs text-[#6C675E] sm:flex-row sm:items-center sm:px-6 lg:px-8 dark:text-[#9D978E]">
          <p>
            Karsa Browser · Cetak Biru Arsitektur & Prototipe Mobile Browser Kelas Desktop (Android Chromium Fork)
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => handleSelectSection('prototype')}
              className="hover:text-[#1F1E1B] dark:hover:text-[#F2EFE9] cursor-pointer"
            >
              Prototipe UI
            </button>
            <button
              type="button"
              onClick={() => handleSelectSection('stack')}
              className="hover:text-[#1F1E1B] dark:hover:text-[#F2EFE9] cursor-pointer"
            >
              Tech Stack
            </button>
            <button
              type="button"
              onClick={() => handleSelectSection('architecture')}
              className="hover:text-[#1F1E1B] dark:hover:text-[#F2EFE9] cursor-pointer"
            >
              Arsitektur
            </button>
            <button
              type="button"
              onClick={() => handleSelectSection('roadmap')}
              className="hover:text-[#1F1E1B] dark:hover:text-[#F2EFE9] cursor-pointer"
            >
              Roadmap
            </button>
            <button
              type="button"
              onClick={() => handleSelectSection('code')}
              className="hover:text-[#1F1E1B] dark:hover:text-[#F2EFE9] cursor-pointer"
            >
              Kode Inti
            </button>
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              className="hover:text-[#1F1E1B] dark:hover:text-[#F2EFE9] cursor-pointer"
            >
              {isDark ? 'Tema Terang' : 'Tema Gelap'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
