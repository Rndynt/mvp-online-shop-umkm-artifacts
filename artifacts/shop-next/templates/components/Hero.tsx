import type { ReactNode } from 'react';

export type HeroVariant = 'basic' | 'modern' | 'fullwidth';

export interface HeroProps {
  title: ReactNode;
  subtitle?: ReactNode;
  badgeText?: ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  variant?: HeroVariant;
}

export function Hero({
  title,
  subtitle,
  badgeText,
  ctaLabel = 'Belanja Sekarang',
  ctaHref = '#produk',
  variant = 'basic',
}: HeroProps) {
  if (variant === 'fullwidth') {
    return (
      <div className="relative left-1/2 -translate-x-1/2 w-screen mb-12 overflow-hidden -mt-8">
        <div
          className="relative bg-primary px-4 pt-16 pb-24 sm:pt-24 sm:pb-32 text-center text-white"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 88%, 0 100%)' }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-black/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-primary-foreground/5 blur-2xl" />
          </div>
          <div className="relative max-w-3xl mx-auto">
            {badgeText && (
              <span className="mb-6 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold ring-1 ring-white/30 backdrop-blur-sm">
                {badgeText}
              </span>
            )}
            <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-white/80 sm:text-xl">
                {subtitle}
              </p>
            )}
            <a
              href={ctaHref}
              className="inline-block rounded-full bg-white px-8 py-3.5 text-sm font-bold text-primary shadow-lg transition-colors hover:bg-white/90 sm:text-base"
            >
              {ctaLabel} →
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'modern') {
    return (
      <div className="relative text-center py-12 sm:py-16 mb-10 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-white to-secondary/40">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-52 h-52 rounded-full bg-accent/40 blur-3xl" />
        </div>
        <div className="relative px-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-600 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
          {badgeText && (
            <p className="mt-5 inline-block bg-primary text-white text-sm font-semibold px-5 py-2 rounded-full shadow-sm shadow-primary/30">
              {badgeText}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-8 mb-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-slate-500 text-base max-w-md mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
      {badgeText && (
        <p className="mt-4 inline-block bg-accent text-accent-foreground text-sm font-medium px-4 py-1.5 rounded-full ring-1 ring-accent">
          {badgeText}
        </p>
      )}
    </div>
  );
}
