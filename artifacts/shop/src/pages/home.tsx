import { useState } from 'react';
import { useListProducts, useGetStorefront } from '@workspace/api-client-react';
import { Layout } from '@/components/layout';
import { BasicTemplate } from '@/templates/basic/BasicTemplate';
import { BasicTemplate1 } from '@/templates/basic-1/BasicTemplate1';
import { BoldTemplate } from '@/templates/bold/BoldTemplate';
import { LayoutTemplate, X } from 'lucide-react';

type TemplateId = 'basic' | 'basic-1' | 'bold';

const TEMPLATE_LABELS: Record<TemplateId, string> = {
  basic: 'Template Basic',
  'basic-1': 'Template Basic 1',
  bold: 'Template Bold',
};

/**
 * Override manual lewat query param, mis. /?template=basic-1, untuk keperluan
 * preview cepat. Jika tidak ada override, pakai template yang dipilih toko
 * di halaman Management (tersimpan di database).
 */
function useTemplateOverride(): TemplateId | null {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('template');
  return value === 'basic-1' || value === 'basic' || value === 'bold' ? value : null;
}

function HomeSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="max-w-6xl mx-auto px-4 py-14 text-center">
        <div className="h-8 w-2/3 sm:w-1/2 bg-slate-200 rounded mx-auto mb-4" />
        <div className="h-4 w-3/4 sm:w-1/3 bg-slate-100 rounded mx-auto mb-2" />
        <div className="h-4 w-1/2 sm:w-1/4 bg-slate-100 rounded mx-auto mb-6" />
        <div className="h-10 w-56 bg-slate-200 rounded-full mx-auto" />
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden bg-white border border-slate-100">
            <div className="h-28 bg-slate-100" />
            <div className="p-2 space-y-1.5">
              <div className="h-2.5 w-4/5 bg-slate-200 rounded" />
              <div className="h-2.5 w-2/5 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FloatingTemplateSwitcher({ active }: { active: TemplateId }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 w-56">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Lihat versi homepage</span>
            <button onClick={() => setOpen(false)} aria-label="Tutup pemilih template" className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {(Object.keys(TEMPLATE_LABELS) as TemplateId[]).map((id) => (
              <a
                key={id}
                href={`/?template=${id}`}
                className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                  active === id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {TEMPLATE_LABELS[id]}
              </a>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        aria-label="Ganti template homepage"
      >
        <LayoutTemplate className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function HomePage() {
  const { data: productsResp, isLoading: productsLoading, error } = useListProducts();
  const { data: storefrontResp, isLoading: storefrontLoading } = useGetStorefront();
  const products = productsResp?.data ?? [];

  const override = useTemplateOverride();
  const raw = storefrontResp?.data?.homepageTemplate;
  const storeTemplate: TemplateId =
    raw === 'basic-1' ? 'basic-1' : raw === 'bold' ? 'bold' : 'basic';

  // Kalau ada override lewat query param, langsung pakai (tidak perlu tunggu
  // storefront). Kalau tidak, tunggu data storefront selesai dimuat dulu
  // sebelum menentukan template — supaya tidak sempat "flash" ke template
  // default (basic) sebelum template asli yang tersimpan diketahui.
  if (!override && storefrontLoading) {
    return (
      <Layout>
        <HomeSkeleton />
      </Layout>
    );
  }

  const template: TemplateId = override ?? storeTemplate;

  return (
    <Layout>
      {template === 'basic-1' ? (
        <BasicTemplate1 products={products} isLoading={productsLoading} error={error} />
      ) : template === 'bold' ? (
        <BoldTemplate products={products} isLoading={productsLoading} error={error} />
      ) : (
        <BasicTemplate products={products} isLoading={productsLoading} error={error} />
      )}
      <FloatingTemplateSwitcher active={template} />
    </Layout>
  );
}
