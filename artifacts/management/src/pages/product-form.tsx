import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useParams } from 'wouter';
import { toast } from 'sonner';
import {
  useAdminGetProduct,
  useAdminCreateProduct,
  useAdminUpdateProduct,
} from '@workspace/api-client-react';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const inputCls =
  'w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow bg-white';

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
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
    if (!name.trim() || !slug.trim()) { toast.error('Nama dan slug wajib diisi'); return; }
    if (Number.isNaN(priceNum) || priceNum < 0) { toast.error('Harga tidak valid'); return; }
    if (Number.isNaN(stockNum) || stockNum < 0) { toast.error('Stok tidak valid'); return; }

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
      toast.error(`Gagal: ${err instanceof Error ? err.message : 'Terjadi kesalahan'}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (isEdit && isLoadingExisting) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? 'Edit Produk' : 'Produk Baru'}
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {isEdit ? 'Ubah detail produk di bawah ini' : 'Isi detail produk yang ingin ditambahkan'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card title="Info Produk">
          <Field label="Nama Produk">
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="cth. Tas Kanvas Handy"
              className={inputCls}
              required
            />
          </Field>
          <Field label="Slug (URL)" hint="otomatis dari nama">
            <input
              value={slug}
              onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }}
              placeholder="tas-kanvas-handy"
              className={inputCls}
              required
            />
          </Field>
          <Field label="Deskripsi Singkat">
            <input
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Satu kalimat singkat tentang produk"
              className={inputCls}
            />
          </Field>
          <Field label="Deskripsi Lengkap">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan bahan, ukuran, keunggulan produk..."
              className={cn(inputCls, 'resize-none')}
            />
          </Field>
        </Card>

        <Card title="Harga">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Harga Jual">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium pointer-events-none">Rp</span>
                <input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className={cn(inputCls, 'pl-9')}
                  required
                />
              </div>
            </Field>
            <Field label="Harga Coret" hint="opsional">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium pointer-events-none">Rp</span>
                <input
                  type="number"
                  min={0}
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="0"
                  className={cn(inputCls, 'pl-9')}
                />
              </div>
            </Field>
          </div>
        </Card>

        <Card title="Inventori">
          <div className="grid grid-cols-2 gap-3">
            <Field label="SKU">
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="cth. TKH-001"
                className={inputCls}
              />
            </Field>
            <Field label="Stok">
              <input
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className={inputCls}
                required
              />
            </Field>
          </div>
        </Card>

        <Card title="Gambar Produk">
          <Field label="URL Gambar">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          </Field>
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-44 object-cover rounded-lg border border-slate-200 mt-1"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
        </Card>

        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-700">Tampilkan di toko</p>
            <p className="text-xs text-slate-500 mt-0.5">Produk nonaktif tidak muncul di storefront</p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        <div className="flex gap-3 pb-8">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center border border-slate-300 text-slate-600 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
