import { useState } from 'react';
import { Copy, Check, Tag, Zap, Gift } from 'lucide-react';

export interface PromoItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  code: string;
  /** Tailwind gradient classes for the card background */
  gradient: string;
  /** Icon component name: 'zap' | 'tag' | 'gift' */
  icon: 'zap' | 'tag' | 'gift';
}

const ICON_MAP = { zap: Zap, tag: Tag, gift: Gift } as const;

const DEFAULT_PROMOS: PromoItem[] = [
  {
    id: 'flash-sale',
    title: 'Flash Sale Akhir Bulan',
    description: 'Diskon besar-besaran untuk produk pilihan. Stok terbatas, jangan sampai kehabisan!',
    badge: 'Diskon 25%',
    code: 'AKHIRBULAN25',
    gradient: 'from-primary to-primary/70',
    icon: 'zap',
  },
  {
    id: 'free-shipping',
    title: 'Gratis Ongkir Seluruh Indonesia',
    description: 'Belanja minimum Rp 100.000 sudah dapat gratis ongkir ke seluruh wilayah Indonesia.',
    badge: 'Gratis Ongkir',
    code: 'ONGKIRGRATIS',
    gradient: 'from-secondary to-secondary/70',
    icon: 'gift',
  },
  {
    id: 'new-member',
    title: 'Promo Member Baru',
    description: 'Khusus untuk kamu yang baru bergabung. Nikmati diskon 10% untuk pembelian pertama.',
    badge: 'Diskon 10%',
    code: 'HEMAT10',
    gradient: 'from-accent to-accent/70',
    icon: 'tag',
  },
];

function PromoCard({ promo }: { promo: PromoItem }) {
  const [copied, setCopied] = useState(false);
  const Icon = ICON_MAP[promo.icon];

  function copyCode() {
    navigator.clipboard.writeText(promo.code).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {/* clipboard unavailable — silent fail */},
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${promo.gradient} p-5 text-white shadow-md`}
    >
      {/* Background decorative circle */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-black/10" />

      <div className="relative">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon className="h-4 w-4" />
          </div>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold backdrop-blur-sm ring-1 ring-white/30">
            {promo.badge}
          </span>
        </div>

        {/* Content */}
        <h3 className="mb-1.5 text-sm font-bold leading-snug sm:text-base">{promo.title}</h3>
        <p className="mb-4 text-xs leading-relaxed text-white/80 sm:text-sm">{promo.description}</p>

        {/* Promo code copy */}
        <button
          type="button"
          onClick={copyCode}
          className="flex w-full items-center justify-between rounded-xl bg-white/15 px-4 py-2.5 ring-1 ring-white/30 backdrop-blur-sm transition-colors hover:bg-white/25 active:scale-95"
          aria-label={`Salin kode promo ${promo.code}`}
        >
          <span className="font-mono text-sm font-bold tracking-widest">{promo.code}</span>
          <span className="flex items-center gap-1 text-xs font-medium text-white/80">
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Disalin!
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {promos.map((promo) => (
          <PromoCard key={promo.id} promo={promo} />
        ))}
      </div>
    </section>
  );
}
