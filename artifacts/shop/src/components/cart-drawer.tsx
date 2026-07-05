import { X, Minus, Plus, ShoppingBag, Trash2, Package } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatIDR } from '@/lib/format';
import { useLocation } from 'wouter';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCartStore();
  const [, navigate] = useLocation();

  function handleCheckout() {
    closeCart();
    navigate('/checkout');
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Keranjang
          </h2>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <p className="font-medium text-slate-700">Keranjang masih kosong</p>
                <p className="text-sm text-slate-400 mt-1">Tambahkan produk untuk mulai berbelanja</p>
              </div>
              <button
                onClick={closeCart}
                className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                Lihat Produk
              </button>
            </div>
          ) : (
            items.map((item) => {
              const isBundle = !!item.bundleId;
              return (
                <div key={item.lineId} className="flex gap-3">
                  {/* Image */}
                  <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm line-clamp-2 leading-snug">
                      {item.name}
                    </p>
                    {item.variantLabel && (
                      <p className="text-xs text-slate-500 mt-0.5">{item.variantLabel}</p>
                    )}
                    <p className="text-primary font-semibold text-sm mt-1">
                      {formatIDR(
                        item.bundlePackPrice != null && item.bundlePackQty != null && item.bundlePackQty > 0
                          ? (item.quantity / item.bundlePackQty) * item.bundlePackPrice
                          : item.price * item.quantity,
                      )}
                    </p>

                    {isBundle ? (
                      /* Bundle items: locked quantity — qty is fixed to bundle size */
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1.5 bg-accent text-accent-foreground text-xs font-medium px-2.5 py-1 rounded-lg">
                          <Package className="w-3 h-3" />
                          Paket ×{item.quantity}
                        </div>
                        <button
                          onClick={() => removeItem(item.lineId)}
                          className="ml-auto p-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* Regular items: quantity is editable */
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                          className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                          className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.lineId)}
                          className="ml-auto p-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 px-5 py-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 text-sm">Subtotal</span>
              <span className="font-bold text-slate-900">{formatIDR(subtotal())}</span>
            </div>
            <p className="text-xs text-slate-400">Ongkir dihitung saat checkout</p>
            <button
              onClick={handleCheckout}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Lanjut ke Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
