import { useGetStorefront, useListProducts } from '@workspace/api-client-react';
import { ProductCard } from '@/components/product-card';
import { Header } from '@/components/header';
import { CartDrawer } from '@/components/cart-drawer';
import { AnnouncementBar } from '@/components/announcement-bar';
import { ShoppingBag } from 'lucide-react';

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-2/3" />
        <div className="h-8 bg-slate-200 rounded-lg mt-4" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: storefrontResp } = useGetStorefront();
  const { data: productsResp, isLoading, error } = useListProducts();

  const storefront = storefrontResp?.data;
  const products = productsResp?.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      {storefront?.announcementText && (
        <AnnouncementBar text={storefront.announcementText} />
      )}
      <Header storeName={storefront?.name} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="text-center py-8 mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            Produk Pilihan untuk<br className="hidden sm:block" /> Keseharian Anda
          </h1>
          <p className="text-slate-500 text-base max-w-md mx-auto leading-relaxed">
            Temukan produk berkualitas tinggi dengan harga terjangkau, dikirim langsung ke pintu rumah Anda.
          </p>
          <p className="mt-4 inline-block bg-teal-50 text-teal-700 text-sm font-medium px-4 py-1.5 rounded-full ring-1 ring-teal-200">
            Gunakan kode <strong>HEMAT10</strong> untuk diskon 10%!
          </p>
        </div>

        {/* Products */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
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
            <p>Belum ada produk tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                compareAtPrice={product.compareAtPrice ?? null}
                shortDescription={product.shortDescription ?? null}
                images={product.images ?? []}
                stockQuantity={product.stockQuantity}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 mt-16 py-8 text-center text-sm text-slate-400">
        <p>© 2025 {storefront?.name ?? 'Tokko'} — Belanja mudah, aman, dan terpercaya</p>
      </footer>

      <CartDrawer />
    </div>
  );
}
