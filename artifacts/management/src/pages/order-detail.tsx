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
import {
  ArrowLeft,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  CreditCard,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  RefreshCw,
  ShoppingBag,
  Copy,
  Check,
} from 'lucide-react';
import { STATUS_OPTIONS, STATUS_LABELS, STATUS_COLORS, formatRupiah, formatDate } from './orders';

// Map each status to a Lucide icon
const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending_payment: <Clock className="w-3.5 h-3.5" />,
  payment_review: <RefreshCw className="w-3.5 h-3.5" />,
  paid: <CheckCircle2 className="w-3.5 h-3.5" />,
  processing: <Package className="w-3.5 h-3.5" />,
  shipped: <Truck className="w-3.5 h-3.5" />,
  completed: <CheckCircle2 className="w-3.5 h-3.5" />,
  cancelled: <XCircle className="w-3.5 h-3.5" />,
};

// Ordered position of every status in the fulfilment flow.
// payment_review sits between pending_payment and paid (value 2, while paid = 3).
const STATUS_STEP: Record<string, number> = {
  pending_payment: 1,
  payment_review: 2,
  paid: 3,
  processing: 4,
  shipped: 5,
  completed: 6,
  cancelled: 0,
};

// The 5 milestones shown in the visual progress bar.
// payment_review is intentionally omitted; it is handled by highlighting
// pending_payment when order.status === 'payment_review'.
const PROGRESS_STEPS = [
  { key: 'pending_payment', label: 'Menunggu Bayar' },
  { key: 'paid', label: 'Dibayar' },
  { key: 'processing', label: 'Diproses' },
  { key: 'shipped', label: 'Dikirim' },
  { key: 'completed', label: 'Selesai' },
];

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

function SectionCard({
  icon,
  title,
  children,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2.5">
          <span className="text-primary">{icon}</span>
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function CopyOrderCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard not available — ignore silently
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
      title="Salin kode order"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-sm text-slate-400">Memuat detail order…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <ShoppingBag className="w-10 h-10 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Order tidak ditemukan.</p>
        <button
          onClick={() => navigate('/orders')}
          className="text-primary text-sm mt-2 hover:underline"
        >
          Kembali ke Manajemen Order
        </button>
      </div>
    );
  }

  const statusStep = STATUS_STEP[order.status] ?? 0;
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => navigate('/orders')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Manajemen Order
      </button>

      {/* Page header — neutral card, independent of the store's theme color */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1">Kode Order</p>
            <div className="flex items-center gap-1">
              <h1 className="text-xl font-bold tracking-wide font-mono text-slate-900">{order.orderCode}</h1>
              <CopyOrderCode code={order.orderCode} />
            </div>
            <p className="text-slate-400 text-xs mt-1">{formatDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <Badge className={`${STATUS_COLORS[order.status] ?? ''} flex items-center gap-1.5`}>
              {STATUS_ICONS[order.status]}
              {STATUS_LABELS[order.status] ?? order.status}
            </Badge>
            <p className="text-2xl font-bold text-slate-900">{formatRupiah(order.totalAmount)}</p>
            <p className="text-slate-400 text-xs">{order.items.length} produk · {order.currency}</p>
          </div>
        </div>

        {/* Order progress bar — hidden when cancelled */}
        {!isCancelled && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-0">
              {PROGRESS_STEPS.map((step, idx) => {
                const isLast = idx === PROGRESS_STEPS.length - 1;
                // A step is "active" when the order's status matches it directly,
                // OR when the order is in payment_review (which sits between
                // pending_payment and paid) — in that case highlight pending_payment.
                const stepActive =
                  order.status === step.key ||
                  (order.status === 'payment_review' && step.key === 'pending_payment');
                // A step is "done" when it sits strictly before the current status in
                // the full ordered sequence and is not the currently active milestone.
                const stepDone =
                  !stepActive && STATUS_STEP[step.key] < statusStep;
                return (
                  <div key={step.key} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          stepDone || stepActive
                            ? 'bg-primary border-primary'
                            : 'bg-slate-100 border-slate-200'
                        }`}
                      >
                        {(stepDone || stepActive) ? (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        )}
                      </div>
                      <span
                        className={`text-[9px] mt-1 text-center leading-tight max-w-[48px] hidden sm:block ${
                          stepActive
                            ? 'text-slate-900 font-semibold'
                            : stepDone
                            ? 'text-slate-500'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {!isLast && (
                      <div
                        className={`h-0.5 flex-1 mx-1 rounded-full ${
                          stepDone ? 'bg-primary' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {isCancelled && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600 font-medium">Order ini telah dibatalkan</span>
          </div>
        )}
      </div>

      {/* Main grid: 2/3 + 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column — 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer */}
          <SectionCard icon={<User className="w-4 h-4" />} title="Informasi Pelanggan">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                {getInitials(order.customerEmail)}
              </div>
              <div className="flex-1 min-w-0 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-700 break-all">{order.customerEmail}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-700">{order.customerPhone}</span>
                  </div>
                )}
                {order.address && (
                  <div className="flex items-start gap-2 pt-2 border-t border-slate-100 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-700 leading-relaxed">
                      <p className="font-medium">{order.address.firstName} {order.address.lastName}</p>
                      <p className="text-slate-500">{order.address.addressLine1}{order.address.addressLine2 ? `, ${order.address.addressLine2}` : ''}</p>
                      <p className="text-slate-500">{order.address.city}, {order.address.province} {order.address.postalCode}</p>
                      <p className="text-slate-500">{order.address.country}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          {/* Products */}
          <SectionCard icon={<Package className="w-4 h-4" />} title="Produk Dipesan">
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  {/* Placeholder thumbnail */}
                  <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4 text-slate-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{item.nameSnapshot}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.skuSnapshot ?? '-'} · {item.quantity}× {formatRupiah(item.unitPrice)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 shrink-0">
                    {formatRupiah(item.lineTotal)}
                  </p>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span><span>{formatRupiah(order.subtotalAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Diskon</span><span>-{formatRupiah(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-500">
                <span>Ongkir</span><span>{formatRupiah(order.shippingAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 mt-1 border-t border-slate-200 bg-slate-50 -mx-5 px-5 py-2.5 rounded-b-lg">
                <span>Total</span><span>{formatRupiah(order.totalAmount)}</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right column — 1/3 */}
        <div className="space-y-5">
          {/* Status changer */}
          <SectionCard
            icon={<RefreshCw className="w-4 h-4" />}
            title="Ubah Status"
            action={saving ? <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" /> : undefined}
          >
            <Select value={order.status} onValueChange={handleStatusChange} disabled={saving}>
              <SelectTrigger className="w-full h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      {STATUS_ICONS[opt.value]}
                      {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Compact visual trail of status history within the flow */}
            <div className="mt-4 space-y-2.5">
              {STATUS_OPTIONS.filter((o) => o.value !== 'all' && o.value !== 'cancelled').map((opt) => {
                const stepValue = STATUS_STEP[opt.value] ?? 0;
                const isCurrent = order.status === opt.value;
                const isPast = !isCurrent && stepValue < statusStep && !isCancelled;
                return (
                  <div key={opt.value} className="flex items-center gap-2.5">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isCurrent ? 'bg-primary ring-4 ring-primary/15' : isPast ? 'bg-primary/50' : 'bg-slate-200'
                      }`}
                    />
                    <span className={`text-xs ${isCurrent ? 'text-slate-900 font-semibold' : isPast ? 'text-slate-500' : 'text-slate-400'}`}>
                      {opt.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Payment */}
          {order.payment && (
            <SectionCard icon={<CreditCard className="w-4 h-4" />} title="Pembayaran">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Metode</span>
                  <span className="text-sm font-medium text-slate-800">{order.payment.displayName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Status</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    order.payment.status === 'paid'
                      ? 'bg-emerald-50 text-emerald-700'
                      : order.payment.status === 'pending'
                      ? 'bg-amber-50 text-amber-700'
                      : order.payment.status === 'expired'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      order.payment.status === 'paid' ? 'bg-emerald-500'
                        : order.payment.status === 'pending' ? 'bg-amber-500'
                        : order.payment.status === 'expired' ? 'bg-red-500'
                        : 'bg-slate-400'
                    }`} />
                    {order.payment.status === 'paid' ? 'Lunas'
                      : order.payment.status === 'pending' ? 'Menunggu'
                      : order.payment.status === 'expired' ? 'Kedaluwarsa'
                      : order.payment.status}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400 font-medium">Jumlah</span>
                  <span className="text-sm font-bold text-slate-900">{formatRupiah(order.totalAmount)}</span>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
