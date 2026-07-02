import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('RukoLite');
  const [tagline, setTagline] = useState('Produk Pilihan untuk Keseharian Anda');
  const [email, setEmail] = useState('hello@rukolite.id');
  const [phone, setPhone] = useState('+62 812-3456-7890');
  const [website, setWebsite] = useState('https://rukolite.id');
  const [address, setAddress] = useState('Jl. Raya Serpong No. 12');
  const [city, setCity] = useState('Tangerang Selatan');
  const [province, setProvince] = useState('Banten');
  const [postalCode, setPostalCode] = useState('15322');
  const [currency, setCurrency] = useState('IDR');
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Pengaturan berhasil disimpan');
    }, 800);
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
            <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Tagline" hint="opsional">
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Slogan singkat toko Anda"
              className={inputCls}
            />
          </Field>
          <Field label="Logo Toko" hint="opsional">
            <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
              <p className="text-sm text-slate-400">Klik untuk upload logo</p>
              <p className="text-xs text-slate-300 mt-0.5">PNG, JPG maks. 2MB</p>
            </div>
          </Field>
        </Card>

        <Card title="Kontak" description="Email dan nomor yang bisa dihubungi pelanggan">
          <Field label="Email Toko">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nomor Telepon">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Website" hint="opsional">
              <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" className={inputCls} />
            </Field>
          </div>
        </Card>

        <Card title="Alamat Toko" description="Digunakan untuk informasi pengiriman dan faktur">
          <Field label="Alamat">
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kota">
              <input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Kode Pos">
              <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={inputCls} />
            </Field>
          </div>
          <Field label="Provinsi">
            <input value={province} onChange={(e) => setProvince(e.target.value)} className={inputCls} />
          </Field>
        </Card>

        <Card title="Preferensi" description="Mata uang dan format tampilan">
          <Field label="Mata Uang">
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={cn(inputCls, 'appearance-none pr-9')}
              >
                <option value="IDR">IDR — Rupiah Indonesia</option>
                <option value="USD">USD — US Dollar</option>
                <option value="SGD">SGD — Singapore Dollar</option>
                <option value="MYR">MYR — Malaysian Ringgit</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}
