import { useState } from 'react';
import { Copy, Check, Tag, Zap, Gift } from 'lucide-react';

export interface PromoItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  code: string;
  icon: 'zap' | 'tag' | 'gift';
  /** Tailwind color for the icon accent (e.g. 'text-rose-500 bg-rose-50') */
  iconClass?: string;
}

const ICON_MAP = { zap: Zap, tag: Tag, gift: Gift } as const;

const DEFAULT_PROMOS: PromoItem[] = [
  {
    id: 'flash-sale',
    title: 'Flash Sale Akhir Bulan',
    description: 'Diskon besar-besaran untuk produk pilihan. Stok terbatas!',
    badge: 'Diskon 25%',
    code: 'AKHIRBULAN25',
    icon: 'zap',
    iconClass: 'text-amber-600 bg-amber-50',
  },
  {
    id: 'free-shipping',
    title: 'Gratis Ongkir Seluruh Indonesia',
    description: 'Belanja minimum Rp 100.000 gratis ongkir ke seluruh Indonesia.',
    badge: 'Gratis Ongkir',
    code: 'ONGKIRGRATIS',
    icon: 'gift',
    iconClass: 'text-sky-600 bg-sky-50',
  },
  {
    id: 'new-member',
    title: 'Promo Member Baru',
    description: 'Khusus untuk kamu yang baru bergabung. Diskon 10% pembelian pertama.',
    badge: 'Diskon 10%',
    code: 'HEMAT10',
    icon: 'tag',
    iconClass: 'text-violet-600 bg-violet-50',
  },
];

function PromoCard({ promo }: { promo: PromoItem }) {
  const [copied, setCopied] = useState(false);
  const Icon = ICON_MAP[promo.icon];
  const iconClass = promo.iconClass ?? 'text-slate-600 bg-slate-100';

  function copyCode() {
    navigator.clipboard.writeText(promo.code).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {},
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 shrink-0 w-72 sm:w-auto">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
          {promo.badge}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">{promo.title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{promo.description}</p>
      </div>

      {/* Code */}
      <button
        type="button"
        onClick={copyCode}
        className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 transition-colors hover:bg-slate-100 active:scale-95"
        aria-label={`Salin kode promo ${promo.code}`}
      >
        <span className="font-mono text-sm font-bold tracking-widest text-slate-800">{promo.code}</span>
        <span className="flex items-center gap-1 text-xs font-medium text-slate-400 shrink-0">
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-600">Disalin!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Salin
            </>
          )}
        </span>
      </button>
    </div>
  );
}

export interface PromoSectionProps {
  promos?: PromoItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function PromoSection({
  promos = DEFAULT_PROMOS,
  title = 'Promo & Campaign',
  subtitle = 'Gunakan kode promo berikut saat checkout untuk hemat lebih banyak',
  className = '',
}: PromoSectionProps) {
  return (
    <section className={`mb-12 ${className}`}>
      <div className="mb-5 text-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 scrollbar-hide">
        {promos.map((promo) => (
          <PromoCard key={promo.id} promo={promo} />
        ))}
      </div>
    </section>
  );
}
