---
name: RukoLite variant system
description: Multi-dimensional product variant implementation — DB, API, management UI, shop UI, cart, checkout
---

## Architecture

4 new DB tables (all cascade-delete from products):
- `product_option_types` — e.g. "Ukuran", "Warna"
- `product_option_values` — e.g. "S", "M", "Hitam"
- `product_variants` — one row per SKU combo; price nullable (null = inherit from product)
- `product_variant_options` — join table; composite PK (variantId, optionValueId)

## Admin service pattern

`replaceVariants(productId, optionTypes, variants)` — delete-all-then-reinsert (same pattern as replaceBundles). Builds a lookup map `"typeIdx:valueStr" → optionValueId` during insert, then links each variant row to its option values. Silent skips on unmatched values (known medium issue).

`serializeProduct` fetches option types + values + variants + variant-options all in parallel, returns nested structure: `optionTypes[].values[]` and `variants[].optionValueIds[]`.

## Admin listProducts

Returns raw product rows for ALL products (no `isActive` filter — admins must see inactive products too). Does NOT serialize full associations — only `getProduct` does.

**Why:** The list endpoint is lightweight; full serialization per product would be too slow for large catalogs.

## Cart line identity

`computeLineId` composes both dimensions:
```
key = productId
if (bundleId) key += `:b:${bundleId}`
if (variantId) key += `:v:${variantId}`
```
This gives unique lines for plain / bundle-only / variant-only / bundle+variant combos.

## Checkout service

`CheckoutInput.items` now accepts `variantId?: string | null`. Validation:
1. Fetch all referenced variants in one query
2. Check variant belongs to product and isActive
3. Stock check keyed by `(productId, variantId)` pair — not just productId (variants have independent stock)
4. Pricing: `unitPrice = variant.price ?? product.price`

**Why:** Without per-key stock aggregation, two different variants of the same product would be incorrectly summed against product-level stock.

## Management form (product-form.tsx)

- `OptionTypeEditor` — always renders `AddButton`; empty state shows placeholder text above it
- `VariantMatrix` — auto-generated from cartesian product of option type values via `generateVariantMatrix()`
- `useEffect` watches `JSON.stringify(optionTypes map)` to auto-regenerate matrix while preserving existing row data for matching combos
- Existing variants loaded from API: `optionValueIds` matched against `optionTypes[].values[].id` to reconstruct `optionValues: string[]`
- Tab order: Info & Harga → **Varian** → Media → Bundle Harga → Fitur Produk → FAQ

## Shop UI (product.tsx)

- `selectedValues: Record<optionTypeId, optionValueId>` state
- `selectedVariant` found by matching all `optionValueIds`
- Chip values greyed-out/strikethrough when no variant with that value has stock > 0
- `effectivePrice = selectedVariant?.price ?? product.price`
- `outOfStock`: when hasVariants → only true when variant is selected AND stock = 0; unselected state shows "Pilih semua opsi"
- "Tambah ke Keranjang" disabled when `hasVariants && !allSelected`
- `variantLabel` (e.g. "M / Hitam") stored on CartItem and shown in cart drawer

## Known gaps (not critical)

- `orderItemsTable` has no `variantId` column — variant context not persisted on order line items
- Variant combination validation doesn't enforce completeness (partial variant-option rows can exist if option type edit races with variant save)
- `qty` state not clamped when switching to lower-stock variant
