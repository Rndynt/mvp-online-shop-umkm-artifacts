import React, { useEffect, useState } from 'react';
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
  {
    id: 'bold',
    name: 'Template Bold',
    description: 'Hero full-width mencolok, section promo & campaign dengan kode diskon, grid produk, dan ulasan pelanggan.',
  },
] as const;

type TemplateId = (typeof TEMPLATE_OPTIONS)[number]['id'];

function MiniProductCard({ tone = 'slate' }: { tone?: 'slate' | 'white' }) {
  return (
    <div
      className={cn(
        'flex-1 rounded-md overflow-hidden border',
        tone === 'white' ? 'bg-white/80 border-white' : 'bg-white border-slate-200',
      )}
    >
      <div className={cn('h-6', tone === 'white' ? 'bg-slate-200/70' : 'bg-slate-200')} />
      <div className="p-1 space-y-0.5">
        <div className="h-1 w-3/4 bg-slate-300 rounded" />
        <div className="h-1 w-1/2 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

/**
 * Shared wrapper: renders children as a centered "website canvas" (58% wide)
 * on a gray background, simulating a desktop browser viewport preview.
 */
function PreviewFrame({ children, bg = 'bg-slate-100' }: { children: React.ReactNode; bg?: string }) {
  return (
    <div className={`w-full h-full ${bg} flex items-stretch justify-center`}>
      <div className="w-[58%] bg-white flex flex-col overflow-hidden shadow-sm">
        {children}
      </div>
    </div>
  );
}

function BasicThumbnail() {
  return (
    <PreviewFrame>
      <div className="flex flex-col items-center justify-center gap-1 px-2 py-3 text-center flex-1">
        <div className="h-2 w-4/5 bg-slate-400 rounded" />
        <div className="h-1.5 w-3/5 bg-slate-300 rounded" />
        <div className="h-1.5 w-2/5 bg-slate-200 rounded mt-0.5" />
        <div className="h-3 w-2/5 bg-primary/70 rounded-full mt-1" />
      </div>
      <div className="flex gap-1 px-2 pb-2">
        <MiniProductCard />
        <MiniProductCard />
        <MiniProductCard />
      </div>
    </PreviewFrame>
  );
}

function Basic1Thumbnail() {
  return (
    <PreviewFrame bg="bg-slate-200">
      <div className="bg-gradient-to-br from-primary/30 via-white to-accent/20 flex flex-col items-center gap-1 px-2 py-2.5 text-center">
        <div className="h-2 w-4/5 bg-slate-500/70 rounded" />
        <div className="h-1.5 w-3/5 bg-slate-400/60 rounded" />
        <div className="h-2.5 w-2/5 bg-accent/80 rounded-full mt-1" />
      </div>
      <div className="px-2 pt-1.5">
        <div className="h-1 w-1/3 bg-slate-300 rounded mb-1" />
        <div className="flex gap-1">
          <MiniProductCard />
          <MiniProductCard />
          <MiniProductCard />
        </div>
      </div>
      <div className="flex gap-1 px-2 py-1.5 mt-auto">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 bg-slate-50 border border-slate-200 rounded p-1 space-y-0.5">
            <div className="h-1 w-full bg-slate-300 rounded" />
            <div className="h-1 w-2/3 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}

function BoldThumbnail() {
  return (
    <PreviewFrame bg="bg-slate-200">
      {/* Full-width hero — spans the inner canvas edge-to-edge */}
      <div className="bg-primary flex flex-col items-center gap-1 px-2 py-2.5">
        <div className="h-1.5 w-1/3 bg-white/60 rounded-full" />
        <div className="h-2 w-4/5 bg-white/90 rounded" />
        <div className="h-1.5 w-3/5 bg-white/60 rounded" />
        <div className="h-2.5 w-2/5 bg-white rounded-full mt-0.5" />
      </div>
      {/* Promo cards — horizontal strip */}
      <div className="flex gap-1 px-2 py-1.5">
        <div className="flex-1 rounded bg-primary/80 p-1 space-y-0.5">
          <div className="h-1 w-3/4 bg-white/80 rounded" />
          <div className="h-1.5 w-2/3 bg-white/40 rounded" />
        </div>
        <div className="flex-1 rounded bg-slate-300 p-1 space-y-0.5">
          <div className="h-1 w-3/4 bg-slate-500/60 rounded" />
          <div className="h-1.5 w-2/3 bg-slate-400/40 rounded" />
        </div>
        <div className="flex-1 rounded bg-amber-400 p-1 space-y-0.5">
          <div className="h-1 w-3/4 bg-amber-900/50 rounded" />
          <div className="h-1.5 w-2/3 bg-amber-900/30 rounded" />
        </div>
      </div>
      {/* Product grid */}
      <div className="flex gap-1 px-2 pb-1">
        <MiniProductCard />
        <MiniProductCard />
        <MiniProductCard />
      </div>
      {/* Testimonials */}
      <div className="flex gap-1 px-2 pb-2 mt-auto">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 bg-slate-50 border border-slate-200 rounded p-1 space-y-0.5">
            <div className="h-1 w-full bg-yellow-300 rounded" />
            <div className="h-1 w-2/3 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}

const THUMBNAILS: Record<TemplateId, () => React.ReactElement> = {
  basic: BasicThumbnail,
  'basic-1': Basic1Thumbnail,
  bold: BoldThumbnail,
};

export default function TemplatesPage() {
  const [selected, setSelected] = useState<TemplateId | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);

  function loadSettings() {
    return fetch('/api/admin/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setSettings(json.data);
          const t = json.data.homepageTemplate;
          setSelected(t === 'basic-1' ? 'basic-1' : t === 'bold' ? 'bold' : 'basic');
        }
      });
  }

  useEffect(() => {
    loadSettings()
      .catch(() => toast.error('Gagal memuat pengaturan template'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSelect(templateId: TemplateId) {
    if (templateId === selected || saving || !settings) return;
    const previous = selected;
    setSelected(templateId);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, homepageTemplate: templateId }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(json?.error?.message ?? 'Gagal menyimpan template');
        setSelected(previous);
        return;
      }
      setSettings((prev) => (prev ? { ...prev, homepageTemplate: templateId } : prev));
      toast.success('Template homepage berhasil diperbarui');
      await loadSettings();
    } catch {
      toast.error('Terjadi kesalahan jaringan, silakan coba lagi');
      setSelected(previous);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !selected) {
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
          const Thumbnail = THUMBNAILS[tpl.id];
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
                <span className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary flex items-center justify-center z-10">
                  <Check className="w-3 h-3 text-white" />
                </span>
              )}
              <div className="w-full h-36 rounded-lg mb-4 overflow-hidden border border-slate-100">
                <Thumbnail />
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
