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
  Minus 
} from 'lucide-react';

export default function Products({ setActiveNav }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Order Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [storePhone, setStorePhone] = useState('');
  const [storeName, setStoreName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orderError, setOrderError] = useState(null);

  const categories = ['Semua', 'Biskuit', 'Permen', 'Cokelat', 'Kopi', 'Mi Instan'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProducts();
      setProducts(res.products || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat katalog produk.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'Semua' ||
      (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenOrder = (product) => {
    setSelectedProduct(product);
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
            productId: selectedProduct.id,
            quantity: Number(orderQuantity),
          },
        ],
      };

      const res = await api.createOrder(payload);
      setOrderSuccess(res.order || res);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      setOrderError(err.message || 'Gagal mengirim pesanan grosir. Pastikan toko terdaftar atau hubungi admin.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* HEADER TITLE */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="tertiary" className="text-xs uppercase">Harga Prinsipal Mayora</Badge>
          <span className="text-xs text-on-surface-variant">• Depo Krian KM 29 Sidoarjo</span>
        </div>
        <h1 className="text-3xl font-black text-on-surface tracking-tight">Katalog Grosir Resmi Mayora</h1>
        <p className="text-sm text-on-surface-variant max-w-2xl">
          Seluruh produk dikirim langsung dalam satuan karton (dus) dengan segel orisinal pabrik. Jaminan FEFO (First-Expired, First-Out) aktif untuk setiap batch.
        </p>
      </div>

      {/* SEARCH & CATEGORY BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-surface-container-low rounded-xl border border-outline/10">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari SKU atau nama produk..."
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* PRODUCTS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-72 bg-surface-container rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl space-y-3">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
          <div className="font-bold text-red-800">{error}</div>
          <Button onClick={fetchProducts} variant="outline" size="sm">
            Coba Lagi
          </Button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-low rounded-xl space-y-3">
          <Package className="h-10 w-10 text-outline mx-auto" />
          <h3 className="font-bold text-on-surface">Produk Tidak Ditemukan</h3>
          <p className="text-xs text-on-surface-variant">
            Coba gunakan kata kunci pencarian yang lain atau pilih kategori Semua.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const hasStock = (p.stock || 0) > 0;
            return (
              <Card key={p.id} className="flex flex-col justify-between overflow-hidden hover:shadow-md transition-all border-outline/10">
                <div className="p-4 bg-surface-container-low flex items-center justify-between border-b border-outline/5">
                  <span className="font-mono text-xs font-bold text-on-surface-variant">{p.sku}</span>
                  <Badge variant={hasStock ? 'success' : 'destructive'} className="text-[10px]">
                    {hasStock ? `${p.stock} Karton Tersedia` : 'Stok Habis'}
                  </Badge>
                </div>

                <CardContent className="p-5 space-y-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider">{p.category}</span>
                    {p.expiryDate && (
                      <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Exp: {new Date(p.expiryDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-on-surface leading-tight line-clamp-2">
                    {p.name}
                  </h3>

                  <div className="text-xs text-on-surface-variant space-y-0.5">
                    <div>Kemasan: <span className="font-semibold text-on-surface">{p.packaging || 'Karton'}</span></div>
                    <div>Min. Order: <span className="font-semibold text-on-surface">{p.minOrder || 1} Karton</span></div>
                  </div>

                  <div className="pt-3 border-t border-outline/10">
                    <div className="text-xs text-outline font-medium">Harga Grosir Resmi:</div>
                    <div className="text-xl font-black text-primary">{formatRupiah(p.price)} <span className="text-xs font-normal text-on-surface-variant">/ dus</span></div>
                  </div>
                </CardContent>

                <div className="p-4 pt-0">
                  <Button
                    onClick={() => handleOpenOrder(p)}
                    disabled={!hasStock}
                    size="sm"
                    className="w-full font-bold gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Pesan Grosir</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* QUICK ORDER MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline/15 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-surface-container-low border-b border-outline/10 flex items-center justify-between">
              <div>
                <Badge variant="tertiary" className="text-[10px] uppercase font-bold">Checkout Grosir Resmi</Badge>
                <h3 className="font-bold text-lg text-on-surface mt-1">{selectedProduct.name}</h3>
                <span className="font-mono text-xs text-outline">{selectedProduct.sku}</span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {orderSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-on-surface">Pesanan Berhasil Terkirim!</h4>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Pesanan Anda sedang diproses oleh Dispatcher Depo Krian Mayora.
                    </p>
                  </div>

                  <div className="p-4 bg-surface-container rounded-xl border border-outline/10 text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Kode Tracking:</span>
                      <strong className="font-mono text-primary text-sm">{orderSuccess.trackingCode}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Total Pembayaran:</span>
                      <strong className="text-on-surface">{formatRupiah(orderSuccess.totalAmount)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Metode:</span>
                      <span className="font-semibold text-on-surface">{orderSuccess.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <Button 
                      onClick={() => {
                        setSelectedProduct(null);
                        setActiveNav('home');
                      }}
                      className="w-full font-bold"
                    >
                      Kembali ke Beranda
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  {orderError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>{orderError}</div>
                    </div>
                  )}

                  {/* Quantity selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface">Jumlah Karton (Dus)</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setOrderQuantity(Math.max((selectedProduct.minOrder || 1), orderQuantity - 1))}
                        className="h-9 w-9 rounded-lg border border-outline/20 bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <Input
                        type="number"
                        min={selectedProduct.minOrder || 1}
                        max={selectedProduct.stock || 999}
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="text-center font-bold text-base h-9 w-24"
                      />
                      <button
                        type="button"
                        onClick={() => setOrderQuantity(Math.min((selectedProduct.stock || 999), orderQuantity + 1))}
                        className="h-9 w-9 rounded-lg border border-outline/20 bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <span className="text-xs text-on-surface-variant">
                        Maks. {selectedProduct.stock} dus
                      </span>
                    </div>
                  </div>

                  {/* Price Calculation Box */}
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline/10 text-xs flex items-center justify-between">
                    <div>
                      <div className="text-outline">Subtotal Pesanan:</div>
                      <div className="text-lg font-black text-primary">
                        {formatRupiah((selectedProduct.price || 0) * orderQuantity)}
                      </div>
                    </div>
                    <Badge variant="surface" className="text-[10px]">Gratis Ongkir Sidoarjo</Badge>
                  </div>

                  {/* Store Information */}
                  <div className="space-y-3 pt-2 border-t border-outline/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-outline">Identitas Mitra Toko</h4>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-on-surface">Nomor WhatsApp Terdaftar</label>
                      <Input
                        value={storePhone}
                        onChange={(e) => setStorePhone(e.target.value)}
                        placeholder="081234567890"
                        className="text-xs"
                        required
                      />
                      <p className="text-[11px] text-outline">
                        Gunakan nomor toko yang sudah terdaftar atau ketik nama toko di bawah jika belum terdaftar.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-on-surface">Nama Warung / Toko (Opsional)</label>
                      <Input
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Toko Berkah Barokah Krian"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-on-surface">Metode Pembayaran</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-outline/20 bg-surface-container-low text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="CASH_ON_DELIVERY">Cash on Delivery (Bayar Tunai Saat BAST Tiba)</option>
                        <option value="BANK_TRANSFER">Transfer Bank BCA / Mandiri Mayora Inbisco</option>
                        <option value="CREDIT_TERMS">Plafon Tempo (TOP 14 Hari - Khusus Mitra Terverifikasi)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedProduct(null)}
                      className="w-1/3"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={submittingOrder}
                      className="w-2/3 font-bold gap-2"
                    >
                      {submittingOrder ? 'Memproses Pesanan...' : 'Konfirmasi Pesanan Grosir'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
