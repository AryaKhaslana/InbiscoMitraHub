import prisma from '../src/config/database.js';
import { CACHE_KEYS, invalidateCache } from '../src/config/redis.js';

/**
 * Helper to generate relative dates from current date (in months/days)
 * so FEFO alerts (< 3 months DANGER, < 6 months WARNING, >= 6 months SAFE)
 * are always accurately demonstrated regardless of when the seed runs.
 */
function addDaysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log('🌱 Starting Inbisco MitraHub database seed (Mayora FMCG & Sidoarjo Stores)...');

  // 1. Seed Partner Stores across Sidoarjo Districts (Krian, Taman, Waru, Sidoarjo, Candi, Gedangan)
  const storesSeed = [
    {
      name: 'Toko Kelontong Berkah Jaya',
      ownerName: 'H. Bambang Sutrisno',
      phone: '081234560001',
      district: 'Krian',
      address: 'Jl. Raya Krian No. 45, Pasar Krian Baru, Kec. Krian, Sidoarjo',
      isVerified: true,
    },
    {
      name: 'Warkop & Agen Kopi Cak Toni',
      ownerName: 'Ahmad Fatoni',
      phone: '081234560002',
      district: 'Taman',
      address: 'Jl. Raya Bebekan No. 18, Sepanjang, Kec. Taman, Sidoarjo',
      isVerified: true,
    },
    {
      name: 'Warung Sembako Bu Sri Rejeki',
      ownerName: 'Sri Wahyuni',
      phone: '081234560003',
      district: 'Waru',
      address: 'Jl. Brigjen Katamso No. 88, Wedoro, Kec. Waru, Sidoarjo',
      isVerified: true,
    },
    {
      name: 'Toko Grosir Sumber Makmur',
      ownerName: 'Hendra Wijaya',
      phone: '081234560004',
      district: 'Sidoarjo',
      address: 'Jl. Gajah Mada No. 112, Pekauman, Kec. Sidoarjo, Sidoarjo',
      isVerified: true,
    },
    {
      name: 'Warung Madura 24 Jam Al-Fath',
      ownerName: 'M. Rofik',
      phone: '081234560005',
      district: 'Candi',
      address: 'Jl. Raya Gelam No. 23, Kec. Candi, Sidoarjo',
      isVerified: false,
    },
    {
      name: 'Kedai & Warung Pojok Gedangan',
      ownerName: 'Siti Aminah',
      phone: '081234560006',
      district: 'Gedangan',
      address: 'Jl. Raya Gedangan No. 67, Keboansikep, Kec. Gedangan, Sidoarjo',
      isVerified: false,
    },
  ];

  const upsertedStores = [];
  for (const store of storesSeed) {
    const saved = await prisma.store.upsert({
      where: { phone: store.phone },
      update: {
        name: store.name,
        ownerName: store.ownerName,
        district: store.district,
        address: store.address,
        isVerified: store.isVerified,
      },
      create: store,
    });
    upsertedStores.push(saved);
  }
  console.log(`✅ Upserted ${upsertedStores.length} partner stores in Sidoarjo.`);

  // 2. Seed Mayora Official FMCG Products with varied FEFO expiry dates
  // - 2 products < 90 days (DANGER FEFO)
  // - 2 products between 90 and 180 days (WARNING FEFO)
  // - 4 products > 180 days (SAFE FEFO)
  const productsSeed = [
    {
      sku: 'MYR-BIS-ROMAKELAPA-300',
      name: 'Roma Biskuit Kelapa 300g (1 Karton x 24 Pak)',
      category: 'Biskuit',
      cartonPrice: 215000,
      retailPriceEst: 252000,
      stockCartons: 140,
      batchNumber: 'BATCH-RK-2601A',
      expiryDate: addDaysFromNow(45), // < 3 months -> DANGER FEFO
      imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
    },
    {
      sku: 'MYR-WAF-BENGBENG-25',
      name: 'Beng-Beng Wafer Caramel 25g (1 Karton x 8 Box x 17 Pcs)',
      category: 'Wafer & Cokelat',
      cartonPrice: 268000,
      retailPriceEst: 320000,
      stockCartons: 95,
      batchNumber: 'BATCH-BB-2602B',
      expiryDate: addDaysFromNow(72), // < 3 months -> DANGER FEFO
      imageUrl: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
    },
    {
      sku: 'MYR-KOP-TORABIKADUO-25',
      name: 'Kopi Torabika Duo 25g (1 Karton x 12 Renceng x 10 Sachet)',
      category: 'Kopi Instan',
      cartonPrice: 162000,
      retailPriceEst: 192000,
      stockCartons: 210,
      batchNumber: 'BATCH-TD-2604C',
      expiryDate: addDaysFromNow(120), // < 6 months -> WARNING FEFO
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
    },
    {
      sku: 'MYR-SER-ENERGENCOK-34',
      name: 'Energen Sereal Cokelat 34g (1 Karton x 16 Renceng x 10 Sachet)',
      category: 'Sereal & Nutrisi',
      cartonPrice: 274000,
      retailPriceEst: 320000,
      stockCartons: 115,
      batchNumber: 'BATCH-EN-2605A',
      expiryDate: addDaysFromNow(155), // < 6 months -> WARNING FEFO
      imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
    },
    {
      sku: 'MYR-AIR-LEMINERALE-600',
      name: 'Le Minerale Air Mineral 600ml (1 Karton x 24 Botol)',
      category: 'Minuman & AMDK',
      cartonPrice: 48500,
      retailPriceEst: 72000,
      stockCartons: 450,
      batchNumber: 'BATCH-LM-2609A',
      expiryDate: addDaysFromNow(320), // > 6 months -> SAFE FEFO
      imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
    },
    {
      sku: 'MYR-MIN-TEHPUCUK-350',
      name: 'Teh Pucuk Harum Melati 350ml (1 Karton x 24 Botol)',
      category: 'Minuman & AMDK',
      cartonPrice: 64000,
      retailPriceEst: 84000,
      stockCartons: 380,
      batchNumber: 'BATCH-TP-2608B',
      expiryDate: addDaysFromNow(275), // > 6 months -> SAFE FEFO
      imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
    },
    {
      sku: 'MYR-BIS-MALKISTABON-135',
      name: 'Roma Malkist Abon 135g (1 Karton x 30 Pak)',
      category: 'Biskuit',
      cartonPrice: 198000,
      retailPriceEst: 240000,
      stockCartons: 165,
      batchNumber: 'BATCH-MA-2607D',
      expiryDate: addDaysFromNow(240), // > 6 months -> SAFE FEFO
      imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
    },
    {
      sku: 'MYR-PER-KOPIKO-150',
      name: 'Permen Kopiko Coffee Candy (1 Karton x 24 Pak x 50 Butir)',
      category: 'Permen',
      cartonPrice: 186000,
      retailPriceEst: 228000,
      stockCartons: 190,
      batchNumber: 'BATCH-KP-2610A',
      expiryDate: addDaysFromNow(360), // > 6 months -> SAFE FEFO
      imageUrl: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
    },
  ];

  const upsertedProducts = [];
  for (const prod of productsSeed) {
    const saved = await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {
        name: prod.name,
        category: prod.category,
        cartonPrice: prod.cartonPrice,
        retailPriceEst: prod.retailPriceEst,
        stockCartons: prod.stockCartons,
        batchNumber: prod.batchNumber,
        expiryDate: prod.expiryDate,
        imageUrl: prod.imageUrl,
        isAvailable: prod.isAvailable,
      },
      create: prod,
    });
    upsertedProducts.push(saved);
  }
  console.log(`✅ Upserted ${upsertedProducts.length} Mayora FMCG products with FEFO batches.`);

  // 3. Seed Sample Wholesale Orders with non-predictable 8-char tracking codes
  const [storeKrian, storeTaman, storeWaru] = upsertedStores;
  const [roma, bengbeng, torabika, energen, leMinerale, tehPucuk] = upsertedProducts;

  // Remove old predictable 4-char seed orders if they exist
  await prisma.order.deleteMany({
    where: {
      trackingCode: {
        in: ['INB-2610-KR01', 'INB-2610-TM02', 'INB-2610-WR03'],
      },
    },
  });

  const existingOrderCount = await prisma.order.count();
  if (existingOrderCount === 0) {
    const sampleOrders = [
      {
        trackingCode: 'INB-2610-K8R4M9P2',
        storeId: storeKrian.id,
        paymentMethod: 'COD',
        status: 'COMPLETED',
        notes: 'Kirim pagi sebelum jam 10 ke Pasar Krian Baru',
        items: [
          { product: leMinerale, quantity: 10 },
          { product: roma, quantity: 4 },
          { product: torabika, quantity: 5 },
        ],
      },
      {
        trackingCode: 'INB-2610-T7M3W6Q9',
        storeId: storeTaman.id,
        paymentMethod: 'TEMPO_7_DAYS',
        status: 'PACKING',
        notes: 'Stok warkop mingguan, titip kasir',
        items: [
          { product: torabika, quantity: 8 },
          { product: energen, quantity: 3 },
          { product: bengbeng, quantity: 4 },
        ],
      },
      {
        trackingCode: 'INB-2610-W5R8N2X7',
        storeId: storeWaru.id,
        paymentMethod: 'COD',
        status: 'PENDING',
        notes: 'Mohon dipilihkan dus yang mulus',
        items: [
          { product: tehPucuk, quantity: 12 },
          { product: leMinerale, quantity: 15 },
          { product: roma, quantity: 3 },
        ],
      },
    ];

    for (const sample of sampleOrders) {
      const itemsData = sample.items.map(({ product, quantity }) => {
        const unitPrice = Number(product.cartonPrice);
        const subtotal = Number((unitPrice * quantity).toFixed(2));
        return {
          productId: product.id,
          quantity,
          unitPrice,
          subtotal,
        };
      });

      const totalAmount = itemsData.reduce((sum, i) => sum + i.subtotal, 0);

      await prisma.order.create({
        data: {
          trackingCode: sample.trackingCode,
          storeId: sample.storeId,
          totalAmount,
          paymentMethod: sample.paymentMethod,
          status: sample.status,
          notes: sample.notes,
          items: {
            create: itemsData,
          },
        },
      });
    }

    console.log(`✅ Created ${sampleOrders.length} sample wholesale orders (INB-2610-K8R4M9P2, INB-2610-T7M3W6Q9, INB-2610-W5R8N2X7).`);
  } else {
    console.log(`ℹ️ Skipping sample orders creation (${existingOrderCount} orders already in database).`);
  }

  // 4. Clear Redis caches so fresh data is served immediately
  await invalidateCache(CACHE_KEYS.CATALOG_PUBLIC, CACHE_KEYS.KPI_SUMMARY);
  console.log('🧹 Invalidated Upstash Redis caches (cache:catalog_public, cache:kpi_summary).');
  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

