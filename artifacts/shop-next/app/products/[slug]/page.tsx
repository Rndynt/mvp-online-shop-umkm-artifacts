import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ProductDetail } from '@workspace/api-client-react';
import { serverFetch } from '@/lib/server-api';
import { ProductDetailClient } from '@/components/product-detail';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function fetchProduct(slug: string) {
  return serverFetch<ProductDetail>(`/products/${encodeURIComponent(slug)}`);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) {
    return { title: 'Produk tidak ditemukan' };
  }

  const description = product.shortDescription ?? product.description?.slice(0, 160) ?? undefined;
  const image = product.images?.[0]?.url;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      images: image ? [{ url: image, alt: product.images[0]?.alt ?? product.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
    other: {
      'product:price:amount': String(product.price),
      'product:price:currency': 'IDR',
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto -mt-8 sm:-mx-6">
      <div className="px-4 sm:px-6">
        <ProductDetailClient product={product} />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.shortDescription ?? product.description ?? undefined,
            image: product.images?.map((img) => img.url),
            offers: {
              '@type': 'Offer',
              priceCurrency: 'IDR',
              price: product.price,
              availability:
                product.stockQuantity > 0
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
            },
          }),
        }}
      />
    </div>
  );
}

export const dynamic = 'force-dynamic';
