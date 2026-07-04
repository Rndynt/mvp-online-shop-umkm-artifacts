import { useGetStorefront } from '@workspace/api-client-react';
import { Layout } from '@/components/layout';
import { Store, MapPin, Phone, Mail } from 'lucide-react';

export default function AboutPage() {
  const { data } = useGetStorefront();
  const store = data?.data;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {store?.logoUrl ? (
            <img src={store.logoUrl} alt={store.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-100" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shrink-0">
              <Store className="w-8 h-8 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{store?.name ?? '—'}</h1>
            {store?.tagline && (
              <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{store.tagline}</p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 mb-8" />

        {/* Tentang */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Tentang Toko</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {store?.tagline
              ? `${store.name} adalah toko online yang menyediakan produk-produk berkualitas pilihan. ${store.tagline}`
              : `${store?.name ?? 'Toko kami'} hadir untuk memberikan pengalaman belanja yang mudah, aman, dan menyenangkan bagi setiap pelanggan.`}
          </p>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(store?.addressLine1 || store?.city) && (
            <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-4">
              <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Lokasi</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {[store.addressLine1, store.city, store.province].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          )}

          {store?.contactPhone && (
            <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-4">
              <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Telepon</p>
                <p className="text-sm text-slate-700">{store.contactPhone}</p>
              </div>
            </div>
          )}

          {store?.contactEmail && (
            <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-4">
              <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Email</p>
                <p className="text-sm text-slate-700 break-all">{store.contactEmail}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
