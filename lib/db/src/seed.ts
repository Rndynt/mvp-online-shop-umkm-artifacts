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
    name: "RukoLite",
    slug: "rukolite",
    logoUrl: null,
    primaryColor: "#0F766E",
    announcementText: "🎉 Gratis ongkir untuk pembelian di atas Rp 200.000!",
    currency: "IDR",
    country: "Indonesia",
    tagline: "Belanja produk pilihan berkualitas, langsung dari tangan pengrajin lokal.",
    addressLine1: "Jl. Raya Bogor No. 12",
    city: "Jakarta Timur",
    province: "DKI Jakarta",
    postalCode: "13710",
    contactEmail: "hello@rukolite.id",
    contactPhone: "+62812-3456-7890",
    isActive: true,
  });
  console.log("✔ Store created");

  // --- Products ---
  const products = [
    {
      id: id(),
      name: "Tas Kanvas Handy",
      slug: "tas-kanvas-handy",
      shortDescription: "Tas kanvas premium untuk aktivitas sehari-hari",
      description:
        "Tas kanvas Handy dibuat dari bahan kanvas tebal 12oz yang tahan lama. Desain minimalis dengan satu kompartemen utama besar, kantung dalam, dan tali jinjing yang kuat. Cocok untuk belanja, ke kampus, atau jalan-jalan kasual.\n\n**Spesifikasi:**\n- Bahan: Kanvas 12oz\n- Ukuran: 38 x 40 x 12 cm\n- Tali: Kulit sintetis 55cm\n- Warna: Natural, Hitam, Olive",
      price: 159000,
      compareAtPrice: 219000,
      sku: "TKH-001",
      stockQuantity: 45,
      images: [
        {
          url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
          alt: "Tas Kanvas Handy tampak depan",
          sortOrder: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
          alt: "Tas Kanvas Handy detail",
          sortOrder: 1,
        },
      ],
      bundles: [
        { quantity: 1, price: 159000, label: "1 Tas", badge: null, isFeatured: false },
        { quantity: 2, price: 289000, label: "2 Tas", badge: "Hemat 9%", isFeatured: true },
        { quantity: 3, price: 399000, label: "3 Tas", badge: "Hemat 16%", isFeatured: false },
      ],
      features: [
        {
          imageUrl: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=1000&q=80",
          title: "Kanvas Tebal 12oz",
          description: "Bahan kanvas premium yang tahan lama dan tidak mudah robek, cocok dipakai setiap hari.",
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&q=80",
          title: "Kompartemen Luas",
          description: "Satu kompartemen utama besar plus kantung dalam untuk menyimpan barang dengan rapi.",
        },
      ],
      faqs: [
        { question: "Apakah tas ini bisa dicuci?", answer: "Bisa, cuci dengan tangan menggunakan air dingin dan jangan diperas terlalu keras." },
        { question: "Berapa lama pengiriman?", answer: "Estimasi pengiriman 1-3 hari kerja tergantung metode pengiriman yang dipilih." },
        { question: "Apakah ada garansi?", answer: "Ya, garansi 30 hari untuk kerusakan produksi." },
      ],
    },
    {
      id: id(),
      name: "Pouch Kulit Multifungsi",
      slug: "pouch-kulit-multifungsi",
      shortDescription: "Pouch kulit serbaguna untuk kabel, alat tulis, dan kosmetik",
      description:
        "Pouch premium dari kulit PU berkualitas tinggi. Tersedia 3 ukuran, dengan ritsleting anti-seret YKK. Bagian dalam dilapisi bahan suede lembut untuk melindungi isi.\n\n**Spesifikasi:**\n- Bahan: Kulit PU premium\n- Ukuran: S (18x10cm), M (22x12cm), L (26x14cm)\n- Penutup: Ritsleting YKK\n- Warna: Cokelat Muda, Hitam, Burgundy",
      price: 89000,
      compareAtPrice: null,
      sku: "PKM-001",
      stockQuantity: 120,
      images: [
        {
          url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80",
          alt: "Pouch Kulit Multifungsi",
          sortOrder: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80",
          alt: "Pouch detail interior",
          sortOrder: 1,
        },
      ],
      bundles: [
        { quantity: 1, price: 89000, label: "1 Pouch", badge: null, isFeatured: false },
        { quantity: 2, price: 159000, label: "2 Pouch", badge: "Hemat 11%", isFeatured: true },
        { quantity: 3, price: 219000, label: "3 Pouch", badge: "Hemat 18%", isFeatured: false },
      ],
      features: [
        {
          imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&q=80",
          title: "Ritsleting Anti-Seret",
          description: "Menggunakan ritsleting YKK premium yang halus dan tahan lama.",
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=1000&q=80",
          title: "Lapisan Suede Lembut",
          description: "Bagian dalam dilapisi suede halus yang melindungi barang berharga dari goresan.",
        },
      ],
      faqs: [
        { question: "Ukuran mana yang paling laris?", answer: "Ukuran M paling banyak dipilih karena pas untuk kabel dan alat tulis sehari-hari." },
        { question: "Apakah tahan air?", answer: "Bahan kulit PU tahan terhadap cipratan air ringan, namun tidak disarankan terkena air berlebihan." },
      ],
    },
    {
      id: id(),
      name: "Tumbler Stainless Slim",
      slug: "tumbler-stainless-slim",
      shortDescription: "Tumbler stainless 500ml, jaga minuman tetap dingin 24 jam",
      description:
        "Tumbler vacuum-insulated dua dinding yang menjaga minuman panas hingga 12 jam dan dingin hingga 24 jam. Desain ramping muat di cup holder mobil. Mulut lebar mudah dibersihkan.\n\n**Spesifikasi:**\n- Bahan: Stainless steel 18/8\n- Kapasitas: 500ml\n- Dimensi: Ø7 x 25cm\n- BPA-free, food grade\n- Warna: Matte Black, Silver, Sage Green",
      price: 175000,
      compareAtPrice: 249000,
      sku: "TSS-001",
      stockQuantity: 60,
      images: [
        {
          url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
          alt: "Tumbler Stainless Slim",
          sortOrder: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1569534409608-b1b96e80d31a?w=800&q=80",
          alt: "Tumbler detail tutup",
          sortOrder: 1,
        },
      ],
      bundles: [
        { quantity: 1, price: 175000, label: "1 Tumbler", badge: null, isFeatured: false },
        { quantity: 2, price: 319000, label: "2 Tumbler", badge: "Hemat 9%", isFeatured: true },
        { quantity: 3, price: 449000, label: "3 Tumbler", badge: "Hemat 15%", isFeatured: false },
      ],
      features: [
        {
          imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1000&q=80",
          title: "Insulasi Vacuum Ganda",
          description: "Menjaga minuman dingin hingga 24 jam dan panas hingga 12 jam dengan dinding vacuum ganda.",
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1610725664285-7c57e6eea3ee?w=1000&q=80",
          title: "Desain Ramping",
          description: "Muat di cup holder mobil dan mudah dibawa ke mana saja.",
        },
      ],
      faqs: [
        { question: "Apakah aman untuk air panas?", answer: "Ya, tumbler ini aman digunakan untuk minuman panas maupun dingin." },
        { question: "Bagaimana cara membersihkannya?", answer: "Cuci dengan air sabun hangat, mulut lebar memudahkan pembersihan menyeluruh." },
      ],
    },
    {
      id: id(),
      name: "Notebook Dot Grid A5",
      slug: "notebook-dot-grid-a5",
      shortDescription: "Buku catatan dot grid 160 halaman, kertas ivory 90gsm",
      description:
        "Notebook berkualitas tinggi dengan kertas ivory 90gsm anti-bleed-through. Pola dot grid 5mm ideal untuk bullet journal, sketsa, dan catatan. Cover hardcover dengan layflat binding.\n\n**Spesifikasi:**\n- Ukuran: A5 (148 x 210mm)\n- Halaman: 160 halaman (80 lembar)\n- Kertas: Ivory 90gsm\n- Pola: Dot grid 5mm\n- Binding: Layflat, hardcover\n- Warna cover: Forest Green, Midnight Blue, Terracotta",
      price: 65000,
      compareAtPrice: null,
      sku: "NDA-001",
      stockQuantity: 200,
      images: [
        {
          url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
          alt: "Notebook Dot Grid A5",
          sortOrder: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1531346680769-a1d79b57de5e?w=800&q=80",
          alt: "Notebook halaman dalam",
          sortOrder: 1,
        },
      ],
      bundles: [
        { quantity: 1, price: 65000, label: "1 Notebook", badge: null, isFeatured: false },
        { quantity: 2, price: 119000, label: "2 Notebook", badge: "Hemat 8%", isFeatured: true },
        { quantity: 3, price: 165000, label: "3 Notebook", badge: "Hemat 15%", isFeatured: false },
      ],
      features: [
        {
          imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=1000&q=80",
          title: "Kertas Ivory 90gsm",
          description: "Anti-bleed-through, nyaman untuk menulis dengan berbagai jenis pena termasuk fountain pen.",
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=1000&q=80",
          title: "Layflat Binding",
          description: "Buku terbuka rata sepenuhnya, memudahkan menulis di halaman manapun.",
        },
      ],
      faqs: [
        { question: "Apakah cocok untuk bullet journal?", answer: "Sangat cocok, pola dot grid 5mm ideal untuk bullet journal dan sketsa." },
        { question: "Berapa jumlah halaman?", answer: "160 halaman (80 lembar) dengan kertas ivory 90gsm." },
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
      price: 18000,
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
    code: "HEMAT10",
    type: "percentage",
    value: 10,
    isActive: true,
  });
  console.log("✔ Discount code HEMAT10 (10%) created");

  console.log("\n✅ Seeding complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
