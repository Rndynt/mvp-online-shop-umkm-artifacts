import { Store, Package, ShoppingCart, BarChart3, Settings, ArrowRight, Clock } from 'lucide-react';

const features = [
  { icon: Package, label: 'Kelola Produk', desc: 'CRUD produk, gambar, stok, harga' },
  { icon: ShoppingCart, label: 'Manajemen Order', desc: 'Pantau dan proses pesanan masuk' },
  { icon: BarChart3, label: 'Analitik', desc: 'Laporan penjualan dan performa toko' },
  { icon: Settings, label: 'Pengaturan Toko', desc: 'Konfigurasi toko, pembayaran, pengiriman' },
];

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
          <Store className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-slate-800">Tokko</span>
        <span className="text-slate-300 text-sm">/ Management</span>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-2xl mx-auto w-full">
        <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-teal-100">
          <Clock className="w-8 h-8 text-teal-600" />
        </div>

        <span className="inline-block bg-teal-50 text-teal-700 text-xs font-medium px-3 py-1 rounded-full ring-1 ring-teal-200 mb-4">
          Segera Hadir
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
          Management App Sedang Disiapkan
        </h1>
        <p className="text-slate-500 text-base leading-relaxed mb-10 max-w-md">
          Dashboard pengelolaan toko RukoLite sedang dalam pengembangan.
          Struktur dan arsitektur sudah siap — fitur akan diimplementasikan bertahap.
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-10">
          {features.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-start gap-3 bg-white rounded-xl border border-slate-200 p-4 text-left"
            >
              <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-slate-100">
                <Icon className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <a
          href="/"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Lihat Storefront
          <ArrowRight className="w-4 h-4" />
        </a>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-400">
        RukoLite Management — MVP Placeholder · Struktur siap untuk dikembangkan
      </footer>
    </div>
  );
}
