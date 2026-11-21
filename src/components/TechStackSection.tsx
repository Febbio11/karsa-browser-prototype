import React from 'react';
import { ENGINE_COMPARISON, TECH_STACK_LAYERS } from '../data/architectureData';

export const TechStackSection: React.FC = () => {
  return (
    <section className="space-y-10">
      {/* Header */}
      <div className="max-w-3xl space-y-2.5 border-b border-[#E5E0D6] pb-6 dark:border-[#2E2C28]">
        <p className="text-xs font-medium text-[#8E3C21] dark:text-[#E28A6C]">
          01. Rekomendasi Tech Stack · Target Android ARM64
        </p>
        <h1 className="font-editorial text-3xl font-semibold tracking-tight sm:text-4xl [text-wrap:balance]">
          Custom Chromium Fork (basis Cromite) dengan Android UI Jetpack Compose.
        </h1>
        <p className="text-sm leading-relaxed text-[#5C5953] dark:text-[#A6A198]">
          Untuk menggabungkan kompatibilitas penuh ekstensi Chrome Web Store (<code className="font-mono">.crx</code> Manifest V3 untuk MetaMask, Rabby, dan Phantom), stabilitas WebGL2/WebGPU, kontrol FPS/DPR di level compositor, serta pemblokiran intent eksternal yang absolut, arsitektur fork Chromium ringan adalah satu-satunya opsi yang memenuhi seluruh spesifikasi tanpa kompromi.
        </p>
      </div>

      {/* Verdict Summary Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-[#E5E0D6] bg-white p-6 space-y-2 dark:border-[#2E2C28] dark:bg-[#22201D]">
          <p className="text-xs text-[#8E3C21] dark:text-[#E28A6C]">Pilihan Utama</p>
          <h2 className="font-editorial text-xl font-semibold">Cromite / Chromium Fork + Patch WebExtensions</h2>
          <p className="text-sm leading-relaxed text-[#5C5953] dark:text-[#A6A198]">
            Menghapus layanan Google bloat/telemetri sejak tahap kompilasi (GN args), menambahkan dukungan <code className="font-mono">//extensions</code> ala Kiwi Browser, serta membuka jembatan JNI untuk kontrol DPR, BeginFrame FPS, dan Proxy per-sesi.
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E0D6] bg-white p-6 space-y-2 dark:border-[#2E2C28] dark:bg-[#22201D]">
          <p className="text-xs text-[#5C5953] dark:text-[#A6A198]">Mengapa Bukan GeckoView?</p>
          <h2 className="font-editorial text-xl font-semibold">Kendala Ekosistem Wallet & RAM</h2>
          <p className="text-sm leading-relaxed text-[#5C5953] dark:text-[#A6A198]">
            GeckoView sangat kuat untuk privasi, tetapi hanya mendukung format XPI Mozilla. Mayoritas wallet Web3 terbaru (seperti Rabby) memprioritaskan Chrome Web Store (<code className="font-mono">.crx</code>) dan API Chromium.
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E0D6] bg-white p-6 space-y-2 dark:border-[#2E2C28] dark:bg-[#22201D]">
          <p className="text-xs text-[#5C5953] dark:text-[#A6A198]">Mengapa Bukan System WebView?</p>
          <h2 className="font-editorial text-xl font-semibold">Batas Kontrol Engine & Ekstensi</h2>
          <p className="text-sm leading-relaxed text-[#5C5953] dark:text-[#A6A198]">
            Android System WebView tidak memiliki subsistem WebExtensions, tidak mendukung autentikasi SOCKS5 per-sesi, dan tidak menyediakan akses native ke <code className="font-mono">WebContents</code> reparenting atau <code className="font-mono">BeginFrameSource</code>.
          </p>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="space-y-3">
        <div>
          <h2 className="font-editorial text-2xl font-semibold">Perbandingan Engine Browser Android</h2>
          <p className="text-sm text-[#5C5953] dark:text-[#A6A198]">
            Evaluasi teknis terhadap 7 persyaratan kritikal game browser desktop dan Web3.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E5E0D6] bg-white dark:border-[#2E2C28] dark:bg-[#22201D]">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#E5E0D6] bg-[#F3EFE7] text-xs font-semibold text-[#3E3B35] dark:border-[#32302B] dark:bg-[#1B1A18] dark:text-[#D8D3C9]">
                <th className="px-5 py-3.5 w-[22%]">Kriteria Teknis</th>
                <th className="px-5 py-3.5 w-[28%] text-[#8E3C21] dark:text-[#E59377]">
                  Custom Chromium Fork (Rekomendasi)
                </th>
                <th className="px-5 py-3.5 w-[25%]">GeckoView (Mozilla)</th>
                <th className="px-5 py-3.5 w-[25%]">Android System WebView</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE6] text-xs leading-relaxed dark:divide-[#2E2C28]">
              {ENGINE_COMPARISON.map((row) => (
                <tr key={row.criterion} className="hover:bg-[#FAF8F4] dark:hover:bg-[#282622]">
                  <td className="px-5 py-3.5 font-medium text-[#1F1E1B] dark:text-[#F2EFE9]">
                    {row.criterion}
                  </td>
                  <td className="px-5 py-3.5 text-[#1F1E1B] dark:text-[#EFECE6]">
                    {row.chromiumFork}
                  </td>
                  <td className="px-5 py-3.5 text-[#5C5953] dark:text-[#A6A198]">
                    {row.geckoView}
                  </td>
                  <td className="px-5 py-3.5 text-[#5C5953] dark:text-[#A6A198]">
                    {row.systemWebView}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6-Layer Stack Architecture Breakdown */}
      <div className="space-y-4">
        <div>
          <h2 className="font-editorial text-2xl font-semibold">Susunan 6 Lapisan Stack Produksi</h2>
          <p className="text-sm text-[#5C5953] dark:text-[#A6A198]">
            Kombinasi modul native Android dan subsistem Chromium yang dibutuhkan dari UI hingga keamanan kredensial.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {TECH_STACK_LAYERS.map((item, idx) => (
            <article
              key={item.id}
              className="rounded-xl border border-[#E5E0D6] bg-white p-6 space-y-2.5 dark:border-[#2E2C28] dark:bg-[#22201D]"
            >
              <div className="flex items-center justify-between gap-2 text-xs text-[#7A746B] dark:text-[#9D978E]">
                <span>0{idx + 1}. {item.layer}</span>
              </div>
              <h3 className="font-editorial text-lg font-semibold text-[#1F1E1B] dark:text-[#F2EFE9]">
                {item.technology}
              </h3>
              <p className="text-sm leading-relaxed text-[#45423C] dark:text-[#CBC6BC]">
                {item.role}
              </p>
              <p className="border-t border-[#EFECE6] pt-2.5 text-xs leading-relaxed text-[#6C675E] dark:border-[#302E29] dark:text-[#9D978E]">
                Alasan pemilihan: {item.rationale}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
