import { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { toast } from 'sonner';
import { useAdminGetOrder, useAdminUpdateOrderStatus } from '@workspace/api-client-react';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronDown, Loader2 } from 'lucide-react';
import { STATUS_OPTIONS, STATUS_LABELS, STATUS_COLORS, formatRupiah, formatDate } from './orders';

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-4">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
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
    } catch {
      toast.error('Gagal memperbarui status order');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
      </div>
    );
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/orders')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Manajemen Order
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{order.orderCode}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <Badge className={STATUS_COLORS[order.status] ?? ''}>
          {STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </div>

      <Card title="Ubah Status Order">
        <div className="relative w-full sm:w-72">
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={saving}
            className="w-full appearance-none border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow pr-9 disabled:opacity-60"
          >
            {STATUS_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </Card>

      <Card title="Informasi Pelanggan">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Email</dt>
            <dd className="text-slate-700 break-all">{order.customerEmail}</dd>
          </div>
          <div>
            <dt className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Telepon</dt>
            <dd className="text-slate-700">{order.customerPhone ?? '-'}</dd>
          </div>
        </dl>
        {order.address && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-sm">
            <dt className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Alamat Pengiriman</dt>
            <dd className="text-slate-700 leading-relaxed">
              {order.address.firstName} {order.address.lastName}<br />
              {order.address.addressLine1}
              {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ''}<br />
              {order.address.city}, {order.address.province} {order.address.postalCode}<br />
              {order.address.country}
            </dd>
          </div>
        )}
      </Card>

      <Card title="Produk Dipesan">
        <div className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <div className="min-w-0">
                <p className="text-slate-800 font-medium truncate">{item.nameSnapshot}</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {item.skuSnapshot ?? '-'} · {item.quantity}× {formatRupiah(item.unitPrice)}
                </p>
              </div>
              <p className="text-slate-700 font-semibold shrink-0">{formatRupiah(item.lineTotal)}</p>
            </div>
          ))}
        </div>
        <div className="pt-4 mt-2 border-t border-slate-100 space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span><span>{formatRupiah(order.subtotalAmount)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Diskon</span><span>-{formatRupiah(order.discountAmount)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Ongkir</span><span>{formatRupiah(order.shippingAmount)}</span>
          </div>
          <div className="flex justify-between text-slate-800 font-semibold pt-1 border-t border-slate-100">
            <span>Total</span><span>{formatRupiah(order.totalAmount)}</span>
          </div>
        </div>
      </Card>

      {order.payment && (
        <Card title="Pembayaran">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Metode</dt>
              <dd className="text-slate-700">{order.payment.displayName}</dd>
            </div>
            <div>
              <dt className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Status Pembayaran</dt>
              <dd className="text-slate-700">{order.payment.status}</dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}
