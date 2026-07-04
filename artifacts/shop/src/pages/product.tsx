import { useMemo, useState, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useGetProductBySlug } from '@workspace/api-client-react';
import { Layout } from '@/components/layout';
import { formatIDR, discountPercent } from '@/lib/format';
import { useCartStore } from '@/lib/cart-store';
import { ChevronLeft, ChevronDown, Minus, Plus, ShoppingBag, Check, ShieldCheck, Truck, Lock } from 'lucide-react';
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
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const bundles = product?.bundles ?? [];
  const hasBundles = bundles.length > 0;

  const defaultBundleId = useMemo(() => {
    if (!hasBundles) return null;
    return bundles.find((b) => b.isFeatured)?.id ?? bundles[0]!.id;
  }, [bundles, hasBundles]);

  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const effectiveBundleId = selectedBundleId ?? defaultBundleId;
  const selectedBundle = bundles.find((b) => b.id === effectiveBundleId) ?? null;

  // Floating CTA — visible only when main button scrolls out of view
  const mainBtnRef = useRef<HTMLButtonElement>(null);
  const [showFloating, setShowFloating] = useState(false);
  useEffect(() => {
    const el = mainBtnRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowFloating(!entry!.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
            <button onClick={() => navigate('/')} className="text-primary text-sm underline">
              Kembali ke toko
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const pct = product.compareAtPrice ? discountPercent(product.price, product.compareAtPrice) : null;
  const images = product.images ?? [];
  const features = product.features ?? [];
  const faqs = product.faqs ?? [];
  const outOfStock = product.stockQuantity === 0;

  function handleAddToCart() {
    if (outOfStock) return;

    if (hasBundles && selectedBundle) {
      // Store exact bundle pack price to avoid rounding drift in subtotals
      addItem(
        {
          id: product!.id,
          name: product!.name,
          slug: product!.slug,
          price: selectedBundle.quantity > 0
            ? Math.round(selectedBundle.price / selectedBundle.quantity)
            : selectedBundle.price,
          compareAtPrice: product!.price,
          imageUrl: images[0]?.url ?? null,
          bundleId: selectedBundle.id,
          bundlePackPrice: selectedBundle.price,
          bundlePackQty: selectedBundle.quantity,
        },
        selectedBundle.quantity,
      );
    } else {
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
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    openCart();
  }

  return (
    <Layout mainClassName="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary mb-6 transition-colors">
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
                    activeImg === idx ? 'border-primary' : 'border-slate-200 hover:border-slate-300'
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
          {pct && !hasBundles && (
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

          {!hasBundles && (
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-slate-900">{formatIDR(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-base text-slate-400 line-through">
                  {formatIDR(product.compareAtPrice)}
                </span>
              )}
            </div>
          )}

          <div className={`text-sm mb-5 font-medium ${outOfStock ? 'text-red-500' : 'text-green-600'}`}>
            {outOfStock ? '⚠ Stok habis' : `✓ Tersedia (${product.stockQuantity} item)`}
          </div>

          {hasBundles && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-sm font-semibold text-slate-800">Pilih Paket</span>
                <span className="text-xs text-primary font-medium">Beli lebih banyak, hemat lebih besar</span>
              </div>
              <div className="space-y-2">
                {bundles.map((bundle) => {
                  const isSelected = effectiveBundleId === bundle.id;
                  const unitPrice = Math.round(bundle.price / bundle.quantity);
                  return (
                    <button
                      key={bundle.id}
                      onClick={() => setSelectedBundleId(bundle.id)}
                      className={`w-full flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                            isSelected ? 'border-primary' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <span className="w-2 h-2 rounded-full bg-primary" />}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {bundle.label ?? `Beli ${bundle.quantity}`}
                          </div>
                          <div className="text-xs text-slate-500">{formatIDR(unitPrice)} / item</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {bundle.badge && (
                          <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                            {bundle.badge}
                          </span>
                        )}
                        <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
                          {formatIDR(bundle.price)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!hasBundles && !outOfStock && (
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
            ref={mainBtnRef}
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {added ? (
              <><Check className="w-5 h-5" /> Ditambahkan!</>
            ) : (
              <><ShoppingBag className="w-5 h-5" /> {outOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}</>
            )}
          </button>

          <div className="grid grid-cols-3 gap-2 mt-5">
            <div className="flex flex-col items-center gap-1.5 text-center bg-slate-50 rounded-lg py-3 px-1">
              <Truck className="w-5 h-5 text-primary" />
              <span className="text-[11px] text-slate-600 leading-tight">Pengiriman Cepat</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center bg-slate-50 rounded-lg py-3 px-1">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="text-[11px] text-slate-600 leading-tight">Garansi 30 Hari</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center bg-slate-50 rounded-lg py-3 px-1">
              <Lock className="w-5 h-5 text-primary" />
              <span className="text-[11px] text-slate-600 leading-tight">Pembayaran Aman</span>
            </div>
          </div>

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

      {features.length > 0 && (
        <div className="mt-16 pt-12 border-t border-slate-200 space-y-14">
          {features.map((feature, idx) => (
            <div
              key={feature.id}
              className={`grid grid-cols-1 ${feature.imageUrl ? 'md:grid-cols-2' : ''} gap-6 md:gap-10 items-center`}
            >
              {feature.imageUrl && (
                <div className={`aspect-video md:aspect-square rounded-2xl overflow-hidden bg-slate-100 ${idx % 2 === 1 ? 'md:order-2' : ''}`}>
                  <img src={feature.imageUrl} alt={feature.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className={feature.imageUrl && idx % 2 === 1 ? 'md:order-1' : ''}>
                <h3 className="text-xl font-bold text-slate-900 mb-2.5">{feature.title}</h3>
                {feature.description && (
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {faqs.length > 0 && (
        <div className="mt-16 pt-12 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-5 text-center">FAQ</h2>
          <div className="max-w-2xl mx-auto space-y-2">
            {faqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div key={faq.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
                  >
                    <span className="text-sm font-medium text-slate-800">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3.5 text-sm text-slate-600 leading-relaxed">{faq.answer}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Floating add-to-cart bar ── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
          showFloating && !outOfStock ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
            {/* Thumbnail */}
            {images[0] && (
              <img
                src={images[0].url}
                alt={product.name}
                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-100"
              />
            )}

            {/* Name + price */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{product.name}</p>
              <p className="text-sm font-bold text-primary">
                {hasBundles && selectedBundle
                  ? formatIDR(selectedBundle.price)
                  : formatIDR(product.price)}
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={handleAddToCart}
              className="shrink-0 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 active:scale-95"
            >
              {added ? (
                <><Check className="w-4 h-4" /> Ditambahkan!</>
              ) : (
                <><ShoppingBag className="w-4 h-4" /> Tambah</>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
