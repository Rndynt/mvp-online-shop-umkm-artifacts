import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/layout';
import { useCartStore } from '@/lib/cart-store';
import { formatIDR } from '@/lib/format';
import { useListShippingMethods, useCreateCheckout } from '@workspace/api-client-react';
import { ChevronLeft, ChevronRight, Loader2, Tag, CheckCircle2, QrCode, Landmark } from 'lucide-react';
import { Link } from 'wouter';

// ─── Schemas ─────────────────────────────────────────────────────────────────

const infoSchema = z.object({
  // Contact
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(8, 'Nomor HP minimal 8 digit').regex(/^[0-9+\-\s]+$/, 'Format HP tidak valid'),
  // Address
  firstName: z.string().min(1, 'Nama depan wajib diisi'),
  lastName: z.string().optional(),
  addressLine1: z.string().min(5, 'Alamat minimal 5 karakter'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'Kota wajib diisi'),
  province: z.string().min(2, 'Provinsi wajib diisi'),
  postalCode: z.string().min(5, 'Kode pos minimal 5 digit').max(10),
});

type InfoForm = z.infer<typeof infoSchema>;

type PaymentMethod = 'manual_fake_qris' | 'manual_bank_transfer';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Info Pengiriman', 'Kurir & Pembayaran'];

const PROVINCES = [
  'Aceh', 'Bali', 'Banten', 'Bengkulu', 'DI Yogyakarta', 'DKI Jakarta',
  'Gorontalo', 'Jambi', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur',
  'Kalimantan Barat', 'Kalimantan Selatan', 'Kalimantan Tengah', 'Kalimantan Timur',
  'Kalimantan Utara', 'Kepulauan Bangka Belitung', 'Kepulauan Riau', 'Lampung',
  'Maluku', 'Maluku Utara', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
  'Papua', 'Papua Barat', 'Papua Pegunungan', 'Papua Selatan', 'Papua Tengah',
  'Riau', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tengah',
  'Sulawesi Tenggara', 'Sulawesi Utara', 'Sumatera Barat', 'Sumatera Selatan',
  'Sumatera Utara',
];

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: 'manual_fake_qris',
    label: 'QRIS',
    desc: 'Bayar dengan semua aplikasi dompet digital',
    icon: <QrCode className="w-5 h-5" />,
  },
  {
    value: 'manual_bank_transfer',
    label: 'Transfer Bank',
    desc: 'Transfer ke rekening BCA, BNI, atau Mandiri',
    icon: <Landmark className="w-5 h-5" />,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const inputClass =
  'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/60 transition-colors';

interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, error, required, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { items, subtotal, clearCart } = useCartStore();
  const [step, setStep] = useState(0);
  const [savedInfo, setSavedInfo] = useState<InfoForm | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<string>('');
  const [discountCode, setDiscountCode] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('manual_fake_qris');
  const { data: shippingResp } = useListShippingMethods();
  const createCheckout = useCreateCheckout();

  const shippingMethods = shippingResp?.data ?? [];
  const selectedMethod = shippingMethods.find((m) => m.id === selectedShipping);
  const cartTotal = subtotal();
  const shippingPrice = selectedMethod?.price ?? 0;
  const total = cartTotal + shippingPrice;

  const infoForm = useForm<InfoForm>({ resolver: zodResolver(infoSchema) });

  function onInfoSubmit(data: InfoForm) {
    setSavedInfo(data);
    setStep(1);
  }

  async function handleConfirm() {
    if (!savedInfo || !selectedShipping) return;
    try {
      const result = await createCheckout.mutateAsync({
        data: {
          items: items.map((i) => ({
            productId: i.id,
            quantity: i.quantity,
            bundleId: i.bundleId ?? undefined,
            variantId: i.variantId ?? undefined,
          })),
          customer: { email: savedInfo.email, phone: savedInfo.phone },
          shippingAddress: {
            firstName: savedInfo.firstName,
            lastName: savedInfo.lastName ?? '',
            addressLine1: savedInfo.addressLine1,
            addressLine2: savedInfo.addressLine2,
            city: savedInfo.city,
            province: savedInfo.province,
            postalCode: savedInfo.postalCode,
            country: 'Indonesia',
          },
          shippingMethodId: selectedShipping,
          paymentMethod: selectedPayment,
          discountCode: discountCode || undefined,
        },
      });
      clearCart();
      navigate(`/orders/${result.data.orderCode}`);
    } catch (err) {
      console.error('Checkout error:', err);
    }
  }

  if (items.length === 0 && step === 0) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <p className="text-slate-700 font-medium mb-3">Keranjang belanja Anda kosong</p>
          <Link href="/" className="inline-block bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors">
            Lihat Produk
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout mainClassName="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Kembali Belanja
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Checkout</h1>

      {/* Progress */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step
                    ? 'bg-primary text-white'
                    : i === step
                    ? 'bg-primary text-white ring-4 ring-primary/30'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i <= step ? 'text-slate-800' : 'text-slate-400'}`}>
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 transition-colors ${i < step ? 'bg-primary' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: form */}
        <div className="lg:col-span-2">

          {/* ── Step 0: Info Pengiriman (Kontak + Alamat) ── */}
          {step === 0 && (
            <form
              onSubmit={infoForm.handleSubmit(onInfoSubmit)}
              className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5"
            >
              {/* Contact section */}
              <div>
                <h2 className="font-semibold text-slate-900 mb-4">Informasi Kontak</h2>
                <div className="space-y-4">
                  <Field label="Email" error={infoForm.formState.errors.email?.message} required>
                    <input type="email" {...infoForm.register('email')} className={inputClass} placeholder="email@contoh.com" />
                  </Field>
                  <Field label="Nomor HP" error={infoForm.formState.errors.phone?.message} required>
                    <input type="tel" {...infoForm.register('phone')} className={inputClass} placeholder="+62812-3456-7890" />
                  </Field>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Address section */}
              <div>
                <h2 className="font-semibold text-slate-900 mb-4">Alamat Pengiriman</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Nama Depan" error={infoForm.formState.errors.firstName?.message} required>
                      <input {...infoForm.register('firstName')} className={inputClass} placeholder="Budi" />
                    </Field>
                    <Field label="Nama Belakang">
                      <input {...infoForm.register('lastName')} className={inputClass} placeholder="Santoso" />
                    </Field>
                  </div>
                  <Field label="Alamat Lengkap" error={infoForm.formState.errors.addressLine1?.message} required>
                    <input {...infoForm.register('addressLine1')} className={inputClass} placeholder="Jl. Kebon Raya No. 12" />
                  </Field>
                  <Field label="Alamat Tambahan (opsional)">
                    <input {...infoForm.register('addressLine2')} className={inputClass} placeholder="RT/RW, Kelurahan, Kecamatan" />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Kota" error={infoForm.formState.errors.city?.message} required>
                      <input {...infoForm.register('city')} className={inputClass} placeholder="Jakarta Selatan" />
                    </Field>
                    <Field label="Kode Pos" error={infoForm.formState.errors.postalCode?.message} required>
                      <input {...infoForm.register('postalCode')} className={inputClass} placeholder="12345" />
                    </Field>
                  </div>
                  <Field label="Provinsi" error={infoForm.formState.errors.province?.message} required>
                    <select {...infoForm.register('province')} className={inputClass} defaultValue="">
                      <option value="" disabled>Pilih provinsi</option>
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
              >
                Pilih Kurir & Pembayaran <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ── Step 1: Kurir & Pembayaran ── */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Shipping */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Pilih Kurir</h2>
                <div className="space-y-3">
                  {shippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedShipping === method.id ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={method.id}
                          checked={selectedShipping === method.id}
                          onChange={() => setSelectedShipping(method.id)}
                          className="accent-primary"
                        />
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{method.name}</p>
                          {method.description && <p className="text-xs text-slate-500 mt-0.5">{method.description}</p>}
                        </div>
                      </div>
                      <span className="font-semibold text-slate-900 text-sm shrink-0 ml-4">{formatIDR(method.price)}</span>
                    </label>
                  ))}
                </div>

                {/* Discount code */}
                <div className="mt-5">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Kode Diskon <span className="text-slate-400 font-normal">(opsional)</span>
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      className={`${inputClass} pl-9`}
                      placeholder="NGOPI10"
                    />
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Metode Pembayaran</h2>
                <div className="space-y-3">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedPayment === opt.value ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={opt.value}
                        checked={selectedPayment === opt.value}
                        onChange={() => setSelectedPayment(opt.value)}
                        className="accent-primary"
                      />
                      <span className={`${selectedPayment === opt.value ? 'text-primary' : 'text-slate-400'} transition-colors`}>
                        {opt.icon}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{opt.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex-1 border border-slate-300 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!selectedShipping || createCheckout.isPending}
                  className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {createCheckout.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                    : 'Buat Pesanan'
                  }
                </button>
              </div>

              {createCheckout.error && (
                <p className="text-red-500 text-xs text-center">
                  Gagal membuat pesanan. Silakan coba lagi.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: order summary */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-20">
            <h3 className="font-semibold text-slate-900 mb-4">Ringkasan Pesanan</h3>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.lineId} className="flex gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 line-clamp-2">{item.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">×{item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-900 shrink-0">
                    {formatIDR(
                      item.bundlePackPrice != null && item.bundlePackQty != null && item.bundlePackQty > 0
                        ? (item.quantity / item.bundlePackQty) * item.bundlePackPrice
                        : item.price * item.quantity,
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span><span>{formatIDR(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ongkir</span>
                <span>{selectedMethod ? formatIDR(shippingPrice) : <span className="text-slate-400">—</span>}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200 text-base">
                <span>Total</span>
                <span>{formatIDR(total)}</span>
              </div>
            </div>

            {/* Mini summary of step 0 data when on step 1 */}
            {step === 1 && savedInfo && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                <p className="font-medium text-slate-700 mb-1.5">Info pengiriman</p>
                <p>{savedInfo.firstName} {savedInfo.lastName}</p>
                <p>{savedInfo.email}</p>
                <p>{savedInfo.city}, {savedInfo.province}</p>
                <button
                  onClick={() => setStep(0)}
                  className="text-primary hover:underline mt-1"
                >
                  Ubah
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
