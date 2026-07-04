import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/layout';
import { useCartStore } from '@/lib/cart-store';
import { formatIDR } from '@/lib/format';
import { useListShippingMethods, useCreateCheckout } from '@workspace/api-client-react';
import { ChevronLeft, ChevronRight, Loader2, Tag, CheckCircle2 } from 'lucide-react';
import { Link } from 'wouter';

const contactSchema = z.object({
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(8, 'Nomor HP minimal 8 digit').regex(/^[0-9+\-\s]+$/, 'Format HP tidak valid'),
});

const addressSchema = z.object({
  firstName: z.string().min(1, 'Nama depan wajib diisi'),
  lastName: z.string().optional(),
  addressLine1: z.string().min(5, 'Alamat minimal 5 karakter'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'Kota wajib diisi'),
  province: z.string().min(2, 'Provinsi wajib diisi'),
  postalCode: z.string().min(5, 'Kode pos minimal 5 digit').max(10),
});

type ContactForm = z.infer<typeof contactSchema>;
type AddressForm = z.infer<typeof addressSchema>;

const STEPS = ['Kontak', 'Alamat', 'Pengiriman', 'Pembayaran'];

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

const inputClass =
  'w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow';

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

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { items, subtotal, clearCart } = useCartStore();
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState<ContactForm | null>(null);
  const [address, setAddress] = useState<AddressForm | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<string>('');
  const [discountCode, setDiscountCode] = useState('');
  const { data: shippingResp } = useListShippingMethods();
  const createCheckout = useCreateCheckout();

  const shippingMethods = shippingResp?.data ?? [];
  const selectedMethod = shippingMethods.find((m) => m.id === selectedShipping);
  const cartTotal = subtotal();
  const shippingPrice = selectedMethod?.price ?? 0;
  const total = cartTotal + shippingPrice;

  const contactForm = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });
  const addressForm = useForm<AddressForm>({ resolver: zodResolver(addressSchema) });

  function onContactSubmit(data: ContactForm) {
    setContact(data);
    setStep(1);
  }

  function onAddressSubmit(data: AddressForm) {
    setAddress(data);
    setStep(2);
  }

  async function handleConfirmPayment() {
    if (!contact || !address || !selectedShipping) return;

    const payload = {
      items: items.map((i) => ({ productId: i.id, quantity: i.quantity, bundleId: i.bundleId ?? undefined })),
      customer: contact,
      shippingAddress: {
        firstName: address.firstName,
        lastName: address.lastName ?? '',
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
        country: 'Indonesia',
      },
      shippingMethodId: selectedShipping,
      paymentMethod: 'manual_fake_qris' as const,
      discountCode: discountCode || undefined,
    };

    try {
      const result = await createCheckout.mutateAsync({ data: payload });
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
          <Link href="/" className="inline-block bg-teal-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-teal-700 transition-colors">
            Lihat Produk
          </Link>
        </div>
      </Layout>
    );
  }

  return (
      <Layout mainClassName="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-6 transition-colors">
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
                      ? 'bg-teal-600 text-white'
                      : i === step
                      ? 'bg-teal-600 text-white ring-4 ring-teal-100'
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
                <div className={`h-0.5 flex-1 mx-2 transition-colors ${i < step ? 'bg-teal-600' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: form */}
          <div className="lg:col-span-2">
            {/* Step 0: Contact */}
            {step === 0 && (
              <form
                onSubmit={contactForm.handleSubmit(onContactSubmit)}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
              >
                <h2 className="font-semibold text-slate-900 mb-2">Informasi Kontak</h2>
                <Field label="Email" error={contactForm.formState.errors.email?.message} required>
                  <input type="email" {...contactForm.register('email')} className={inputClass} placeholder="email@contoh.com" />
                </Field>
                <Field label="Nomor HP" error={contactForm.formState.errors.phone?.message} required>
                  <input type="tel" {...contactForm.register('phone')} className={inputClass} placeholder="+62812-3456-7890" />
                </Field>
                <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  Lanjut ke Alamat <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Step 1: Address */}
            {step === 1 && (
              <form
                onSubmit={addressForm.handleSubmit(onAddressSubmit)}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
              >
                <h2 className="font-semibold text-slate-900 mb-2">Alamat Pengiriman</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nama Depan" error={addressForm.formState.errors.firstName?.message} required>
                    <input {...addressForm.register('firstName')} className={inputClass} placeholder="Budi" />
                  </Field>
                  <Field label="Nama Belakang">
                    <input {...addressForm.register('lastName')} className={inputClass} placeholder="Santoso" />
                  </Field>
                </div>
                <Field label="Alamat Lengkap" error={addressForm.formState.errors.addressLine1?.message} required>
                  <input {...addressForm.register('addressLine1')} className={inputClass} placeholder="Jl. Kebon Raya No. 12" />
                </Field>
                <Field label="Alamat Tambahan (opsional)">
                  <input {...addressForm.register('addressLine2')} className={inputClass} placeholder="RT/RW, Kelurahan, Kecamatan" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Kota" error={addressForm.formState.errors.city?.message} required>
                    <input {...addressForm.register('city')} className={inputClass} placeholder="Jakarta Selatan" />
                  </Field>
                  <Field label="Kode Pos" error={addressForm.formState.errors.postalCode?.message} required>
                    <input {...addressForm.register('postalCode')} className={inputClass} placeholder="12345" />
                  </Field>
                </div>
                <Field label="Provinsi" error={addressForm.formState.errors.province?.message} required>
                  <select {...addressForm.register('province')} className={inputClass} defaultValue="">
                    <option value="" disabled>Pilih provinsi</option>
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(0)} className="flex-1 border border-slate-300 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-50 transition-colors">
                    Kembali
                  </button>
                  <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    Pilih Pengiriman <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Shipping */}
            {step === 2 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Pilih Metode Pengiriman</h2>
                <div className="space-y-3 mb-6">
                  {shippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedShipping === method.id ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={method.id}
                          checked={selectedShipping === method.id}
                          onChange={() => setSelectedShipping(method.id)}
                          className="accent-teal-600"
                        />
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{method.name}</p>
                          {method.description && <p className="text-xs text-slate-500">{method.description}</p>}
                        </div>
                      </div>
                      <span className="font-semibold text-slate-900 text-sm">{formatIDR(method.price)}</span>
                    </label>
                  ))}
                </div>

                {/* Discount code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Kode Diskon <span className="text-slate-400 font-normal">(opsional)</span>
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      className={`${inputClass} pl-9`}
                      placeholder="HEMAT10"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 border border-slate-300 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-50 transition-colors">
                    Kembali
                  </button>
                  <button
                    type="button"
                    onClick={() => selectedShipping && setStep(3)}
                    disabled={!selectedShipping}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Lanjut Bayar <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Metode Pembayaran</h2>

                <label className="flex items-center justify-between p-4 rounded-xl border-2 border-teal-600 bg-teal-50 cursor-pointer mb-6">
                  <div className="flex items-center gap-3">
                    <input type="radio" checked readOnly className="accent-teal-600" />
                    <div>
                      <p className="font-medium text-slate-900 text-sm">QRIS</p>
                      <p className="text-xs text-slate-500">Bayar dengan semua aplikasi dompet digital</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 px-2 py-1 rounded text-xs font-bold text-slate-700">QRIS</div>
                </label>

                {/* Summary */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm mb-6">
                  {contact && (
                    <div className="flex justify-between text-slate-600">
                      <span>Email</span><span className="font-medium">{contact.email}</span>
                    </div>
                  )}
                  {address && (
                    <div className="flex justify-between text-slate-600">
                      <span>Pengiriman ke</span>
                      <span className="font-medium text-right max-w-[60%]">{address.city}, {address.province}</span>
                    </div>
                  )}
                  {selectedMethod && (
                    <div className="flex justify-between text-slate-600">
                      <span>Kurir</span><span className="font-medium">{selectedMethod.name}</span>
                    </div>
                  )}
                  {discountCode && (
                    <div className="flex justify-between text-green-600">
                      <span>Kode diskon</span><span className="font-medium">{discountCode}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 border border-slate-300 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-50 transition-colors">
                    Kembali
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={createCheckout.isPending}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {createCheckout.isPending
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                      : 'Buat Pesanan'
                    }
                  </button>
                </div>

                {createCheckout.error && (
                  <p className="text-red-500 text-xs mt-3 text-center">
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
                  <span>Ongkir</span><span>{selectedMethod ? formatIDR(shippingPrice) : '-'}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200 text-base">
                  <span>Total</span>
                  <span className="text-teal-700">{formatIDR(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
  );
}
