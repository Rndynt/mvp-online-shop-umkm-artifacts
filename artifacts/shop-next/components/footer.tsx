import { MapPin, Phone, Mail } from 'lucide-react';

interface FooterProps {
  storeName?: string;
  tagline?: string | null;
  address?: {
    line1?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
  };
  contact?: {
    email?: string | null;
    phone?: string | null;
  };
}

function ShopeeIcon() {
  return (
    <svg viewBox="0 0 60 60" className="w-full h-full" fill="none">
      <rect width="60" height="60" rx="10" fill="#EE4D2D" />
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">Shopee</text>
    </svg>
  );
}

function TokopediaIcon() {
  return (
    <svg viewBox="0 0 60 60" className="w-full h-full" fill="none">
      <rect width="60" height="60" rx="10" fill="#42B549" />
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="9.5" fontWeight="bold" fontFamily="Arial">Tokopedia</text>
    </svg>
  );
}

function TiktokShopIcon() {
  return (
    <svg viewBox="0 0 60 60" className="w-full h-full" fill="none">
      <rect width="60" height="60" rx="10" fill="#010101" />
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">TikTok Shop</text>
    </svg>
  );
}

function LazadaIcon() {
  return (
    <svg viewBox="0 0 60 60" className="w-full h-full" fill="none">
      <rect width="60" height="60" rx="10" fill="#0F146D" />
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">Lazada</text>
    </svg>
  );
}

function PaymentChip({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wide"
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  );
}

const MARKETPLACES = [
  { id: 'shopee', label: 'Shopee', Icon: ShopeeIcon },
  { id: 'tokopedia', label: 'Tokopedia', Icon: TokopediaIcon },
  { id: 'tiktok', label: 'TikTok Shop', Icon: TiktokShopIcon },
  { id: 'lazada', label: 'Lazada', Icon: LazadaIcon },
] as const;

const PAYMENTS = [
  { label: 'GoPay', bg: '#00AED6', color: '#fff' },
  { label: 'OVO', bg: '#4C3494', color: '#fff' },
  { label: 'DANA', bg: '#118EEA', color: '#fff' },
  { label: 'QRIS', bg: '#E4132B', color: '#fff' },
  { label: 'Transfer', bg: '#F1F5F9', color: '#475569' },
  { label: 'COD', bg: '#F1F5F9', color: '#475569' },
] as const;

export function Footer({
  storeName = 'RukoLite',
  tagline,
  address,
  contact,
}: FooterProps) {
  const hasAddress = address?.line1 || address?.city || address?.province;
  const hasContact = contact?.email || contact?.phone;

  return (
    <footer className="bg-primary/8 text-slate-700 mt-16 border-t border-primary/15">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div className="sm:col-span-1 flex flex-col gap-4">
          <div>
            <h2 className="text-slate-900 text-lg font-bold tracking-tight">{storeName}</h2>
            {tagline && <p className="mt-1 text-sm text-slate-500 leading-relaxed">{tagline}</p>}
          </div>

          {(hasAddress || hasContact) && (
            <ul className="flex flex-col gap-2.5 text-sm">
              {hasAddress && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary/60" />
                  <span className="text-slate-600 leading-relaxed">
                    {[address?.line1, address?.city, address?.province, address?.postalCode]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </li>
              )}
              {contact?.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 shrink-0 text-primary/60" />
                  <a href={`tel:${contact.phone}`} className="text-slate-600 hover:text-primary transition-colors">
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact?.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 shrink-0 text-primary/60" />
                  <a href={`mailto:${contact.email}`} className="text-slate-600 hover:text-primary transition-colors">
                    {contact.email}
                  </a>
                </li>
              )}
            </ul>
          )}
        </div>

        <div>
          <h3 className="text-slate-900 text-sm font-semibold mb-4 uppercase tracking-widest">Tersedia di</h3>
          <div className="flex flex-wrap gap-2.5">
            {MARKETPLACES.map(({ id, label, Icon }) => (
              <div key={id} className="w-14 h-14 rounded-xl overflow-hidden opacity-90 hover:opacity-100 transition-opacity" title={label}>
                <Icon />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-slate-900 text-sm font-semibold mb-4 uppercase tracking-widest">Metode Pembayaran</h3>
          <div className="flex flex-wrap gap-2">
            {PAYMENTS.map((p) => (
              <PaymentChip key={p.label} label={p.label} bg={p.bg} color={p.color} />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-primary/15">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <p>Powered by RukoLite</p>
        </div>
      </div>
    </footer>
  );
}
