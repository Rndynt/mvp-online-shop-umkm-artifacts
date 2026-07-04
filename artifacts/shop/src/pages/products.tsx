import { useListProducts } from '@workspace/api-client-react';
import { Layout } from '@/components/layout';
import { ProductCard } from '@/components/product-card';
import { ShoppingBag } from 'lucide-react';

export default function ProductsPage() {
  const { data, isLoading } = useListProducts();
  const products = data?.data ?? [];

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Semua Produk</h1>
        <p className="text-sm text-slate-500 mt-1">Jelajahi seluruh koleksi kami</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-white border border-slate-100 animate-pulse">
              <div className="aspect-square bg-slate-100" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
          <ShoppingBag className="w-12 h-12" />
          <p className="text-sm">Belum ada produk</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </Layout>
  );
}
