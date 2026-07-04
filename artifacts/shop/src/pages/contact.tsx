import { useGetStorefront } from '@workspace/api-client-react';
import { Layout } from '@/components/layout';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  const { data } = useGetStorefront();
  const store = data?.data;

  const waNumber = store?.contactPhone?.replace(/\D/g, '');
  const waLink = waNumber ? `https://wa.me/${waNumber.startsWith('0') ? '62' + waNumber.slice(1) : waNumber}` : null;

  return (
    <Layout>
      <div className="max-w-lg mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Hubungi Kami</h1>
          <p className="text-sm text-slate-500 mt-1">Ada pertanyaan? Kami siap membantu kamu.</p>
        </div>

        <div className="flex flex-col gap-3">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 hover:bg-emerald-100 transition-colors group"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">WhatsApp</p>
                <p className="text-sm text-slate-500 truncate">{store?.contactPhone}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full shrink-0">
                Chat Sekarang
              </span>
            </a>
          )}

          {store?.contactEmail && (
            <a
              href={`mailto:${store.contactEmail}`}
              className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">Email</p>
                <p className="text-sm text-slate-500 truncate">{store.contactEmail}</p>
              </div>
            </a>
          )}

          {store?.contactPhone && !waLink && (
            <a
              href={`tel:${store.contactPhone}`}
              className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">Telepon</p>
                <p className="text-sm text-slate-500">{store.contactPhone}</p>
              </div>
            </a>
          )}

          {(store?.addressLine1 || store?.city) && (
            <div className="flex items-start gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Alamat</p>
                <p className="text-sm text-slate-500 leading-relaxed mt-0.5">
                  {[store.addressLine1, store.city, store.province, store.postalCode]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>

        {!store?.contactPhone && !store?.contactEmail && (
          <div className="text-center py-16 text-slate-400">
            <MessageCircle className="w-10 h-10 mx-auto mb-3" />
            <p className="text-sm">Informasi kontak belum tersedia.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
