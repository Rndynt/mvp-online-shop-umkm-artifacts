import { ProductGrid, type GridProduct, type ProductGridColumns } from '@/templates/components/ProductGrid';

interface TopProductsProps {
  products: GridProduct[];
  isLoading?: boolean;
  error?: unknown;
  count?: number;
  columns?: ProductGridColumns;
  title?: string;
  subtitle?: string;
}

export function TopProducts({
  products,
  isLoading,
  error,
  count = 4,
  columns = 4,
  title = 'Produk Terlaris',
  subtitle = 'Pilihan favorit pelanggan kami',
}: TopProductsProps) {
  const topProducts = [...products]
    .sort((a, b) => {
      const discountA = a.compareAtPrice ? a.compareAtPrice - a.price : 0;
      const discountB = b.compareAtPrice ? b.compareAtPrice - b.price : 0;
      return discountB - discountA;
    })
    .slice(0, count);

  return (
    <ProductGrid
      products={topProducts}
      isLoading={isLoading}
      error={error}
      columns={columns}
      title={title}
      subtitle={subtitle}
      emptyMessage="Belum ada produk unggulan"
      className="mb-12"
    />
  );
}
