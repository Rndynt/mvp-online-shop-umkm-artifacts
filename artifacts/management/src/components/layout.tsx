import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import {
  Store,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

const navItems = [
  { href: '/', label: 'Kelola Produk', icon: Package },
  { href: '/orders', label: 'Manajemen Order', icon: ShoppingCart },
  { href: '/analytics', label: 'Analitik', icon: BarChart3 },
  { href: '/settings', label: 'Pengaturan Toko', icon: Settings },
];

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 px-4 h-16 shrink-0', collapsed && 'justify-center px-0')}>
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-950/40 shrink-0">
        <Store className="w-4.5 h-4.5 text-white" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="font-semibold text-white text-sm leading-tight truncate">RukoLite</p>
          <p className="text-xs text-slate-400 leading-tight truncate">Management</p>
        </div>
      )}
    </div>
  );
}

function NavLinks({
  collapsed,
  location,
  onNavigate,
}: {
  collapsed?: boolean;
  location: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? location === '/' : location.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={cn(
              'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              collapsed && 'justify-center px-0',
              active
                ? 'bg-white/10 text-white shadow-inner'
                : 'text-slate-400 hover:bg-white/5 hover:text-white',
            )}
          >
            {active && (
              <span
                className={cn(
                  'absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-gradient-to-b from-teal-400 to-teal-500',
                  collapsed && '-left-2.5',
                )}
              />
            )}
            <Icon className={cn('w-[18px] h-[18px] shrink-0', active && 'text-teal-400')} />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <header className="sticky top-0 z-30 flex items-center gap-2 h-14 px-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shrink-0">
              <Store className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white text-sm truncate">RukoLite</span>
          </div>
        </header>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-72 flex flex-col gap-0 bg-[hsl(240_25%_10%)] border-white/10 text-white">
            <Brand />
            <NavLinks location={location} onNavigate={() => setMobileOpen(false)} />
            <div className="px-4 py-3 border-t border-white/10">
              <a href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
                Lihat Storefront &rarr;
              </a>
            </div>
          </SheetContent>
        </Sheet>

        <main className="min-w-0">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <aside
        className={cn(
          'bg-[hsl(240_25%_10%)] flex flex-col shrink-0 transition-all duration-200',
          collapsed ? 'w-[72px]' : 'w-64',
        )}
      >
        <Brand collapsed={collapsed} />
        <NavLinks collapsed={collapsed} location={location} />
        <div className="p-2.5 border-t border-white/10 space-y-1">
          {!collapsed && (
            <a
              href="/"
              className="block px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Lihat Storefront &rarr;
            </a>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors',
              collapsed && 'justify-center px-0',
            )}
          >
            {collapsed ? <PanelLeftOpen className="w-[18px] h-[18px]" /> : <PanelLeftClose className="w-[18px] h-[18px]" />}
            {!collapsed && <span>Ciutkan</span>}
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
