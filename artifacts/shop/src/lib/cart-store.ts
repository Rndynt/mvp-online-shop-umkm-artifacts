import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  /** Unique line identifier: `${productId}` for plain items, `${productId}:b:${bundleId}` for bundles, `${productId}:v:${variantId}` for variants. */
  lineId: string;
  id: string;
  name: string;
  /** Display unit price. For bundles this is rounded; use bundlePackPrice / bundlePackQty for exact totals. */
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  slug: string;
  quantity: number;
  /** Bundle ID if this item was added via a bundle — used server-side for correct bundle pricing. */
  bundleId?: string | null;
  /** Exact total price for one bundle pack (bundle.price from API). Undefined for non-bundle items. */
  bundlePackPrice?: number | null;
  /** Number of units in one bundle pack (bundle.quantity from API). Undefined for non-bundle items. */
  bundlePackQty?: number | null;
  /** Variant ID if this item has a selected variant. */
  variantId?: string | null;
  /** Human-readable variant label, e.g. "M / Hitam". Shown in cart. */
  variantLabel?: string | null;
}

function computeLineId(productId: string, bundleId?: string | null, variantId?: string | null): string {
  // Compose both dimensions so bundle+variant combos get unique lines
  let key = productId;
  if (bundleId) key += `:b:${bundleId}`;
  if (variantId) key += `:v:${variantId}`;
  return key;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity' | 'lineId'>, quantity?: number) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) => {
        const lineId = computeLineId(item.id, item.bundleId, item.variantId);
        set((state) => {
          const existing = state.items.find((i) => i.lineId === lineId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.lineId === lineId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, lineId, quantity }] };
        });
      },

      removeItem: (lineId) => {
        set((state) => ({ items: state.items.filter((i) => i.lineId !== lineId) }));
      },

      updateQuantity: (lineId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(lineId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.lineId === lineId ? { ...i, quantity } : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => {
          // Use exact bundle pack price to avoid rounding drift
          if (i.bundlePackPrice != null && i.bundlePackQty != null && i.bundlePackQty > 0) {
            const packs = i.quantity / i.bundlePackQty;
            return sum + packs * i.bundlePackPrice;
          }
          return sum + i.price * i.quantity;
        }, 0),
    }),
    { name: 'rukolite-cart' },
  ),
);
