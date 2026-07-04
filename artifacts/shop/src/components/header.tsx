import { ShoppingBag, Store } from 'lucide-react';
import { Link } from 'wouter';
import { useCartStore } from '@/lib/cart-store';

interface HeaderProps {
  storeName?: string;
  logoUrl?: string | null;
}

export function Header({ storeName = 'Tokko', logoUrl }: HeaderProps) {
  const { totalItems, openCart } = useCartStore();
  const count = totalItems();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 group"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={storeName}
              className="w-8 h-8 rounded-lg object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary/90 transition-colors">
              <Store className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="font-bold text-slate-900 text-lg tracking-tight">
            {storeName}
          </span>
        </Link>

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
      </div>
    </header>
  );
}
