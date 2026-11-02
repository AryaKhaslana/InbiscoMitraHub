import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { api } from '../services/api';
import { formatRupiah } from '../lib/utils';
import { 
  ShieldCheck, 
  Clock, 
  Truck, 
  Boxes, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  Store, 
  TrendingUp, 
  AlertCircle,
  PackageCheck
} from 'lucide-react';

export default function Home({ setActiveNav }) {
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);

  const [topProducts, setTopProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    // Fetch products for fast moving preview
    api.getProducts()
      .then((data) => {
        if (data && data.products) {
          setTopProducts(data.products.slice(0, 4));
        }
      })
      .catch((err) => {
        console.error('Failed to load top products:', err);
      })
      .finally(() => {
        setProductsLoading(false);
      });
  }, []);

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;

    setTrackingLoading(true);
    setTrackingError(null);
    setTrackingResult(null);

    try {
      const res = await api.trackOrder(trackingInput.trim());
      setTrackingResult(res.order || res);
    } catch (err) {
      setTrackingError(err.message || 'Nomor resi/tracking code tidak ditemukan.');
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface via-surface-container-low to-surface pt-12 pb-20 border-b border-outline/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <span>Distributor Resmi Mayora FMCG Sidoarjo</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-on-surface tracking-tight leading-[1.15]">
                Rantai Pasok Cerdas, <br />
                <span className="text-primary">Stok Pasti Aman</span> Untuk Warung Anda.
              </h1>

              <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Platform B2B Inbisco MitraHub menghubungkan 1.250+ toko kelontong & grosir di 18 kecamatan Kabupaten Sidoarjo langsung dengan Depo Krian. Pengiriman 24 jam, harga distributor pabrik, dan sistem kedaluwarsa FEFO terjamin.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button 
                  onClick={() => setActiveNav('partnership')} 
                  size="lg" 
                  className="gap-2 shadow-md shadow-primary/25"
                >
                  <Store className="h-5 w-5" />
                  <span>Daftar Mitra Toko Sekarang</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <Button 
                  onClick={() => setActiveNav('products')} 
                  variant="outline" 
                  size="lg" 
                  className="gap-2"
                >
                  <Boxes className="h-5 w-5 text-primary" />
                  <span>Katalog Produk Grosir</span>
                </Button>
              </div>

              {/* Badges Guarantee */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-outline/10">
                <div className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>100% Asli Mayora</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>SLA Kirim 24 Jam</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Jaminan FEFO Baru</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Fasilitas TOP Tempo</span>
                </div>
              </div>
            </div>

            {/* Hero Quick Tracking Card & Stats */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="border-primary/20 shadow-xl bg-surface-container-lowest/90 backdrop-blur">
                <CardHeader className="pb-3 border-b border-outline/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      Lacak Pesanan Grosir Anda
                    </CardTitle>
                    <Badge variant="surface" className="text-[10px]">Real-time GPS</Badge>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Masukkan nomor kode pelacakan pesanan Anda (contoh: <span className="font-mono text-primary font-semibold">INB-2610-KR03</span>).
                  </p>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <form onSubmit={handleTrackOrder} className="flex gap-2">
                    <Input
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="INB-2610-KR03"
                      className="font-mono uppercase text-xs"
                    />
                    <Button type="submit" disabled={trackingLoading} size="sm" className="shrink-0 gap-1">
                      {trackingLoading ? 'Memeriksa...' : 'Lacak'}
                      <Search className="h-3.5 w-3.5" />
                    </Button>
                  </form>

                  {/* Tracking Error */}
                  {trackingError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                      <div>{trackingError}</div>
                    </div>
                  )}

                  {/* Tracking Result */}
                  {trackingResult && (
                    <div className="p-3 bg-surface-container rounded-lg border border-outline/10 text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold">
                        <span className="font-mono text-primary">{trackingResult.trackingCode}</span>
                        <Badge variant="success">{trackingResult.status}</Badge>
                      </div>
                      <div className="text-on-surface-variant">
                        <div>Toko: <strong className="text-on-surface">{trackingResult.storeName}</strong> ({trackingResult.district})</div>
                        <div>Total: <strong className="text-on-surface">{formatRupiah(trackingResult.totalAmount)}</strong> ({trackingResult.totalCartons} Dus)</div>
                      </div>
                      <div className="text-[11px] text-outline pt-1 border-t border-outline/10">
                        Pembaruan terakhir: {new Date(trackingResult.updatedAt || Date.now()).toLocaleTimeString('id-ID')} WIB
                      </div>
                    </div>
                  )}

                  <div className="pt-2 text-[11px] text-on-surface-variant flex items-center justify-between">
                    <span>Butuh bantuan armada?</span>
                    <button 
                      onClick={() => setActiveNav('contact')} 
                      className="text-primary font-bold hover:underline"
                    >
                      Hubungi Dispatcher
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline/10 text-center shadow-xs">
                  <div className="text-lg font-black text-primary">18</div>
                  <div className="text-[10px] text-on-surface-variant font-medium">Kecamatan Sidoarjo</div>
                </div>
                <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline/10 text-center shadow-xs">
                  <div className="text-lg font-black text-primary">1.250+</div>
                  <div className="text-[10px] text-on-surface-variant font-medium">Mitra Terhubung</div>
                </div>
                <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline/10 text-center shadow-xs">
                  <div className="text-lg font-black text-emerald-700">99.4%</div>
                  <div className="text-[10px] text-on-surface-variant font-medium">SLA Pengiriman</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 PILARS VALUE PROPOSITION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <Badge variant="tertiary" className="text-xs uppercase">Keunggulan Mitra</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Mengapa Toko Kelontong Memilih Inbisco MitraHub?
          </h2>
          <p className="text-sm text-on-surface-variant">
            Standar keandalan logistik tingkat prinsipal Mayora langsung di genggaman Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:border-primary/40 transition-all hover:shadow-md">
            <CardContent className="pt-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-on-surface">100% Produk Mayora Asli</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Semua SKU (Roma, Kopiko, Beng-Beng, Torabika) dipasok langsung dari pabrik Mayora DC Pasuruan & Cikupa dengan segel resmi.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 transition-all hover:shadow-md">
            <CardContent className="pt-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-on-surface">SLA Pengiriman 24 Jam</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Pesan hari ini sebelum pukul 15:00 WIB, armada Canter Depo Krian mengirimkan barang ke toko Anda keesokan paginya.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 transition-all hover:shadow-md">
            <CardContent className="pt-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <PackageCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-on-surface">Manajemen FEFO Ketat</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                First-Expired, First-Out. Jaminan produk yang Anda terima memiliki sisa masa kedaluwarsa panjang (&gt;10 bulan), bukan barang returan.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 transition-all hover:shadow-md">
            <CardContent className="pt-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-on-surface">Fasilitas TOP (Tempo 14 Hari)</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Mitra toko terverifikasi dapat menikmati plafon kredit fleksibel untuk menjaga arus kas warung tetap lancar tanpa modal macet.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAST MOVING SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="tertiary" className="text-xs uppercase">Produk Unggulan</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-1">
              SKU Terlaris Mayora (Fast Moving)
            </h2>
            <p className="text-sm text-on-surface-variant">
              Produk dengan perputaran harian tertinggi di warung se-Kabupaten Sidoarjo.
            </p>
          </div>
          <Button onClick={() => setActiveNav('products')} variant="outline" className="gap-2 shrink-0">
            <span>Buka Seluruh Katalog</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-surface-container rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topProducts.map((p) => (
              <Card key={p.id} className="overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all border-outline/10">
                <div className="p-4 bg-surface-container-low flex items-center justify-between border-b border-outline/5">
                  <span className="font-mono text-xs font-bold text-on-surface-variant">{p.sku}</span>
                  <Badge variant={p.stock > 100 ? 'success' : 'warning'} className="text-[10px]">
                    {p.stock > 100 ? 'Stok Melimpah' : 'Stok Terbatas'}
                  </Badge>
                </div>
                <CardContent className="p-4 space-y-2 flex-1">
                  <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">{p.category}</span>
                  <h3 className="font-bold text-base text-on-surface leading-snug line-clamp-2">{p.name}</h3>
                  <div className="text-xs text-on-surface-variant">Isi: {p.packaging}</div>
                  <div className="pt-2">
                    <div className="text-xs text-outline">Harga Karton (Dus):</div>
                    <div className="text-lg font-black text-primary">{formatRupiah(p.price)}</div>
                  </div>
                </CardContent>
                <div className="p-4 pt-0">
                  <Button 
                    onClick={() => setActiveNav('products')} 
                    variant="default" 
                    size="sm" 
                    className="w-full font-bold"
                  >
                    Pesan Grosir
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* PARTNERSHIP CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <Badge variant="tertiary" className="text-xs uppercase bg-white/20 text-white border-0">
              Pendaftaran Mitra Toko
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Ingin Menjadi Mitra Toko Resmi Mayora di Sidoarjo?
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              Daftarkan warung atau toko kelontong Anda sekarang melalui form 4 langkah mudah. Dapatkan kepastian suplai tanpa calo, margin grosir resmi, dan pengiriman gratis se-Sidoarjo.
            </p>
            <div className="pt-2">
              <Button 
                onClick={() => setActiveNav('partnership')} 
                variant="subtle" 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
              >
                Mulai Pendaftaran 4 Langkah
              </Button>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </section>
    </div>
  );
}
