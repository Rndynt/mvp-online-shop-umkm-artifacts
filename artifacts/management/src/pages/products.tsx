import { useState } from 'react';
import { toast } from 'sonner';
import {
  useAdminListProducts,
  useAdminDeleteProduct,
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { useLocation } from 'wouter';

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function ProductThumb({ url, name }: { url?: string; name: string }) {
  return url ? (
    <img
      src={url}
      alt={name}
      className="w-11 h-11 rounded-xl object-cover border border-slate-100 dark:border-white/10 shrink-0"
    />
  ) : (
    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
      <Package className="w-4 h-4 text-slate-300" />
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      className={
        isActive
          ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-50 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20'
          : 'bg-slate-100 text-slate-500 hover:bg-slate-100 ring-1 ring-inset ring-slate-200 dark:bg-white/5 dark:text-slate-400 dark:ring-white/10'
      }
    >
      {isActive ? 'Aktif' : 'Nonaktif'}
    </Badge>
  );
}

export default function ProductsPage() {
  const [, navigate] = useLocation();
  const { data, isLoading, refetch } = useAdminListProducts();
  const deleteProduct = useAdminDeleteProduct();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const products = data?.data ?? [];

  async function handleDelete() {
    if (!pendingDeleteId) return;
    try {
      await deleteProduct.mutateAsync({ id: pendingDeleteId });
      toast.success('Produk berhasil dihapus');
      setPendingDeleteId(null);
      refetch();
    } catch (err) {
      toast.error('Gagal menghapus produk');
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Kelola Produk
          </h1>
          <p className="text-slate-500 text-sm mt-1">Tambah, ubah, dan hapus produk toko Anda</p>
        </div>
        <Button
          onClick={() => navigate('/products/new')}
          className="bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Produk
        </Button>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/10 p-10 text-center text-slate-400 text-sm">
          Memuat produk...
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/10 p-10 text-center">
          <Package className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Belum ada produk. Tambahkan produk pertama Anda.</p>
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="grid grid-cols-1 sm:hidden gap-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/10 p-4"
              >
                <div className="flex items-start gap-3">
                  <ProductThumb url={p.images?.[0]?.url} name={p.name} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 dark:text-white text-sm truncate">{p.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{p.sku ?? 'Tanpa SKU'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge isActive={p.isActive} />
                      <span className="text-xs text-slate-400">Stok {p.stockQuantity}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                  <span className="font-semibold text-slate-800 dark:text-white text-sm">
                    {formatRupiah(p.price)}
                  </span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => navigate(`/products/${p.id}`)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setPendingDeleteId(p.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm shadow-slate-200/50">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100 dark:border-white/5">
                  <TableHead>Produk</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow
                    key={p.id}
                    className="border-slate-100 dark:border-white/5 hover:bg-slate-50/80 dark:hover:bg-white/[0.03]"
                  >
                    <TableCell className="font-medium text-slate-800 dark:text-white">
                      <div className="flex items-center gap-3">
                        <ProductThumb url={p.images?.[0]?.url} name={p.name} />
                        <span className="truncate max-w-[220px]">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500">{p.sku ?? '-'}</TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">{formatRupiah(p.price)}</TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">{p.stockQuantity}</TableCell>
                    <TableCell>
                      <StatusBadge isActive={p.isActive} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => navigate(`/products/${p.id}`)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                          onClick={() => setPendingDeleteId(p.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus produk ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Produk akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
