import { Link, useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import {
  Store,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  Tag,
  Truck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

const NAV_GROUPS = [
  {
    label: 'Katalog',
    items: [
      { href: '/', label: 'Kelola Produk', icon: Package },
    ],
  },
  {
    label: 'Penjualan',
    items: [
      { href: '/orders', label: 'Manajemen Order', icon: ShoppingCart },
      { href: '/discounts', label: 'Kode Promo', icon: Tag },
    ],
  },
  {
    label: 'Toko',
    items: [
      { href: '/shipping', label: 'Pengiriman', icon: Truck },
      { href: '/analytics', label: 'Analitik', icon: BarChart3 },
      { href: '/settings', label: 'Pengaturan', icon: Settings },
    ],
  },
];

function isActive(href: string, location: string) {
  return href === '/' ? location === '/' : location.startsWith(href);
}

function SidebarContent({
  location,
  onNavigate,
  logoUrl,
  storeName,
}: {
  location: string;
  onNavigate?: () => void;
  logoUrl?: string;
  storeName?: string;
}) {
  return (
    <>
      <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-200">
        {logoUrl ? (
          <img src={logoUrl} alt={storeName} className="w-8 h-8 rounded-lg object-cover shrink-0" />
        ) : (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <Store className="w-4 h-4 text-white" />
          </div>
        )}
        <div>
          <p className="font-semibold text-slate-800 text-sm leading-tight">{storeName || 'RukoLite'}</p>
          <p className="text-xs text-slate-400 leading-tight">Management</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(href, location);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground ring-1 ring-primary'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-slate-200">
        <a href="/" className="text-xs text-slate-400 hover:text-primary transition-colors">
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
  const [store, setStore] = useState<{ logoUrl?: string; name?: string }>({});

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setStore({ logoUrl: json.data.logoUrl, name: json.data.name });
      })
      .catch(() => {});
  }, []);

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
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Store className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <span className="font-semibold text-slate-800 text-sm truncate">{store.name || 'RukoLite'}</span>
          </div>
        </header>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-64 flex flex-col gap-0 bg-white border-r border-slate-200">
            <SidebarContent
              location={location}
              onNavigate={() => setMobileOpen(false)}
              logoUrl={store.logoUrl}
              storeName={store.name}
            />
          </SheetContent>
        </Sheet>

        <main className="min-w-0">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <SidebarContent location={location} logoUrl={store.logoUrl} storeName={store.name} />
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
