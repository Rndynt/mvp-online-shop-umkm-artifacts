import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import {
  Store,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
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

function SidebarContent({ location, onNavigate }: { location: string; onNavigate?: () => void }) {
  return (
    <>
      <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-200">
        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center shrink-0">
          <Store className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-sm leading-tight">RukoLite</p>
          <p className="text-xs text-slate-400 leading-tight">Management</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? location === '/' : location.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-slate-200">
        <a href="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
          Lihat Storefront &rarr;
        </a>
      </div>
    </>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-30 flex items-center gap-2 h-14 px-3 bg-white border-b border-slate-200">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center shrink-0">
              <Store className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-slate-800 text-sm truncate">RukoLite</span>
          </div>
        </header>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-64 flex flex-col gap-0 bg-white border-r border-slate-200">
            <SidebarContent location={location} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <main className="min-w-0">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <SidebarContent location={location} />
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
