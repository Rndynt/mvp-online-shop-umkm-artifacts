import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useParams } from 'wouter';
import { toast } from 'sonner';
import {
  useAdminGetProduct,
  useAdminCreateProduct,
  useAdminUpdateProduct,
} from '@workspace/api-client-react';
import { Switch } from '@/components/ui/switch';
import { TabsNav } from '@/components/ui/tabs-nav';
import { ArrowLeft, Loader2, Plus, Trash2, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageDropzone } from '@workspace/object-storage-web';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const inputCls =
  'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/60 transition-colors bg-white';

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

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        {action}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary bg-primary/8 hover:bg-primary/12 px-3 py-1.5 rounded-lg transition-colors"
    >
      <Plus className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

// ── Local input types ─────────────────────────────────────────────────────────

interface ProductBundleInput {
  quantity: number;
  price: number;
  label?: string | null;
  badge?: string | null;
  isFeatured?: boolean;
}

interface ProductFeatureInput {
  imageUrl?: string | null;
  title: string;
  description?: string | null;
}

interface ProductFaqInput {
  question: string;
  answer: string;
}

// ── Bundle editor ─────────────────────────────────────────────────────────────

type BundleRow = ProductBundleInput & { _key: number };

function BundleEditor({
  bundles,
  onChange,
}: {
  bundles: BundleRow[];
  onChange: (rows: BundleRow[]) => void;
}) {
  function update(key: number, patch: Partial<BundleRow>) {
    onChange(bundles.map((b) => (b._key === key ? { ...b, ...patch } : b)));
  }
  function remove(key: number) {
    onChange(bundles.filter((b) => b._key !== key));
  }
  function setFeatured(key: number) {
    onChange(bundles.map((b) => ({ ...b, isFeatured: b._key === key })));
  }

  if (bundles.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-lg">
        Tidak ada paket — klik "Tambah Paket" untuk menambahkan bundle harga.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {bundles.map((b) => (
        <div key={b._key} className={cn('rounded-xl border p-4 space-y-3', b.isFeatured ? 'border-primary bg-accent/40' : 'border-slate-200 bg-slate-50/40')}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFeatured(b._key)}
              title="Jadikan paket unggulan"
              className={cn('p-1 rounded-md transition-colors', b.isFeatured ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400')}
            >
              <Star className="w-4 h-4" fill={b.isFeatured ? 'currentColor' : 'none'} />
            </button>
            <span className="text-xs font-medium text-slate-500 flex-1">
              {b.isFeatured ? 'Paket Unggulan' : 'Paket'}
            </span>
            <RemoveButton onClick={() => remove(b._key)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Jumlah (qty)">
              <input
                type="number"
                min={1}
                value={b.quantity}
                onChange={(e) => update(b._key, { quantity: Number(e.target.value) })}
                placeholder="1"
                className={inputCls}
              />
            </Field>
            <Field label="Harga Total">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium pointer-events-none">Rp</span>
                <input
                  type="number"
                  min={0}
                  value={b.price}
                  onChange={(e) => update(b._key, { price: Number(e.target.value) })}
                  placeholder="0"
                  className={cn(inputCls, 'pl-9')}
                />
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Label" hint="opsional">
              <input
                value={b.label ?? ''}
                onChange={(e) => update(b._key, { label: e.target.value || null })}
                placeholder="cth. Beli 2"
                className={inputCls}
              />
            </Field>
            <Field label="Badge" hint="opsional">
              <input
                value={b.badge ?? ''}
                onChange={(e) => update(b._key, { badge: e.target.value || null })}
                placeholder="cth. Hemat 20%"
                className={inputCls}
              />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Feature editor ────────────────────────────────────────────────────────────

type FeatureRow = ProductFeatureInput & { _key: number };

function FeatureEditor({
  features,
  onChange,
}: {
  features: FeatureRow[];
  onChange: (rows: FeatureRow[]) => void;
}) {
  function update(key: number, patch: Partial<FeatureRow>) {
    onChange(features.map((f) => (f._key === key ? { ...f, ...patch } : f)));
  }
  function remove(key: number) {
    onChange(features.filter((f) => f._key !== key));
  }

  if (features.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-lg">
        Tidak ada fitur — tambahkan keunggulan produk dengan gambar dan teks.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {features.map((f) => (
        <div key={f._key} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Fitur #{features.indexOf(f) + 1}</span>
            <RemoveButton onClick={() => remove(f._key)} />
          </div>
          <Field label="Judul Fitur">
            <input
              value={f.title}
              onChange={(e) => update(f._key, { title: e.target.value })}
              placeholder="cth. Bahan Premium"
              className={inputCls}
              required
            />
          </Field>
          <Field label="Deskripsi" hint="opsional">
            <textarea
              rows={2}
              value={f.description ?? ''}
              onChange={(e) => update(f._key, { description: e.target.value || null })}
              placeholder="Jelaskan keunggulan ini..."
              className={cn(inputCls, 'resize-none')}
            />
          </Field>
          <Field label="Gambar" hint="opsional">
            <ImageDropzone
              value={f.imageUrl ?? undefined}
              onUploaded={(url) => update(f._key, { imageUrl: url })}
              onClear={() => update(f._key, { imageUrl: null })}
              heightClassName="h-32"
              label="Seret & lepas gambar keunggulan, atau klik untuk memilih"
            />
          </Field>
        </div>
      ))}
    </div>
  );
}

// ── FAQ editor ────────────────────────────────────────────────────────────────

type FaqRow = ProductFaqInput & { _key: number };

function FaqEditor({
  faqs,
  onChange,
}: {
  faqs: FaqRow[];
  onChange: (rows: FaqRow[]) => void;
}) {
  function update(key: number, patch: Partial<FaqRow>) {
    onChange(faqs.map((f) => (f._key === key ? { ...f, ...patch } : f)));
  }
  function remove(key: number) {
    onChange(faqs.filter((f) => f._key !== key));
  }

  if (faqs.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-lg">
        Tidak ada FAQ — tambahkan pertanyaan yang sering ditanyakan pembeli.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {faqs.map((f) => (
        <div key={f._key} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">FAQ #{faqs.indexOf(f) + 1}</span>
            <RemoveButton onClick={() => remove(f._key)} />
          </div>
          <Field label="Pertanyaan">
            <input
              value={f.question}
              onChange={(e) => update(f._key, { question: e.target.value })}
              placeholder="cth. Berapa lama pengiriman?"
              className={inputCls}
              required
            />
          </Field>
          <Field label="Jawaban">
            <textarea
              rows={2}
              value={f.answer}
              onChange={(e) => update(f._key, { answer: e.target.value })}
              placeholder="Tulis jawaban di sini..."
              className={cn(inputCls, 'resize-none')}
              required
            />
          </Field>
        </div>
      ))}
    </div>
  );
}

// ── Cartesian product helper ──────────────────────────────────────────────────

function cartesian<T>(...arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (acc, arr) => acc.flatMap((combo) => arr.map((val) => [...combo, val])),
    [[]],
  );
}

// ── Variant types ─────────────────────────────────────────────────────────────

interface OptionTypeValueRow { _key: number; value: string }
interface OptionTypeRow { _key: number; name: string; values: OptionTypeValueRow[] }
interface VariantRow { _key: number; optionValues: string[]; price: string; stockQuantity: string; sku: string; isActive: boolean }

function generateVariantMatrix(optionTypes: OptionTypeRow[], existing: VariantRow[]): VariantRow[] {
  const valueArrays = optionTypes.map((ot) => ot.values.map((v) => v.value).filter((v) => v.trim()));
  if (optionTypes.length === 0 || valueArrays.some((arr) => arr.length === 0)) return existing;
  const combos = cartesian(...valueArrays);
  return combos.map((combo) => {
    const found = existing.find(
      (v) => v.optionValues.length === combo.length && v.optionValues.every((val, i) => val === combo[i]),
    );
    return found ?? { _key: nextKey(), optionValues: combo, price: '', stockQuantity: '0', sku: '', isActive: true };
  });
}

// ── OptionTypeEditor ──────────────────────────────────────────────────────────

function OptionTypeEditor({
  optionTypes,
  onChange,
}: {
  optionTypes: OptionTypeRow[];
  onChange: (rows: OptionTypeRow[]) => void;
}) {
  function addType() {
    onChange([...optionTypes, { _key: nextKey(), name: '', values: [] }]);
  }
  function removeType(key: number) {
    onChange(optionTypes.filter((ot) => ot._key !== key));
  }
  function updateTypeName(key: number, name: string) {
    onChange(optionTypes.map((ot) => (ot._key === key ? { ...ot, name } : ot)));
  }
  function addValue(typeKey: number) {
    onChange(optionTypes.map((ot) => ot._key === typeKey ? { ...ot, values: [...ot.values, { _key: nextKey(), value: '' }] } : ot));
  }
  function updateValue(typeKey: number, valKey: number, value: string) {
    onChange(optionTypes.map((ot) => ot._key === typeKey ? { ...ot, values: ot.values.map((v) => v._key === valKey ? { ...v, value } : v) } : ot));
  }
  function removeValue(typeKey: number, valKey: number) {
    onChange(optionTypes.map((ot) => ot._key === typeKey ? { ...ot, values: ot.values.filter((v) => v._key !== valKey) } : ot));
  }

  return (
    <div className="space-y-3">
      {optionTypes.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-3 bg-slate-50 rounded-lg">
          Belum ada tipe opsi. Klik tombol di bawah untuk mulai menambah dimensi seperti "Ukuran" atau "Warna".
        </p>
      )}
      {optionTypes.map((ot) => (
        <div key={ot._key} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/40">
          <div className="flex items-center gap-2">
            <input
              value={ot.name}
              onChange={(e) => updateTypeName(ot._key, e.target.value)}
              placeholder="cth. Ukuran, Warna, Rasa, Berat..."
              className={cn(inputCls, 'flex-1')}
            />
            <RemoveButton onClick={() => removeType(ot._key)} />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {ot.values.map((v) => (
              <div key={v._key} className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
                <input
                  value={v.value}
                  onChange={(e) => updateValue(ot._key, v._key, e.target.value)}
                  placeholder="nilai..."
                  className="text-sm text-slate-800 outline-none w-16 min-w-0"
                />
                <button type="button" onClick={() => removeValue(ot._key, v._key)} className="text-slate-300 hover:text-red-400 transition-colors ml-0.5 flex-shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addValue(ot._key)}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/8 hover:bg-primary/12 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3 h-3" /> Tambah Nilai
            </button>
          </div>
        </div>
      ))}
      <AddButton onClick={addType} label="Tambah Tipe Opsi" />
    </div>
  );
}

// ── VariantMatrix ─────────────────────────────────────────────────────────────

function VariantMatrix({
  optionTypes,
  variantRows,
  onChange,
}: {
  optionTypes: OptionTypeRow[];
  variantRows: VariantRow[];
  onChange: (rows: VariantRow[]) => void;
}) {
  function update(key: number, patch: Partial<VariantRow>) {
    onChange(variantRows.map((v) => (v._key === key ? { ...v, ...patch } : v)));
  }

  if (optionTypes.length === 0) return null;

  if (variantRows.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-lg">
        Tambahkan tipe opsi dan nilai di atas untuk melihat matriks varian.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left px-4 py-2.5 font-medium text-slate-600 text-xs">Varian</th>
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 text-xs">Harga Override</th>
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 text-xs">Stok *</th>
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 text-xs">SKU</th>
            <th className="text-center px-3 py-2.5 font-medium text-slate-600 text-xs">Aktif</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {variantRows.map((v) => (
            <tr key={v._key} className={v.isActive ? '' : 'opacity-50'}>
              <td className="px-4 py-2.5">
                <span className="font-medium text-slate-800 text-sm">{v.optionValues.join(' / ')}</span>
              </td>
              <td className="px-3 py-2">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">Rp</span>
                  <input
                    type="number"
                    min={0}
                    value={v.price}
                    onChange={(e) => update(v._key, { price: e.target.value })}
                    placeholder="default"
                    className="w-28 border border-slate-200 rounded-lg pl-7 pr-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/60 bg-white"
                  />
                </div>
              </td>
              <td className="px-3 py-2">
                <input
                  type="number"
                  min={0}
                  value={v.stockQuantity}
                  onChange={(e) => update(v._key, { stockQuantity: e.target.value })}
                  className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/60 bg-white"
                  required
                />
              </td>
              <td className="px-3 py-2">
                <input
                  value={v.sku}
                  onChange={(e) => update(v._key, { sku: e.target.value })}
                  placeholder="opsional"
                  className="w-28 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/60 bg-white"
                />
              </td>
              <td className="px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={v.isActive}
                  onChange={(e) => update(v._key, { isActive: e.target.checked })}
                  className="w-4 h-4 rounded accent-primary"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-slate-400 px-4 py-2 border-t border-slate-100">
        * Harga Override kosong = pakai harga produk utama. Stok 0 = "Stok Habis" di toko.
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

let _keyCounter = 0;
function nextKey() { return ++_keyCounter; }

type ProductTab = 'dasar' | 'media' | 'bundle' | 'fitur' | 'faq' | 'varian';

const TABS: import('@/components/ui/tabs-nav').TabItem<ProductTab>[] = [
  { id: 'dasar',  label: 'Info & Harga' },
  { id: 'varian', label: 'Varian' },
  { id: 'media',  label: 'Media' },
  { id: 'bundle', label: 'Bundle Harga' },
  { id: 'fitur',  label: 'Fitur Produk' },
  { id: 'faq',    label: 'FAQ' },
];

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

  // Basic fields
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

  // Advanced fields
  const [bundles, setBundles] = useState<BundleRow[]>([]);
  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [faqs, setFaqs] = useState<FaqRow[]>([]);
  const [optionTypes, setOptionTypes] = useState<OptionTypeRow[]>([]);
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<ProductTab>('dasar');

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

      setBundles(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (product.bundles ?? []).map((b: any) => ({
          _key: nextKey(),
          quantity: b.quantity as number,
          price: b.price as number,
          label: (b.label ?? null) as string | null,
          badge: (b.badge ?? null) as string | null,
          isFeatured: b.isFeatured as boolean,
        })),
      );
      setFeatures(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (product.features ?? []).map((f: any) => ({
          _key: nextKey(),
          title: f.title as string,
          description: (f.description ?? null) as string | null,
          imageUrl: (f.imageUrl ?? null) as string | null,
        })),
      );
      setFaqs(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (product.faqs ?? []).map((f: any) => ({
          _key: nextKey(),
          question: f.question as string,
          answer: f.answer as string,
        })),
      );

      // Load variant option types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const loadedOptionTypes: OptionTypeRow[] = (product.optionTypes ?? []).map((ot: any) => ({
        _key: nextKey(),
        name: ot.name as string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        values: (ot.values ?? []).map((v: any) => ({ _key: nextKey(), value: v.value as string })),
      }));
      setOptionTypes(loadedOptionTypes);

      // Reconstruct variant rows from API data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const loadedVariants: VariantRow[] = (product.variants ?? []).map((v: any) => {
        // Map optionValueIds to values in order of optionTypes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const optionValues = (product.optionTypes ?? []).map((ot: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const match = (ot.values ?? []).find((val: any) => (v.optionValueIds ?? []).includes(val.id));
          return match ? (match.value as string) : '';
        });
        return {
          _key: nextKey(),
          optionValues,
          price: v.price != null ? String(v.price) : '',
          stockQuantity: String(v.stockQuantity ?? 0),
          sku: v.sku ?? '',
          isActive: v.isActive ?? true,
        };
      });
      setVariantRows(loadedVariants);
    }
  }, [existingData]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  // Auto-regenerate variant matrix when option types / values change
  useEffect(() => {
    setVariantRows((prev) => generateVariantMatrix(optionTypes, prev));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(optionTypes.map((ot) => ({ name: ot.name, values: ot.values.map((v) => v.value) })))]);

  function addBundle() {
    setBundles((prev) => [...prev, { _key: nextKey(), quantity: 1, price: 0, label: null, badge: null, isFeatured: prev.length === 0 }]);
  }
  function addFeature() {
    setFeatures((prev) => [...prev, { _key: nextKey(), title: '', description: null, imageUrl: null }]);
  }
  function addFaq() {
    setFaqs((prev) => [...prev, { _key: nextKey(), question: '', answer: '' }]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const priceNum = Number(price);
    const stockNum = Number(stockQuantity);
    if (!name.trim() || !slug.trim()) { toast.error('Nama dan slug wajib diisi'); return; }
    if (Number.isNaN(priceNum) || priceNum < 0) { toast.error('Harga tidak valid'); return; }
    if (Number.isNaN(stockNum) || stockNum < 0) { toast.error('Stok tidak valid'); return; }
    for (const b of bundles) {
      if (b.quantity < 1) { toast.error('Jumlah paket harus minimal 1'); return; }
      if (b.price < 0) { toast.error('Harga paket tidak boleh negatif'); return; }
    }
    for (const f of features) {
      if (!f.title.trim()) { toast.error('Judul fitur wajib diisi'); return; }
    }
    for (const f of faqs) {
      if (!f.question.trim() || !f.answer.trim()) { toast.error('Pertanyaan dan jawaban FAQ wajib diisi'); return; }
    }

    const hasVariants = optionTypes.length > 0 && variantRows.length > 0;
    if (hasVariants) {
      for (const v of variantRows) {
        const stock = Number(v.stockQuantity);
        if (Number.isNaN(stock) || stock < 0) { toast.error('Stok varian tidak valid'); return; }
      }
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
      bundles: bundles.map(({ _key: _k, ...b }) => b),
      features: features.map(({ _key: _k, ...f }) => f),
      faqs: faqs.map(({ _key: _k, ...f }) => f),
      optionTypes: optionTypes.map((ot) => ({
        name: ot.name,
        values: ot.values.map((v) => v.value).filter((v) => v.trim()),
      })),
      variants: variantRows.map((v) => ({
        optionCombination: v.optionValues,
        price: v.price.trim() ? Number(v.price) : null,
        stockQuantity: Number(v.stockQuantity),
        sku: v.sku.trim() || null,
        imageUrl: null,
        isActive: v.isActive,
      })),
    };

    setSubmitting(true);
    try {
      if (isEdit && params.id) {
        await updateProduct.mutateAsync({ id: params.id, data: payload });
        toast.success('Perubahan berhasil disimpan');
        // Tetap di halaman edit — jangan navigate ke list
      } else {
        await createProduct.mutateAsync({ data: payload });
        toast.success('Produk berhasil ditambahkan');
        navigate('/');
      }
    } catch (err) {
      toast.error(`Gagal: ${err instanceof Error ? err.message : 'Terjadi kesalahan'}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (isEdit && isLoadingExisting) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Produk
      </button>

      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? 'Edit Produk' : 'Produk Baru'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isEdit ? 'Ubah detail produk di bawah ini' : 'Isi detail produk yang ingin ditambahkan'}
          </p>
        </div>

        {/* Tombol simpan di header — selalu terlihat tanpa scroll */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center border border-slate-300 text-slate-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
          </button>
        </div>
      </div>

      <TabsNav tabs={TABS} active={tab} onChange={(id) => setTab(id)} className="mb-5" />

      <form id="product-form" onSubmit={handleSubmit} className="space-y-4 pb-8">
        {/* ── Tab: Info & Harga ── */}
        {tab === 'dasar' && (
          <>
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

            <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm font-medium text-slate-700">Tampilkan di toko</p>
                <p className="text-xs text-slate-500 mt-0.5">Produk nonaktif tidak muncul di storefront</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </>
        )}

        {/* ── Tab: Media ── */}
        {tab === 'media' && (
          <Card title="Gambar Produk">
            <Field label="Gambar">
              <ImageDropzone
                value={imageUrl || undefined}
                onUploaded={(url) => setImageUrl(url)}
                onClear={() => setImageUrl('')}
                label="Seret & lepas gambar produk di sini, atau klik untuk memilih"
              />
            </Field>
          </Card>
        )}

        {/* ── Tab: Bundle Harga ── */}
        {tab === 'bundle' && (
          <Card
            title="Bundle Harga"
            action={<AddButton onClick={addBundle} label="Tambah Paket" />}
          >
            <p className="text-xs text-slate-500 -mt-1">
              Jika ada bundle, harga satuan digantikan oleh pilihan paket di halaman produk. Tandai ⭐ untuk paket yang disorot.
            </p>
            <BundleEditor bundles={bundles} onChange={setBundles} />
          </Card>
        )}

        {/* ── Tab: Fitur Produk ── */}
        {tab === 'fitur' && (
          <Card
            title="Fitur Produk"
            action={<AddButton onClick={addFeature} label="Tambah Fitur" />}
          >
            <p className="text-xs text-slate-500 -mt-1">
              Tampil sebagai section bergambar di bawah detail produk — cocok untuk highlight keunggulan.
            </p>
            <FeatureEditor features={features} onChange={setFeatures} />
          </Card>
        )}

        {/* ── Tab: FAQ ── */}
        {tab === 'faq' && (
          <Card
            title="FAQ"
            action={<AddButton onClick={addFaq} label="Tambah FAQ" />}
          >
            <p className="text-xs text-slate-500 -mt-1">
              Pertanyaan umum yang muncul sebagai accordion di bawah halaman produk.
            </p>
            <FaqEditor faqs={faqs} onChange={setFaqs} />
          </Card>
        )}

        {/* ── Tab: Varian ── */}
        {tab === 'varian' && (
          <>
            <Card title="Tipe Opsi">
              <p className="text-xs text-slate-500 -mt-1">
                Definisikan dimensi opsi produk (contoh: "Ukuran" dengan nilai S, M, L, XL). Matriks varian di bawah akan otomatis terupdate.
              </p>
              <OptionTypeEditor optionTypes={optionTypes} onChange={setOptionTypes} />
            </Card>

            {optionTypes.length > 0 && (
              <Card title="Matriks Varian">
                <p className="text-xs text-slate-500 -mt-1">
                  Isi stok untuk tiap kombinasi. Harga override kosong berarti pakai harga produk utama.
                </p>
                <VariantMatrix
                  optionTypes={optionTypes}
                  variantRows={variantRows}
                  onChange={setVariantRows}
                />
              </Card>
            )}

            {optionTypes.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
                💡 Saat produk punya varian, stok di tab <strong>Info &amp; Harga</strong> tidak digunakan — stok dihitung per varian dari matriks di atas.
              </div>
            )}
          </>
        )}
      </form>
    </div>
  );
}
