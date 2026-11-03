import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { api } from '../services/api';
import { formatRupiah } from '../lib/utils';
import { 
  Truck, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  PackageCheck,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';

export default function Home({ setActiveNav }) {
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);

  const sampleTrackingCodes = [
    { code: 'INB-2610-KR06', label: 'Toko Makmur', status: 'Packing' },
    { code: 'INB-2610-KR05', label: 'Minimarket Barokah', status: 'Selesai' },
    { code: 'INB-2611-C7CHLQND', label: 'Pesanan Baru', status: 'Pending' },
  ];

  const handleTrackWithCode = async (code) => {
    const query = code.trim().toUpperCase();
    setTrackingInput(query);
    setTrackingLoading(true);
    setTrackingError(null);
    setTrackingResult(null);

    try {
      const res = await api.trackOrder(query);
      setTrackingResult(res.order || res);
    } catch (err) {
      setTrackingError(err.message || 'Nomor resi/tracking code tidak ditemukan.');
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;
    await handleTrackWithCode(trackingInput);
  };

  const featuredProducts = [
    {
      category: 'Biskuit',
      name: 'Roma Kelapa 300g',
      sku: 'MYR-RMK-01',
      pack: 'Karton (30 Roll)',
      price: 239000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX82eOYLKVWquXOSZbuJ03d2ZBQolx7wPPPV2ecCusG0DnhnW3-qhRLNJq1e8rZIMBxhwU_NgDS1Hmjxz8rFGOGYaIIIPjJSTrA66anbiehdb9c6CJkaN8uiotXowYkLcdDNqCLfVZjkjnngWgeKi3odNFh3LVoLjRYiWUAAm563B2cnb_Z7xVgz1EfDf28ksf9f3E8z4RRcxhh8pXzKpwI_Qfr2vZ1Ouex1q2CLk',
    },
    {
      category: 'Wafer & Cokelat',
      name: 'Beng-Beng Regular',
      sku: 'MYR-BBG-02',
      pack: 'Karton (8 Box x 20 Pcs)',
      price: 295000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVONZHYyqYp_IAS7PTpYpxjiQz7nokCI44aQPJJrBEyUMoXak6pEZdQigpSERPL6Op8w_rD14kc8jPXAR9povlHYSC_0MupO4V3fQU4wQTCH-FKHO-RYAWoLSG3dm5Ch5_U8WYM66z_65v9D0VqpaZLc2c_JBD6S8ZM33W7TNCGg-KigNhD9uAh20DAa0aLBG5D72WZ_HySo7fqQU1wKceCIhiB7f9VjPoUK0k8Wc',
    },
    {
      category: 'Kopi & Teh',
      name: 'Torabika Duo',
      sku: 'MYR-TBD-03',
      pack: 'Karton (12 Renceng x 10 Sachet)',
      price: 138000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC40oSJaOlq5P3FLnYoLSeuF-gXEX2QfMxboCOnaxfKYbSyPod20KMdOL-I6CLYJhrsP4soICbrHHhk768kwJtadlchRsczqvusdIx1IyCkzUiIMNi-emEVlSRt_PYdV2T49og9zTOU895egcWh5uY8psM-WaQZnQzCrwQsTzJGWtQoENKbhClASS2dco4SSnSnDXIr5bzGNvdTykwnMawiQeJBTBQiUPumhho02PA',
    },
    {
      category: 'Permen',
      name: 'Kopiko Coffee Candy',
      sku: 'MYR-KPK-04',
      pack: 'Karton (24 Bag x 150g)',
      price: 182000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcUl8Rfyocs6JT6wiosku_m3S1Njs-AfTBBdIrR38wSJABjEByqZXL5n-Ma94nfP_E3IfEejvC3TvKpQws8MOOsY2he1VviZ9A5Aly9166mndNHSzcDv5nEYHkdp5xLYNGXtlgiisezmqE5fhPDJlQTBj3U5sPCuginjOTt3FFa-VV8XfnnyK9e69s0C7zr98CTsLZMGZEZadmjbZKmC_RJVEmsWy7DynAN9WuGZQ',
    },
    {
      category: 'Sereal & Minuman',
      name: 'Energen Cokelat',
      sku: 'MYR-ENG-05',
      pack: 'Karton (16 Renceng x 10 Sachet)',
      price: 248000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCItX9aSc5wkgCofcKzLwyFZ-AS5EacGA7N961CKzog82So-L4uL0kg0y4_0G8n_BdFN_v2YvMm4U9lK9XhsjsPDwtdu0k33vAtFbUuTHvwZBFFsN8tkyvBS7jCloi8-dYEHPVk2s01Py0Gv46q9_aJIwFCG_InMJHDNd8S-qnIAFEj3xyrlG_vIXOyM3Afae39oHvVTsyYm052S_89xOuBsZiQrNKhFysid_omHwo',
    },
    {
      category: 'Air Mineral',
      name: 'Le Minerale 600ml',
      sku: 'MYR-LMN-06',
      pack: 'Karton (24 Botol)',
      price: 49500,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqizQO1bwJ3p0VB3nXYGVdpUPmOqZDUiGIj_ponHFYCKcvHUbjENITrJMCTs8cie92eE3P4KBTqe-wCiYmQM9mJceoV5lk7h6RHj0c8keEfJObfgrTHZX0truKM3D6oowDhIWIMghN-8_Fm5s3icrGt1mY-Ptm5ez0CDnij72AznlxJqEoOh82T6HR9EnHiUhOpzk8meh26J_a_pchFN6j6yfJuXqbRlbBUW_EIOQ',
    },
  ];

  return (
    <div className="w-full space-y-0">
      {/* ========================================================= */}
      {/* SECTION 0: HERO SECTION (Stitch 13_inbisco_mitrahub_beranda) */}
      {/* ========================================================= */}
      <section className="relative bg-surface-container-low border-b border-surface-container-high overflow-hidden py-14 lg:py-20">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy & Actions */}
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                Jaringan Logistik Resmi · Cabang Krian Sidoarjo
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-on-surface tracking-tight leading-[1.15]">
                Distribusi Produk FMCG Andal untuk Mitra Usaha Anda.
              </h1>

              <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Temukan peluang kemitraan distribusi bersama Inbisco dan kembangkan bisnis Anda melalui produk berkualitas serta jaringan distribusi yang terpercaya di Kabupaten Sidoarjo dan sekitarnya.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveNav('partnership')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary-container text-white text-sm font-bold hover:bg-secondary-container transition-all duration-200 shadow-sm active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                  <span>Daftar Kemitraan</span>
                </button>

                <button
                  onClick={() => setActiveNav('products')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-surface-variant bg-surface-container-lowest text-on-surface text-sm font-bold hover:bg-surface-container transition-colors shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[20px] text-primary">inventory_2</span>
                  <span>Lihat Katalog Produk</span>
                </button>
              </div>

              {/* Guarantees Badges */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-surface-container-high text-xs font-semibold text-on-surface">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
                  <span>100% Asli Mayora</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">schedule</span>
                  <span>SLA Kirim 24 Jam</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">inventory</span>
                  <span>Rotasi FEFO Baru</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">receipt_long</span>
                  <span>Faktur Pajak Sah</span>
                </div>
              </div>

              {/* LIVE TRACKING WIDGET */}
              <div className="pt-2">
                <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-primary" />
                      Lacak Surat Jalan / Resi Pengiriman
                    </span>
                    <span className="text-[10px] font-mono font-bold text-primary-container bg-primary-container/10 px-2 py-0.5 rounded">
                      GPS LIVE
                    </span>
                  </div>
                  <form onSubmit={handleTrackOrder} className="flex gap-2">
                    <Input
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="Cth: INB-2610-KR06..."
                      className="text-xs h-9 bg-surface-container-low"
                    />
                    <Button type="submit" size="sm" disabled={trackingLoading} className="h-9 px-4 text-xs font-bold shrink-0">
                      {trackingLoading ? 'Mencari...' : 'Lacak'}
                    </Button>
                  </form>

                  {/* Quick Preset Tracking Code Chips */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-on-surface-variant font-semibold flex items-center gap-1 text-[11px]">
                      <Sparkles className="h-3 w-3 text-primary" />
                      Contoh Resi:
                    </span>
                    {sampleTrackingCodes.map((s) => (
                      <button
                        key={s.code}
                        type="button"
                        onClick={() => handleTrackWithCode(s.code)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
                          trackingInput === s.code
                            ? 'bg-primary-container text-white font-bold shadow-2xs'
                            : 'bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-on-surface hover:text-primary'
                        }`}
                        title={`Cek status ${s.label}`}
                      >
                        <span>{s.code}</span>
                        <span className={trackingInput === s.code ? 'text-white/90 font-medium' : 'text-on-surface-variant font-medium'}>
                          ({s.status})
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Tracking Result Display */}
                  {trackingError && (
                    <div className="mt-2.5 text-xs text-error flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{trackingError}</span>
                    </div>
                  )}

                  {trackingResult && (
                    <div className="mt-3 p-3.5 bg-surface-container-low rounded-xl border border-surface-container-high text-xs space-y-2.5 animate-in fade-in">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-primary text-sm">
                          {trackingResult.trackingCode || trackingResult.orderNumber || trackingResult.id}
                        </span>
                        <Badge variant="tertiary" className="text-[10px] uppercase font-bold">
                          {trackingResult.statusLabel || trackingResult.deliveryStatus || trackingResult.status || 'DALAM PERJALANAN'}
                        </Badge>
                      </div>

                      {/* Visual 5-Step Order Journey Bar */}
                      <div className="py-1">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-outline mb-1">
                          <span className={['PENDING', 'CONFIRMED', 'PACKING', 'DISPATCHED', 'COMPLETED'].includes((trackingResult.status || '').toUpperCase()) ? 'text-primary font-bold' : ''}>Diterima</span>
                          <span className={['CONFIRMED', 'PACKING', 'DISPATCHED', 'COMPLETED'].includes((trackingResult.status || '').toUpperCase()) ? 'text-primary font-bold' : ''}>Konfirmasi</span>
                          <span className={['PACKING', 'DISPATCHED', 'COMPLETED'].includes((trackingResult.status || '').toUpperCase()) ? 'text-primary font-bold' : ''}>Packing</span>
                          <span className={['DISPATCHED', 'COMPLETED'].includes((trackingResult.status || '').toUpperCase()) ? 'text-primary font-bold' : ''}>Armada</span>
                          <span className={['COMPLETED'].includes((trackingResult.status || '').toUpperCase()) ? 'text-emerald-700 font-bold' : ''}>Tiba</span>
                        </div>
                        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden flex">
                          <div
                            className="bg-primary-container h-full transition-all duration-500 rounded-full"
                            style={{
                              width: (trackingResult.status || '').toUpperCase() === 'COMPLETED' ? '100%'
                                : (trackingResult.status || '').toUpperCase() === 'DISPATCHED' ? '80%'
                                : (trackingResult.status || '').toUpperCase() === 'PACKING' ? '60%'
                                : (trackingResult.status || '').toUpperCase() === 'CONFIRMED' ? '40%'
                                : '20%',
                            }}
                          />
                        </div>
                      </div>

                      <div className="text-on-surface-variant">
                        Toko: <strong className="text-on-surface">{trackingResult.store?.name || trackingResult.storeName}</strong> ({trackingResult.store?.district || trackingResult.district || 'Sidoarjo'})
                      </div>
                      {trackingResult.itemsSummary && (
                        <div className="text-[11px] text-on-surface-variant">
                          Muatan: <span className="font-medium text-on-surface">{trackingResult.itemsSummary}</span>
                        </div>
                      )}
                      <div className="text-[11px] text-on-surface-variant flex items-center justify-between pt-1 border-t border-surface-container-high">
                        <span>Total Nilai: <strong className="text-primary">{trackingResult.totalAmountFormatted || (trackingResult.totalAmount ? formatRupiah(trackingResult.totalAmount) : '-')}</strong></span>
                        <span className="font-mono text-outline">Metode: {trackingResult.paymentMethodLabel || trackingResult.paymentMethod || 'COD'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Hero Depot Card */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden border border-surface-container-high shadow-md bg-surface-container-low p-2">
                <div className="relative h-[360px] sm:h-[420px] rounded-xl overflow-hidden">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCU1lsfRf2RijOStSWs_HRnNw-TorpNVrh53pA28nJ1lgEzANReT5jk-wIfOcuHgvL1KpxZ_WpmngV64hL6sMv3u4YBLUP8nHYHAGRdwLzw1CRbAonLimLrNxxHCRvh2SzlzbeISrdl05t3I1SUfVbqHO9UYX9gVnChBTalEXsw_ZHg-ghsDlqZuxWdZ_WaPFUgyOHrtJyPsaABwUy8R6torxHYaZEUh8v3MemRjg"
                    alt="Depot Konsolidasi Krian Sidoarjo"
                    className="w-full h-full object-cover"
                    width={566}
                    height={420}
                    fetchPriority="high"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                </div>

                {/* Floating Depot Info Box */}
                <div className="absolute bottom-5 left-5 right-5 bg-surface-container-lowest/95 backdrop-blur-md p-4 rounded-xl border border-surface-container-high shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary-container shrink-0 border border-surface-variant">
                      <span className="material-symbols-outlined text-[22px]">warehouse</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-display text-on-surface">
                          Depot Konsolidasi Krian
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-tertiary-container/30 text-tertiary uppercase tracking-wide">
                          SDA-KRN
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">
                        Hub logistik lintas Krian, Balongbendo, Tarik, Prambon, dan perimeter industri Sidoarjo Barat.
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-[11px] font-mono text-on-surface-variant">
                        <span className="text-primary font-bold">STATUS: READY INVENTORY</span>
                        <span>•</span>
                        <span>LEAD TIME: SAMEDAY / H+1</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 1: 4 PILLARS OF PARTNERSHIP */}
      {/* ========================================================= */}
      <section className="py-14 bg-surface-container-low border-b border-surface-container-high">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                KEUNGGULAN KEMITRAAN
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-on-surface mt-1">
                Keuntungan Bermitra Bersama Inbisco
              </h2>
            </div>
            <p className="text-sm text-on-surface-variant max-w-md">
              Dukungan menyeluruh dan rantai pasok terintegrasi untuk memperkuat daya saing toko kelontong, agen grosir, dan mitra ritel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-surface-container-lowest rounded-xl border border-surface-container-high hover:border-outline hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-surface-container-high flex items-center justify-center text-primary-container mb-5">
                  <span className="material-symbols-outlined text-[28px]">stars</span>
                </div>
                <h3 className="text-base font-bold font-display text-on-surface mb-2">
                  Produk FMCG Terkemuka
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Akses langsung ke portofolio brand FMCG terlaris Mayora dengan perputaran stok cepat dan jaminan keaslian pabrik 100%.
                </p>
              </div>
            </div>

            <div className="p-6 bg-surface-container-lowest rounded-xl border border-surface-container-high hover:border-outline hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-surface-container-high flex items-center justify-center text-primary-container mb-5">
                  <span className="material-symbols-outlined text-[28px]">payments</span>
                </div>
                <h3 className="text-base font-bold font-display text-on-surface mb-2">
                  Peluang Bisnis Menguntungkan
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Struktur harga tiering distributor pabrik, margin keuntungan stabil, serta program promosi berkala yang dirancang khusus bagi mitra.
                </p>
              </div>
            </div>

            <div className="p-6 bg-surface-container-lowest rounded-xl border border-surface-container-high hover:border-outline hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-surface-container-high flex items-center justify-center text-primary-container mb-5">
                  <span className="material-symbols-outlined text-[28px]">warehouse</span>
                </div>
                <h3 className="text-base font-bold font-display text-on-surface mb-2">
                  Dukungan Logistik Depot
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Penyimpanan standar industri di Depot Krian dengan armada pengiriman terjadwal untuk menjamin ketersediaan barang di etalase Anda.
                </p>
              </div>
            </div>

            <div className="p-6 bg-surface-container-lowest rounded-xl border border-surface-container-high hover:border-outline hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-surface-container-high flex items-center justify-center text-primary-container mb-5">
                  <span className="material-symbols-outlined text-[28px]">share_location</span>
                </div>
                <h3 className="text-base font-bold font-display text-on-surface mb-2">
                  Jaringan Distribusi Luas
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Jangkauan rute komprehensif mencakup Krian, Balongbendo, Taman, Waru, Tarik, Prambon, dan sentra perdagangan Sidoarjo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: FEATURED FMCG CATALOG */}
      {/* ========================================================= */}
      <section className="py-14 bg-surface border-b border-surface-container-high" id="katalog-produk">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                KATALOG UNGGULAN
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-on-surface mt-1">
                Produk Pilihan untuk Kebutuhan Harian
              </h2>
              <p className="text-sm text-on-surface-variant mt-1.5 max-w-xl">
                Pilihan produk FMCG favorit konsumen dengan rotasi penjualan tinggi untuk toko kelontong, warkop, dan usaha ritel Anda.
              </p>
            </div>
            <div>
              <button
                onClick={() => setActiveNav('products')}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-secondary transition-colors group"
              >
                <span>Lihat Semua Produk</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredProducts.map((p, idx) => (
              <div 
                key={idx} 
                onClick={() => setActiveNav('products', p.category)}
                className="bg-surface-container-lowest rounded-xl border border-surface-container-high p-4 flex flex-col justify-between hover:border-tertiary-container hover:shadow-md transition-all duration-200 group cursor-pointer"
              >
                <div>
                  <div className="mb-2">
                    <span className="text-[11px] px-2.5 py-0.5 rounded bg-surface-container text-on-surface font-semibold">
                      {p.category}
                    </span>
                  </div>
                  <div className="relative h-36 rounded-lg bg-surface-container-low overflow-hidden mb-3 flex items-center justify-center p-2 border border-surface-container">
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="text-[10px] font-mono text-on-surface-variant font-medium">{p.sku}</div>
                  <h3 className="text-sm font-bold font-display text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">{p.pack}</p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-surface-container-high flex items-center justify-between">
                  <div className="text-xs font-bold text-primary">
                    {formatRupiah(p.price)}
                  </div>
                  <span className="text-[11px] font-bold text-primary group-hover:underline flex items-center gap-0.5">
                    Detail <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: B2B OPPORTUNITY & COMPLIANCE */}
      {/* ========================================================= */}
      <section className="py-16 max-w-[1280px] mx-auto px-4 md:px-8" id="tentang-kami">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Photo & Counter Stats */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-surface-container-high shadow-sm bg-surface-container-low p-2">
              <div className="relative h-[440px] rounded-xl overflow-hidden">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoxZNKgeLEThWYt0YQGRYfdVf4meW88QIFAgVB34rWsqpRCv8bWG5lgTDXqRGJbuSdE-_KiDVf0IwqqRpebV89aObO5wtWUov2PHWD_D6szVRdXVnp-j410nLuUvD1QXT6maayfN6LukDCZOlqAcH7XzoFYdpVvGp9q2EWAuH6mvqjtppPaUn7kkzpcBF6I6CvXW1kNj3iWreoNDssxRdO2a7vexsac9_53h-nHfM"
                  alt="Logistik Inbisco Cabang Krian"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 bg-surface-container-lowest/95 backdrop-blur-md p-4 rounded-xl border border-surface-container-high shadow-md">
                <div className="grid grid-cols-2 gap-4 text-center divide-x divide-surface-container-high">
                  <div>
                    <span className="text-2xl font-bold font-display text-primary block">
                      1,850+
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      Mitra Retail Terdaftar
                    </span>
                  </div>
                  <div>
                    <span className="text-2xl font-bold font-display text-on-surface block">
                      100%
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      Kepatuhan Legalitas & Faktur
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Value Proposition List */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                PELUANG KEMITRAAN B2B
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-on-surface mt-1">
                Mengapa Pelaku Usaha Ritel & Grosir Memilih Inbisco MitraHub?
              </h2>
              <p className="text-base text-on-surface-variant mt-2 leading-relaxed">
                Kami menghadirkan ekosistem distribusi terpadu yang memangkas hambatan suplai bagi pemilik toko kelontong, warkop, minimarket mandiri, hingga grosir regional.
              </p>
            </div>

            <div className="space-y-3.5 pt-1">
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary-container border border-surface-container-high shrink-0">
                    <span className="material-symbols-outlined text-[20px]">price_check</span>
                  </div>
                  <h3 className="text-sm font-bold font-display text-on-surface">
                    Jaminan Harga Resmi & Faktur Pajak Sah
                  </h3>
                </div>
                <p className="text-xs text-on-surface-variant pl-11">
                  Seluruh pesanan mitra didukung faktur resmi langsung dari cabang pabrikan, menjamin akurasi pembukuan dan transparansi harga tanpa biaya tersembunyi.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary-container border border-surface-container-high shrink-0">
                    <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                  </div>
                  <h3 className="text-sm font-bold font-display text-on-surface">
                    Armada Logistik Sendiri & Ketepatan Jadwal
                  </h3>
                </div>
                <p className="text-xs text-on-surface-variant pl-11">
                  Didukung armada truk dan van box terkelola mandiri dari Depot Krian untuk menjamin integritas kemasan produk tiba tanpa kerusakan di toko Anda.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary-container border border-surface-container-high shrink-0">
                    <span className="material-symbols-outlined text-[20px]">support_agent</span>
                  </div>
                  <h3 className="text-sm font-bold font-display text-on-surface">
                    Dedicated Sales Officer Setiap Wilayah
                  </h3>
                </div>
                <p className="text-xs text-on-surface-variant pl-11">
                  Setiap mitra didampingi petugas representatif resmi untuk kemudahan reorder berkala, konsultasi stok cepat laku, dan penanganan retur produk.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveNav('partnership')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-container text-white text-sm font-bold hover:bg-secondary-container transition-colors shadow-sm"
              >
                <span>Daftar Jadi Mitra Sekarang</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>

              <button
                onClick={() => setActiveNav('about')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-surface-variant text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors"
              >
                <span>Pelajari Profil Distribusi</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: 4-STEP PARTNERSHIP WORKFLOW & COVERAGE */}
      {/* ========================================================= */}
      <section className="py-16 bg-surface border-t border-surface-container-high" id="cakupan-wilayah">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="mb-10 max-w-3xl">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              TAHAPAN KEMITRAAN & LOGISTIK
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-on-surface mt-1">
              Alur Distribusi Terstruktur & Cepat
            </h2>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              Mulai dari pendaftaran online hingga pengantaran pertama ke titik usaha Anda dengan standar operasional yang terukur.
            </p>
          </div>

          {/* Stepper Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-14">
            <div className="relative p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high">
              <div className="w-10 h-10 rounded-full bg-primary-container text-white font-mono font-bold flex items-center justify-center mb-3">
                01
              </div>
              <h3 className="text-sm font-bold font-display text-on-surface mb-1">
                Pendaftaran & Verifikasi
              </h3>
              <p className="text-xs text-on-surface-variant">
                Isi data profil toko, titik lokasi maps, dan legalitas usaha melalui formulir kemitraan online.
              </p>
            </div>

            <div className="relative p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high">
              <div className="w-10 h-10 rounded-full bg-primary-container text-white font-mono font-bold flex items-center justify-center mb-3">
                02
              </div>
              <h3 className="text-sm font-bold font-display text-on-surface mb-1">
                Konsultasi Wilayah
              </h3>
              <p className="text-xs text-on-surface-variant">
                Tim sales officer cabang Krian menghubungi Anda untuk validasi jadwal rute dan potensi kuota suplai.
              </p>
            </div>

            <div className="relative p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high">
              <div className="w-10 h-10 rounded-full bg-primary-container text-white font-mono font-bold flex items-center justify-center mb-3">
                03
              </div>
              <h3 className="text-sm font-bold font-display text-on-surface mb-1">
                Alokasi Kuota
              </h3>
              <p className="text-xs text-on-surface-variant">
                Penetapan tier harga grosir pabrik, plafon tempo (TOP), dan kuota produk fast-moving prioritas.
              </p>
            </div>

            <div className="relative p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high">
              <div className="w-10 h-10 rounded-full bg-primary-container text-white font-mono font-bold flex items-center justify-center mb-3">
                04
              </div>
              <h3 className="text-sm font-bold font-display text-on-surface mb-1">
                Pengiriman Terjadwal
              </h3>
              <p className="text-xs text-on-surface-variant">
                Armada box mengantarkan pesanan secara berkala langsung ke etalase toko Anda secara aman dan tepat waktu.
              </p>
            </div>
          </div>

          {/* Coverage Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  WILAYAH JANGKAUAN LOGISTIK
                </span>
                <h3 className="text-xl font-bold font-display text-on-surface mt-1">
                  Pusat Wilayah Distribusi Utama Sidoarjo
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Kami mengoperasikan jadwal rute tetap setiap pekannya ke zona sentra retail dan grosir:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high p-4 border-l-4 border-l-primary-container shadow-xs">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container text-on-surface uppercase">
                    HUB UTAMA DEPOT
                  </span>
                  <h4 className="text-base font-bold font-display text-on-surface mt-1.5 mb-0.5">
                    Krian
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Pusat depot logistik regional, zona pergudangan, pasar grosir Krian, dan sentra toko retail.
                  </p>
                </div>

                <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high p-4 border-l-4 border-l-tertiary-container shadow-xs">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container text-on-surface uppercase">
                    RUTE JALUR BARAT
                  </span>
                  <h4 className="text-base font-bold font-display text-on-surface mt-1.5 mb-0.5">
                    Balongbendo
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Jalur arteri penghubung Sidoarjo-Mojokerto dengan jaringan agen grosir dan warkop strategis.
                  </p>
                </div>

                <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high p-4 border-l-4 border-l-tertiary-container shadow-xs">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container text-on-surface uppercase">
                    ZONA SUBURBAN
                  </span>
                  <h4 className="text-base font-bold font-display text-on-surface mt-1.5 mb-0.5">
                    Taman
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Wilayah padat pemukiman dan konsentrasi usaha toko kelontong, retail modern mandiri, serta warkop aktif.
                  </p>
                </div>

                <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high p-4 border-l-4 border-l-tertiary-container shadow-xs">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container text-on-surface uppercase">
                    KORIDOR INDUSTRI
                  </span>
                  <h4 className="text-base font-bold font-display text-on-surface mt-1.5 mb-0.5">
                    Waru
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Koridor simpul perdagangan dan perimeter industri penghubung logistik Sidoarjo dengan metropolitan Surabaya.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveNav('contact')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-container-lowest border border-surface-variant text-on-surface text-xs font-semibold hover:bg-surface-container-low transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">location_searching</span>
                  <span>Konsultasikan Ketersediaan Rute Toko Anda</span>
                </button>
              </div>
            </div>

            {/* Hub Logistik Card */}
            <div className="lg:col-span-5 bg-surface-container-low rounded-2xl border border-surface-container-high p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">hub</span>
                    <span className="text-base font-bold font-display text-on-surface">
                      Depot Utama Krian
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-on-surface-variant font-bold">
                    SDA-KRN-HUB
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Seluruh titik rute distribusi dikonsolidasikan langsung dari gudang logistik Krian untuk memastikan keteraturan pasokan mingguan dan kebersihan produk terjamin.
                </p>
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high space-y-2 text-xs text-on-surface">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Jadwal Pengiriman:</span>
                    <span className="font-semibold">Terjadwal Tetap Tiap Pekan</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Status Kemitraan:</span>
                    <span className="font-semibold text-primary">Pendaftaran Terbuka</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Area Coverage:</span>
                    <span className="font-semibold">18 Kecamatan Sidoarjo</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-surface-container-high">
                <span className="text-xs text-on-surface-variant">
                  Informasi ketersediaan kuota pengiriman baru dapat dikonsultasikan langsung bersama tim sales representatif wilayah kami.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: FINAL CTA BANNER */}
      {/* ========================================================= */}
      <section className="bg-primary-container text-white py-16 relative overflow-hidden" id="daftar-mitra">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-tertiary-container"></div>
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs font-bold text-tertiary-container uppercase tracking-wider block">
                Peluang Kemitraan Resmi Wilayah Sidoarjo
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
                Bangun Kemitraan Distribusi Bersama Inbisco.
              </h2>
              <p className="text-sm text-white/90 max-w-2xl leading-relaxed">
                Daftarkan toko kelontong, warkop, atau usaha grosir Anda untuk menikmati jaminan pasokan produk FMCG Mayora terbaik dengan skema kemitraan yang menguntungkan.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <button
                onClick={() => setActiveNav('partnership')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-surface-container-lowest text-primary text-sm font-bold hover:bg-surface-container-low transition-all shadow-md active:scale-95 text-center"
              >
                <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                <span>Mulai Daftar Kemitraan</span>
              </button>
              <button
                onClick={() => setActiveNav('contact')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white text-white text-sm font-semibold hover:bg-white/10 transition-colors text-center"
              >
                <span className="material-symbols-outlined text-[20px]">mail</span>
                <span>Hubungi Tim Sales Cabang</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
