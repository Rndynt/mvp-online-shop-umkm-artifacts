import type { Metadata } from 'next';
import type { ProductListItem } from '@workspace/api-client-react';
import { serverFetch } from '@/lib/server-api';
import { ProductCard } from '@/components/product-card';
import { ShoppingBag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Semua Produk',
  description: 'Jelajahi seluruh koleksi produk kami',
};

export default async function ProductsPage() {
  const products = (await serverFetch<ProductListItem[]>('/products')) ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Semua Produk</h1>
        <p className="text-sm text-slate-500 mt-1">Jelajahi seluruh koleksi kami</p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
          <ShoppingBag className="w-12 h-12" />
          <p className="text-sm">Belum ada produk</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              price={p.price}
              compareAtPrice={p.compareAtPrice ?? null}
              shortDescription={p.shortDescription ?? null}
              images={(p.images ?? []).map((img) => ({ url: img.url, alt: img.alt ?? null }))}
              stockQuantity={p.stockQuantity}
              minVariantPrice={p.minVariantPrice ?? null}
              maxVariantPrice={p.maxVariantPrice ?? null}
              hasVariants={p.hasVariants ?? false}
              hasBundles={p.hasBundles ?? false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';
