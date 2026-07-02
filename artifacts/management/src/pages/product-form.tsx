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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Package, Tag, Boxes, Image, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Package;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-teal-600" />
        </div>
        <span className="text-sm font-semibold text-slate-700">{title}</span>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

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
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputClass =
  'h-11 rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:border-teal-500 transition-colors';

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
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {isEdit ? 'Edit Produk' : 'Produk Baru'}
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {isEdit ? 'Ubah detail produk di bawah ini' : 'Isi detail produk yang ingin ditambahkan'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info dasar */}
        <Section icon={Package} title="Info Produk">
          <Field label="Nama Produk">
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="cth. Tas Kanvas Handy"
              className={inputClass}
              required
            />
          </Field>
          <Field label="Slug" hint="otomatis dari nama">
            <Input
              value={slug}
              onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }}
              placeholder="tas-kanvas-handy"
              className={inputClass}
              required
            />
          </Field>
          <Field label="Deskripsi Singkat">
            <Input
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Satu kalimat singkat tentang produk"
              className={inputClass}
            />
          </Field>
          <Field label="Deskripsi Lengkap">
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan detail produk, bahan, ukuran, dll."
              className={cn(inputClass, 'h-auto resize-none')}
            />
          </Field>
        </Section>

        {/* Harga */}
        <Section icon={Tag} title="Harga">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Harga Jual">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  Rp
                </span>
                <Input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className={cn(inputClass, 'pl-9')}
                  required
                />
              </div>
            </Field>
            <Field label="Harga Coret" hint="opsional">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  Rp
                </span>
                <Input
                  type="number"
                  min={0}
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="0"
                  className={cn(inputClass, 'pl-9')}
                />
              </div>
            </Field>
          </div>
        </Section>

        {/* Inventori */}
        <Section icon={Boxes} title="Inventori">
          <div className="grid grid-cols-2 gap-3">
            <Field label="SKU">
              <Input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="cth. TKH-001"
                className={inputClass}
              />
            </Field>
            <Field label="Stok">
              <Input
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="0"
                className={inputClass}
                required
              />
            </Field>
          </div>
        </Section>

        {/* Gambar */}
        <Section icon={Image} title="Gambar">
          <Field label="URL Gambar">
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </Field>
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-40 object-cover rounded-xl border border-slate-200"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
        </Section>

        {/* Status */}
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">Tampilkan di toko</p>
            <p className="text-xs text-slate-400 mt-0.5">Produk nonaktif tidak akan muncul di storefront</p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1 pb-6">
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1 h-12 bg-teal-700 hover:bg-teal-800 text-sm font-semibold rounded-xl shadow-sm shadow-teal-900/20"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan...</>
            ) : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
            className="h-12 px-5 rounded-xl border-slate-200 text-slate-500"
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
