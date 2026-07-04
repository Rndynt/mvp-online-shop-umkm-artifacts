import { Star, Quote } from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────── */

export interface Review {
  name: string;
  role: string;
  comment: string;
  rating: number;
  initials: string;
}

export interface RatingSectionProps {
  /** Overall score out of 5 */
  score?: number;
  /** Total number of reviews */
  totalReviews?: number;
  /** Distribution: index 0 = 5-star count, index 4 = 1-star count */
  distribution?: [number, number, number, number, number];
  reviews?: Review[];
  title?: string;
  subtitle?: string;
  className?: string;
}

/* ─── Defaults ───────────────────────────────────────────────── */

const DEFAULT_REVIEWS: Review[] = [
  {
    name: 'Ayu Pradita',
    role: 'Pelanggan di Surabaya',
    comment:
      'Kualitas produknya melebihi ekspektasi saya. Pengiriman cepat dan packaging rapi banget!',
    rating: 5,
    initials: 'AP',
  },
  {
    name: 'Rizky Firmansyah',
    role: 'Pelanggan di Bandung',
    comment:
      'Sudah order 3 kali dan selalu puas. Harga kompetitif, barang ori, dan CS responsif.',
    rating: 5,
    initials: 'RF',
  },
  {
    name: 'Linda Kusuma',
    role: 'Pelanggan di Jakarta',
    comment: 'Produknya sesuai deskripsi, tampilan elegan. Recommended banget buat hadiah!',
    rating: 4,
    initials: 'LK',
  },
];

/* ─── Sub-components ─────────────────────────────────────────── */

function StarRow({ filled, size = 'md' }: { filled: number; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${cls} ${i < filled ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'}`}
        />
      ))}
    </div>
  );
}

function DistributionBar({
  label,
  count,
  max,
}: {
  label: string;
  count: number;
  max: number;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs text-slate-600">
      <span className="w-6 shrink-0 text-right font-medium">{label}</span>
      <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-yellow-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-slate-400">{count}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="relative flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5">
      <Quote className="absolute right-4 top-4 h-5 w-5 text-primary/15" />
      <StarRow filled={review.rating} size="sm" />
      <p className="text-sm leading-relaxed text-slate-600">{review.comment}</p>
      <div className="mt-auto flex items-center gap-2.5 border-t border-slate-100 pt-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {review.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{review.name}</p>
          <p className="truncate text-xs text-slate-400">{review.role}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────── */

export function RatingSection({
  score = 4.9,
  totalReviews = 248,
  distribution = [210, 28, 7, 2, 1],
  reviews = DEFAULT_REVIEWS,
  title = 'Ulasan Pelanggan',
  subtitle = 'Ribuan pelanggan sudah mempercayai kami',
  className = '',
}: RatingSectionProps) {
  const maxCount = Math.max(...distribution);
  const roundedScore = Math.round(score * 10) / 10;

  return (
    <section className={`mb-12 ${className}`}>
      {/* Section header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      {/* Score card + distribution */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col divide-y divide-slate-100 sm:flex-row sm:divide-x sm:divide-y-0">
          {/* Aggregate score */}
          <div className="flex flex-col items-center justify-center gap-2 px-8 py-8 sm:w-48 sm:shrink-0">
            <span className="text-5xl font-extrabold text-slate-900">{roundedScore}</span>
            <StarRow filled={Math.round(score)} size="md" />
            <span className="text-xs text-slate-400">{totalReviews.toLocaleString('id-ID')} ulasan</span>
          </div>

          {/* Distribution bars */}
          <div className="flex flex-1 flex-col justify-center gap-2.5 px-6 py-6">
            {distribution.map((count, i) => (
              <DistributionBar
                key={i}
                label={String(5 - i)}
                count={count}
                max={maxCount}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Review cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {reviews.map((review, i) => (
          <ReviewCard key={i} review={review} />
        ))}
      </div>
    </section>
  );
}
