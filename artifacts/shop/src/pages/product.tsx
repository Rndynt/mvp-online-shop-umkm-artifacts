import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useGetProductBySlug } from '@workspace/api-client-react';
import { Layout } from '@/components/layout';
import { formatIDR, discountPercent } from '@/lib/format';
import { useCartStore } from '@/lib/cart-store';
import { ChevronLeft, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { Link } from 'wouter';

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { data: resp, isLoading, error } = useGetProductBySlug(params.slug!);
  const product = resp?.data;
  const { addItem, openCart } = useCartStore();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  if (isLoading) {
    return (
      <Layout mainClassName="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-slate-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-5/6" />
              <div className="h-10 bg-slate-200 rounded w-1/2 mt-4" />
              <div className="h-12 bg-slate-200 rounded-xl mt-6" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-slate-700 font-medium mb-2">Produk tidak ditemukan</p>
            <button onClick={() => navigate('/')} className="text-teal-600 text-sm underline">
              Kembali ke toko
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const pct = product.compareAtPrice ? discountPercent(product.price, product.compareAtPrice) : null;
  const images = product.images ?? [];
  const outOfStock = product.stockQuantity === 0;

  function handleAddToCart() {
    if (outOfStock) return;
    addItem(
      {
        id: product!.id,
        name: product!.name,
        slug: product!.slug,
        price: product!.price,
        compareAtPrice: product!.compareAtPrice ?? null,
        imageUrl: images[0]?.url ?? null,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    openCart();
  }

  return (
      <Layout mainClassName="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Toko
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {images[activeImg] ? (
                <img
                  src={images[activeImg].url}
                  alt={images[activeImg].alt ?? product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200">
                  <ShoppingBag className="w-20 h-20" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImg(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                      activeImg === idx ? 'border-teal-600' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={img.url} alt={img.alt ?? ''} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {pct && (
              <span className="inline-block self-start bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full mb-3">
                Hemat {pct}%
              </span>
            )}

            <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                {product.shortDescription}
              </p>
            )}

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-slate-900">{formatIDR(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-base text-slate-400 line-through">
                  {formatIDR(product.compareAtPrice)}
                </span>
              )}
            </div>

            <div className={`text-sm mb-6 font-medium ${outOfStock ? 'text-red-500' : 'text-green-600'}`}>
              {outOfStock ? '⚠ Stok habis' : `✓ Tersedia (${product.stockQuantity} item)`}
            </div>

            {!outOfStock && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-medium text-slate-900">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product!.stockQuantity, q + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-slate-400">maks. {product.stockQuantity}</span>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {added ? (
                <><Check className="w-5 h-5" /> Ditambahkan!</>
              ) : (
                <><ShoppingBag className="w-5 h-5" /> {outOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}</>
              )}
            </button>

            {product.description && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h2 className="font-semibold text-slate-900 mb-3">Deskripsi Produk</h2>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
  );
}
