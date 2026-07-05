import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useAdminListOrders } from '@workspace/api-client-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ShoppingCart,
  ChevronRight,
  Search,
  Wallet,
  Clock3,
  BadgeCheck,
  Inbox,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'pending_payment', label: 'Menunggu Pembayaran' },
  { value: 'payment_review', label: 'Verifikasi Pembayaran' },
  { value: 'paid', label: 'Dibayar' },
  { value: 'processing', label: 'Diproses' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map((o) => [o.value, o.label]),
);

const STATUS_COLORS: Record<string, string> = {
  pending_payment: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 hover:bg-amber-50',
  payment_review: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 hover:bg-blue-50',
  paid: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 hover:bg-emerald-50',
  processing: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50',
  shipped: 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200 hover:bg-purple-50',
  completed: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200 hover:bg-green-50',
  cancelled: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-50',
};

// Dot colors used in the compact status pill on the table row.
const STATUS_DOT: Record<string, string> = {
  pending_payment: 'bg-amber-500',
  payment_review: 'bg-blue-500',
  paid: 'bg-emerald-500',
  processing: 'bg-indigo-500',
  shipped: 'bg-purple-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export default function OrdersPage() {
  const [, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Fetch the full list once so we can derive summary stats regardless of
  // the active filter, then filter/search client-side for the table itself.
  const { data, isLoading } = useAdminListOrders();
  const allOrders = data?.data ?? [];

  const stats = useMemo(() => {
    const pending = allOrders.filter((o) => o.status === 'pending_payment').length;
    const review = allOrders.filter((o) => o.status === 'payment_review').length;
    const revenue = allOrders
      .filter((o) => !['cancelled', 'pending_payment'].includes(o.status))
      .reduce((sum, o) => sum + o.totalAmount, 0);
    return { total: allOrders.length, pending, review, revenue };
  }, [allOrders]);

  const orders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allOrders.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchesSearch =
        q === '' ||
        o.orderCode.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [allOrders, statusFilter, search]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Manajemen Order</h1>
        <p className="text-slate-500 text-sm mt-0.5">Pantau dan proses pesanan yang masuk</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <Inbox className="w-4 h-4 text-slate-500" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-slate-900 leading-tight">{stats.total}</p>
            <p className="text-xs text-slate-400 truncate">Total Order</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <Clock3 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-slate-900 leading-tight">{stats.pending}</p>
            <p className="text-xs text-slate-400 truncate">Menunggu Bayar</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <BadgeCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-slate-900 leading-tight">{stats.review}</p>
            <p className="text-xs text-slate-400 truncate">Perlu Verifikasi</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-slate-900 leading-tight truncate">{formatRupiah(stats.revenue)}</p>
            <p className="text-xs text-slate-400 truncate">Total Pendapatan</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode order atau email pelanggan..."
            className="pl-9 h-10 bg-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-56 h-10 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400 text-sm">
          Memuat order...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">
            {search || statusFilter !== 'all' ? 'Tidak ada order yang cocok dengan pencarian.' : 'Belum ada order untuk toko ini.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile */}
          <div className="sm:hidden space-y-2">
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => navigate(`/orders/${o.orderCode}`)}
                className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 active:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-sm font-mono">{o.orderCode}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{o.customerEmail}</p>
                <div className="flex items-center justify-between mt-3">
                  <Badge className={STATUS_COLORS[o.status] ?? ''}>{STATUS_LABELS[o.status] ?? o.status}</Badge>
                  <span className="font-bold text-slate-800 text-sm">{formatRupiah(o.totalAmount)}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">{formatDate(o.createdAt)}</p>
              </button>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60">
              <p className="text-xs font-medium text-slate-500">
                Menampilkan <span className="font-semibold text-slate-700">{orders.length}</span> dari {allOrders.length} order
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="pl-5 text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Order</TableHead>
                  <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Pelanggan</TableHead>
                  <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Status</TableHead>
                  <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Tanggal</TableHead>
                  <TableHead className="text-right text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Total</TableHead>
                  <TableHead className="pr-5 w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow
                    key={o.id}
                    className="cursor-pointer border-slate-100 hover:bg-slate-50/80 group"
                    onClick={() => navigate(`/orders/${o.orderCode}`)}
                  >
                    <TableCell className="pl-5 py-3.5">
                      <span className="font-mono font-semibold text-slate-800 text-sm">{o.orderCode}</span>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0">
                          {getInitials(o.customerEmail)}
                        </div>
                        <span className="text-slate-600 text-sm truncate max-w-[220px]">{o.customerEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[o.status] ?? 'bg-slate-400'}`} />
                        <Badge className={STATUS_COLORS[o.status] ?? ''}>{STATUS_LABELS[o.status] ?? o.status}</Badge>
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm py-3.5 whitespace-nowrap">{formatDate(o.createdAt)}</TableCell>
                    <TableCell className="text-right font-semibold text-slate-800 py-3.5 whitespace-nowrap">{formatRupiah(o.totalAmount)}</TableCell>
                    <TableCell className="pr-5 py-3.5">
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

export { STATUS_OPTIONS, STATUS_LABELS, STATUS_COLORS, formatRupiah, formatDate };
