import { useState } from 'react';
import { toast } from 'sonner';
import {
  useAdminListProducts,
  useAdminDeleteProduct,
} from '@workspace/api-client-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Plus, Package, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
    <img src={url} alt={name} className="w-11 h-11 rounded-lg object-cover shrink-0" />
  ) : (
    <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
      <Package className="w-4 h-4 text-slate-300" />
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      className={
        isActive
          ? 'bg-accent text-accent-foreground hover:bg-accent ring-1 ring-inset ring-accent'
          : 'bg-slate-100 text-slate-500 hover:bg-slate-100 ring-1 ring-inset ring-slate-200'
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
    } catch {
      toast.error('Gagal menghapus produk');
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Produk</h1>
          <p className="text-slate-500 text-sm mt-0.5">Tambah, ubah, dan hapus produk toko Anda</p>
        </div>
        <button
          onClick={() => navigate('/products/new')}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400 text-sm">
          Memuat produk...
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <Package className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Belum ada produk. Tambahkan produk pertama Anda.</p>
        </div>
      ) : (
        <>
          {/* Mobile */}
          <div className="sm:hidden space-y-2">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/products/${p.id}`)}
                className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer active:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ProductThumb url={p.images?.[0]?.url} name={p.name} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{p.sku ?? 'Tanpa SKU'}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StatusBadge isActive={p.isActive} />
                      <span className="text-xs text-slate-400">Stok {p.stockQuantity}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/products/${p.id}`); }}>
                          <Pencil className="w-4 h-4 mr-2" />Edit Produk
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={(e) => { e.stopPropagation(); setPendingDeleteId(p.id); }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <span className="font-bold text-slate-800 text-sm">{formatRupiah(p.price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100">
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
                    className="border-slate-100 hover:bg-slate-50/80 cursor-pointer"
                    onClick={() => navigate(`/products/${p.id}`)}
                  >
                    <TableCell className="font-medium text-slate-800">
                      <div className="flex items-center gap-3">
                        <ProductThumb url={p.images?.[0]?.url} name={p.name} />
                        <span className="truncate max-w-[220px]">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500">{p.sku ?? '-'}</TableCell>
                    <TableCell className="text-slate-700">{formatRupiah(p.price)}</TableCell>
                    <TableCell className="text-slate-700">{p.stockQuantity}</TableCell>
                    <TableCell><StatusBadge isActive={p.isActive} /></TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => navigate(`/products/${p.id}`)}>
                            <Pencil className="w-4 h-4 mr-2" />Edit Produk
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => setPendingDeleteId(p.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
