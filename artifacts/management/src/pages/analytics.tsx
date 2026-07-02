import { TrendingUp, ShoppingBag, Package, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

function StatCard({
  label,
  value,
  sub,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: { value: string; up: boolean };
  icon: typeof TrendingUp;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-teal-600" />
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trend.up ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {trend.value} dari bulan lalu
        </div>
      )}
    </div>
  );
}

const STATUS_BREAKDOWN = [
  { label: 'Menunggu Pembayaran', value: 12, color: 'bg-amber-400', pct: 20 },
  { label: 'Diproses', value: 8, color: 'bg-teal-500', pct: 13 },
  { label: 'Dikirim', value: 15, color: 'bg-purple-400', pct: 25 },
  { label: 'Selesai', value: 24, color: 'bg-emerald-400', pct: 40 },
  { label: 'Dibatalkan', value: 1, color: 'bg-red-400', pct: 2 },
];

const TOP_PRODUCTS = [
  { name: 'Tas Kanvas Handy', sku: 'TKH-001', sold: 34, revenue: 'Rp 5.406.000' },
  { name: 'Tumbler Stainless Slim', sku: 'TSS-001', sold: 21, revenue: 'Rp 3.675.000' },
  { name: 'Notebook Dot Grid A5', sku: 'NDA-001', sold: 19, revenue: 'Rp 1.235.000' },
  { name: 'Pouch Kulit Multifungsi', sku: 'PKM-001', sold: 11, revenue: 'Rp 979.000' },
];

const MONTHLY = [
  { month: 'Feb', value: 42 },
  { month: 'Mar', value: 58 },
  { month: 'Apr', value: 51 },
  { month: 'Mei', value: 73 },
  { month: 'Jun', value: 67 },
  { month: 'Jul', value: 60 },
];

const maxVal = Math.max(...MONTHLY.map((m) => m.value));

export default function AnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Analitik</h1>
        <p className="text-slate-500 text-sm mt-0.5">Ringkasan performa toko Anda</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Pesanan"
          value="60"
          sub="Bulan ini"
          trend={{ value: '+12%', up: true }}
          icon={ShoppingBag}
        />
        <StatCard
          label="Pendapatan"
          value="Rp 11,2jt"
          sub="Bulan ini"
          trend={{ value: '+8%', up: true }}
          icon={TrendingUp}
        />
        <StatCard
          label="Produk Aktif"
          value="4"
          sub="Total listing"
          icon={Package}
        />
        <StatCard
          label="Rata-rata Order"
          value="Rp 187rb"
          sub="Per transaksi"
          trend={{ value: '-3%', up: false }}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Pesanan 6 Bulan Terakhir</h2>
          <div className="flex items-end gap-2 h-36">
            {MONTHLY.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs text-slate-400">{m.value}</span>
                <div
                  className="w-full bg-teal-500 rounded-t-md transition-all"
                  style={{ height: `${(m.value / maxVal) * 100}%` }}
                />
                <span className="text-xs text-slate-400 shrink-0">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Status Pesanan</h2>
          <div className="space-y-3">
            {STATUS_BREAKDOWN.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{s.label}</span>
                  <span className="text-slate-400 font-medium">{s.value}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Produk Terlaris</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {TOP_PRODUCTS.map((p, i) => (
            <div key={p.sku} className="flex items-center gap-4 px-5 py-3.5">
              <span className="text-sm font-bold text-slate-300 w-5 shrink-0">#{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                <p className="text-xs text-slate-400">{p.sku}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-slate-800">{p.revenue}</p>
                <p className="text-xs text-slate-400">{p.sold} terjual</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
