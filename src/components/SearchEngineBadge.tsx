import React from 'react';
import { SearchEngineId } from '../types/browser';

interface SearchEngineBadgeProps {
  engineId: SearchEngineId;
  size?: 'sm' | 'md';
}

export const SearchEngineBadge: React.FC<SearchEngineBadgeProps> = ({
  engineId,
  size = 'sm',
}) => {
  const boxClass =
    size === 'sm'
      ? 'h-5 w-5 rounded-full text-[10px]'
      : 'h-7 w-7 rounded-lg text-[11px]';

  switch (engineId) {
    case 'google':
      return (
        <span
          aria-hidden="true"
          className={`inline-flex shrink-0 items-center justify-center border border-[#DFD9CE] bg-white font-sans font-bold text-[#1F1E1B] shadow-[0_1px_1px_rgba(0,0,0,0.04)] dark:border-[#3A3732] dark:bg-[#2A2824] dark:text-[#F2EFE9] ${boxClass}`}
        >
          <svg viewBox="0 0 24 24" className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} fill="none">
            <path
              d="M20.6 12.2c0-.64-.06-1.26-.17-1.85H12v3.5h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.65-3.88 2.65-6.63Z"
              fill="#4285F4"
            />
            <path
              d="M12 21c2.43 0 4.47-.8 5.95-2.17l-2.91-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H3.97v2.33A9 9 0 0 0 12 21Z"
              fill="#34A853"
            />
            <path
              d="M6.97 13.73A5.41 5.41 0 0 1 6.68 12c0-.6.1-1.18.29-1.73V7.94H3.97A9 9 0 0 0 3 12c0 1.45.35 2.82.97 4.06l3-2.33Z"
              fill="#FBBC05"
            />
            <path
              d="M12 6.57c1.32 0 2.51.45 3.44 1.35l2.58-2.58C16.46 3.89 14.43 3 12 3a9 9 0 0 0-8.03 4.94l3 2.33C7.68 8.15 9.66 6.57 12 6.57Z"
              fill="#EA4335"
            />
          </svg>
        </span>
      );

    case 'brave':
      return (
        <span
          aria-hidden="true"
          className={`inline-flex shrink-0 items-center justify-center bg-[#FB542B]/14 text-[#D9431F] dark:bg-[#FB542B]/20 dark:text-[#FF8566] ${boxClass}`}
        >
          <svg viewBox="0 0 24 24" className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} fill="none">
            <path
              d="M12 3 5.5 6.2 7 15.2 12 21l5-5.8 1.5-9L12 3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M9 10.5 12 13l3-2.5M12 13v4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      );

    case 'duckduckgo':
      return (
        <span
          aria-hidden="true"
          className={`inline-flex shrink-0 items-center justify-center bg-[#DE5833]/14 text-[#C64724] dark:bg-[#DE5833]/22 dark:text-[#F49377] ${boxClass}`}
        >
          <svg viewBox="0 0 24 24" className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} fill="none">
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.9" />
            <circle cx="10.2" cy="10" r="1.2" fill="currentColor" />
            <path
              d="M12.5 12.2c2.2 0 4 .7 4 1.6 0 1-1.7 1.6-3.7 1.4-1.3-.1-2.4-.5-2.8-1.1"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </span>
      );

    case 'bing':
      return (
        <span
          aria-hidden="true"
          className={`inline-flex shrink-0 items-center justify-center bg-[#008373]/14 text-[#007366] dark:bg-[#20A898]/20 dark:text-[#66D4C6] ${boxClass}`}
        >
          <svg viewBox="0 0 24 24" className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} fill="none">
            <path
              d="M7 4.5v13.2l4.2 2.3 6.3-3.6v-3.7l-5.5-2 1.8 3.6-2.8 1.5V6.5L7 4.5Z"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      );

    case 'yandex':
      return (
        <span
          aria-hidden="true"
          className={`inline-flex shrink-0 items-center justify-center bg-[#D93829]/14 font-editorial font-bold text-[#C22B1E] dark:bg-[#E04F41]/22 dark:text-[#F58B80] ${boxClass}`}
        >
          Y
        </span>
      );

    case 'custom':
    default:
      return (
        <span
          aria-hidden="true"
          className={`inline-flex shrink-0 items-center justify-center border border-[#D8D1C4] bg-[#EFECE6] text-[#8E3C21] dark:border-[#3D3A34] dark:bg-[#2C2A26] dark:text-[#E59377] ${boxClass}`}
        >
          <svg viewBox="0 0 24 24" className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} fill="none">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
            <path
              d="M16 16l4 4M11 8v6M8 11h6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>
      );
  }
};
