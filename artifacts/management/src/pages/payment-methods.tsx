import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, CreditCard, QrCode, Landmark, GripVertical } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BankAccount {
  bank: string;
  accountNumber: string;
  accountName: string;
}

interface PaymentConfig {
  qrisEnabled: boolean;
  qrisImageUrl?: string | null;
  bankTransferEnabled: boolean;
  bankAccounts: BankAccount[];
}

// ── UI helpers ────────────────────────────────────────────────────────────────

const inputCls =
  'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/60 transition-colors bg-white';

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
        checked ? 'bg-primary' : 'bg-slate-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const EMPTY_ACCOUNT: BankAccount = { bank: '', accountNumber: '', accountName: '' };

export default function PaymentMethodsPage() {
  const [config, setConfig] = useState<PaymentConfig>({
    qrisEnabled: true,
    qrisImageUrl: null,
    bankTransferEnabled: true,
    bankAccounts: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load
  useEffect(() => {
    fetch('/api/admin/payment-methods')
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setConfig(json.data);
      })
      .catch(() => toast.error('Gagal memuat konfigurasi'))
      .finally(() => setLoading(false));
  }, []);

  function setField<K extends keyof PaymentConfig>(key: K, value: PaymentConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function addAccount() {
    setConfig((prev) => ({ ...prev, bankAccounts: [...prev.bankAccounts, { ...EMPTY_ACCOUNT }] }));
  }

  function removeAccount(idx: number) {
    setConfig((prev) => ({ ...prev, bankAccounts: prev.bankAccounts.filter((_, i) => i !== idx) }));
  }

  function updateAccount(idx: number, field: keyof BankAccount, value: string) {
    setConfig((prev) => {
      const accounts = [...prev.bankAccounts];
      accounts[idx] = { ...accounts[idx], [field]: value };
      return { ...prev, bankAccounts: accounts };
    });
  }

  async function save() {
    if (!config.qrisEnabled && !config.bankTransferEnabled) {
      toast.error('Minimal satu metode pembayaran harus aktif');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? 'Gagal menyimpan');
      toast.success('Konfigurasi pembayaran disimpan');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Metode Pembayaran</h1>
        <p className="text-slate-500 text-sm mt-0.5">Atur metode pembayaran yang tersedia di checkout</p>
      </div>

      {/* QRIS */}
      <Card
        title="QRIS"
        description="Pelanggan membayar menggunakan QR code dari dompet digital atau mobile banking"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">QRIS</p>
              <p className="text-xs text-slate-400">Semua aplikasi dompet digital</p>
            </div>
          </div>
          <Toggle
            checked={config.qrisEnabled}
            onChange={(v) => setField('qrisEnabled', v)}
            disabled={config.qrisEnabled && !config.bankTransferEnabled}
          />
        </div>

        {config.qrisEnabled && (
          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-medium text-slate-600 block mb-1.5">
              URL Gambar QR (opsional)
            </label>
            <input
              className={inputCls}
              placeholder="https://... (kosongkan untuk generate otomatis)"
              value={config.qrisImageUrl ?? ''}
              onChange={(e) => setField('qrisImageUrl', e.target.value || null)}
            />
            <p className="text-xs text-slate-400 mt-1">
              Jika dikosongkan, QR code akan digenerate dari data pesanan secara otomatis.
            </p>
          </div>
        )}
      </Card>

      {/* Transfer Bank */}
      <Card
        title="Transfer Bank"
        description="Pelanggan mentransfer ke rekening bank yang Anda daftarkan"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <Landmark className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Transfer Bank Manual</p>
              <p className="text-xs text-slate-400">BCA, BNI, Mandiri, dan lainnya</p>
            </div>
          </div>
          <Toggle
            checked={config.bankTransferEnabled}
            onChange={(v) => setField('bankTransferEnabled', v)}
            disabled={config.bankTransferEnabled && !config.qrisEnabled}
          />
        </div>

        {config.bankTransferEnabled && (
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Rekening Bank</p>
              <button
                type="button"
                onClick={addAccount}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Rekening
              </button>
            </div>

            {config.bankAccounts.length === 0 && (
              <div className="py-6 text-center border-2 border-dashed border-slate-200 rounded-lg">
                <CreditCard className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Belum ada rekening bank</p>
                <button
                  type="button"
                  onClick={addAccount}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  + Tambah rekening
                </button>
              </div>
            )}

            <div className="space-y-3">
              {config.bankAccounts.map((acct, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-slate-400">
                      <GripVertical className="w-4 h-4" />
                      <span className="text-xs font-medium text-slate-500">Rekening {idx + 1}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAccount(idx)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1">Nama Bank</label>
                      <input
                        className={inputCls}
                        placeholder="BCA"
                        value={acct.bank}
                        onChange={(e) => updateAccount(idx, 'bank', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1">Nomor Rekening</label>
                      <input
                        className={inputCls}
                        placeholder="1234567890"
                        value={acct.accountNumber}
                        onChange={(e) => updateAccount(idx, 'accountNumber', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1">Nama Pemilik</label>
                      <input
                        className={inputCls}
                        placeholder="PT Kopio Indonesia"
                        value={acct.accountName}
                        onChange={(e) => updateAccount(idx, 'accountName', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Save button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
          Simpan Konfigurasi
        </button>
      </div>
    </div>
  );
}
