import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useParams } from 'wouter';
import { toast } from 'sonner';
import {
  useAdminGetProduct,
  useAdminCreateProduct,
  useAdminUpdateProduct,
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function ProductFormPage() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const isEdit = !!params.id && params.id !== 'new';

  const { data: existingData, isLoading: isLoadingExisting } = useAdminGetProduct(
    params.id ?? '',
    { query: { enabled: isEdit, queryKey: ['admin-product', params.id ?? ''] } },
  );
  const createProduct = useAdminCreateProduct();
  const updateProduct = useAdminUpdateProduct();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [sku, setSku] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const product = existingData?.data;
    if (product) {
      setName(product.name);
      setSlug(product.slug);
      setShortDescription(product.shortDescription ?? '');
      setDescription(product.description ?? '');
      setPrice(String(product.price));
      setCompareAtPrice(product.compareAtPrice != null ? String(product.compareAtPrice) : '');
      setSku(product.sku ?? '');
      setStockQuantity(String(product.stockQuantity));
      setIsActive(product.isActive);
      setImageUrl(product.images?.[0]?.url ?? '');
    }
  }, [existingData]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const priceNum = Number(price);
    const stockNum = Number(stockQuantity);
    if (!name.trim() || !slug.trim()) {
      toast.error('Nama dan slug produk wajib diisi');
      return;
    }
    if (Number.isNaN(priceNum) || priceNum < 0) {
      toast.error('Harga tidak valid');
      return;
    }
    if (Number.isNaN(stockNum) || stockNum < 0) {
      toast.error('Stok tidak valid');
      return;
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      shortDescription: shortDescription.trim() || null,
      description: description.trim() || null,
      price: priceNum,
      compareAtPrice: compareAtPrice.trim() ? Number(compareAtPrice) : null,
      sku: sku.trim() || null,
      stockQuantity: stockNum,
      isActive,
      imageUrl: imageUrl.trim() || null,
    };

    setSubmitting(true);
    try {
      if (isEdit && params.id) {
        await updateProduct.mutateAsync({ id: params.id, data: payload });
        toast.success('Produk berhasil diperbarui');
      } else {
        await createProduct.mutateAsync({ data: payload });
        toast.success('Produk berhasil ditambahkan');
      }
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast.error(`Gagal menyimpan produk: ${message}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (isEdit && isLoadingExisting) {
    return <div className="p-8 text-center text-slate-400 text-sm">Memuat produk...</div>;
  }

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Kelola Produk
      </button>

      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">
        {isEdit ? 'Ubah Produk' : 'Tambah Produk'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Produk</Label>
          <Input id="name" value={name} onChange={(e) => handleNameChange(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortDescription">Deskripsi Singkat</Label>
          <Input
            id="shortDescription"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi Lengkap</Label>
          <Textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Harga (Rp)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="compareAtPrice">Harga Coret (Opsional)</Label>
            <Input
              id="compareAtPrice"
              type="number"
              min={0}
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stockQuantity">Stok</Label>
            <Input
              id="stockQuantity"
              type="number"
              min={0}
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">URL Gambar</Label>
          <Input
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-800">Status Aktif</p>
            <p className="text-xs text-slate-400">Produk nonaktif tidak akan tampil di toko</p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-700">
            {submitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
