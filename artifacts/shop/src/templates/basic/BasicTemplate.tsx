import { Hero } from '@/templates/components/Hero';
import { ProductGrid, type GridProduct } from '@/templates/components/ProductGrid';

export interface BasicTemplateProps {
  products: GridProduct[];
  isLoading?: boolean;
  error?: unknown;
}

/**
 * Template Basic — homepage default toko (hero sederhana + grid produk).
 * Ini adalah homepage awal RukoLite, diekstrak jadi komponen template
 * yang bisa dipakai ulang / dipilih sebagai tampilan homepage toko.
 */
export function BasicTemplate({ products, isLoading, error }: BasicTemplateProps) {
  return (
    <>
      <Hero
        variant="basic"
        title={
          <>
            Produk Pilihan untuk
            <br className="hidden sm:block" /> Keseharian Anda
          </>
        }
        subtitle="Temukan produk berkualitas tinggi dengan harga terjangkau, dikirim langsung ke pintu rumah Anda."
        badgeText="Gunakan kode HEMAT10 untuk diskon 10%!"
      />

      <ProductGrid products={products} isLoading={isLoading} error={error} columns={4} />
    </>
  );
}
