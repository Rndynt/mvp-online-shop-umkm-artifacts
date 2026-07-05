import { db } from "./index.js";
import {
  storesTable,
  productsTable,
  productImagesTable,
  productBundlesTable,
  productFeaturesTable,
  productFaqsTable,
  shippingMethodsTable,
  discountsTable,
} from "./schema/index.js";

const id = () => crypto.randomUUID();

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
    logoUrl: null,
    primaryColor: "#6F4E37",
    secondaryColor: "#F5EBDD",
    tertiaryColor: "#C08552",
    announcementText: "☕ Gratis ongkir se-Jabodetabek untuk pembelian di atas Rp 150.000!",
    currency: "IDR",
    country: "Indonesia",
    tagline: "Kopi asli Nusantara dan peralatan seduh untuk pecinta kopi rumahan.",
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
      name: "Kopi Arabika Gayo Bubuk 250g",
      slug: "kopi-arabika-gayo-bubuk-250g",
      shortDescription: "Bubuk kopi arabika single origin dari dataran tinggi Gayo, Aceh",
      description:
        "Kopi Arabika Gayo dipetik dari perkebunan dataran tinggi 1.200 mdpl di Aceh, diproses dengan metode full-wash dan disangrai medium roast untuk menonjolkan karakter asam segar dan aroma floral yang khas. Digiling halus, siap seduh dengan metode apapun.\n\n**Detail Produk:**\n- Asal: Gayo, Aceh, Sumatra\n- Varietas: Arabika Typica\n- Tingkat sangrai: Medium Roast\n- Proses: Full-wash\n- Catatan rasa: Jeruk, floral, aftertaste bersih\n- Berat: 250g bubuk",
      price: 65000,
      compareAtPrice: 79000,
      sku: "KAG-250",
      stockQuantity: 150,
      images: [
        {
          url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80",
          alt: "Kopi Arabika Gayo Bubuk 250g dalam kemasan",
          sortOrder: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80",
          alt: "Biji kopi arabika Gayo yang telah disangrai",
          sortOrder: 1,
        },
      ],
      bundles: [
        { quantity: 1, price: 65000, label: "1 Pack (250g)", badge: null, isFeatured: false },
        { quantity: 2, price: 119000, label: "2 Pack (500g)", badge: "Hemat 8%", isFeatured: true },
        { quantity: 3, price: 169000, label: "3 Pack (750g)", badge: "Hemat 13%", isFeatured: false },
      ],
      features: [
        {
          imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1000&q=80",
          title: "Single Origin Gayo",
          description: "Dipanen dari perkebunan dataran tinggi Aceh dengan cita rasa floral dan asam segar yang khas.",
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1587734195503-904fca47e0b9?w=1000&q=80",
          title: "Disangrai Segar Mingguan",
          description: "Setiap batch disangrai dalam jumlah kecil setiap minggu untuk menjaga kesegaran aroma.",
        },
      ],
      faqs: [
        { question: "Cocok untuk metode seduh apa?", answer: "Cocok untuk V60, French Press, maupun Aeropress. Gilingan sudah disesuaikan untuk seduh manual." },
        { question: "Apakah kemasan sudah kedap udara?", answer: "Ya, menggunakan kemasan dengan valve satu arah untuk menjaga aroma tetap segar lebih lama." },
        { question: "Berapa lama masa simpan setelah dibuka?", answer: "Sebaiknya dikonsumsi dalam 2-3 minggu setelah kemasan dibuka untuk rasa terbaik." },
      ],
    },
    {
      id: id(),
      name: "Kopi Robusta Lampung Bubuk 250g",
      slug: "kopi-robusta-lampung-bubuk-250g",
      shortDescription: "Bubuk kopi robusta pekat dari Lampung, cocok untuk kopi tubruk",
      description:
        "Kopi Robusta Lampung terkenal dengan body yang tebal dan karakter pahit-manis yang kuat. Disangrai dark roast, sempurna untuk kopi tubruk khas Indonesia maupun campuran espresso blend.\n\n**Detail Produk:**\n- Asal: Lampung, Sumatra\n- Varietas: Robusta\n- Tingkat sangrai: Dark Roast\n- Catatan rasa: Cokelat pahit, kacang, body tebal\n- Berat: 250g bubuk",
      price: 45000,
      compareAtPrice: null,
      sku: "KRL-250",
      stockQuantity: 200,
      images: [
        {
          url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80",
          alt: "Kopi Robusta Lampung Bubuk dalam kemasan",
          sortOrder: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
          alt: "Secangkir kopi tubruk robusta",
          sortOrder: 1,
        },
      ],
      bundles: [
        { quantity: 1, price: 45000, label: "1 Pack (250g)", badge: null, isFeatured: false },
        { quantity: 2, price: 84000, label: "2 Pack (500g)", badge: "Hemat 7%", isFeatured: true },
        { quantity: 3, price: 119000, label: "3 Pack (750g)", badge: "Hemat 12%", isFeatured: false },
      ],
      features: [
        {
          imageUrl: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1000&q=80",
          title: "Body Tebal & Pekat",
          description: "Karakter robusta klasik dengan body tebal, cocok untuk yang suka kopi kental.",
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&q=80",
          title: "Nikmat Diseduh Tubruk",
          description: "Gilingan medium-coarse yang pas untuk kopi tubruk ala warung kopi tradisional.",
        },
      ],
      faqs: [
        { question: "Apakah cocok untuk kopi susu?", answer: "Sangat cocok, karakter pahit-manisnya berpadu baik dengan susu dan gula aren." },
        { question: "Apa bedanya dengan arabika?", answer: "Robusta memiliki kadar kafein lebih tinggi, body lebih tebal, dan rasa lebih pahit dibanding arabika." },
      ],
    },
    {
      id: id(),
      name: "Kopi Toraja Sapan Biji Utuh 200g",
      slug: "kopi-toraja-sapan-biji-utuh-200g",
      shortDescription: "Biji kopi arabika Toraja Sapan single origin, whole bean premium",
      description:
        "Kopi Toraja Sapan adalah salah satu kopi paling dicari dari Sulawesi Selatan. Tumbuh di ketinggian 1.500-1.800 mdpl dengan proses semi-washed khas Sulawesi, menghasilkan body yang berat dengan tingkat keasaman rendah dan rasa earthy yang kompleks.\n\n**Detail Produk:**\n- Asal: Sapan, Toraja, Sulawesi Selatan\n- Varietas: Arabika Typica\n- Tingkat sangrai: Medium-Dark Roast\n- Proses: Semi-washed (Giling Basah)\n- Catatan rasa: Earthy, herbal, rempah, body berat\n- Berat: 200g biji utuh (whole bean)",
      price: 95000,
      compareAtPrice: 115000,
      sku: "KTS-200",
      stockQuantity: 80,
      images: [
        {
          url: "https://images.unsplash.com/photo-1524350876685-274059332603?w=800&q=80",
          alt: "Kopi Toraja Sapan biji utuh dalam kemasan",
          sortOrder: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80",
          alt: "Biji kopi Toraja Sapan close up",
          sortOrder: 1,
        },
      ],
      bundles: [
        { quantity: 1, price: 95000, label: "1 Pack (200g)", badge: null, isFeatured: false },
        { quantity: 2, price: 175000, label: "2 Pack (400g)", badge: "Hemat 8%", isFeatured: true },
        { quantity: 3, price: 249000, label: "3 Pack (600g)", badge: "Hemat 12%", isFeatured: false },
      ],
      features: [
        {
          imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=1000&q=80",
          title: "Whole Bean Premium",
          description: "Dijual dalam bentuk biji utuh agar Anda bisa menggiling sesaat sebelum diseduh untuk aroma maksimal.",
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1524350876685-274059332603?w=1000&q=80",
          title: "Proses Giling Basah Khas Sulawesi",
          description: "Metode semi-washed tradisional menghasilkan body berat dengan keasaman rendah yang khas Toraja.",
        },
      ],
      faqs: [
        { question: "Perlu digiling sendiri?", answer: "Ya, produk ini berbentuk biji utuh. Kami sarankan digiling maksimal 1-2 hari sebelum diseduh." },
        { question: "Apakah tersedia versi bubuk?", answer: "Saat ini Toraja Sapan hanya tersedia whole bean, silakan gunakan grinder Kopio untuk hasil terbaik." },
      ],
    },
    {
      id: id(),
      name: "French Press Kopio Classic 600ml",
      slug: "french-press-kopio-classic-600ml",
      shortDescription: "French press kaca borosilikat 600ml dengan filter saringan stainless",
      description:
        "French Press Kopio Classic dibuat dari kaca borosilikat tahan panas dan dilengkapi filter mesh stainless 4-lapis untuk hasil seduhan bersih tanpa ampas. Gagang dan tutup dari plastik food-grade yang tahan panas dan nyaman digenggam.\n\n**Spesifikasi:**\n- Kapasitas: 600ml (sekitar 3-4 cangkir)\n- Bahan wadah: Kaca borosilikat\n- Filter: Stainless steel 4-lapis\n- Gagang: Plastik food-grade tahan panas\n- Cocok untuk: Kopi & teh",
      price: 189000,
      compareAtPrice: 239000,
      sku: "FPK-600",
      stockQuantity: 65,
      images: [
        {
          url: "https://images.unsplash.com/photo-1610632380989-680fe40816c6?w=800&q=80",
          alt: "French Press Kopio Classic 600ml",
          sortOrder: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1587734195503-904fca47e0b9?w=800&q=80",
          alt: "French Press sedang menyeduh kopi",
          sortOrder: 1,
        },
      ],
      bundles: [
        { quantity: 1, price: 189000, label: "1 Unit", badge: null, isFeatured: false },
        { quantity: 2, price: 349000, label: "2 Unit", badge: "Hemat 8%", isFeatured: true },
      ],
      features: [
        {
          imageUrl: "https://images.unsplash.com/photo-1610632380989-680fe40816c6?w=1000&q=80",
          title: "Kaca Borosilikat Tahan Panas",
          description: "Tahan terhadap perubahan suhu mendadak dan tidak menyerap bau maupun rasa dari seduhan sebelumnya.",
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1587734195503-904fca47e0b9?w=1000&q=80",
          title: "Filter 4-Lapis Stainless",
          description: "Menyaring ampas kopi secara maksimal sehingga hasil seduhan lebih bersih dan halus di lidah.",
        },
      ],
      faqs: [
        { question: "Berapa lama waktu ideal menyeduh?", answer: "Rendam kopi selama 4 menit sebelum ditekan untuk hasil terbaik." },
        { question: "Apakah aman dicuci dengan mesin cuci piring?", answer: "Bagian kaca aman, namun kami sarankan cuci tangan untuk bagian filter agar lebih awet." },
        { question: "Apakah ada garansi jika kaca pecah saat pengiriman?", answer: "Ya, kami menyediakan garansi ganti baru jika unit rusak saat pengiriman (wajib video unboxing)." },
      ],
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
      stockQuantity: 50,
      images: [
        {
          url: "https://images.unsplash.com/photo-1595246007497-c8fed49ff0c9?w=800&q=80",
          alt: "Grinder Kopi Manual Kopio Hand Mill",
          sortOrder: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
          alt: "Detail mata pisau keramik grinder",
          sortOrder: 1,
        },
      ],
      bundles: [
        { quantity: 1, price: 249000, label: "1 Unit", badge: null, isFeatured: false },
        { quantity: 2, price: 459000, label: "2 Unit", badge: "Hemat 8%", isFeatured: true },
      ],
      features: [
        {
          imageUrl: "https://images.unsplash.com/photo-1595246007497-c8fed49ff0c9?w=1000&q=80",
          title: "Mata Pisau Keramik Presisi",
          description: "Menghasilkan gilingan konsisten dan tidak mudah berkarat dibanding mata pisau baja biasa.",
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1000&q=80",
          title: "6 Level Kehalusan",
          description: "Dari kasar untuk French Press hingga halus untuk Espresso, atur sesuai metode seduh favoritmu.",
        },
      ],
      faqs: [
        { question: "Bisa untuk espresso?", answer: "Bisa, gunakan level pengaturan paling halus. Namun hasil terbaik tetap pada metode seduh manual seperti V60 dan French Press." },
        { question: "Apakah muat dibawa traveling?", answer: "Sangat portabel, ukurannya kompak dan bisa masuk tas ransel maupun tas kamera." },
      ],
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
      stockQuantity: 40,
      images: [
        {
          url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80",
          alt: "Dripper V60 Kopio Ceramic Set lengkap",
          sortOrder: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1587734195503-904fca47e0b9?w=800&q=80",
          alt: "Proses menyeduh kopi dengan dripper V60",
          sortOrder: 1,
        },
      ],
      bundles: [
        { quantity: 1, price: 215000, label: "1 Set", badge: null, isFeatured: false },
        { quantity: 2, price: 399000, label: "2 Set", badge: "Hemat 7%", isFeatured: true },
      ],
      features: [
        {
          imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=1000&q=80",
          title: "Spiral Rib untuk Aliran Optimal",
          description: "Desain alur spiral di dalam dripper membantu air mengalir merata untuk ekstraksi rasa yang seimbang.",
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1587734195503-904fca47e0b9?w=1000&q=80",
          title: "Paket Lengkap Siap Pakai",
          description: "Sudah termasuk server kaca dan 40 kertas filter, cukup tambahkan kopi dan air panas.",
        },
      ],
      faqs: [
        { question: "Apakah kertas filter bisa dibeli ulang terpisah?", answer: "Ya, kertas filter isi ulang tersedia terpisah di toko kami." },
        { question: "Rasio kopi dan air yang disarankan?", answer: "Kami sarankan rasio 1:15, misalnya 15g kopi untuk 225ml air." },
        { question: "Apakah server kaca aman dipanaskan langsung?", answer: "Server kaca tahan panas dari tuangan air mendidih, namun tidak disarankan diletakkan langsung di atas kompor." },
      ],
    },
  ];

  for (const product of products) {
    const { images, bundles, features, faqs, ...productData } = product;
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
