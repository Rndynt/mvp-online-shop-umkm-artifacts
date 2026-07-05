'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Store, Menu, X, Home, Package, Search, Phone } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';

interface HeaderProps {
  storeName?: string;
  logoUrl?: string | null;
}

const NAV_ITEMS = [
  { href: '/', label: 'Beranda', Icon: Home },
  { href: '/products', label: 'Semua Produk', Icon: Package },
  { href: '/track-order', label: 'Lacak Pesanan', Icon: Search },
  { href: '/contact', label: 'Kontak', Icon: Phone },
] as const;

export function Header({ storeName = 'Tokko', logoUrl }: HeaderProps) {
  const { totalItems, openCart } = useCartStore();
  const count = totalItems();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={storeName} className="w-8 h-8 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary/90 transition-colors">
                <Store className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="font-bold text-slate-900 text-lg tracking-tight">{storeName}</span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={openCart}
              className="relative p-2 text-slate-600 hover:text-primary hover:bg-accent rounded-lg transition-colors"
              aria-label="Keranjang belanja"
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>

            <button
              onClick={() => setOpen((v) => !v)}
              className="p-2 text-slate-600 hover:text-primary hover:bg-accent rounded-lg transition-colors"
              aria-label={open ? 'Tutup menu' : 'Buka menu'}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-slate-100">
          <span className="font-semibold text-slate-900 text-sm">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3.5 px-5 py-3.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary bg-primary/8'
                    : 'text-slate-700 hover:text-primary hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                {label}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={storeName} className="w-7 h-7 rounded-md object-cover" />
            ) : (
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <Store className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <span className="text-xs font-semibold text-slate-500">{storeName}</span>
          </div>
        </div>
      </div>
    </>
  );
}
