import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { api } from '../services/api';
import { formatRupiah } from '../lib/utils';
import confetti from 'canvas-confetti';
import { 
  Search, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  Truck, 
  Calendar, 
  X, 
  Plus, 
  Minus,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Store,
  ShieldCheck
} from 'lucide-react';

export default function Products({ setActiveNav }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');

  // Drawer & Order State
  const [drawerProduct, setDrawerProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [storePhone, setStorePhone] = useState('');
  const [storeName, setStoreName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orderError, setOrderError] = useState(null);

  // Fallback product data with rich specs, official Google Stitch CDN images, and actual DB UUIDs
  const defaultProducts = [
    {
      id: '4dbb8ed7-e34b-4c83-97e6-621c204fa0ef',
      sku: 'MYR-BIS-ROMAKELAPA-300',
      name: 'Roma Kelapa 300g',
      category: 'Biskuit',
      brand: 'Roma (PT Mayora Indah Tbk)',
      packSpec: '30 Pack × 300 gram',
      dimensions: '385 × 255 × 225 mm (Berat Bersih: 9.0 kg)',
      shelfLife: '12 Bulan dari Produksi',
      price: 215000,
      minOrder: 1,
      stock: 141,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkk8fB3gEbY_xd-o9C45zvfOEhoSpAXv4CkL_3q2PsBi1DAju0lIQ8uBAil3ZvBXnwSQNnrJ5SFkFRHObyk8vPXP-NGWBJFUcLDkTxx8qclXIt_YWa9iGPx1uGUmCZ0XObqeAS7awN4zEfGjvaIosOOnynUhgmWdelXbGW9JFs6MNXeiZ_mZ60ZZmzAwIol5aqIG6VeoC9vvg2eYZ-DrZE0S5JpFkoZxF2X-nh8kk',
      description: 'Biskuit kelapa renyah ikonik pilihan utama toko kelontong dan warung keluarga. Dibuat dengan kelapa asli segar pilihan serta diperkaya Vitamin B1, B2, B6, B12, dan E untuk camilan keluarga Indonesia.',
    },
    {
      id: '883bd11d-43d6-43b0-a048-f0ebcbbd2440',
      sku: 'MYR-WAF-BENGBENG-25',
      name: 'Beng-Beng Regular',
      category: 'Wafer & Cokelat',
      brand: 'Beng-Beng (PT Mayora Indah Tbk)',
      packSpec: '8 Box × 20 Pcs (160 Bar × 20g)',
      dimensions: '320 × 240 × 190 mm (Berat Bersih: 3.2 kg)',
      shelfLife: '12 Bulan dari Produksi',
      price: 268000,
      minOrder: 1,
      stock: 95,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCTnmr6rNnIkeLH5N6C6I3Ca--4HcgOrB2cqrgwVlj5Wm_EBc0aWhMUfIV8933PvVKjZaBI27Br1IOytLggToCx9ZmSW4J7i87iCGZYBV9v8ob0LQPtCxGuW30_DHH1ahfYcLvVe_Ae34ZcRST4lN2k9z5HkAprmGJtUEXJrvmMw8_pu71LM15lrmXuj2ixwGx7jHAByvaSoJlZ7TTkbmj48OWBH4YAPu4Mt1ypOY',
      description: 'Wafer cokelat kombinasi 4 kelezatan: wafer renyah, karamel lembut, rice crispy gurih, dan cokelat susu tebal Mayora. Produk fast-moving wajib untuk etalase warung dan minimarket.',
    },
    {
      id: '51a9e696-47d0-4234-9390-60199138e882',
      sku: 'MYR-KOP-TORABIKADUO-25',
      name: 'Torabika Duo',
      category: 'Kopi & Teh',
      brand: 'Torabika (PT Torabika Eka Semesta)',
      packSpec: '12 Renceng × 10 Sachet (120 Sachet × 25g)',
      dimensions: '350 × 260 × 210 mm (Berat Bersih: 3.0 kg)',
      shelfLife: '18 Bulan dari Produksi',
      price: 162000,
      minOrder: 1,
      stock: 210,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcZTQvuCY4GL_4SnLqRmcb0po5i2BaiaMWt83orotvE74fgBgPRyD_sYpFDon6Ndx_pYGhum4JDaILj_LzS7ARtybXJ3tHD0TykTm-at4LCTGwsCcraUZwizlO62hLPaNdIBcPbF6_13TKtqtNtiLOXkNyh7A_DazTHuenJkib8WSSL040M6lXdz9wFj-zSWHh5WhVwyECFatJfUsN7c_gLravCzIR2kJwYeMd6xg',
      description: 'Perpaduan kopi robusta mantap dengan gula murni pilihan yang harum dan pas. Menjadi komoditas utama warkop dan warung seduh di seluruh penjuru Kabupaten Sidoarjo.',
    },
    {
      id: '907edf79-a1c7-4725-b954-8d8b18f3c7d0',
      sku: 'MYR-PER-KOPIKO-150',
      name: 'Kopiko Coffee Candy',
      category: 'Permen',
      brand: 'Kopiko (PT Mayora Indah Tbk)',
      packSpec: '24 Bag × 150 gram',
      dimensions: '340 × 230 × 180 mm (Berat Bersih: 3.6 kg)',
      shelfLife: '24 Bulan dari Produksi',
      price: 186000,
      minOrder: 1,
      stock: 190,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRPC6qJVUYYDNy00uMaSCjaa0gecThqiireOyrKSWUu2BMrPx1Wn3o7qLRQCC9TnviHEEpwhgK1GPja_w86v4lJDas--FNQx4MmsH3mNVx87xtD1UgKS5gJVuxw5qX0Gg_nf2Q_poDT9uZDySYEnDCifTJu04p0oJ4kNNVCZHNqx_YCNrRwS5j_347fGZmytu2G7Cq5oF1PI6sYnfk8ARso7dyVqwJRihEIm-7-TQ',
      description: 'Permen kopi nomor satu di dunia yang terbuat dari ekstrak biji kopi asli pilihan. Sangat praktis sebagai pengganti kopi dan cemilan kasir toko kelontong.',
    },
    {
      id: '96cf9193-3131-4d82-82f3-4bb6bcfb6de6',
      sku: 'MYR-SER-ENERGENCOK-34',
      name: 'Energen Cokelat',
      category: 'Sereal & Minuman',
      brand: 'Energen (PT Torabika Eka Semesta)',
      packSpec: '16 Renceng × 10 Sachet (160 Sachet × 29g)',
      dimensions: '380 × 280 × 240 mm (Berat Bersih: 4.64 kg)',
      shelfLife: '12 Bulan dari Produksi',
      price: 274000,
      minOrder: 1,
      stock: 115,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_g0BwPpl1PJIZysGTw8s4pt7YeyIoG7iAEOtqKvySNbVtefexo7esKuJwt3EvReVNVKNkoS95rVMnSiY9kxHMT2xDot6dGSLUfozNfu5QIBwQKphKcd4GObxRskQVdajdYm_gKfPbQD0sp7GffTVkTIJbV9QO4HfDwPMgbpgkEWpkclA-kIFKCPl8GIak0gNgqEqVtmQKOzbhZNKpFy2BGGhq9MtlYX5z2aeWCjI',
      description: 'Minuman sereal dan susu bernutrisi dengan rasa cokelat lezat berenergi Sigmavit (Vitamin A, B1, B2, B6, B12, D, E, dan Kalsium). Pilihan sarapan sehat keluarga.',
    },
    {
      id: '80464a99-21b0-43c0-a0ec-9de87826d5ac',
      sku: 'MYR-AIR-LEMINERALE-600',
      name: 'Le Minerale 600ml',
      category: 'Air Mineral',
      brand: 'Le Minerale (PT Tirta Fresindo Jaya)',
      packSpec: 'Karton (24 Botol × 600ml)',
      dimensions: '400 × 270 × 230 mm (Berat Bersih: 14.4 kg)',
      shelfLife: '24 Bulan dari Produksi',
      price: 48500,
      minOrder: 2,
      stock: 450,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqizQO1bwJ3p0VB3nXYGVdpUPmOqZDUiGIj_ponHFYCKcvHUbjENITrJMCTs8cie92eE3P4KBTqe-wCiYmQM9mJceoV5lk7h6RHj0c8keEfJObfgrTHZX0truKM3D6oowDhIWIMghN-8_Fm5s3icrGt1mY-Ptm5ez0CDnij72AznlxJqEoOh82T6HR9EnHiUhOpzk8meh26J_a_pchFN6j6yfJuXqbRlbBUW_EIOQ',
      description: 'Air mineral alami pegunungan yang mengandung mineral esensial seimbang dan disegel dengan teknologi Mineral Protection System untuk menjaga kemurnian rasa manis alaminya.',
    },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProducts();
      if (res && res.products && res.products.length > 0) {
        // Merge with our rich local spec & image data
        const merged = res.products.map(p => {
          const foundDefault = defaultProducts.find(d => d.sku === p.sku || d.name.toLowerCase().includes(p.name.toLowerCase()));
          return foundDefault ? { ...foundDefault, ...p, image: foundDefault.image } : p;
        });
        setProducts(merged);
      } else {
        setProducts(defaultProducts);
      }
    } catch (err) {
      console.warn('API getProducts fallback to static defaultProducts:', err);
      setProducts(defaultProducts);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Semua Kategori',
    'Biskuit',
    'Wafer & Cokelat',
    'Kopi & Teh',
    'Permen',
    'Sereal & Minuman',
    'Air Mineral',
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === 'Semua Kategori' ||
      (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const handleOpenDrawer = (product) => {
    setDrawerProduct(product);
    setOrderQuantity(product.minOrder || 1);
    setOrderSuccess(null);
    setOrderError(null);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!storePhone.trim()) {
      setOrderError('Harap masukkan nomor WhatsApp toko Anda.');
      return;
    }

    setSubmittingOrder(true);
    setOrderError(null);

    try {
      const payload = {
        storePhone: storePhone.trim(),
        storeName: storeName.trim() || undefined,
        paymentMethod,
        items: [
          {
            productId: drawerProduct.id,
            quantity: Number(orderQuantity),
          },
        ],
      };

      const res = await api.createOrder(payload);
      setOrderSuccess(res.order || res);
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      setOrderError(err.message || 'Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="w-full bg-surface py-8">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Title & Eyebrow */}
        <div className="mb-8">
          <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1.5">
            Katalog Distributor Resmi · Cabang Krian Sidoarjo
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-on-surface tracking-tight">
            Katalog Produk FMCG Mayora
          </h1>
          <p className="text-sm text-on-surface-variant mt-1.5 max-w-2xl">
            Akses langsung stok master dus & karton dari Depo Krian untuk toko kelontong, warkop, minimarket, dan agen grosir dengan harga distributor resmi.
          </p>
        </div>

        {/* 2-COLUMN LAYOUT: Filter Sidebar (Left) + Search & Grid (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ======================================== */}
          {/* LEFT FILTER SIDEBAR (lg:col-span-3)      */}
          {/* ======================================== */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container-high mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">filter_alt</span>
                  <h2 className="text-sm font-bold font-display text-on-surface">Filter Produk</h2>
                </div>
                <button 
                  onClick={() => { setSelectedCategory('Semua Kategori'); setSearchQuery(''); }}
                  className="text-xs text-primary hover:underline font-bold"
                >
                  Reset
                </button>
              </div>

              {/* Kategori Radio / Checkbox List */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Kategori Produk
                </h3>
                {categories.map((cat, idx) => {
                  const count = cat === 'Semua Kategori' 
                    ? products.length 
                    : products.filter(p => p.category && p.category.toLowerCase().includes(cat.toLowerCase())).length;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                        selectedCategory === cat
                          ? 'bg-primary-container text-white font-bold'
                          : 'text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-surface-container text-on-surface-variant'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* B2B Logistics Specs Sidebar Box */}
              <div className="mt-6 pt-5 border-t border-surface-container-high space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Ketentuan Grosir B2B
                </h3>
                <div className="text-xs text-on-surface-variant space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Pembelian wajib format Karton / Master Dus</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Faktur resmi PPn 11% langsung atas nama toko</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Gratis ongkir rute rutin Sidoarjo min. 5 karton</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ======================================== */}
          {/* RIGHT PRODUCT GRID (lg:col-span-9)       */}
          {/* ======================================== */}
          <div className="lg:col-span-9 space-y-6">
            {/* Search Bar & Stats */}
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari biskuit, kopi, permen, SKU..."
                  className="pl-9 text-xs bg-surface-container-low h-9"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="text-xs text-on-surface-variant font-medium self-start sm:self-auto">
                Menampilkan <strong className="text-on-surface">{filteredProducts.length}</strong> produk FMCG aktif
              </div>
            </div>

            {/* Product Cards Grid */}
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-surface-container-high">
                <Package className="h-12 w-12 text-outline mx-auto mb-3" />
                <h3 className="text-base font-bold text-on-surface">Produk Tidak Ditemukan</h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Tidak ada produk yang cocok dengan pencarian "{searchQuery}". Silakan reset filter.
                </p>
                <Button 
                  onClick={() => { setSearchQuery(''); setSelectedCategory('Semua Kategori'); }}
                  variant="outline" 
                  size="sm" 
                  className="mt-4 text-xs"
                >
                  Reset Semua Filter
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleOpenDrawer(p)}
                    className="bg-surface-container-lowest rounded-xl border border-surface-container-high p-4 flex flex-col justify-between hover:border-primary-container hover:shadow-md transition-all duration-200 cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container text-on-surface font-semibold">
                          {p.category}
                        </span>
                        <span className="text-[10px] font-mono text-outline">{p.sku}</span>
                      </div>

                      <div className="relative h-44 rounded-lg bg-surface-container-low overflow-hidden mb-3.5 flex items-center justify-center p-3 border border-surface-container">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                          Ready Depo
                        </span>
                      </div>

                      <h3 className="text-base font-bold font-display text-on-surface group-hover:text-primary transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                        {p.description}
                      </p>
                      <div className="mt-2 text-xs font-medium text-outline">
                        Kemasan: <strong className="text-on-surface">{p.packSpec}</strong>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-surface-container-high flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-on-surface-variant">Harga Distributor / Dus</div>
                        <div className="text-base font-bold text-primary font-display">
                          {formatRupiah(p.price)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDrawer(p);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-secondary transition-colors shadow-2xs"
                      >
                        Pesan B2B
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SLIDE-OUT PRODUCT DRAWER (Stitch 08 Detail Modal)         */}
      {/* ========================================================= */}
      {drawerProduct && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setDrawerProduct(null)} 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6">
            <div className="w-screen max-w-xl bg-surface-container-lowest shadow-2xl flex flex-col justify-between border-l border-surface-container-high animate-in slide-in-from-right duration-300">
              {/* Drawer Header */}
              <div className="p-6 border-b border-surface-container-high flex items-center justify-between">
                <div>
                  <nav className="flex items-center space-x-1.5 text-xs text-outline mb-1">
                    <span>Katalog FMCG</span>
                    <span>/</span>
                    <span className="text-on-surface font-semibold">{drawerProduct.category}</span>
                  </nav>
                  <h2 className="text-xl font-bold font-display text-on-surface">
                    {drawerProduct.name}
                  </h2>
                </div>
                <button
                  onClick={() => setDrawerProduct(null)}
                  className="p-2 text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Product Image Showcase */}
                <div className="w-full h-56 bg-surface-container-low rounded-xl border border-surface-container-high flex items-center justify-center p-6 relative">
                  <img
                    src={drawerProduct.image}
                    alt={drawerProduct.name}
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-surface-container-lowest text-[10px] font-bold text-tertiary rounded border border-tertiary-container shadow-xs">
                    Distribusi Resmi Cabang Krian
                  </span>
                </div>

                {/* Deskripsi & Mutu Produk */}
                <div>
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Deskripsi & Mutu Produk
                  </h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {drawerProduct.description}
                  </p>
                </div>

                {/* Logistics & Packing Specifications Table */}
                <div>
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                    Spesifikasi Logistik & Kemasan
                  </h4>
                  <div className="border border-surface-container-high rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <tbody className="divide-y divide-surface-container">
                        <tr className="bg-surface-container-lowest">
                          <td className="py-2.5 px-4 text-outline font-medium w-1/3">Merek Prinsipal</td>
                          <td className="py-2.5 px-4 text-on-surface font-semibold">{drawerProduct.brand}</td>
                        </tr>
                        <tr className="bg-surface-container-low/40">
                          <td className="py-2.5 px-4 text-outline font-medium">Format Master Dus</td>
                          <td className="py-2.5 px-4 text-on-surface">{drawerProduct.packSpec}</td>
                        </tr>
                        <tr className="bg-surface-container-lowest">
                          <td className="py-2.5 px-4 text-outline font-medium">Dimensi Karton</td>
                          <td className="py-2.5 px-4 text-on-surface">{drawerProduct.dimensions}</td>
                        </tr>
                        <tr className="bg-surface-container-low/40">
                          <td className="py-2.5 px-4 text-outline font-medium">Masa Simpan (Shelf Life)</td>
                          <td className="py-2.5 px-4 text-on-surface font-semibold text-primary">{drawerProduct.shelfLife}</td>
                        </tr>
                        <tr className="bg-surface-container-lowest">
                          <td className="py-2.5 px-4 text-outline font-medium">Sertifikasi & Mutu</td>
                          <td className="py-2.5 px-4 text-on-surface flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>BPOM RI MD & Sertifikasi Halal Resmi</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Benefits for Retailers */}
                <div>
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                    Keuntungan untuk Mitra Toko & Ritel
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container-high">
                      <div className="flex items-center gap-1.5 text-primary font-bold text-xs mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>Perputaran Cepat</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        Demand harian stabil, stok tidak mengendap di etalase toko.
                      </p>
                    </div>
                    <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container-high">
                      <div className="flex items-center gap-1.5 text-primary font-bold text-xs mb-1">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Margin Terjamin</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        Struktur harga distributor pabrik dengan margin retail sehat.
                      </p>
                    </div>
                  </div>
                </div>

                {/* LIVE ORDER CREATION FORM */}
                <div className="pt-2 border-t border-surface-container-high">
                  <h4 className="text-sm font-bold font-display text-on-surface mb-3 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    <span>Pesan Langsung Grosir Depo Krian</span>
                  </h4>

                  {orderSuccess ? (
                    <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        <span>Pesanan B2B Berhasil Dibuat!</span>
                      </div>
                      <p className="text-xs text-emerald-800">
                        Nomor Pesanan: <strong className="font-mono text-emerald-950">{orderSuccess.orderNumber || orderSuccess.id}</strong>. Sales representatif kami akan segera menghubungi nomor WhatsApp Anda untuk konfirmasi jadwal armada.
                      </p>
                      <Button
                        onClick={() => {
                          setOrderSuccess(null);
                          setDrawerProduct(null);
                        }}
                        size="sm"
                        className="w-full text-xs font-bold mt-2"
                      >
                        Selesai & Tutup
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitOrder} className="space-y-3.5 bg-surface-container-low p-4 rounded-xl border border-surface-container-high">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-on-surface font-semibold">Jumlah Karton:</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                            className="w-7 h-7 rounded border border-surface-variant bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-surface-container font-bold"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-10 text-center font-bold font-mono text-sm">
                            {orderQuantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setOrderQuantity(orderQuantity + 1)}
                            className="w-7 h-7 rounded border border-surface-variant bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-surface-container font-bold"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-surface-container-high">
                        <span>Estimasi Total:</span>
                        <span className="text-primary text-base font-display">
                          {formatRupiah(drawerProduct.price * orderQuantity)}
                        </span>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-on-surface block mb-1">
                          Nomor WhatsApp Toko <span className="text-error">*</span>
                        </label>
                        <Input
                          value={storePhone}
                          onChange={(e) => setStorePhone(e.target.value)}
                          placeholder="081234567890"
                          className="text-xs h-9 bg-surface-container-lowest"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-on-surface block mb-1">
                          Nama Toko / Warkop (Opsional)
                        </label>
                        <Input
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          placeholder="Cth: Toko Barokah Krian"
                          className="text-xs h-9 bg-surface-container-lowest"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-on-surface block mb-1">
                          Metode Pembayaran
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full text-xs h-9 rounded-md border border-input bg-surface-container-lowest px-3 py-1 font-medium"
                        >
                          <option value="CASH_ON_DELIVERY">Cash on Delivery (Bayar Saat Barang Tiba)</option>
                          <option value="TRANSFER_BANK">Transfer Bank Virtual Account</option>
                          <option value="TOP_14_DAYS">Tempo Pembayaran Mitra (TOP 14 Hari)</option>
                        </select>
                      </div>

                      {orderError && (
                        <div className="text-xs text-error flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>{orderError}</span>
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={submittingOrder}
                        className="w-full text-xs font-bold py-2.5 gap-2 shadow-sm"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>{submittingOrder ? 'Memproses PO...' : 'Konfirmasi Pesanan Grosir'}</span>
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
