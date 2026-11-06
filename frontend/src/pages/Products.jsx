import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  ShieldCheck,
  Printer
} from 'lucide-react';

export default function Products({ setActiveNav, initialCategory, onCategoryChange }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'Semua Kategori');

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    if (onCategoryChange) {
      onCategoryChange(cat);
    }
  };

  // Modal & Order State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [storePhone, setStorePhone] = useState('');
  const [storeName, setStoreName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orderError, setOrderError] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedProduct) {
        setSelectedProduct(null);
      }
    };
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProduct]);

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

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setOrderQuantity(product.minOrder || 1);
    setOrderSuccess(null);
    setOrderError(null);
  };
  const handleOpenDrawer = handleOpenModal;

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
            productId: selectedProduct.id,
            quantity: Number(orderQuantity),
          },
        ],
      };

      const res = await api.createOrder(payload);
      const createdOrder = res.order || res;
      setOrderSuccess(createdOrder);

      // Save to recent orders localStorage so it immediately appears in track-order
      try {
        const trackingCode = createdOrder.trackingCode || createdOrder.orderNumber || createdOrder.id;
        const existing = JSON.parse(localStorage.getItem('supplysync_mitra_recent_orders') || '[]');
        const newEntry = {
          code: trackingCode,
          storeName: storeName.trim() || 'Toko Mitra Sidoarjo',
          totalAmount: selectedProduct.price * orderQuantity,
          statusLabel: 'Pesanan Masuk (PO Depo)',
          date: new Date().toISOString(),
        };
        const updated = [newEntry, ...existing.filter((x) => x.code !== newEntry.code)].slice(0, 5);
        localStorage.setItem('supplysync_mitra_recent_orders', JSON.stringify(updated));
      } catch {}

      confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      setOrderError(err.message || 'Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handlePrintOrderInvoice = () => {
    if (!orderSuccess || !selectedProduct) return;
    const trackingCode = orderSuccess.trackingCode || orderSuccess.orderNumber || orderSuccess.id || 'INB-PO-2026';
    const currentDate = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const totalAmount = selectedProduct.price * orderQuantity;
    const dpp = Math.round(totalAmount / 1.11);
    const ppn = totalAmount - dpp;
    const payMethod = paymentMethod === 'TOP_14_DAYS' ? 'Tempo Pembayaran Mitra (TOP 14 Hari)' : 'Cash on Delivery (COD Tunai)';

    const printWin = window.open('', '_blank', 'width=800,height=900');
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Surat Pesanan Grosir - ${trackingCode}</title>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1b1c1c; padding: 40px; margin: 0; background: #fff; line-height: 1.5; }
          .header { border-bottom: 2.5px solid #a80000; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
          .title { font-size: 20px; font-weight: 800; color: #a80000; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
          .subtitle { font-size: 13px; color: #524341; margin-top: 4px; font-weight: 600; }
          .address { font-size: 11px; color: #7d6b68; margin-top: 4px; }
          .badge { display: inline-block; background: #e8f5e9; color: #1b5e20; border: 1px solid #c8e6c9; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 12px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px; background: #fdf8f7; padding: 16px; border-radius: 8px; border: 1px solid #f0e1df; }
          .meta-item { font-size: 12px; }
          .meta-label { color: #7d6b68; font-weight: 500; display: block; margin-bottom: 2px; }
          .meta-val { color: #1b1c1c; font-weight: 700; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12.5px; }
          th, td { border: 1px solid #e5d8d6; padding: 10px 14px; text-align: left; }
          th { background: #fbf5f4; font-weight: 700; color: #433332; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .totals-table { width: 50%; margin-left: auto; margin-bottom: 24px; }
          .totals-table td { padding: 8px 12px; }
          .grand-total { font-size: 15px; font-weight: 800; color: #a80000; background: #fdf8f7; }
          .footer-note { font-size: 11px; color: #7d6b68; line-height: 1.6; margin-top: 24px; border-top: 1px dashed #d5c4c2; padding-top: 14px; }
          .sign-area { display: flex; justify-content: space-between; margin-top: 36px; }
          .sign-box { text-align: center; width: 220px; }
          .sign-line { border-bottom: 1px solid #1b1c1c; margin-top: 55px; margin-bottom: 4px; }
          @media print { body { padding: 15px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">PT Inbisco Niagatama Semesta</h1>
            <div class="subtitle">Distributor Resmi Mayora Group — Cabang Krian (Sidoarjo)</div>
            <div class="address">Jl. Raya Ponokawan No. Km. 27 No. 8, Ponokawan, Kec. Krian, Kabupaten Sidoarjo 61262 (Telp: 031-8983290)</div>
          </div>
          <div style="text-align: right;">
            <div class="badge">SURAT PESANAN GROSIR (PO)</div>
            <div style="font-size: 11px; font-family: monospace; color: #7d6b68; margin-top: 6px;">${trackingCode}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Nomor Resi / Tracking Code:</span>
            <span class="meta-val" style="color: #a80000; font-family: monospace;">${trackingCode}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Waktu Pemesanan:</span>
            <span class="meta-val">${currentDate}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Nama Outlet Pemesan:</span>
            <span class="meta-val">${storeName || 'Toko Mitra Mayora'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Kontak WhatsApp:</span>
            <span class="meta-val" style="font-family: monospace;">${storePhone}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Metode Pembayaran:</span>
            <span class="meta-val">${payMethod}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Jadwal Keberangkatan:</span>
            <span class="meta-val" style="color: #1b5e20;">H+1 Terjadwal (Armada Depo Krian)</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50px;" class="text-center">No</th>
              <th>Deskripsi Produk & Kemasan</th>
              <th style="width: 140px;">Kode SKU</th>
              <th style="width: 90px;" class="text-center">Jumlah</th>
              <th style="width: 130px;" class="text-right">Harga Dus</th>
              <th style="width: 140px;" class="text-right">Total Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-center">1</td>
              <td>
                <strong>${selectedProduct.name}</strong>
                <div style="font-size: 11px; color: #7d6b68;">${selectedProduct.packSpec || 'Karton Standar Mayora'}</div>
              </td>
              <td style="font-family: monospace; font-size: 11px;">${selectedProduct.sku}</td>
              <td class="text-center font-bold"><strong>${orderQuantity} Karton</strong></td>
              <td class="text-right font-mono">${formatRupiah(selectedProduct.price)}</td>
              <td class="text-right font-mono"><strong>${formatRupiah(totalAmount)}</strong></td>
            </tr>
          </tbody>
        </table>

        <table class="totals-table">
          <tr>
            <td>Dasar Pengenaan Pajak (DPP):</td>
            <td class="text-right font-mono">${formatRupiah(dpp)}</td>
          </tr>
          <tr>
            <td>PPN 11% (Faktur Pajak Sah):</td>
            <td class="text-right font-mono">${formatRupiah(ppn)}</td>
          </tr>
          <tr class="grand-total">
            <td><strong>TOTAL FAKTUR RESMI:</strong></td>
            <td class="text-right font-mono"><strong>${formatRupiah(totalAmount)}</strong></td>
          </tr>
        </table>

        <div class="sign-area">
          <div class="sign-box">
            <div style="font-size: 11px; color: #7d6b68;">Dipesan Oleh (Mitra Toko)</div>
            <div class="sign-line"></div>
            <div style="font-size: 12px; font-weight: 700;">${storeName || 'Penanggung Jawab Toko'}</div>
            <div style="font-size: 10px; color: #7d6b68;">Cap / Tanda Tangan Outlet</div>
          </div>
          <div class="sign-box">
            <div style="font-size: 11px; color: #7d6b68;">Logistik & Pengiriman Cabang Krian</div>
            <div class="sign-line"></div>
            <div style="font-size: 12px; font-weight: 700;">Admin Distribusi Mayora</div>
            <div style="font-size: 10px; color: #7d6b68;">PT Inbisco Niagatama Semesta</div>
          </div>
        </div>

        <div class="footer-note">
          <strong>Catatan Operasional:</strong> Dokumen ini merupakan Surat Pesanan resmi yang diteruskan ke sistem warehouse loading bay Depot Krian. Pemeriksaan fisik segel karton dan tanda tangan Berita Acara Serah Terima (BAST) wajib dilakukan bersama kurir armada saat bongkar muat. Retur dus cacat diakomodasi 100% tanpa potongan biaya.
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="w-full bg-surface py-8">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Title & Eyebrow */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-surface-container-high">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1.5">
              Katalog Distributor Resmi · Cabang Krian Sidoarjo
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-on-surface tracking-tight">
              Katalog Produk FMCG Mayora
            </h1>
            <p className="text-sm text-on-surface-variant mt-1.5 max-w-2xl">
              Akses langsung stok master dus &amp; karton dari Depo Krian untuk toko kelontong, warkop, minimarket, dan agen grosir dengan harga distributor resmi.
            </p>
          </div>

          {/* Quick Access ke Status & Pelacakan Pesanan */}
          <button
            onClick={() => setActiveNav && setActiveNav('track-order')}
            className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low border border-surface-container-high hover:border-primary/50 text-on-surface transition-all shadow-xs shrink-0 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <Truck className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-on-surface">Status &amp; Lacak Pesanan</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Layanan Live"></span>
              </div>
              <span className="text-[11px] text-on-surface-variant block">Pantau resi &amp; progres armada PO toko</span>
            </div>
            <ArrowRight className="h-4 w-4 text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-transform ml-1" />
          </button>
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
                  onClick={() => { handleCategorySelect('Semua Kategori'); setSearchQuery(''); }}
                  className="text-xs text-primary hover:underline font-bold cursor-pointer"
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
                      onClick={() => handleCategorySelect(cat)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
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

            {/* Quick Card: Cek Status Pesanan Toko */}
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-4 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold font-display text-on-surface">Sudah Pesan Grosir?</h3>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Pantau langsung armada Suzuki Carry Box dan verifikasi tanda tangan serah terima e-POD toko.
              </p>
              <Button
                type="button"
                onClick={() => setActiveNav && setActiveNav('track-order')}
                variant="outline"
                className="w-full text-xs font-bold h-8 gap-1.5 border-primary/30 text-primary hover:bg-primary/5 cursor-pointer"
              >
                <span>Cek Status Pesanan</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
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
                    onClick={() => handleOpenModal(p)}
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
                          handleOpenModal(p);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-primary-container text-white text-xs font-bold hover:bg-secondary-container transition-colors shadow-2xs flex items-center gap-1.5"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>Pesan Grosir</span>
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
      {/* CENTERED PRODUCT DETAIL & B2B ORDER POPUP MODAL           */}
      {/* ========================================================= */}
      {selectedProduct && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop (Dark Dimming) */}
          <div
            onClick={() => setSelectedProduct(null)}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs anim-backdrop"
            aria-hidden="true"
          />

          {/* Centering Flex Container - Ensures true viewport center & smooth top-to-bottom scroll */}
          <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
            
            {/* Modal Card Panel */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden text-left anim-modal z-10 my-6 sm:my-8 flex flex-col"
            >
              {/* Header */}
              <div className="px-5 sm:px-6 py-4 border-b border-surface-container-high flex items-center justify-between bg-surface-container-lowest shrink-0">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2 text-xs text-outline mb-0.5">
                    <span className="font-semibold text-primary">{selectedProduct.category}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">{selectedProduct.sku}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold font-display text-on-surface truncate">
                    {selectedProduct.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="w-9 h-9 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors shrink-0"
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 space-y-5">
                {orderSuccess ? (
                  <div className="py-6 px-2 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-display text-on-surface">
                        Pesanan Grosir Berhasil Dibuat!
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                        Kode Pelacakan:{' '}
                        <strong className="font-mono text-primary text-sm">
                          {orderSuccess.trackingCode || orderSuccess.orderNumber || orderSuccess.id}
                        </strong>
                      </p>
                      <p className="text-xs text-on-surface-variant mt-2 max-w-sm mx-auto">
                        Sales representatif cabang Krian akan segera menghubungi WhatsApp Anda untuk konfirmasi jadwal armada pengiriman.
                      </p>
                    </div>
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                      <Button
                        type="button"
                        onClick={() => {
                          const code = orderSuccess.trackingCode || orderSuccess.orderNumber || orderSuccess.id;
                          setOrderSuccess(null);
                          setSelectedProduct(null);
                          if (setActiveNav) {
                            setActiveNav('track-order', code);
                          }
                        }}
                        className="text-xs font-bold px-5 gap-2 bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer w-full sm:w-auto py-2.5"
                      >
                        <Truck className="h-4 w-4" />
                        <span>Pantau Status Pesanan Sekarang</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        onClick={handlePrintOrderInvoice}
                        variant="outline"
                        className="text-xs font-bold px-5 gap-2 border-primary text-primary hover:bg-primary/5 transition-colors cursor-pointer w-full sm:w-auto py-2.5"
                      >
                        <Printer className="h-4 w-4" />
                        <span>Cetak Bukti PO (PDF)</span>
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setOrderSuccess(null);
                          setSelectedProduct(null);
                        }}
                        variant="ghost"
                        className="text-xs font-semibold px-4 cursor-pointer w-full sm:w-auto py-2.5 text-on-surface-variant hover:bg-surface-container"
                      >
                        Tutup
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Product Summary Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg bg-surface-container-lowest border border-surface-container flex items-center justify-center p-2 shrink-0 relative overflow-hidden mx-auto sm:mx-0">
                        <img
                          src={selectedProduct.image}
                          alt={selectedProduct.name}
                          className="max-h-full max-w-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <span className="text-xs font-bold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {formatRupiah(selectedProduct.price)} / dus
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            Ready di Depo Krian
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant line-clamp-2">
                          {selectedProduct.description}
                        </p>
                        <div className="text-[11px] text-outline flex flex-wrap justify-center sm:justify-start gap-x-3 gap-y-1">
                          <span>Kemasan: <strong className="text-on-surface">{selectedProduct.packSpec}</strong></span>
                          <span>Masa Simpan: <strong className="text-on-surface">{selectedProduct.shelfLife}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Order Form */}
                    <form onSubmit={handleSubmitOrder} className="space-y-4">
                      
                      {/* Quantity & Subtotal */}
                      <div className="p-3.5 rounded-xl border border-surface-container-high bg-surface-container-lowest flex items-center justify-between gap-4">
                        <div>
                          <label className="text-xs font-semibold text-on-surface block">
                            Jumlah Karton (Min. {selectedProduct.minOrder || 1} Dus)
                          </label>
                          <div className="text-sm font-bold font-display text-primary mt-0.5">
                            Total: {formatRupiah(selectedProduct.price * orderQuantity)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setOrderQuantity(Math.max(selectedProduct.minOrder || 1, orderQuantity - 1))}
                            className="w-8 h-8 rounded-lg border border-surface-variant bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container font-bold transition-colors cursor-pointer"
                            aria-label="Kurangi"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-10 text-center font-bold font-mono text-base">
                            {orderQuantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setOrderQuantity(orderQuantity + 1)}
                            className="w-8 h-8 rounded-lg border border-surface-variant bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container font-bold transition-colors cursor-pointer"
                            aria-label="Tambah"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Retail Profit & Margin Calculator (Sentuhan Bisnis Riil) */}
                      {(() => {
                        const estRetail = selectedProduct.retailPriceEst || Math.round(selectedProduct.price * 1.18);
                        const marginCarton = estRetail - selectedProduct.price;
                        const marginPct = Math.round((marginCarton / selectedProduct.price) * 100);
                        const totalProfit = marginCarton * orderQuantity;
                        return (
                          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                                <TrendingUp className="h-4 w-4 text-emerald-700" />
                                <span>Kalkulator Margin Toko Mitra</span>
                              </span>
                              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-300">
                                +{marginPct}% Margin Eceran
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-emerald-200/60 text-center">
                              <div>
                                <span className="text-[10px] text-emerald-800 font-medium block">Harga Modal B2B</span>
                                <span className="font-bold text-on-surface font-mono text-[11px]">{formatRupiah(selectedProduct.price)}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-emerald-800 font-medium block">Estimasi Jual Eceran</span>
                                <span className="font-bold text-on-surface font-mono text-[11px]">{formatRupiah(estRetail)}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-emerald-800 font-medium block">Potensi Cuan ({orderQuantity} Dus)</span>
                                <span className="font-bold text-emerald-700 font-mono text-xs">{formatRupiah(totalProfit)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Store Details Input with Quick Auto-fill */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold text-on-surface">
                              Nomor WhatsApp Toko <span className="text-error">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setStorePhone('081234567890');
                                setStoreName('Toko Berkah Barokah Krian');
                              }}
                              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                              title="Gunakan kontak toko uji untuk pengujian cepat"
                            >
                              <Sparkles className="h-3 w-3" />
                              <span>Auto-Fill Uji</span>
                            </button>
                          </div>
                          <Input
                            value={storePhone}
                            onChange={(e) => setStorePhone(e.target.value)}
                            placeholder="081234567890"
                            className="text-xs h-9"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-on-surface block mb-1">
                            Nama Toko / Pemilik (Opsional)
                          </label>
                          <Input
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            placeholder="Cth: Toko Berkah Jaya Krian"
                            className="text-xs h-9"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-on-surface block mb-1">
                          Metode Pembayaran
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full text-xs h-9 rounded-md border border-input bg-surface-container-lowest px-2.5 font-medium"
                        >
                          <option value="CASH_ON_DELIVERY">Cash on Delivery (Bayar Saat Barang Tiba)</option>
                          <option value="TOP_14_DAYS">Tempo Pembayaran Mitra (TOP 14 Hari)</option>
                        </select>
                      </div>

                      {orderError && (
                        <div className="p-2.5 rounded-lg bg-error-container text-on-error-container text-xs flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 text-error shrink-0" />
                          <span>{orderError}</span>
                        </div>
                      )}

                      <div className="pt-2">
                        <Button
                          type="submit"
                          disabled={submittingOrder}
                          className="w-full text-xs font-bold py-2.5 gap-2 shadow-sm"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          <span>{submittingOrder ? 'Memproses PO...' : 'Konfirmasi Pesanan Grosir'}</span>
                        </Button>
                      </div>

                      <p className="text-[10px] text-center text-outline">
                        Pesanan langsung terhubung ke sistem jadwal logistik armada Depo Krian (Sidoarjo).
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
