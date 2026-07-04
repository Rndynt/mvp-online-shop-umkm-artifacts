import type { ReactNode } from 'react';

export type HeroVariant = 'basic' | 'modern';

export interface HeroProps {
  title: ReactNode;
  subtitle?: ReactNode;
  badgeText?: ReactNode;
  variant?: HeroVariant;
}

export function Hero({ title, subtitle, badgeText, variant = 'basic' }: HeroProps) {
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
