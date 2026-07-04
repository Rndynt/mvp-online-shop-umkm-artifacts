import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const inputCls =
  'w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow bg-white';

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

interface StoreSettings {
  name: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  addressLine1: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  currency: string;
}

const EMPTY: StoreSettings = {
  name: '',
  tagline: '',
  contactEmail: '',
  contactPhone: '',
  website: '',
  addressLine1: '',
  city: '',
  province: '',
  postalCode: '',
  country: 'Indonesia',
  currency: 'IDR',
};

export default function SettingsPage() {
  const [form, setForm] = useState<StoreSettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setForm({ ...EMPTY, ...json.data });
      })
      .catch(() => toast.error('Gagal memuat pengaturan'))
      .finally(() => setLoading(false));
  }, []);

  function set(field: keyof StoreSettings) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Nama toko wajib diisi');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? 'Gagal menyimpan pengaturan');
      } else {
        toast.success('Pengaturan berhasil disimpan');
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan Toko</h1>
        <p className="text-slate-500 text-sm mt-0.5">Kelola informasi dan preferensi toko Anda</p>
      </div>

      <div className="space-y-4">
        <Card title="Identitas Toko" description="Nama dan informasi dasar toko Anda">
          <Field label="Nama Toko">
            <input value={form.name} onChange={set('name')} className={inputCls} />
          </Field>
          <Field label="Tagline" hint="opsional">
            <input
              value={form.tagline}
              onChange={set('tagline')}
              placeholder="Slogan singkat toko Anda"
              className={inputCls}
            />
          </Field>
        </Card>

        <Card title="Kontak" description="Email dan nomor yang bisa dihubungi pelanggan">
          <Field label="Email Toko">
            <input type="email" value={form.contactEmail} onChange={set('contactEmail')} className={inputCls} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nomor Telepon">
              <input value={form.contactPhone} onChange={set('contactPhone')} className={inputCls} />
            </Field>
            <Field label="Website" hint="opsional">
              <input value={form.website} onChange={set('website')} placeholder="https://" className={inputCls} />
            </Field>
          </div>
        </Card>

        <Card title="Alamat Toko" description="Digunakan untuk informasi pengiriman dan faktur">
          <Field label="Alamat">
            <input value={form.addressLine1} onChange={set('addressLine1')} className={inputCls} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Kota">
              <input value={form.city} onChange={set('city')} className={inputCls} />
            </Field>
            <Field label="Kode Pos">
              <input value={form.postalCode} onChange={set('postalCode')} className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Provinsi">
              <input value={form.province} onChange={set('province')} className={inputCls} />
            </Field>
            <Field label="Negara">
              <input value={form.country} onChange={set('country')} className={inputCls} />
            </Field>
          </div>
        </Card>

        <Card title="Preferensi" description="Mata uang dan format tampilan">
          <Field label="Mata Uang">
            <div className="relative">
              <select
                value={form.currency}
                onChange={set('currency')}
                className={cn(inputCls, 'appearance-none pr-9')}
              >
                <option value="IDR">IDR — Rupiah Indonesia</option>
                <option value="USD">USD — US Dollar</option>
                <option value="SGD">SGD — Singapore Dollar</option>
                <option value="MYR">MYR — Malaysian Ringgit</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </Field>
        </Card>

        <div className="flex gap-3 pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan…
              </>
            ) : (
              'Simpan Perubahan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
