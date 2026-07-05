'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, PackageSearch } from 'lucide-react';

export default function TrackOrderPage() {
  const [code, setCode] = useState('');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    router.push(`/orders/${trimmed}`);
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <PackageSearch className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Lacak Pesanan</h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Masukkan kode pesanan yang kamu terima setelah checkout untuk melihat status pengiriman.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Contoh: ORD-XXXX-XXXX"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono tracking-wider text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <button
          type="submit"
          disabled={!code.trim()}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          Cek Status Pesanan
        </button>
      </form>

      <p className="text-center text-xs text-slate-400 mt-6">
        Kode pesanan dikirim ke WhatsApp atau email kamu setelah checkout berhasil.
      </p>
    </div>
  );
}
