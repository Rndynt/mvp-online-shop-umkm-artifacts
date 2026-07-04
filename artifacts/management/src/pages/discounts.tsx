import { useState } from 'react';
import { Tag, Plus, MoreHorizontal, Copy, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const MOCK_CODES = [
  {
    id: '1',
    code: 'HEMAT10',
    type: 'percent',
    value: 10,
    minPurchase: 0,
    usageCount: 23,
    usageLimit: null,
    active: true,
  },
  {
    id: '2',
    code: 'GRATIS50K',
    type: 'fixed',
    value: 50000,
    minPurchase: 200000,
    usageCount: 7,
    usageLimit: 50,
    active: true,
  },
  {
    id: '3',
    code: 'WELCOME15',
    type: 'percent',
    value: 15,
    minPurchase: 100000,
    usageCount: 50,
    usageLimit: 50,
    active: false,
  },
];

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button onClick={copy} className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-primary hover:bg-accent transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function DiscountsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kode Promo</h1>
          <p className="text-slate-500 text-sm mt-0.5">Buat dan kelola kode diskon untuk pelanggan</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Buat Kode
        </button>
      </div>

      {/* Mobile */}
      <div className="sm:hidden space-y-2">
        {MOCK_CODES.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 text-sm tracking-wider">{c.code}</span>
                    <CopyButton text={c.code} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {c.type === 'percent' ? `Diskon ${c.value}%` : `Potongan ${formatRupiah(c.value)}`}
                    {c.minPurchase > 0 && ` · min. ${formatRupiah(c.minPurchase)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className={c.active
                  ? 'bg-accent text-accent-foreground ring-1 ring-inset ring-accent hover:bg-accent'
                  : 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200 hover:bg-slate-100'
                }>
                  {c.active ? 'Aktif' : 'Nonaktif'}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>{c.active ? 'Nonaktifkan' : 'Aktifkan'}</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">Hapus</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span>Dipakai: <span className="font-medium text-slate-700">{c.usageCount}×</span></span>
              {c.usageLimit && <span>Limit: <span className="font-medium text-slate-700">{c.usageLimit}</span></span>}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Kode</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Diskon</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Min. Pembelian</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Pemakaian</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_CODES.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 tracking-wider">{c.code}</span>
                    <CopyButton text={c.code} />
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-700">
                  {c.type === 'percent' ? `${c.value}%` : formatRupiah(c.value)}
                </td>
                <td className="px-5 py-4 text-slate-500">
                  {c.minPurchase > 0 ? formatRupiah(c.minPurchase) : '-'}
                </td>
                <td className="px-5 py-4 text-slate-500">
                  {c.usageCount}{c.usageLimit ? `/${c.usageLimit}` : ''}
                </td>
                <td className="px-5 py-4">
                  <Badge className={c.active
                    ? 'bg-accent text-accent-foreground ring-1 ring-inset ring-accent hover:bg-accent'
                    : 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200 hover:bg-slate-100'
                  }>
                    {c.active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>{c.active ? 'Nonaktifkan' : 'Aktifkan'}</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">Hapus</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
