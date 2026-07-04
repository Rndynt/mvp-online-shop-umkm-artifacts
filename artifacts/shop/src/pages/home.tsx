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

function TemplateSwitcher({ active }: { active: 'basic' | 'basic-1' }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-xl p-3">
      <span className="text-xs font-medium text-slate-400 mr-1">Lihat versi homepage:</span>
      <a
        href="/?template=basic"
        className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
          active === 'basic' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        Template Basic
      </a>
      <a
        href="/?template=basic-1"
        className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
          active === 'basic-1' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        Template Basic 1 (Baru)
      </a>
    </div>
  );
}

export default function HomePage() {
  const { data: productsResp, isLoading, error } = useListProducts();
  const products = productsResp?.data ?? [];
  const template = useSelectedTemplate();

  return (
    <Layout>
      <TemplateSwitcher active={template} />

      {template === 'basic-1' ? (
        <BasicTemplate1 products={products} isLoading={isLoading} error={error} />
      ) : (
        <BasicTemplate products={products} isLoading={isLoading} error={error} />
      )}
    </Layout>
  );
}
