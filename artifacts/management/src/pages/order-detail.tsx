import { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { toast } from 'sonner';
import { useAdminGetOrder, useAdminUpdateOrderStatus } from '@workspace/api-client-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { STATUS_OPTIONS, STATUS_LABELS, STATUS_COLORS, formatRupiah, formatDate } from './orders';

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 mb-4 shadow-sm shadow-slate-200/50">
      <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">{title}</h2>
      {children}
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams<{ orderCode: string }>();
  const [, navigate] = useLocation();
  const orderCode = params.orderCode!;

  const { data, isLoading, refetch } = useAdminGetOrder(orderCode);
  const updateStatus = useAdminUpdateOrderStatus();
  const [saving, setSaving] = useState(false);

  const order = data?.data;

  async function handleStatusChange(status: string) {
    setSaving(true);
    try {
      await updateStatus.mutateAsync({ orderCode, data: { status: status as any } });
      toast.success('Status order berhasil diperbarui');
      refetch();
    } catch (err) {
      toast.error('Gagal memperbarui status order');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400 text-sm">Memuat order...</div>;
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 text-sm">Order tidak ditemukan.</p>
        <button onClick={() => navigate('/orders')} className="text-teal-600 text-sm mt-2 hover:underline">
          Kembali ke Manajemen Order
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Manajemen Order
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {order.orderCode}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <Badge className={STATUS_COLORS[order.status] ?? ''}>
          {STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </div>

      <Card title="Ubah Status Order">
        <Select value={order.status} onValueChange={handleStatusChange} disabled={saving}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <Card title="Informasi Pelanggan">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-400">Email</dt>
            <dd className="text-slate-700 dark:text-slate-300 break-all">{order.customerEmail}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Telepon</dt>
            <dd className="text-slate-700 dark:text-slate-300">{order.customerPhone ?? '-'}</dd>
          </div>
        </dl>
        {order.address && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 text-sm">
            <dt className="text-slate-400 mb-1">Alamat Pengiriman</dt>
            <dd className="text-slate-700 dark:text-slate-300">
              {order.address.firstName} {order.address.lastName}
              <br />
              {order.address.addressLine1}
              {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ''}
              <br />
              {order.address.city}, {order.address.province} {order.address.postalCode}
              <br />
              {order.address.country}
            </dd>
          </div>
        )}
      </Card>

      <Card title="Produk Dipesan">
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="text-slate-800 dark:text-white font-medium truncate">{item.nameSnapshot}</p>
                <p className="text-slate-400 text-xs">
                  {item.skuSnapshot ?? '-'} &middot; {item.quantity}x {formatRupiah(item.unitPrice)}
                </p>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium shrink-0">{formatRupiah(item.lineTotal)}</p>
            </div>
          ))}
        </div>
        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-white/5 space-y-1 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{formatRupiah(order.subtotalAmount)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Diskon</span>
            <span>-{formatRupiah(order.discountAmount)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Ongkir</span>
            <span>{formatRupiah(order.shippingAmount)}</span>
          </div>
          <div className="flex justify-between text-slate-800 dark:text-white font-semibold pt-1">
            <span>Total</span>
            <span>{formatRupiah(order.totalAmount)}</span>
          </div>
        </div>
      </Card>

      {order.payment && (
        <Card title="Pembayaran">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-400">Metode</dt>
              <dd className="text-slate-700 dark:text-slate-300">{order.payment.displayName}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Status Pembayaran</dt>
              <dd className="text-slate-700 dark:text-slate-300">{order.payment.status}</dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}
