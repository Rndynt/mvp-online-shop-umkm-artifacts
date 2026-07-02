import { Truck, Plus, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MOCK_METHODS = [
  {
    id: '1',
    name: 'JNE REG',
    description: 'Pengiriman reguler ke seluruh Indonesia',
    price: 15000,
    estimatedDays: '2–4 hari',
    active: true,
  },
  {
    id: '2',
    name: 'JNE YES',
    description: 'Yakin Esok Sampai — pengiriman ekspres',
    price: 25000,
    estimatedDays: '1 hari',
    active: true,
  },
  {
    id: '3',
    name: 'SiCepat BEST',
    description: 'Pengiriman hemat antar kota',
    price: 10000,
    estimatedDays: '3–5 hari',
    active: true,
  },
  {
    id: '4',
    name: 'Ambil di Tempat',
    description: 'Pengambilan langsung di toko',
    price: 0,
    estimatedDays: 'Sesuai kesepakatan',
    active: false,
  },
];

function formatRupiah(n: number) {
  if (n === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

export default function ShippingSettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Metode Pengiriman</h1>
          <p className="text-slate-500 text-sm mt-0.5">Atur opsi pengiriman yang tersedia di checkout</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Tambah Metode
        </button>
      </div>

      <div className="space-y-2">
        {MOCK_METHODS.map((m) => (
          <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <Truck className="w-4.5 h-4.5 text-slate-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-slate-800 text-sm">{m.name}</p>
                <Badge className={m.active
                  ? 'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200 hover:bg-teal-50'
                  : 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200 hover:bg-slate-100'
                }>
                  {m.active ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{m.description}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs">
                <span className="font-semibold text-slate-700">{formatRupiah(m.price)}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{m.estimatedDays}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>{m.active ? 'Nonaktifkan' : 'Aktifkan'}</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">Hapus</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-teal-50 border border-teal-200 rounded-xl p-4 text-sm text-teal-700">
        <p className="font-medium mb-0.5">Gratis Ongkir Otomatis</p>
        <p className="text-xs text-teal-600">Pelanggan mendapat gratis ongkir otomatis untuk pembelian di atas Rp 200.000. Diatur di storefront banner.</p>
      </div>
    </div>
  );
}
