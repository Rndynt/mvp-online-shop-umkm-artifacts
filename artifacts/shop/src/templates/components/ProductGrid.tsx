import { ShoppingBag } from 'lucide-react';
import { ProductCard } from '@/components/product-card';

export interface GridProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  shortDescription?: string | null;
  images?: Array<{ url: string; alt?: string | null }>;
  stockQuantity: number;
}

export type ProductGridColumns = 2 | 3 | 4 | 5;

const COLUMN_CLASSES: Record<ProductGridColumns, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
};

interface ProductSkeletonProps {
  columns: ProductGridColumns;
}

function ProductSkeletonGrid({ columns }: ProductSkeletonProps) {
  return (
    <div className={`grid ${COLUMN_CLASSES[columns]} gap-4`}>
      {Array.from({ length: columns * 2 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
          <div className="aspect-square bg-slate-200" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-full" />
            <div className="h-3 bg-slate-200 rounded w-2/3" />
            <div className="h-8 bg-slate-200 rounded-lg mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export interface ProductGridProps {
  products: GridProduct[];
  isLoading?: boolean;
  error?: unknown;
  columns?: ProductGridColumns;
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  className?: string;
}

export function ProductGrid({
  products,
  isLoading = false,
  error,
  columns = 4,
  title,
  subtitle,
  emptyMessage = 'Belum ada produk tersedia',
  className = '',
}: ProductGridProps) {
  return (
    <section className={className}>
      {(title || subtitle) && (
        <div className="mb-5">
          {title && <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>}
          {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
        </div>
      )}

      {isLoading ? (
        <ProductSkeletonGrid columns={columns} />
      ) : error ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-slate-700 font-medium">Gagal memuat produk</p>
          <p className="text-slate-400 text-sm mt-1">Coba muat ulang halaman ini</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className={`grid ${COLUMN_CLASSES[columns]} gap-4`}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              compareAtPrice={product.compareAtPrice ?? null}
              shortDescription={product.shortDescription ?? null}
              images={(product.images ?? []).map((img) => ({ url: img.url, alt: img.alt ?? null }))}
              stockQuantity={product.stockQuantity}
            />
          ))}
        </div>
      )}
    </section>
  );
}
