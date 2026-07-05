import { useParams } from 'wouter';
import { useListProducts } from '@workspace/api-client-react';
import { Layout } from '@/components/layout';
import { BasicTemplate } from '@/templates/basic/BasicTemplate';
import { BasicTemplate1 } from '@/templates/basic-1/BasicTemplate1';
import { Link } from 'wouter';

const TEMPLATES = {
  basic: { label: 'Template Basic', component: BasicTemplate },
  'basic-1': { label: 'Template Basic 1', component: BasicTemplate1 },
} as const;

export default function TemplatePreviewPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const { data: productsResp, isLoading, error } = useListProducts();
  const products = productsResp?.data ?? [];

  const entry = TEMPLATES[templateId as keyof typeof TEMPLATES];

  if (!entry) {
    return (
      <Layout>
        <p className="text-center text-slate-500 py-16">
          Template tidak ditemukan. Coba{' '}
          <Link href="/preview/basic" className="text-primary underline">
            Template Basic
          </Link>{' '}
          atau{' '}
          <Link href="/preview/basic-1" className="text-primary underline">
            Template Basic 1
          </Link>
          .
        </p>
      </Layout>
    );
  }

  const TemplateComponent = entry.component;

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-xl p-3">
        <span className="text-xs font-medium text-slate-400 mr-1">Preview template:</span>
        {Object.entries(TEMPLATES).map(([id, t]) => (
          <Link
            key={id}
            href={`/preview/${id}`}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              id === templateId
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <TemplateComponent products={products} isLoading={isLoading} error={error} />
    </Layout>
  );
}
