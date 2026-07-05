import { Star, Quote } from 'lucide-react';

export interface Testimonial {
  name: string;
  role: string;
  comment: string;
  rating: number;
  initials: string;
}

const DUMMY_TESTIMONIALS: Testimonial[] = [
  {
    name: 'Siti Rahma',
    role: 'Pelanggan Setia',
    comment: 'Barangnya berkualitas dan pengirimannya cepat banget. Bakal beli lagi!',
    rating: 5,
    initials: 'SR',
  },
  {
    name: 'Budi Santoso',
    role: 'Pembeli di Jakarta',
    comment: 'Harga terjangkau, kualitas oke. Pelayanan customer service juga ramah.',
    rating: 5,
    initials: 'BS',
  },
  {
    name: 'Dewi Lestari',
    role: 'Pembeli di Bandung',
    comment: 'Suka banget sama kemasannya, rapi dan aman sampai tujuan.',
    rating: 4,
    initials: 'DL',
  },
];

interface TestimonialsProps {
  testimonials?: Testimonial[];
  title?: string;
  subtitle?: string;
}

export function Testimonials({
  testimonials = DUMMY_TESTIMONIALS,
  title = 'Apa Kata Mereka',
  subtitle = 'Pengalaman nyata dari pelanggan kami',
}: TestimonialsProps) {
  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
        <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3 relative"
          >
            <Quote className="w-6 h-6 text-primary/20 absolute top-4 right-4" />
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${s < t.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'}`}
                />
              ))}
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{t.comment}</p>
            <div className="flex items-center gap-2.5 mt-auto pt-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {t.initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{t.name}</p>
                <p className="text-xs text-slate-400 truncate">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
