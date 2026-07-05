import { db } from "./index.js";
import {
  storesTable,
  productsTable,
  productImagesTable,
  productBundlesTable,
  productFeaturesTable,
  productFaqsTable,
  productOptionTypesTable,
  productOptionValuesTable,
  productVariantsTable,
  productVariantOptionsTable,
  shippingMethodsTable,
  discountsTable,
} from "./schema/index.js";

const id = () => crypto.randomUUID();

type VariantEntry = {
  value: string;
  price: number | null;
  stock: number;
  sku: string;
  imageUrl?: string;
};

async function addVariants(productId: string, optionTypeName: string, entries: VariantEntry[]) {
  const optionTypeId = id();
  await db.insert(productOptionTypesTable).values({
    id: optionTypeId,
    productId,
    name: optionTypeName,
    sortOrder: 0,
  });

  for (const [idx, entry] of entries.entries()) {
    const optionValueId = id();
    await db.insert(productOptionValuesTable).values({
      id: optionValueId,
      optionTypeId,
      value: entry.value,
      sortOrder: idx,
    });

    const variantId = id();
    await db.insert(productVariantsTable).values({
      id: variantId,
      productId,
      sku: entry.sku,
      price: entry.price,
      stockQuantity: entry.stock,
      imageUrl: entry.imageUrl ?? null,
      isActive: true,
      sortOrder: idx,
    });

    await db.insert(productVariantOptionsTable).values({
      variantId,
      optionValueId,
    });
  }
}

async function main() {
  console.log("🌱 Seeding database...");

  // Check if already seeded
  const existing = await db.select().from(storesTable).limit(1);
  if (existing.length > 0) {
    console.log("✅ Database already seeded. Skipping.");
    process.exit(0);
  }

  // --- Store ---
  const storeId = id();
  await db.insert(storesTable).values({
    id: storeId,
    name: "Kopio",
    slug: "kopio",
    logoUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80",
    website: "https://kopio.id",
    primaryColor: "#6F4E37",
    secondaryColor: "#F5EBDD",
    tertiaryColor: "#C08552",
    announcementText: "☕ Gratis ongkir se-Jabodetabek untuk pembelian di atas Rp 150.000!",
    currency: "IDR",
    country: "Indonesia",
    tagline: "Kopi asli Nusantara, alat seduh, dan mesin kopi untuk pecinta kopi rumahan.",
    addressLine1: "Jl. Kemang Raya No. 45",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    postalCode: "12730",
    contactEmail: "halo@kopio.id",
    contactPhone: "+62813-9900-1122",
    isActive: true,
  });
  console.log("✔ Store created");

  // --- Products ---
  const products = [
    {
      id: id(),
      name: "Kopi Arabika Gayo Bubuk",
      slug: "kopi-arabika-gayo-bubuk",
      shortDescription: "Bubuk kopi arabika single origin dari dataran tinggi Gayo, Aceh",
      description:
        "Kopi Arabika Gayo dipetik dari perkebunan dataran tinggi 1.200 mdpl di Aceh, diproses dengan metode full-wash dan disangrai medium roast untuk menonjolkan karakter asam segar dan aroma floral yang khas. Digiling halus, siap seduh dengan metode apapun.\n\n**Detail Produk:**\n- Asal: Gayo, Aceh, Sumatra\n- Varietas: Arabika Typica\n- Tingkat sangrai: Medium Roast\n- Proses: Full-wash\n- Catatan rasa: Jeruk, floral, aftertaste bersih",
      price: 65000,
      compareAtPrice: 79000,
      sku: "KAG-250",
      stockQuantity: 150,
      images: [
        { url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80", alt: "Kopi Arabika Gayo Bubuk dalam kemasan", sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80", alt: "Biji kopi arabika Gayo yang telah disangrai", sortOrder: 1 },
      ],
      bundles: [
        { quantity: 1, price: 65000, label: "1 Pack", badge: null, isFeatured: false },
        { quantity: 2, price: 119000, label: "2 Pack", badge: "Hemat 8%", isFeatured: true },
        { quantity: 3, price: 169000, label: "3 Pack", badge: "Hemat 13%", isFeatured: false },
      ],
      features: [
        { imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1000&q=80", title: "Single Origin Gayo", description: "Dipanen dari perkebunan dataran tinggi Aceh dengan cita rasa floral dan asam segar yang khas." },
        { imageUrl: "https://images.unsplash.com/photo-1587734195503-904fca47e0b9?w=1000&q=80", title: "Disangrai Segar Mingguan", description: "Setiap batch disangrai dalam jumlah kecil setiap minggu untuk menjaga kesegaran aroma." },
      ],
      faqs: [
        { question: "Cocok untuk metode seduh apa?", answer: "Cocok untuk V60, French Press, maupun Aeropress. Gilingan sudah disesuaikan untuk seduh manual." },
        { question: "Apakah kemasan sudah kedap udara?", answer: "Ya, menggunakan kemasan dengan valve satu arah untuk menjaga aroma tetap segar lebih lama." },
        { question: "Berapa lama masa simpan setelah dibuka?", answer: "Sebaiknya dikonsumsi dalam 2-3 minggu setelah kemasan dibuka untuk rasa terbaik." },
      ],
      variantOption: {
        name: "Berat",
        entries: [
          { value: "100g", price: 30000, stock: 80, sku: "KAG-100" },
          { value: "250g", price: 65000, stock: 150, sku: "KAG-250" },
          { value: "500g", price: 120000, stock: 60, sku: "KAG-500" },
        ],
      },
    },
    {
      id: id(),
      name: "Kopi Robusta Lampung Bubuk",
      slug: "kopi-robusta-lampung-bubuk",
      shortDescription: "Bubuk kopi robusta pekat dari Lampung, cocok untuk kopi tubruk",
      description:
        "Kopi Robusta Lampung terkenal dengan body yang tebal dan karakter pahit-manis yang kuat. Disangrai dark roast, sempurna untuk kopi tubruk khas Indonesia maupun campuran espresso blend.\n\n**Detail Produk:**\n- Asal: Lampung, Sumatra\n- Varietas: Robusta\n- Tingkat sangrai: Dark Roast\n- Catatan rasa: Cokelat pahit, kacang, body tebal",
      price: 45000,
      compareAtPrice: null,
      sku: "KRL-250",
      stockQuantity: 200,
      images: [
        { url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80", alt: "Kopi Robusta Lampung Bubuk dalam kemasan", sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80", alt: "Secangkir kopi tubruk robusta", sortOrder: 1 },
      ],
      bundles: [
        { quantity: 1, price: 45000, label: "1 Pack", badge: null, isFeatured: false },
        { quantity: 2, price: 84000, label: "2 Pack", badge: "Hemat 7%", isFeatured: true },
        { quantity: 3, price: 119000, label: "3 Pack", badge: "Hemat 12%", isFeatured: false },
      ],
      features: [
        { imageUrl: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1000&q=80", title: "Body Tebal & Pekat", description: "Karakter robusta klasik dengan body tebal, cocok untuk yang suka kopi kental." },
        { imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&q=80", title: "Nikmat Diseduh Tubruk", description: "Gilingan medium-coarse yang pas untuk kopi tubruk ala warung kopi tradisional." },
      ],
      faqs: [
        { question: "Apakah cocok untuk kopi susu?", answer: "Sangat cocok, karakter pahit-manisnya berpadu baik dengan susu dan gula aren." },
        { question: "Apa bedanya dengan arabika?", answer: "Robusta memiliki kadar kafein lebih tinggi, body lebih tebal, dan rasa lebih pahit dibanding arabika." },
      ],
      variantOption: {
        name: "Berat",
        entries: [
          { value: "100g", price: 20000, stock: 100, sku: "KRL-100" },
          { value: "250g", price: 45000, stock: 200, sku: "KRL-250" },
          { value: "500g", price: 85000, stock: 90, sku: "KRL-500" },
        ],
      },
    },
    {
      id: id(),
      name: "Kopi Toraja Sapan Biji Utuh",
      slug: "kopi-toraja-sapan-biji-utuh",
      shortDescription: "Biji kopi arabika Toraja Sapan single origin, whole bean premium",
      description:
        "Kopi Toraja Sapan adalah salah satu kopi paling dicari dari Sulawesi Selatan. Tumbuh di ketinggian 1.500-1.800 mdpl dengan proses semi-washed khas Sulawesi, menghasilkan body yang berat dengan tingkat keasaman rendah dan rasa earthy yang kompleks.\n\n**Detail Produk:**\n- Asal: Sapan, Toraja, Sulawesi Selatan\n- Varietas: Arabika Typica\n- Tingkat sangrai: Medium-Dark Roast\n- Proses: Semi-washed (Giling Basah)\n- Catatan rasa: Earthy, herbal, rempah, body berat",
      price: 95000,
      compareAtPrice: 115000,
      sku: "KTS-200",
      stockQuantity: 80,
      images: [
        { url: "https://images.unsplash.com/photo-1524350876685-274059332603?w=800&q=80", alt: "Kopi Toraja Sapan biji utuh dalam kemasan", sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80", alt: "Biji kopi Toraja Sapan close up", sortOrder: 1 },
      ],
      bundles: [
        { quantity: 1, price: 95000, label: "1 Pack", badge: null, isFeatured: false },
        { quantity: 2, price: 175000, label: "2 Pack", badge: "Hemat 8%", isFeatured: true },
      ],
      features: [
        { imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=1000&q=80", title: "Whole Bean Premium", description: "Dijual dalam bentuk biji utuh agar Anda bisa menggiling sesaat sebelum diseduh untuk aroma maksimal." },
        { imageUrl: "https://images.unsplash.com/photo-1524350876685-274059332603?w=1000&q=80", title: "Proses Giling Basah Khas Sulawesi", description: "Metode semi-washed tradisional menghasilkan body berat dengan keasaman rendah yang khas Toraja." },
      ],
      faqs: [
        { question: "Perlu digiling sendiri?", answer: "Ya, produk ini berbentuk biji utuh. Kami sarankan digiling maksimal 1-2 hari sebelum diseduh." },
        { question: "Apakah tersedia versi bubuk?", answer: "Saat ini Toraja Sapan hanya tersedia whole bean, silakan gunakan grinder Kopio untuk hasil terbaik." },
      ],
      variantOption: {
        name: "Berat",
        entries: [
          { value: "200g", price: 95000, stock: 80, sku: "KTS-200" },
          { value: "500g", price: 225000, stock: 50, sku: "KTS-500" },
          { value: "1kg", price: 420000, stock: 25, sku: "KTS-1000" },
        ],
      },
    },
    {
      id: id(),
      name: "Kopi Sidikalang Bubuk",
      slug: "kopi-sidikalang-bubuk",
      shortDescription: "Bubuk kopi arabika Sidikalang, Sumatra Utara dengan body tebal khas",
      description:
        "Kopi Sidikalang tumbuh di dataran tinggi Sumatra Utara dan diproses dengan metode giling basah tradisional, menghasilkan rasa earthy dengan sentuhan rempah dan body yang tebal namun tetap smooth di akhir tegukan.\n\n**Detail Produk:**\n- Asal: Sidikalang, Sumatra Utara\n- Varietas: Arabika\n- Tingkat sangrai: Medium-Dark Roast\n- Proses: Giling Basah\n- Catatan rasa: Rempah, earthy, body tebal, smooth",
      price: 55000,
      compareAtPrice: 68000,
      sku: "KSD-250",
      stockQuantity: 140,
      images: [
        { url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80", alt: "Kopi Sidikalang Bubuk dalam kemasan", sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1521302080334-4bebac2763a6?w=800&q=80", alt: "Secangkir kopi Sidikalang", sortOrder: 1 },
      ],
      bundles: [
        { quantity: 1, price: 55000, label: "1 Pack", badge: null, isFeatured: false },
        { quantity: 2, price: 100000, label: "2 Pack", badge: "Hemat 9%", isFeatured: true },
        { quantity: 3, price: 140000, label: "3 Pack", badge: "Hemat 15%", isFeatured: false },
      ],
      features: [
        { imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1000&q=80", title: "Body Tebal Khas Sumatra", description: "Proses giling basah tradisional menghasilkan karakter body tebal dengan rasa rempah yang khas." },
        { imageUrl: "https://images.unsplash.com/photo-1521302080334-4bebac2763a6?w=1000&q=80", title: "Smooth di Akhir Tegukan", description: "Meski body tebal, aftertaste tetap smooth dan tidak meninggalkan rasa pahit berlebih." },
      ],
      faqs: [
        { question: "Cocok diseduh dengan cara apa?", answer: "Paling cocok diseduh dengan tubruk atau French Press agar body tebalnya terasa maksimal." },
        { question: "Apakah termasuk kopi asam atau pahit?", answer: "Cenderung netral dengan sedikit rasa rempah, tidak terlalu asam maupun terlalu pahit." },
      ],
      variantOption: {
        name: "Berat",
        entries: [
          { value: "100g", price: 25000, stock: 90, sku: "KSD-100" },
          { value: "250g", price: 55000, stock: 140, sku: "KSD-250" },
          { value: "500g", price: 100000, stock: 70, sku: "KSD-500" },
        ],
      },
    },
    {
      id: id(),
      name: "French Press Kopio Classic",
      slug: "french-press-kopio-classic",
      shortDescription: "French press kaca borosilikat dengan filter saringan stainless",
      description:
        "French Press Kopio Classic dibuat dari kaca borosilikat tahan panas dan dilengkapi filter mesh stainless 4-lapis untuk hasil seduhan bersih tanpa ampas. Gagang dan tutup dari plastik food-grade yang tahan panas dan nyaman digenggam.\n\n**Spesifikasi:**\n- Bahan wadah: Kaca borosilikat\n- Filter: Stainless steel 4-lapis\n- Gagang: Plastik food-grade tahan panas\n- Cocok untuk: Kopi & teh",
      price: 189000,
      compareAtPrice: 239000,
      sku: "FPK-600",
      stockQuantity: 90,
      images: [
        { url: "https://images.unsplash.com/photo-1610632380989-680fe40816c6?w=800&q=80", alt: "French Press Kopio Classic", sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1587734195503-904fca47e0b9?w=800&q=80", alt: "French Press sedang menyeduh kopi", sortOrder: 1 },
      ],
      bundles: [
        { quantity: 1, price: 189000, label: "1 Unit", badge: null, isFeatured: false },
        { quantity: 2, price: 349000, label: "2 Unit", badge: "Hemat 8%", isFeatured: true },
      ],
      features: [
        { imageUrl: "https://images.unsplash.com/photo-1610632380989-680fe40816c6?w=1000&q=80", title: "Kaca Borosilikat Tahan Panas", description: "Tahan terhadap perubahan suhu mendadak dan tidak menyerap bau maupun rasa dari seduhan sebelumnya." },
        { imageUrl: "https://images.unsplash.com/photo-1587734195503-904fca47e0b9?w=1000&q=80", title: "Filter 4-Lapis Stainless", description: "Menyaring ampas kopi secara maksimal sehingga hasil seduhan lebih bersih dan halus di lidah." },
      ],
      faqs: [
        { question: "Berapa lama waktu ideal menyeduh?", answer: "Rendam kopi selama 4 menit sebelum ditekan untuk hasil terbaik." },
        { question: "Apakah aman dicuci dengan mesin cuci piring?", answer: "Bagian kaca aman, namun kami sarankan cuci tangan untuk bagian filter agar lebih awet." },
        { question: "Apakah ada garansi jika kaca pecah saat pengiriman?", answer: "Ya, kami menyediakan garansi ganti baru jika unit rusak saat pengiriman (wajib video unboxing)." },
      ],
      variantOption: {
        name: "Warna",
        entries: [
          { value: "Hitam", price: null, stock: 40, sku: "FPK-600-BLK" },
          { value: "Transparan", price: null, stock: 30, sku: "FPK-600-CLR" },
          { value: "Hijau Tosca", price: null, stock: 20, sku: "FPK-600-GRN" },
        ],
      },
    },
    {
      id: id(),
      name: "Grinder Kopi Manual Kopio Hand Mill",
      slug: "grinder-kopi-manual-kopio-hand-mill",
      shortDescription: "Gilingan kopi manual dengan mata pisau keramik, presisi 6 level kehalusan",
      description:
        "Grinder manual portabel dengan mata pisau keramik conical yang menghasilkan gilingan konsisten dari kasar untuk French Press hingga halus untuk Espresso. Bodi aluminium alloy ringan, cocok dibawa saat traveling atau camping.\n\n**Spesifikasi:**\n- Mata pisau: Keramik conical burr\n- Kapasitas: 30g biji kopi\n- Pengaturan: 6 level kehalusan (kasar-halus)\n- Bodi: Aluminium alloy\n- Wadah bubuk: Kaca borosilikat\n- Dimensi: 6 x 6 x 18 cm",
      price: 249000,
      compareAtPrice: 299000,
      sku: "GKM-001",
      stockQuantity: 65,
      images: [
        { url: "https://images.unsplash.com/photo-1595246007497-c8fed49ff0c9?w=800&q=80", alt: "Grinder Kopi Manual Kopio Hand Mill", sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80", alt: "Detail mata pisau keramik grinder", sortOrder: 1 },
      ],
      bundles: [
        { quantity: 1, price: 249000, label: "1 Unit", badge: null, isFeatured: false },
        { quantity: 2, price: 459000, label: "2 Unit", badge: "Hemat 8%", isFeatured: true },
      ],
      features: [
        { imageUrl: "https://images.unsplash.com/photo-1595246007497-c8fed49ff0c9?w=1000&q=80", title: "Mata Pisau Keramik Presisi", description: "Menghasilkan gilingan konsisten dan tidak mudah berkarat dibanding mata pisau baja biasa." },
        { imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1000&q=80", title: "6 Level Kehalusan", description: "Dari kasar untuk French Press hingga halus untuk Espresso, atur sesuai metode seduh favoritmu." },
      ],
      faqs: [
        { question: "Bisa untuk espresso?", answer: "Bisa, gunakan level pengaturan paling halus. Namun hasil terbaik tetap pada metode seduh manual seperti V60 dan French Press." },
        { question: "Apakah muat dibawa traveling?", answer: "Sangat portabel, ukurannya kompak dan bisa masuk tas ransel maupun tas kamera." },
      ],
      variantOption: {
        name: "Warna",
        entries: [
          { value: "Silver", price: null, stock: 25, sku: "GKM-001-SLV" },
          { value: "Hitam", price: null, stock: 25, sku: "GKM-001-BLK" },
          { value: "Rose Gold", price: 269000, stock: 15, sku: "GKM-001-RGD" },
        ],
      },
    },
    {
      id: id(),
      name: "Dripper V60 Kopio Ceramic Set",
      slug: "dripper-v60-kopio-ceramic-set",
      shortDescription: "Set dripper keramik V60 lengkap dengan server kaca dan 40 kertas filter",
      description:
        "Paket lengkap untuk menyeduh manual brew di rumah: dripper keramik berbentuk V60 dengan spiral rib di bagian dalam untuk aliran air optimal, dilengkapi server kaca 400ml dan 40 lembar kertas filter tanpa pemutih.\n\n**Isi Paket:**\n- 1x Dripper keramik V60\n- 1x Server kaca 400ml\n- 40x Kertas filter unbleached\n- 1x Buku panduan seduh manual\n\n**Spesifikasi Dripper:**\n- Bahan: Keramik glasir\n- Kapasitas seduh: 1-2 cangkir\n- Desain: Spiral rib, single hole",
      price: 215000,
      compareAtPrice: 265000,
      sku: "DVK-SET",
      stockQuantity: 45,
      images: [
        { url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80", alt: "Dripper V60 Kopio Ceramic Set lengkap", sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1587734195503-904fca47e0b9?w=800&q=80", alt: "Proses menyeduh kopi dengan dripper V60", sortOrder: 1 },
      ],
      bundles: [
        { quantity: 1, price: 215000, label: "1 Set", badge: null, isFeatured: false },
        { quantity: 2, price: 399000, label: "2 Set", badge: "Hemat 7%", isFeatured: true },
      ],
      features: [
        { imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=1000&q=80", title: "Spiral Rib untuk Aliran Optimal", description: "Desain alur spiral di dalam dripper membantu air mengalir merata untuk ekstraksi rasa yang seimbang." },
        { imageUrl: "https://images.unsplash.com/photo-1587734195503-904fca47e0b9?w=1000&q=80", title: "Paket Lengkap Siap Pakai", description: "Sudah termasuk server kaca dan 40 kertas filter, cukup tambahkan kopi dan air panas." },
      ],
      faqs: [
        { question: "Apakah kertas filter bisa dibeli ulang terpisah?", answer: "Ya, kertas filter isi ulang tersedia terpisah di toko kami." },
        { question: "Rasio kopi dan air yang disarankan?", answer: "Kami sarankan rasio 1:15, misalnya 15g kopi untuk 225ml air." },
        { question: "Apakah server kaca aman dipanaskan langsung?", answer: "Server kaca tahan panas dari tuangan air mendidih, namun tidak disarankan diletakkan langsung di atas kompor." },
      ],
      variantOption: {
        name: "Warna",
        entries: [
          { value: "Putih", price: null, stock: 20, sku: "DVK-SET-WHT" },
          { value: "Hitam", price: null, stock: 15, sku: "DVK-SET-BLK" },
          { value: "Terracotta", price: null, stock: 10, sku: "DVK-SET-TRC" },
        ],
      },
    },
    {
      id: id(),
      name: "Mesin Kopi Espresso Kopio Home Barista",
      slug: "mesin-kopi-espresso-kopio-home-barista",
      shortDescription: "Mesin espresso semi-otomatis 15 bar dengan steam wand untuk susu",
      description:
        "Wujudkan pengalaman ngopi ala kafe di rumah dengan Mesin Espresso Kopio Home Barista. Dilengkapi pompa 15 bar untuk ekstraksi crema yang kaya, steam wand untuk membuat foam susu, serta portafilter stainless yang kompatibel dengan berbagai jenis kopi bubuk.\n\n**Spesifikasi:**\n- Tekanan pompa: 15 bar\n- Kapasitas tangki air: 1.2 liter\n- Steam wand: Manual, untuk foam susu\n- Portafilter: Stainless steel, 51mm\n- Daya: 1050W, 220V\n- Fitur tambahan: Auto shut-off, indikator suhu siap pakai",
      price: 1250000,
      compareAtPrice: 1490000,
      sku: "MKE-HB01",
      stockQuantity: 25,
      images: [
        { url: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80", alt: "Mesin Kopi Espresso Kopio Home Barista", sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80", alt: "Espresso dengan crema hasil mesin Kopio", sortOrder: 1 },
      ],
      bundles: [
        { quantity: 1, price: 1250000, label: "1 Unit", badge: null, isFeatured: false },
      ],
      features: [
        { imageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=1000&q=80", title: "Pompa 15 Bar", description: "Menghasilkan tekanan ekstraksi optimal untuk crema espresso yang kaya dan konsisten." },
        { imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&q=80", title: "Steam Wand untuk Latte & Cappuccino", description: "Buat foam susu sendiri di rumah untuk membuat latte, cappuccino, hingga latte art sederhana." },
      ],
      faqs: [
        { question: "Apakah kompatibel dengan kapsul kopi?", answer: "Mesin ini menggunakan portafilter untuk kopi bubuk, bukan kapsul. Cocok digunakan dengan bubuk espresso Kopio." },
        { question: "Berapa lama waktu pemanasan?", answer: "Sekitar 2-3 menit hingga indikator suhu menunjukkan mesin siap digunakan." },
        { question: "Apakah ada garansi resmi?", answer: "Ya, garansi 1 tahun untuk kerusakan komponen mesin (bukan pemakaian normal)." },
      ],
      variantOption: {
        name: "Warna",
        entries: [
          { value: "Hitam Matte", price: null, stock: 15, sku: "MKE-HB01-BLK" },
          { value: "Silver", price: 1300000, stock: 10, sku: "MKE-HB01-SLV" },
        ],
      },
    },
    {
      id: id(),
      name: "Moka Pot Kopio Stovetop",
      slug: "moka-pot-kopio-stovetop",
      shortDescription: "Moka pot aluminium klasik untuk espresso ala rumahan di atas kompor",
      description:
        "Moka Pot Kopio Stovetop menggunakan tekanan uap air untuk mengekstraksi kopi dengan hasil menyerupai espresso, cukup diletakkan di atas kompor. Bodi aluminium food-grade dengan gagang bakelite anti panas.\n\n**Spesifikasi:**\n- Bahan: Aluminium food-grade\n- Gagang: Bakelite anti panas\n- Kompatibel: Kompor gas, elektrik (bukan induksi)\n- Cara pakai: Isi air di boiler bawah, kopi di filter basket, panaskan hingga mendidih",
      price: 259000,
      compareAtPrice: 299000,
      sku: "MPK-3CUP",
      stockQuantity: 90,
      images: [
        { url: "https://images.unsplash.com/photo-1461988320302-91bde64fc8ad?w=800&q=80", alt: "Moka Pot Kopio Stovetop", sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1521302080334-4bebac2763a6?w=800&q=80", alt: "Kopi hasil seduhan moka pot", sortOrder: 1 },
      ],
      bundles: [
        { quantity: 1, price: 259000, label: "1 Unit", badge: null, isFeatured: false },
      ],
      features: [
        { imageUrl: "https://images.unsplash.com/photo-1461988320302-91bde64fc8ad?w=1000&q=80", title: "Rasa Menyerupai Espresso", description: "Tekanan uap air menghasilkan kopi pekat dengan crema tipis tanpa perlu mesin espresso mahal." },
        { imageUrl: "https://images.unsplash.com/photo-1521302080334-4bebac2763a6?w=1000&q=80", title: "Praktis di Atas Kompor", description: "Tidak perlu listrik, cukup panaskan di atas kompor gas atau elektrik biasa." },
      ],
      faqs: [
        { question: "Bisa dipakai di kompor induksi?", answer: "Tidak, moka pot aluminium ini tidak kompatibel dengan kompor induksi kecuali menggunakan induction disc terpisah." },
        { question: "Berapa lama proses menyeduh?", answer: "Sekitar 5-7 menit sejak air mulai mendidih hingga kopi keluar penuh." },
      ],
      variantOption: {
        name: "Ukuran",
        entries: [
          { value: "1 Cup", price: 179000, stock: 30, sku: "MPK-1CUP" },
          { value: "3 Cup", price: 259000, stock: 40, sku: "MPK-3CUP" },
          { value: "6 Cup", price: 349000, stock: 20, sku: "MPK-6CUP" },
        ],
      },
    },
    {
      id: id(),
      name: "Timbangan Kopi Digital Kopio",
      slug: "timbangan-kopi-digital-kopio",
      shortDescription: "Timbangan digital presisi 0.1g dengan timer built-in untuk seduh manual",
      description:
        "Timbangan Kopi Digital Kopio dirancang khusus untuk kebutuhan seduh manual brew yang presisi. Dilengkapi timer built-in untuk menghitung waktu ekstraksi, layar LCD yang mudah dibaca, dan permukaan tahan tumpahan air maupun kopi.\n\n**Spesifikasi:**\n- Kapasitas: 3kg\n- Presisi: 0.1g\n- Fitur: Timer built-in, auto tare, auto off\n- Layar: LCD backlit\n- Daya: 2x baterai AAA (termasuk)\n- Permukaan: Tahan air (splash-proof)",
      price: 149000,
      compareAtPrice: 179000,
      sku: "TKD-001",
      stockQuantity: 70,
      images: [
        { url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80", alt: "Timbangan Kopi Digital Kopio", sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1587734195503-904fca47e0b9?w=800&q=80", alt: "Timbangan digital digunakan saat menyeduh V60", sortOrder: 1 },
      ],
      bundles: [
        { quantity: 1, price: 149000, label: "1 Unit", badge: null, isFeatured: false },
        { quantity: 2, price: 279000, label: "2 Unit", badge: "Hemat 6%", isFeatured: true },
      ],
      features: [
        { imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&q=80", title: "Presisi 0.1g", description: "Timbang rasio kopi dan air dengan akurat untuk hasil seduhan yang konsisten setiap hari." },
        { imageUrl: "https://images.unsplash.com/photo-1587734195503-904fca47e0b9?w=1000&q=80", title: "Timer Built-in", description: "Pantau waktu ekstraksi langsung dari layar tanpa perlu stopwatch tambahan." },
      ],
      faqs: [
        { question: "Apakah tahan jika tumpah air atau kopi?", answer: "Permukaan atas tahan tumpahan ringan (splash-proof), namun jangan direndam air." },
        { question: "Baterai apa yang digunakan?", answer: "Menggunakan 2x baterai AAA yang sudah disertakan dalam paket." },
      ],
    },
    {
      id: id(),
      name: "Kopio Ceramic Mug Set",
      slug: "kopio-ceramic-mug-set",
      shortDescription: "Set 2 mug keramik 300ml dengan desain minimalis logo Kopio",
      description:
        "Nikmati kopi favoritmu dengan Kopio Ceramic Mug Set — satu set berisi 2 mug keramik berkualitas tinggi, food-grade, dan aman digunakan di microwave maupun dishwasher. Desain minimalis dengan logo Kopio yang elegan.\n\n**Spesifikasi:**\n- Isi: 2 mug per set\n- Kapasitas: 300ml per mug\n- Bahan: Keramik glasir food-grade\n- Aman untuk: Microwave, dishwasher",
      price: 99000,
      compareAtPrice: 129000,
      sku: "KCM-SET",
      stockQuantity: 100,
      images: [
        { url: "https://images.unsplash.com/photo-1514066558159-fc8c737ef259?w=800&q=80", alt: "Kopio Ceramic Mug Set", sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1521302080334-4bebac2763a6?w=800&q=80", alt: "Mug Kopio berisi kopi hangat", sortOrder: 1 },
      ],
      bundles: [
        { quantity: 1, price: 99000, label: "1 Set (2 Mug)", badge: null, isFeatured: false },
        { quantity: 2, price: 185000, label: "2 Set (4 Mug)", badge: "Hemat 7%", isFeatured: true },
      ],
      features: [
        { imageUrl: "https://images.unsplash.com/photo-1514066558159-fc8c737ef259?w=1000&q=80", title: "Desain Minimalis", description: "Cocok untuk penggunaan sehari-hari maupun dipajang di rak dapur estetik." },
        { imageUrl: "https://images.unsplash.com/photo-1521302080334-4bebac2763a6?w=1000&q=80", title: "Aman Microwave & Dishwasher", description: "Praktis dipanaskan ulang dan dicuci tanpa mengurangi kualitas glasir." },
      ],
      faqs: [
        { question: "Apakah bisa dibeli satuan?", answer: "Saat ini hanya tersedia dalam bentuk set berisi 2 mug per paket." },
        { question: "Apakah warna bisa pudar setelah lama dipakai?", answer: "Tidak, glasir keramik tahan lama dan tidak mudah pudar meski sering dicuci." },
      ],
      variantOption: {
        name: "Warna",
        entries: [
          { value: "Putih", price: null, stock: 40, sku: "KCM-SET-WHT" },
          { value: "Hitam", price: null, stock: 35, sku: "KCM-SET-BLK" },
          { value: "Krem", price: null, stock: 25, sku: "KCM-SET-CRM" },
        ],
      },
    },
    {
      id: id(),
      name: "Kopi Susu Gula Aren Sachet Kopio",
      slug: "kopi-susu-gula-aren-sachet-kopio",
      shortDescription: "Kopi susu gula aren instan siap seduh, praktis dan nikmat kapan saja",
      description:
        "Kopi Susu Gula Aren Sachet Kopio menghadirkan cita rasa kopi susu kekinian dalam kemasan praktis. Dibuat dari kopi robusta pilihan, krimer lembut, dan gula aren asli tanpa pengawet berlebihan. Cukup seduh dengan air panas atau air dingin.\n\n**Detail Produk:**\n- Bahan: Kopi robusta, krimer nabati, gula aren asli\n- Cara seduh: Larutkan dengan 100-150ml air panas/dingin, aduk rata\n- Cocok untuk: Kopi susu panas maupun es kopi susu",
      price: 45000,
      compareAtPrice: null,
      sku: "KSG-10",
      stockQuantity: 160,
      images: [
        { url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80", alt: "Kopi Susu Gula Aren Sachet Kopio", sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80", alt: "Kemasan sachet kopi susu gula aren", sortOrder: 1 },
      ],
      bundles: [
        { quantity: 1, price: 45000, label: "1 Box (10 Sachet)", badge: null, isFeatured: false },
        { quantity: 2, price: 84000, label: "2 Box (20 Sachet)", badge: "Hemat 7%", isFeatured: true },
      ],
      features: [
        { imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1000&q=80", title: "Gula Aren Asli", description: "Menggunakan gula aren asli untuk rasa karamel yang lebih alami dibanding gula biasa." },
        { imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1000&q=80", title: "Praktis Dibawa Kemana Saja", description: "Kemasan sachet ringkas cocok untuk dibawa traveling, ke kantor, atau disimpan di rumah." },
      ],
      faqs: [
        { question: "Bisa diseduh dingin?", answer: "Bisa, larutkan dengan sedikit air panas terlebih dahulu lalu tambahkan es dan susu/air dingin sesuai selera." },
        { question: "Apakah mengandung pengawet?", answer: "Kami meminimalkan penggunaan pengawet, namun tetap ada bahan tambahan pangan sesuai standar keamanan yang berlaku." },
      ],
      variantOption: {
        name: "Isi Kemasan",
        entries: [
          { value: "10 Sachet", price: 45000, stock: 100, sku: "KSG-10" },
          { value: "20 Sachet", price: 85000, stock: 60, sku: "KSG-20" },
        ],
      },
    },
  ];

  for (const product of products) {
    const { images, bundles, features, faqs, variantOption, ...productData } = product;
    await db.insert(productsTable).values({
      ...productData,
      storeId,
      isActive: true,
      sortOrder: products.indexOf(product),
    });

    for (const img of images) {
      await db.insert(productImagesTable).values({
        id: id(),
        productId: productData.id,
        ...img,
      });
    }

    for (const [idx, bundle] of bundles.entries()) {
      await db.insert(productBundlesTable).values({
        id: id(),
        productId: productData.id,
        sortOrder: idx,
        ...bundle,
      });
    }

    for (const [idx, feature] of features.entries()) {
      await db.insert(productFeaturesTable).values({
        id: id(),
        productId: productData.id,
        sortOrder: idx,
        ...feature,
      });
    }

    for (const [idx, faq] of faqs.entries()) {
      await db.insert(productFaqsTable).values({
        id: id(),
        productId: productData.id,
        sortOrder: idx,
        ...faq,
      });
    }

    if (variantOption) {
      await addVariants(productData.id, variantOption.name, variantOption.entries);
    }

    console.log(`✔ Product: ${productData.name}`);
  }

  // --- Shipping methods ---
  await db.insert(shippingMethodsTable).values([
    {
      id: id(),
      storeId,
      code: "jne-reg",
      name: "JNE Reguler",
      description: "Estimasi 2-3 hari kerja",
      price: 15000,
      isActive: true,
      sortOrder: 0,
    },
    {
      id: id(),
      storeId,
      code: "jnt-express",
      name: "J&T Express",
      description: "Estimasi 1-2 hari kerja",
      price: 25000,
      isActive: true,
      sortOrder: 1,
    },
    {
      id: id(),
      storeId,
      code: "gosend-instant",
      name: "GoSend Instant",
      description: "Estimasi 2-4 jam (khusus Jabodetabek)",
      price: 20000,
      isActive: true,
      sortOrder: 2,
    },
  ]);
  console.log("✔ Shipping methods created");

  // --- Discount ---
  await db.insert(discountsTable).values({
    id: id(),
    storeId,
    code: "NGOPI10",
    type: "percentage",
    value: 10,
    isActive: true,
  });
  console.log("✔ Discount code NGOPI10 (10%) created");

  console.log("\n✅ Seeding complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
