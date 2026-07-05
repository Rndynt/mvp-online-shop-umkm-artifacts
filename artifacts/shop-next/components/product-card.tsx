'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { formatIDR, discountPercent } from '@/lib/format';
import { useCartStore } from '@/lib/cart-store';
import { useQuickAddStore } from '@/lib/quick-add-store';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  shortDescription?: string | null;
  images: Array<{ url: string; alt?: string | null }>;
  stockQuantity: number;
  minVariantPrice?: number | null;
  maxVariantPrice?: number | null;
  hasVariants?: boolean;
  hasBundles?: boolean;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  shortDescription,
  images,
  stockQuantity,
  minVariantPrice,
  maxVariantPrice,
  hasVariants = false,
  hasBundles = false,
}: ProductCardProps) {
  const { addItem, openCart } = useCartStore();
  const { open: openQuickAdd } = useQuickAddStore();
  const image = images[0];
  const outOfStock = stockQuantity === 0;
  const needsSelection = hasVariants || hasBundles;

  const hasRange =
    minVariantPrice != null &&
    maxVariantPrice != null &&
    minVariantPrice !== maxVariantPrice;
  const displayPrice =
    minVariantPrice != null && minVariantPrice === maxVariantPrice
      ? minVariantPrice
      : price;
  const pct = !hasRange && compareAtPrice ? discountPercent(displayPrice, compareAtPrice) : null;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    if (needsSelection) {
      openQuickAdd(slug);
      return;
    }
    addItem({
      id,
      name,
      slug,
      price,
      compareAtPrice: compareAtPrice ?? null,
      imageUrl: image?.url ?? null,
    });
    openCart();
  }

  return (
    <Link href={`/products/${slug}`} className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ShoppingBag className="w-12 h-12" />
          </div>
        )}
        {pct != null && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{pct}%
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-slate-700 text-white text-xs font-medium px-3 py-1 rounded-full">
              Habis
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {name}
        </h3>
        {shortDescription && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {shortDescription}
          </p>
        )}
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2 mb-3 flex-wrap">
            {hasRange ? (
              <span className="font-bold text-slate-900 text-sm">
                {formatIDR(minVariantPrice!, { showSymbol: false })} – {formatIDR(maxVariantPrice!, { showSymbol: false })}
              </span>
            ) : (
              <>
                <span className="font-bold text-slate-900 text-sm">{formatIDR(displayPrice, { showSymbol: false })}</span>
                {compareAtPrice && (
                  <span className="text-xs text-slate-400 line-through">{formatIDR(compareAtPrice, { showSymbol: false })}</span>
                )}
              </>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {outOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}
          </button>
        </div>
      </div>
    </Link>
  );
}
