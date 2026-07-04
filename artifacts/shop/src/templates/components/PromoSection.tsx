import { useState } from 'react';
import { Copy, Check, Tag, Zap, Gift, ArrowRight, Star, ShieldCheck } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type IconName = 'zap' | 'tag' | 'gift' | 'star' | 'shield';
const ICON_MAP = { zap: Zap, tag: Tag, gift: Gift, star: Star, shield: ShieldCheck } as const;

interface BasePromo {
  id: string;
  title: string;
  description: string;
  badge: string;
  icon: IconName;
  iconClass?: string;
}

interface CodePromo extends BasePromo {
  type: 'code';
  code: string;
}

interface CtaPromo extends BasePromo {
  type: 'cta';
  ctaLabel: string;
  ctaHref: string;
}

interface VisualPromo extends BasePromo {
  type: 'visual';
  highlights: string[];
}

export type PromoItem = CodePromo | CtaPromo | VisualPromo;

// ─── Default promos ───────────────────────────────────────────────────────────

const DEFAULT_PROMOS: PromoItem[] = [
  {
    id: 'flash-sale',
    type: 'code',
    title: 'Flash Sale Akhir Bulan',
    description: 'Diskon besar-besaran untuk produk pilihan. Stok terbatas!',
    badge: 'Diskon 25%',
    code: 'AKHIRBULAN25',
    icon: 'zap',
    iconClass: 'text-amber-600 bg-amber-50',
  },
  {
    id: 'free-shipping',
    type: 'code',
    title: 'Gratis Ongkir Seluruh Indonesia',
    description: 'Belanja minimum Rp 100.000 gratis ongkir ke seluruh Indonesia.',
    badge: 'Gratis Ongkir',
    code: 'ONGKIRGRATIS',
    icon: 'gift',
    iconClass: 'text-sky-600 bg-sky-50',
  },
  {
    id: 'new-member',
    type: 'code',
    title: 'Promo Member Baru',
    description: 'Khusus untuk kamu yang baru bergabung. Diskon 10% pembelian pertama.',
    badge: 'Diskon 10%',
    code: 'HEMAT10',
    icon: 'tag',
    iconClass: 'text-violet-600 bg-violet-50',
  },
  {
    id: 'new-arrivals',
    type: 'cta',
    title: 'Koleksi Terbaru Sudah Datang',
    description: 'Produk-produk baru pilihan sudah tersedia. Jangan sampai kehabisan!',
    badge: 'New',
    icon: 'star',
    iconClass: 'text-rose-500 bg-rose-50',
    ctaLabel: 'Lihat Koleksi',
    ctaHref: '#produk',
  },
  {
    id: 'guarantee',
    type: 'visual',
    title: 'Belanja Aman & Terjamin',
    description: 'Setiap pembelian dilindungi jaminan kepuasan pelanggan kami.',
    badge: 'Terpercaya',
    icon: 'shield',
    iconClass: 'text-emerald-600 bg-emerald-50',
    highlights: ['Garansi uang kembali 7 hari', 'Pengiriman aman & terlacak', 'CS responsif siap bantu'],
  },
];

// ─── Card variants ────────────────────────────────────────────────────────────

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 shrink-0 w-72 sm:w-auto">
      {children}
    </div>
  );
}

function CardHeader({ icon, badge, iconClass }: { icon: IconName; badge: string; iconClass?: string }) {
  const Icon = ICON_MAP[icon];
  const cls = iconClass ?? 'text-slate-600 bg-slate-100';
  return (
    <div className="flex items-start justify-between gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cls}`}>
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
        {badge}
      </span>
    </div>
  );
}

function CardBody({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex-1">
      <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function CodeCard({ promo }: { promo: CodePromo }) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(promo.code).then(
      () => { setCopied(true); setTimeout(() => setCopied(false), 2000); },
      () => {},
    );
  }

  return (
    <CardShell>
      <CardHeader icon={promo.icon} badge={promo.badge} iconClass={promo.iconClass} />
      <CardBody title={promo.title} description={promo.description} />
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
    </CardShell>
  );
}

function CtaCard({ promo }: { promo: CtaPromo }) {
  return (
    <CardShell>
      <CardHeader icon={promo.icon} badge={promo.badge} iconClass={promo.iconClass} />
      <CardBody title={promo.title} description={promo.description} />
      <a
        href={promo.ctaHref}
        className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 active:scale-95"
      >
        {promo.ctaLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </CardShell>
  );
}

function VisualCard({ promo }: { promo: VisualPromo }) {
  return (
    <CardShell>
      <CardHeader icon={promo.icon} badge={promo.badge} iconClass={promo.iconClass} />
      <CardBody title={promo.title} description={promo.description} />
      <ul className="flex flex-col gap-1.5">
        {promo.highlights.map((h, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
            {h}
          </li>
        ))}
      </ul>
    </CardShell>
  );
}

function PromoCard({ promo }: { promo: PromoItem }) {
  if (promo.type === 'code') return <CodeCard promo={promo} />;
  if (promo.type === 'cta') return <CtaCard promo={promo} />;
  return <VisualCard promo={promo} />;
}

// ─── Section ──────────────────────────────────────────────────────────────────

export interface PromoSectionProps {
  promos?: PromoItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function PromoSection({
  promos = DEFAULT_PROMOS,
  title = 'Promo & Campaign',
  subtitle = 'Penawaran spesial yang sayang untuk dilewatkan',
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
