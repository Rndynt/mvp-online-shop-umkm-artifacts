import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Loader2, Check } from 'lucide-react';
import { ImageDropzone } from '@workspace/object-storage-web';
import { DEFAULT_THEME, THEME_PRESETS, applyThemeToDocument, resolveThemeColors } from '@workspace/shared';
import { TabsNav } from '@/components/ui/tabs-nav';

const inputCls =
  'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/60 transition-colors bg-white';

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
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
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
  logoUrl: '',
  primaryColor: DEFAULT_THEME.primary,
  secondaryColor: DEFAULT_THEME.secondary,
  tertiaryColor: DEFAULT_THEME.tertiary,
};

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700 block mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <label className="relative w-10 h-10 rounded-lg border border-slate-300 overflow-hidden shrink-0 cursor-pointer">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-1 -left-1 w-12 h-12 cursor-pointer"
          />
        </label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow bg-white"
          maxLength={7}
        />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [form, setForm] = useState<StoreSettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          const merged = {
            ...EMPTY,
            ...json.data,
            primaryColor: json.data.primaryColor || EMPTY.primaryColor,
            secondaryColor: json.data.secondaryColor || EMPTY.secondaryColor,
            tertiaryColor: json.data.tertiaryColor || EMPTY.tertiaryColor,
          };
          setForm(merged);
          applyThemeToDocument(
            resolveThemeColors({
              primary: merged.primaryColor,
              secondary: merged.secondaryColor,
              tertiary: merged.tertiaryColor,
            }),
          );
        }
      })
      .catch(() => toast.error('Gagal memuat pengaturan'))
      .finally(() => setLoading(false));
  }, []);

  function set(field: keyof StoreSettings) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function setColor(field: 'primaryColor' | 'secondaryColor' | 'tertiaryColor') {
    return (value: string) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        applyThemeToDocument(
          resolveThemeColors({
            primary: next.primaryColor,
            secondary: next.secondaryColor,
            tertiary: next.tertiaryColor,
          }),
        );
        return next;
      });
    };
  }

  function applyPreset(presetColors: { primary: string; secondary: string; tertiary: string }) {
    setForm((prev) => {
      const next = {
        ...prev,
        primaryColor: presetColors.primary,
        secondaryColor: presetColors.secondary,
        tertiaryColor: presetColors.tertiary,
      };
      applyThemeToDocument(resolveThemeColors(presetColors));
      return next;
    });
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

  type SettingsTab = 'toko' | 'tampilan';
  const [tab, setTab] = useState<SettingsTab>('toko');

  const SETTINGS_TABS: import('@/components/ui/tabs-nav').TabItem<SettingsTab>[] = [
    { id: 'toko', label: 'Informasi Toko' },
    { id: 'tampilan', label: 'Tampilan & Tema' },
  ];

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
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan Toko</h1>
        <p className="text-slate-500 text-sm mt-0.5">Kelola informasi dan preferensi toko Anda</p>
      </div>

      <TabsNav
        tabs={SETTINGS_TABS}
        active={tab}
        onChange={(id) => setTab(id)}
        className="mb-5"
      />

      <div className="space-y-4">
        {/* ── Tab: Informasi Toko ── */}
        {tab === 'toko' && (
          <>
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
          </>
        )}

        {/* ── Tab: Tampilan & Tema ── */}
        {tab === 'tampilan' && (
          <>
            <Card title="Logo Toko" description="Ditampilkan di header storefront dan panel manajemen">
              <Field label="Logo">
                <div className="max-w-xs">
                  <ImageDropzone
                    value={form.logoUrl || undefined}
                    onUploaded={(url) => setForm((prev) => ({ ...prev, logoUrl: url }))}
                    onClear={() => setForm((prev) => ({ ...prev, logoUrl: '' }))}
                    heightClassName="h-32"
                    label="Seret & lepas logo di sini, atau klik untuk memilih"
                  />
                </div>
              </Field>
            </Card>

            <Card title="Warna Tema" description="Pilih preset atau kustomisasi warna primer, sekunder, dan tersier toko Anda">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Preset Warna</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {THEME_PRESETS.map((preset) => {
                    const isActive =
                      form.primaryColor?.toLowerCase() === preset.colors.primary.toLowerCase() &&
                      form.tertiaryColor?.toLowerCase() === preset.colors.tertiary.toLowerCase();
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPreset(preset.colors)}
                        className={cn(
                          'relative flex flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 transition-colors',
                          isActive ? 'border-primary bg-primary/10' : 'border-slate-200 hover:border-slate-300',
                        )}
                      >
                        {isActive && (
                          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </span>
                        )}
                        <div className="flex -space-x-1.5">
                          <span
                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: preset.colors.primary }}
                          />
                          <span
                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: preset.colors.secondary }}
                          />
                          <span
                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: preset.colors.tertiary }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-600 font-medium leading-tight text-center">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <ColorField label="Warna Primer" value={form.primaryColor} onChange={setColor('primaryColor')} />
                <ColorField label="Warna Sekunder" value={form.secondaryColor} onChange={setColor('secondaryColor')} />
                <ColorField label="Warna Tersier" value={form.tertiaryColor} onChange={setColor('tertiaryColor')} />
              </div>
            </Card>
          </>
        )}

        {/* ── Save — always visible ── */}
        <div className="flex gap-3 pb-8 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
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
