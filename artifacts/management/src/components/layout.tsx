import { Link, useLocation } from 'wouter';
import { Store, Package, ShoppingCart, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const navItems = [
  { href: '/', label: 'Kelola Produk', icon: Package },
  { href: '/orders', label: 'Manajemen Order', icon: ShoppingCart },
  { href: '/analytics', label: 'Analitik', icon: BarChart3 },
  { href: '/settings', label: 'Pengaturan Toko', icon: Settings },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-200">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm leading-tight">RukoLite</p>
            <p className="text-xs text-slate-400 leading-tight">Management</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? location === '/' : location.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
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
          <a href="/" className="text-xs text-slate-400 hover:text-slate-600">
            Lihat Storefront &rarr;
          </a>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
