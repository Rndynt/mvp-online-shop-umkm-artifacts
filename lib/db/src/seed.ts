import { db } from "./index.js";
import {
  storesTable,
  productsTable,
  productImagesTable,
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
    },
  ];

  for (const product of products) {
    const { images, ...productData } = product;
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
