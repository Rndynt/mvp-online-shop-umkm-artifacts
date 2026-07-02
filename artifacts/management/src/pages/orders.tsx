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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShoppingCart } from 'lucide-react';

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
  pending_payment: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  payment_review: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  paid: 'bg-teal-100 text-teal-700 hover:bg-teal-100',
  processing: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100',
  shipped: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
  completed: 'bg-green-100 text-green-700 hover:bg-green-100',
  cancelled: 'bg-red-100 text-red-700 hover:bg-red-100',
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export default function OrdersPage() {
  const [, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading } = useAdminListOrders(
    statusFilter !== 'all' ? { status: statusFilter } : undefined,
  );

  const orders = data?.data ?? [];

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Order</h1>
          <p className="text-slate-500 text-sm mt-1">Pantau dan proses pesanan yang masuk</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Memuat order...</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center">
            <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Belum ada order untuk status ini.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
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
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => navigate(`/orders/${o.orderCode}`)}
                >
                  <TableCell className="font-medium text-slate-800">{o.orderCode}</TableCell>
                  <TableCell className="text-slate-500">{o.customerEmail}</TableCell>
                  <TableCell className="text-slate-700">{formatRupiah(o.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[o.status] ?? ''}>
                      {STATUS_LABELS[o.status] ?? o.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">{formatDate(o.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export { STATUS_OPTIONS, STATUS_LABELS, STATUS_COLORS, formatRupiah, formatDate };
