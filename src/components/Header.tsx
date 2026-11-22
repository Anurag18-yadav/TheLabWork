import React, { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { AppScreen } from '../types';

interface HeaderProps {
  activeScreen: AppScreen;
  onSelectScreen: (screen: AppScreen) => void;
  onOpenDemoModal: () => void;
}

const NAV_ITEMS: { id: AppScreen; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'owner', label: 'Owner' },
  { id: 'teacher', label: 'Teacher' },
  { id: 'student', label: 'Student' },
];

export const Header: React.FC<HeaderProps> = ({
  activeScreen,
  onSelectScreen,
  onOpenDemoModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (screen: AppScreen) => {
    onSelectScreen(screen);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMobileDemoClick = () => {
    setMobileMenuOpen(false);
    onOpenDemoModal();
  };

  return (
    <header className="sticky top-2.5 md:top-3 z-40 px-0 md:px-6 pt-2.5 md:pt-3">
      <div className="w-[calc(100%-24px)] md:w-full max-w-6xl box-border overflow-hidden md:overflow-visible mx-auto rounded-full bg-surface-container-low/95 backdrop-blur-sm border border-outline-variant shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] px-3 md:px-6 py-2 flex items-center justify-between gap-2 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('overview')}
          className="flex items-center gap-1.5 md:gap-2.5 text-on-surface min-w-0 shrink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-full md:pr-1 cursor-pointer"
        >
          <span
            className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-white border border-brand-amber flex items-center justify-center shrink-0 overflow-hidden"
            aria-hidden="true"
          >
            <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
              <text
                x="32"
                y="30"
                textAnchor="middle"
                fontFamily="Georgia, 'Crimson Pro', serif"
                fontSize="9.5"
                fontWeight="700"
                fill="#1A1A1A"
              >
                The<tspan fill="#F39200">Lab</tspan>Work
              </text>
              <text
                x="32"
                y="38"
                textAnchor="middle"
                fontFamily="Commissioner, sans-serif"
                fontSize="2.6"
                fontWeight="600"
                letterSpacing="0.35"
                fill="#1A1A1A"
              >
                WE DON&apos;T JUST IMAGINE.
              </text>
              <text
                x="32"
                y="42"
                textAnchor="middle"
                fontFamily="Commissioner, sans-serif"
                fontSize="2.6"
                fontWeight="600"
                letterSpacing="0.35"
                fill="#1A1A1A"
              >
                WE ENGINEER
              </text>
            </svg>
          </span>
          <span className="font-headline text-[16px] md:text-[22px] leading-none tracking-tight text-on-surface whitespace-nowrap truncate">
            The<span className="text-brand-amber-ink">Lab</span>Work
          </span>
        </button>

        {/* Zone 2: Clean Single-Line Nav Links */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-8 shrink-0">
          {NAV_ITEMS.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`font-label text-[14px] font-medium whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${
                  isActive
                    ? 'text-on-surface border-brand-amber'
                    : 'text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action + Bare Mobile Menu Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenDemoModal}
            className="inline-flex items-center justify-center gap-1.5 md:gap-2 rounded-full bg-primary text-on-primary px-3 md:px-5 py-1.5 md:py-2.5 font-label text-xs md:text-[14px] font-medium whitespace-nowrap shrink-0 transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
          >
            <span>Book a free demo</span>
            <ArrowRight className="hidden md:inline-block w-4 h-4 text-brand-amber shrink-0" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="flex md:hidden items-center justify-center p-1 text-on-surface hover:text-brand-amber-ink transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden w-[calc(100%-24px)] max-w-6xl mx-auto mt-2 rounded-[18px] bg-surface-container-low border border-outline-variant shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] p-3 flex flex-col gap-1"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl font-label text-[14px] font-medium transition-colors cursor-pointer flex items-center justify-between ${
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface hover:bg-surface-container'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="font-label text-[11px] uppercase tracking-wider text-brand-amber">
                    Active
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2.5 mt-1.5 border-t border-outline-variant">
            <button
              type="button"
              onClick={handleMobileDemoClick}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-on-primary px-5 py-3 font-label text-[14px] font-medium hover:bg-primary-hover transition-colors cursor-pointer"
            >
              <span>Book a free demo</span>
              <ArrowRight className="w-4 h-4 text-brand-amber shrink-0" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};
