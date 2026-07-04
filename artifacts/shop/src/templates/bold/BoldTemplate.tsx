import { Hero } from '@/templates/components/Hero';
import { PromoSection } from '@/templates/components/PromoSection';
import { ProductGrid, type GridProduct } from '@/templates/components/ProductGrid';
import { Testimonials } from '@/templates/components/Testimonials';

export interface BoldTemplateProps {
  products: GridProduct[];
  isLoading?: boolean;
  error?: unknown;
}

/**
 * Template Bold — homepage fokus promosi & konversi:
 * Hero full-width + Section promo/campaign + Grid produk + Rating & testimoni.
 */
export function BoldTemplate({ products, isLoading, error }: BoldTemplateProps) {
  return (
    <>
      <Hero
        variant="fullwidth"
        title={
          <>
            Produk Terbaik,
            <br className="hidden sm:block" /> Harga Terjangkau
          </>
        }
        subtitle="Temukan ribuan produk berkualitas dengan penawaran eksklusif yang tidak akan kamu temukan di tempat lain."
        badgeText="🎉 Promo spesial menanti kamu di bawah!"
        ctaLabel="Lihat Semua Produk"
        ctaHref="#produk"
      />

      <PromoSection />

      <ProductGrid
        id="produk"
        products={products}
        isLoading={isLoading}
        error={error}
        columns={4}
        title="Semua Produk"
        subtitle="Jelajahi koleksi lengkap kami"
        className="mb-12"
      />

      <Testimonials />
    </>
  );
}
