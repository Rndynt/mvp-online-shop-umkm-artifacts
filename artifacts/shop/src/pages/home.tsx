import { useListProducts } from '@workspace/api-client-react';
import { Layout } from '@/components/layout';
import { BasicTemplate } from '@/templates/basic/BasicTemplate';
import { BasicTemplate1 } from '@/templates/basic-1/BasicTemplate1';

/**
 * Preview template lewat query param, mis. /?template=basic-1
 * Nantinya ini bisa diganti dengan pilihan template yang disimpan
 * per-toko dari sisi backend/management.
 */
function useSelectedTemplate(): 'basic' | 'basic-1' {
  const params = new URLSearchParams(window.location.search);
  return params.get('template') === 'basic-1' ? 'basic-1' : 'basic';
}

export default function HomePage() {
  const { data: productsResp, isLoading, error } = useListProducts();
  const products = productsResp?.data ?? [];
  const template = useSelectedTemplate();

  return (
    <Layout>
      {template === 'basic-1' ? (
        <BasicTemplate1 products={products} isLoading={isLoading} error={error} />
      ) : (
        <BasicTemplate products={products} isLoading={isLoading} error={error} />
      )}
    </Layout>
  );
}
