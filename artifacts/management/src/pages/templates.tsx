import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';

const TEMPLATE_OPTIONS = [
  {
    id: 'basic',
    name: 'Template Basic',
    description: 'Hero sederhana dengan grid produk klasik. Cocok untuk toko yang ingin tampilan bersih dan cepat dimuat.',
  },
  {
    id: 'basic-1',
    name: 'Template Basic 1',
    description: 'Hero modern dengan gradasi warna, section "Produk Terlaris" terpisah, dan testimoni pelanggan.',
  },
] as const;

type TemplateId = (typeof TEMPLATE_OPTIONS)[number]['id'];

export default function TemplatesPage() {
  const [selected, setSelected] = useState<TemplateId>('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setSettings(json.data);
          if (json.data.homepageTemplate === 'basic-1' || json.data.homepageTemplate === 'basic') {
            setSelected(json.data.homepageTemplate);
          }
        }
      })
      .catch(() => toast.error('Gagal memuat pengaturan template'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSelect(templateId: TemplateId) {
    if (templateId === selected || saving || !settings) return;
    setSelected(templateId);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, homepageTemplate: templateId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? 'Gagal menyimpan template');
        setSelected(settings.homepageTemplate as TemplateId);
      } else {
        setSettings((prev) => (prev ? { ...prev, homepageTemplate: templateId } : prev));
        toast.success('Template homepage berhasil diperbarui');
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan');
      setSelected(settings.homepageTemplate as TemplateId);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Kelola Template</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Pilih tampilan homepage yang digunakan storefront Anda
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TEMPLATE_OPTIONS.map((tpl) => {
          const isActive = selected === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              disabled={saving}
              onClick={() => handleSelect(tpl.id)}
              className={cn(
                'relative text-left bg-white rounded-xl border-2 p-5 transition-colors disabled:opacity-70',
                isActive ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300',
              )}
            >
              {isActive && (
                <span className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </span>
              )}
              <div className="w-full h-28 rounded-lg bg-slate-100 mb-4 flex items-center justify-center overflow-hidden">
                {tpl.id === 'basic' ? (
                  <div className="w-full h-full p-3 flex flex-col gap-1.5">
                    <div className="h-3 w-2/3 bg-slate-300 rounded" />
                    <div className="h-2 w-1/2 bg-slate-200 rounded" />
                    <div className="flex gap-1.5 mt-auto">
                      <div className="h-8 flex-1 bg-slate-300 rounded" />
                      <div className="h-8 flex-1 bg-slate-300 rounded" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full p-3 flex flex-col gap-1.5 bg-gradient-to-br from-primary/20 to-tertiary/20">
                    <div className="h-3 w-3/4 bg-slate-400/60 rounded" />
                    <div className="h-2 w-1/2 bg-slate-300/60 rounded" />
                    <div className="flex gap-1.5 mt-auto">
                      <div className="h-8 flex-1 bg-white/70 rounded" />
                      <div className="h-8 flex-1 bg-white/70 rounded" />
                      <div className="h-8 flex-1 bg-white/70 rounded" />
                    </div>
                  </div>
                )}
              </div>
              <h3 className="text-sm font-semibold text-slate-800">{tpl.name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tpl.description}</p>
              <div className="mt-3">
                <span
                  className={cn(
                    'text-xs font-semibold px-2.5 py-1 rounded-full',
                    isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500',
                  )}
                >
                  {isActive ? 'Sedang Digunakan' : 'Pilih Template'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {saving && (
        <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan perubahan…
        </p>
      )}
    </div>
  );
}
