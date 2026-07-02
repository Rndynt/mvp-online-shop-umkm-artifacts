import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAdminListOrders } from '@workspace/api-client-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ShoppingCart, ChevronRight, ChevronDown } from 'lucide-react';

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
  processing: 'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200 hover:bg-teal-50',
  shipped: 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200 hover:bg-purple-50',
  completed: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200 hover:bg-green-50',
  cancelled: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-50',
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export default function OrdersPage() {
  const [, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading } = useAdminListOrders(
    statusFilter !== 'all' ? { status: statusFilter } : undefined,
  );

  const orders = data?.data ?? [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Order</h1>
          <p className="text-slate-500 text-sm mt-0.5">Pantau dan proses pesanan yang masuk</p>
        </div>
        <div className="relative w-full sm:w-56">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow pr-9"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400 text-sm">
          Memuat order...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Belum ada order untuk status ini.</p>
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
                  <span className="font-semibold text-slate-800 text-sm">{o.orderCode}</span>
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
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead>Kode Order</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow
                    key={o.id}
                    className="cursor-pointer border-slate-100 hover:bg-slate-50/80"
                    onClick={() => navigate(`/orders/${o.orderCode}`)}
                  >
                    <TableCell className="font-medium text-slate-800">{o.orderCode}</TableCell>
                    <TableCell className="text-slate-500">{o.customerEmail}</TableCell>
                    <TableCell className="text-slate-700">{formatRupiah(o.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[o.status] ?? ''}>{STATUS_LABELS[o.status] ?? o.status}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">{formatDate(o.createdAt)}</TableCell>
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
