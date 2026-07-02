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
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kelola Produk</h1>
          <p className="text-slate-500 text-sm mt-1">Tambah, ubah, dan hapus produk toko Anda</p>
        </div>
        <Button onClick={() => navigate('/products/new')} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Produk
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Memuat produk...</div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Belum ada produk. Tambahkan produk pertama Anda.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
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
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-slate-800">
                    <div className="flex items-center gap-3">
                      {p.images?.[0]?.url ? (
                        <img
                          src={p.images[0].url}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Package className="w-4 h-4 text-slate-300" />
                        </div>
                      )}
                      <span>{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">{p.sku ?? '-'}</TableCell>
                  <TableCell className="text-slate-700">{formatRupiah(p.price)}</TableCell>
                  <TableCell className="text-slate-700">{p.stockQuantity}</TableCell>
                  <TableCell>
                    <Badge variant={p.isActive ? 'default' : 'secondary'} className={p.isActive ? 'bg-teal-100 text-teal-700 hover:bg-teal-100' : ''}>
                      {p.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => navigate(`/products/${p.id}`)}
                      >
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

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
