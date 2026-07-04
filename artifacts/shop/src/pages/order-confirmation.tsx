import { useState } from 'react';
import { useParams } from 'wouter';
import { useForm } from 'react-hook-form';
import { useGetOrderByCode, useSubmitPaymentConfirmation } from '@workspace/api-client-react';
import { Layout } from '@/components/layout';
import { formatIDR } from '@/lib/format';
import {
  CheckCircle2, Clock, Package, Truck, MapPin, CreditCard,
  QrCode, Copy, Loader2, Send, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Link } from 'wouter';
import type {
  GetOrderByCode200,
  OrderResponse,
  PaymentInstruction,
  OrderAddress,
} from '@workspace/api-client-react';

const STATUS_INFO: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_payment: { label: 'Menunggu Pembayaran', color: 'text-amber-600 bg-amber-50 ring-amber-200', icon: <Clock className="w-4 h-4" /> },
  payment_review: { label: 'Sedang Diverifikasi', color: 'text-blue-600 bg-blue-50 ring-blue-200', icon: <CreditCard className="w-4 h-4" /> },
  paid: { label: 'Pembayaran Diterima', color: 'text-green-600 bg-green-50 ring-green-200', icon: <CheckCircle2 className="w-4 h-4" /> },
  processing: { label: 'Sedang Diproses', color: 'text-blue-600 bg-blue-50 ring-blue-200', icon: <Package className="w-4 h-4" /> },
  shipped: { label: 'Dalam Pengiriman', color: 'text-purple-600 bg-purple-50 ring-purple-200', icon: <Truck className="w-4 h-4" /> },
  completed: { label: 'Selesai', color: 'text-teal-600 bg-teal-50 ring-teal-200', icon: <CheckCircle2 className="w-4 h-4" /> },
  cancelled: { label: 'Dibatalkan', color: 'text-red-600 bg-red-50 ring-red-200', icon: <Clock className="w-4 h-4" /> },
};

interface ConfirmForm {
  payerName: string;
  reference?: string;
  note?: string;
}

function QRISDisplay({ amount, qrPayload }: { amount: number; qrPayload: string }) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(true);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrPayload)}`;

  function copyPayload() {
    navigator.clipboard.writeText(qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="w-5 h-5 text-teal-600" />
        <h3 className="font-semibold text-slate-900">Instruksi Pembayaran QRIS</h3>
      </div>
      <div className="bg-amber-50 rounded-xl p-3 mb-5 text-sm text-amber-700 ring-1 ring-amber-200 flex items-start gap-2">
        <Clock className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Selesaikan pembayaran dalam 24 jam agar pesanan diproses.</span>
      </div>
      <div className="text-center mb-5">
        <p className="text-sm text-slate-500 mb-1">Total yang harus dibayar</p>
        <p className="text-3xl font-bold text-slate-900">{formatIDR(amount)}</p>
      </div>
      <button
        onClick={() => setShowQr((s) => !s)}
        className="w-full flex items-center justify-between text-sm text-slate-600 hover:text-teal-600 mb-3 transition-colors"
      >
        <span>Lihat QR Code</span>
        {showQr ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {showQr && (
        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="bg-white p-3 rounded-xl border-2 border-slate-200">
            <img src={qrUrl} alt="QR QRIS" className="w-52 h-52" />
          </div>
          <p className="text-xs text-slate-400 text-center">
            Scan QR code ini dengan aplikasi mobile banking atau e-wallet Anda
          </p>
        </div>
      )}
      <button
        onClick={copyPayload}
        className="w-full flex items-center justify-center gap-2 border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm py-2.5 rounded-lg transition-colors"
      >
        <Copy className="w-4 h-4" />
        {copied ? 'Berhasil disalin!' : 'Salin kode QR'}
      </button>
    </div>
  );
}

function PaymentConfirmationForm({ orderCode, onSuccess }: { orderCode: string; onSuccess: () => void }) {
  const submitConfirmation = useSubmitPaymentConfirmation();
  const { register, handleSubmit, formState: { errors } } = useForm<ConfirmForm>();
  const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500';

  async function onSubmit(data: ConfirmForm) {
    try {
      await submitConfirmation.mutateAsync({ orderCode, data });
      onSuccess();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Send className="w-5 h-5 text-teal-600" />
        <h3 className="font-semibold text-slate-900">Konfirmasi Pembayaran</h3>
      </div>
      <p className="text-sm text-slate-500">Sudah transfer? Isi form ini agar tim kami segera memverifikasi.</p>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Nama Pengirim <span className="text-red-500">*</span>
        </label>
        <input {...register('payerName', { required: 'Nama pengirim wajib diisi' })} className={inputCls} placeholder="Budi Santoso" />
        {errors.payerName && <p className="text-xs text-red-500 mt-1">{errors.payerName.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Nomor Referensi <span className="text-slate-400 text-xs">(opsional)</span>
        </label>
        <input {...register('reference')} className={inputCls} placeholder="Contoh: TRX2024XXXXXX" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Catatan <span className="text-slate-400 text-xs">(opsional)</span>
        </label>
        <textarea {...register('note')} rows={2} className={inputCls} placeholder="Informasi tambahan jika ada" />
      </div>
      <button
        type="submit"
        disabled={submitConfirmation.isPending}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {submitConfirmation.isPending
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
          : 'Kirim Konfirmasi'
        }
      </button>
    </form>
  );
}

export default function OrderConfirmationPage() {
  const params = useParams<{ orderCode: string }>();
  const [confirmSent, setConfirmSent] = useState(false);
  const { data: resp, isLoading, error, refetch } = useGetOrderByCode(params.orderCode!, {
    query: { refetchInterval: 30_000, queryKey: ['getOrderByCode', params.orderCode] },
  });

  const order = resp?.data;

  if (isLoading) {
    return (
      <Layout mainClassName="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="h-48 bg-slate-200 rounded-2xl" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout mainClassName="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-slate-700 font-medium mb-2">Pesanan tidak ditemukan</p>
          <Link href="/" className="text-teal-600 text-sm underline">Kembali ke toko</Link>
        </div>
      </Layout>
    );
  }

  const statusInfo = STATUS_INFO[order.status] ?? STATUS_INFO.pending_payment;
  const payment = order.payment as PaymentInstruction | null;
  const address = order.address as OrderAddress | null;
  const isPendingPayment = order.status === 'pending_payment';

  return (
      <Layout mainClassName="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-teal-100">
            <CheckCircle2 className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Pesanan Berhasil Dibuat!</h1>
          <p className="text-slate-500 text-sm">
            Kode pesanan: <strong className="text-slate-800 font-mono">{order.orderCode}</strong>
          </p>
          <div className="mt-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ring-1 ${statusInfo.color}`}>
              {statusInfo.icon}
              {statusInfo.label}
            </span>
          </div>
        </div>

        <div className="space-y-5">
          {/* QRIS payment instructions */}
          {isPendingPayment && payment?.instruction && (
            <QRISDisplay
              amount={payment.amount}
              qrPayload={payment.instruction.qrPayload}
            />
          )}

          {/* Payment confirmation form */}
          {isPendingPayment && !confirmSent && (
            <PaymentConfirmationForm
              orderCode={order.orderCode}
              onSuccess={() => { setConfirmSent(true); refetch(); }}
            />
          )}

          {confirmSent && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-5 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-green-800">Konfirmasi terkirim!</p>
              <p className="text-sm text-green-600 mt-1">Tim kami akan memverifikasi pembayaran Anda segera.</p>
            </div>
          )}

          {/* Order items */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-teal-600" /> Item Pesanan
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-slate-700">{item.nameSnapshot} <span className="text-slate-400">×{item.quantity}</span></span>
                  <span className="font-medium text-slate-900">{formatIDR(item.lineTotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 mt-4 pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span><span>{formatIDR(order.subtotalAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Diskon</span><span>-{formatIDR(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Ongkir</span><span>{formatIDR(order.shippingAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-200">
                <span>Total</span>
                <span className="text-teal-700">{formatIDR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Address */}
          {address && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" /> Alamat Pengiriman
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {address.firstName} {address.lastName}<br />
                {address.addressLine1}
                {address.addressLine2 && <>, {address.addressLine2}</>}<br />
                {address.city}, {address.province} {address.postalCode}<br />
                {address.country}
              </p>
            </div>
          )}

          {/* Payment info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-teal-600" /> Info Pembayaran
            </h3>
            <div className="text-sm space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Metode</span><span className="font-medium">{payment?.displayName ?? 'QRIS'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status</span>
                <span className={`font-medium ${
                  payment?.status === 'paid' ? 'text-green-600'
                  : payment?.status === 'reviewing' ? 'text-blue-600'
                  : 'text-amber-600'
                }`}>
                  {payment?.status === 'paid' ? 'Lunas'
                   : payment?.status === 'reviewing' ? 'Sedang diverifikasi'
                   : 'Menunggu pembayaran'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Email</span><span className="font-medium">{order.customerEmail}</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link href="/" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors">
              ← Lanjut Belanja
            </Link>
          </div>
        </div>
      </Layout>
  );
}
