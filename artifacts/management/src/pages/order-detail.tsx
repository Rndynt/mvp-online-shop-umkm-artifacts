import { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { toast } from 'sonner';
import { useAdminGetOrder, useAdminUpdateOrderStatus } from '@workspace/api-client-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { STATUS_OPTIONS, STATUS_LABELS, STATUS_COLORS, formatRupiah, formatDate } from './orders';

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
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Manajemen Order
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{order.orderCode}</h1>
          <p className="text-slate-500 text-sm mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <Badge className={STATUS_COLORS[order.status] ?? ''}>
          {STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Ubah Status Order</h2>
        <Select value={order.status} onValueChange={handleStatusChange} disabled={saving}>
          <SelectTrigger className="w-64">
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
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Informasi Pelanggan</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-400">Email</dt>
            <dd className="text-slate-700">{order.customerEmail}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Telepon</dt>
            <dd className="text-slate-700">{order.customerPhone ?? '-'}</dd>
          </div>
        </dl>
        {order.address && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-sm">
            <dt className="text-slate-400 mb-1">Alamat Pengiriman</dt>
            <dd className="text-slate-700">
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
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Produk Dipesan</h2>
        <div className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="text-slate-800 font-medium">{item.nameSnapshot}</p>
                <p className="text-slate-400 text-xs">
                  {item.skuSnapshot ?? '-'} &middot; {item.quantity}x {formatRupiah(item.unitPrice)}
                </p>
              </div>
              <p className="text-slate-700 font-medium">{formatRupiah(item.lineTotal)}</p>
            </div>
          ))}
        </div>
        <div className="pt-4 mt-2 border-t border-slate-100 space-y-1 text-sm">
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
          <div className="flex justify-between text-slate-800 font-semibold pt-1">
            <span>Total</span>
            <span>{formatRupiah(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {order.payment && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Pembayaran</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-400">Metode</dt>
              <dd className="text-slate-700">{order.payment.displayName}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Status Pembayaran</dt>
              <dd className="text-slate-700">{order.payment.status}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
