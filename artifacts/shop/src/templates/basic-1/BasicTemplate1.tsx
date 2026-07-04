import { Hero } from '@/templates/components/Hero';
import { TopProducts } from '@/templates/components/TopProducts';
import { ProductGrid, type GridProduct } from '@/templates/components/ProductGrid';
import { Testimonials } from '@/templates/components/Testimonials';

export interface BasicTemplate1Props {
  products: GridProduct[];
  isLoading?: boolean;
  error?: unknown;
}

/**
 * Template Basic 1 — homepage dengan section lebih lengkap:
 * Hero (gaya modern) + Produk Terlaris + Semua Produk + Testimoni.
 * Semua komponen di dalamnya reusable (Hero, TopProducts, ProductGrid, Testimonials)
 * sehingga bisa dipakai ulang di template lain.
 */
export function BasicTemplate1({ products, isLoading, error }: BasicTemplate1Props) {
  return (
    <>
      <Hero
        variant="modern"
        title="Belanja Mudah, Hidup Lebih Praktis"
        subtitle="Produk pilihan berkualitas untuk kebutuhan sehari-hari Anda, dengan harga bersahabat."
        badgeText="Gunakan kode HEMAT10 untuk diskon 10%!"
      />

      <TopProducts
        products={products}
        isLoading={isLoading}
        error={error}
        count={4}
        columns={4}
      />

      <ProductGrid
        products={products}
        isLoading={isLoading}
        error={error}
        columns={4}
        title="Semua Produk"
        subtitle="Jelajahi semua koleksi produk kami"
        className="mb-12"
      />

      <Testimonials />
    </>
  );
}
