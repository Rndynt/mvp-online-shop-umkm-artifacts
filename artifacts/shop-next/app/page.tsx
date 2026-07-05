import type { ProductListItem, StorefrontResponse } from '@workspace/api-client-react';
import { serverFetch } from '@/lib/server-api';
import { HomeTemplatePicker } from '@/components/home-template-picker';

async function fetchHomeData() {
  const [products, storefront] = await Promise.all([
    serverFetch<ProductListItem[]>('/products'),
    serverFetch<StorefrontResponse>('/storefront'),
  ]);
  return { products: products ?? [], storefront };
}

export default async function HomePage() {
  const { products, storefront } = await fetchHomeData();
  const raw = storefront?.homepageTemplate;
  const template = raw === 'basic-1' ? 'basic-1' : raw === 'bold' ? 'bold' : 'basic';

  return <HomeTemplatePicker products={products} initialTemplate={template} />;
}

export const dynamic = 'force-dynamic';
