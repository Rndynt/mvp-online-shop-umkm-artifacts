import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PageProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  narrow?: boolean; // form-style pages (max-w-2xl inner content)
}

export function Page({ title, description, action, children, narrow = false }: PageProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {description && <p className="text-slate-500 text-sm mt-0.5">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className={cn(narrow && 'max-w-2xl')}>
        {children}
      </div>
    </div>
  );
}
