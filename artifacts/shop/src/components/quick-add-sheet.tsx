import { useMemo, useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { useGetProductBySlug } from '@workspace/api-client-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQuickAddStore } from '@/lib/quick-add-store';
import { useCartStore } from '@/lib/cart-store';
import { formatIDR } from '@/lib/format';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ─── Inner content (shared between Drawer and Dialog) ───────────────────────

function QuickAddContent({ slug, onClose }: { slug: string; onClose: () => void }) {
  const { data: resp, isLoading } = useGetProductBySlug(slug);
  const product = resp?.data;
  const { addItem, openCart } = useCartStore();

  const bundles = product?.bundles ?? [];
  const hasBundles = bundles.length > 0;
  const optionTypes = product?.optionTypes ?? [];
  const variants = product?.variants ?? [];
  const hasVariants = optionTypes.length > 0 && variants.length > 0;

  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});

  const defaultBundleId = useMemo(() => {
    if (!hasBundles) return null;
    return bundles.find((b) => b.isFeatured)?.id ?? bundles[0]!.id;
  }, [bundles, hasBundles]);

  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);

  // Reset selections when product changes
  useEffect(() => {
    setSelectedValues({});
    setSelectedBundleId(null);
  }, [product?.id]);

  const effectiveBundleId = selectedBundleId ?? defaultBundleId;
  const selectedBundle = bundles.find((b) => b.id === effectiveBundleId) ?? null;

  const allSelected = hasVariants && optionTypes.every((ot) => !!selectedValues[ot.id]);
  const selectedVariant = allSelected
    ? variants.find((v) =>
        optionTypes.every((ot) => v.optionValueIds.includes(selectedValues[ot.id]!)),
      )
    : null;
  const invalidCombination = allSelected && !selectedVariant;

  const variantLabel = allSelected
    ? optionTypes
        .map((ot) => ot.values.find((v) => v.id === selectedValues[ot.id])?.value ?? '')
        .join(' / ')
    : null;

  const activeVariants = variants.filter((v) => v.isActive);
  const variantEffectivePrices = hasVariants
    ? activeVariants.map((v) => v.price ?? (product?.price ?? 0))
    : [];
  const minVariantPrice =
    variantEffectivePrices.length > 0 ? Math.min(...variantEffectivePrices) : null;
  const maxVariantPrice =
    variantEffectivePrices.length > 0 ? Math.max(...variantEffectivePrices) : null;
  const showingRange =
    hasVariants &&
    !allSelected &&
    minVariantPrice !== null &&
    maxVariantPrice !== null &&
    minVariantPrice !== maxVariantPrice;

  const uniformVariantPrice =
    !showingRange && minVariantPrice !== null && minVariantPrice === maxVariantPrice
      ? minVariantPrice
      : null;

  const effectivePrice =
    selectedVariant?.price ?? uniformVariantPrice ?? product?.price ?? 0;

  const outOfStock = hasVariants
    ? allSelected && !invalidCombination
      ? (selectedVariant?.stockQuantity ?? 0) === 0
      : false
    : (product?.stockQuantity ?? 0) === 0;

  const canAdd =
    !outOfStock &&
    !invalidCombination &&
    (!hasVariants || allSelected) &&
    !!product;

  function handleAdd() {
    if (!product || !canAdd) return;
    const imageUrl = (selectedVariant?.imageUrl ?? product.images?.[0]?.url) ?? null;

    if (hasBundles && selectedBundle) {
      addItem(
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price:
            selectedBundle.quantity > 0
              ? Math.round(selectedBundle.price / selectedBundle.quantity)
              : selectedBundle.price,
          compareAtPrice: product.price,
          imageUrl,
          bundleId: selectedBundle.id,
          bundlePackPrice: selectedBundle.price,
          bundlePackQty: selectedBundle.quantity,
          variantId: selectedVariant?.id ?? null,
          variantLabel,
        },
        selectedBundle.quantity,
      );
    } else {
      addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: effectivePrice,
        compareAtPrice: product.compareAtPrice ?? null,
        imageUrl,
        variantId: selectedVariant?.id ?? null,
        variantLabel,
      });
    }
    onClose();
    openCart();
  }

  if (isLoading || !product) {
    return (
      <div className="p-5 space-y-4 animate-pulse">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-xl bg-slate-200 shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="h-5 bg-slate-200 rounded w-1/3 mt-3" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-100 rounded w-24" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 w-20 bg-slate-200 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="h-12 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  const image = product.images?.[0];

  return (
    <div className="p-5 space-y-5 overflow-y-auto max-h-[70vh]">
      {/* Product summary */}
      <div className="flex gap-4 items-start">
        {image ? (
          <img
            src={image.url}
            alt={image.alt ?? product.name}
            className="w-20 h-20 rounded-xl object-cover border border-slate-100 shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-8 h-8 text-slate-300" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 leading-snug">{product.name}</p>
          {product.shortDescription && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{product.shortDescription}</p>
          )}
          {!hasBundles && (
            <p className="font-bold text-primary mt-2 text-base">
              {showingRange
                ? `${formatIDR(minVariantPrice!)} – ${formatIDR(maxVariantPrice!)}`
                : formatIDR(effectivePrice)}
            </p>
          )}
        </div>
      </div>

      {/* Variant selectors */}
      {hasVariants && (
        <div className="space-y-4">
          {optionTypes.map((ot) => (
            <div key={ot.id}>
              <p className="text-sm font-semibold text-slate-800 mb-2">
                {ot.name}
                {selectedValues[ot.id] && (
                  <span className="text-primary font-normal ml-1.5">
                    — {ot.values.find((v) => v.id === selectedValues[ot.id])?.value}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {ot.values.map((val) => {
                  const isSelected = selectedValues[ot.id] === val.id;
                  // Check availability considering cross-option selections:
                  // a value is enabled only if at least one active/in-stock variant
                  // matches this value AND all already-selected values for OTHER option types.
                  const hasStock = variants.some(
                    (v) =>
                      v.optionValueIds.includes(val.id) &&
                      v.stockQuantity > 0 &&
                      v.isActive &&
                      optionTypes
                        .filter((otherOt) => otherOt.id !== ot.id && selectedValues[otherOt.id])
                        .every((otherOt) => v.optionValueIds.includes(selectedValues[otherOt.id]!)),
                  );
                  return (
                    <button
                      key={val.id}
                      type="button"
                      onClick={() =>
                        setSelectedValues((prev) => ({ ...prev, [ot.id]: val.id }))
                      }
                      disabled={!hasStock}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : hasStock
                            ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through'
                      }`}
                    >
                      {val.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bundle selector */}
      {hasBundles && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">Pilih Paket</span>
            <span className="text-xs text-primary font-medium">Beli lebih, hemat lebih</span>
          </div>
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
      )}

      {/* Status */}
      {hasVariants && !allSelected && (
        <p className="text-xs text-slate-400">Pilih semua opsi terlebih dahulu</p>
      )}
      {invalidCombination && (
        <p className="text-xs text-amber-600 font-medium">⚠ Kombinasi ini tidak tersedia</p>
      )}
      {outOfStock && !invalidCombination && (
        <p className="text-xs text-red-500 font-medium">⚠ Stok habis</p>
      )}

      {/* CTA */}
      <button
        onClick={handleAdd}
        disabled={!canAdd}
        className="w-full bg-primary hover:bg-primary/90 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <ShoppingBag className="w-5 h-5" />
        {invalidCombination
          ? 'Kombinasi Tidak Tersedia'
          : outOfStock
            ? 'Stok Habis'
            : 'Tambah ke Keranjang'}
      </button>
    </div>
  );
}

// ─── Responsive wrapper ──────────────────────────────────────────────────────

export function QuickAddSheet() {
  const { slug, close } = useQuickAddStore();
  const isMobile = useIsMobile();
  const isOpen = !!slug;

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && close()}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="flex flex-row items-center justify-between pb-0">
            <DrawerTitle className="text-base">Tambah ke Keranjang</DrawerTitle>
            <DrawerClose asChild>
              <button
                onClick={close}
                className="rounded-full p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </DrawerClose>
          </DrawerHeader>
          {slug && <QuickAddContent slug={slug} onClose={close} />}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-base">Tambah ke Keranjang</DialogTitle>
        </DialogHeader>
        {slug && <QuickAddContent slug={slug} onClose={close} />}
      </DialogContent>
    </Dialog>
  );
}
