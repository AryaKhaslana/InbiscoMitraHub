import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { 
  Truck, 
  Warehouse, 
  Store, 
  ShieldCheck, 
  Navigation, 
  CheckCircle2, 
  ArrowRight,
  Eye,
  X,
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';

export default function Moments({ setActiveNav }) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [activePhotoModal, setActivePhotoModal] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activePhotoModal) {
        setActivePhotoModal(null);
      }
    };
    if (activePhotoModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePhotoModal]);

  const galleryItems = [
    {
      id: 1,
      category: 'Gudang & QA',
      title: 'Sistem Racking & Rotasi FEFO Berkala',
      subtitle: 'Penyimpanan terstandardisasi pada high-density racking Depot Krian dengan rotasi lot batch mutakhir.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBroTnMuwdXUqbeg6Vhh3zQth34AT0mJXS4CCQ0s5EZrDZFWoL73aW5kH8QPAQOD_9fc90v54hvZq6qzXKX5szk4gnX71SJXUKbCb0hd7l1LCuIYXpk9CRwEn9ISMpEK4LqpldCzRcU2cG4RPC_DynB6P1XAhRAUa9eWM-WkP9cYtSZgkyDN5Ybd6_Lm_LLGwcLcKUbuhL0VNSNHQsVCkE6CbZ5shQa5hFMTAk2UDw',
      badge: 'Depot Krian Hub',
    },
    {
      id: 2,
      category: 'Gudang & QA',
      title: 'Verifikasi Mutu Karton & Surat Jalan (DO)',
      subtitle: 'Inspeksi barcode dan pemeriksaan keutuhan segel pabrik sebelum barang dipindahkan ke staging loading bay.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAipvIbSWt7I6qT5QX2RLK9e3pPMp2AdIL9cuuWDi8SWiHZ5dVp8BD7jhls42S820taCuUYF4qsAqbKW8eeLB5Vc80BR4HFpDczg97zJeppirRDbhytmpVC1dch7GyZ4zU6_w-m7D73v6M9WgN0RL5uBcqG6thol5RXj7tIsodxUA-1bDiRwUnjIvLvuf7j8vsa0t8lHEgyfHtVPEGoPwzMepGN1DDRQjnNjJ-N5po',
      badge: 'QA & Compliance',
    },
    {
      id: 3,
      category: 'Armada & Logistik',
      title: 'Inspeksi Armada Boks Tertutup Harian',
      subtitle: 'Armada Canter dan Wingbox ber-GPS diperiksa kelayakan jalan, kebersihan boks, dan sistem e-Lock setiap pagi.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCApWYxyidMmztwvul_jytCS6lZf2xTOWItVdA3QanTdfV74t4dqXzM2I0rPO8U-Hne481lMtUf4PBsqhxHsJHaXaCGSuL-7eYCcL_HEKVlk56jrLZLzxnYroDbZHPb00YOTT8gQUM0yk94Gb1lyPxZiMx0591DH9xENzPqkLgQ_aNxv2jBShwM4LiGZo59kYG0-yyCiFbq0p_x_d0kVL8jWEMNITWR9fOfcK1f-Vg',
      badge: '16 Armada Aktif',
    },
    {
      id: 4,
      category: 'Armada & Logistik',
      title: 'Proses Staging & Muat Cepat di Loading Bay',
      subtitle: 'Pemuatan terstruktur berbasis zonasi rute pengantaran ke toko kelontong di 18 kecamatan Sidoarjo.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgWUp1qz5YiLoORDgMqsuwWro3KERt-ey4Ul4-67Bd_EcMkta3e8N-MSTRtgJM8OuFs7Exzs8IqapvPnUXwhcbqPwWaJhjjmtPmgyF72FGRDa2nTwBHPgIiUnvLdhvH_52sgQv9C167k3ywkjtPjnBCTcsVaRSkFRCRJdQOjqBNawxpqlS-LWI4_m7pz7M9FOkPIni6MLxnxqnqGvtQVqaOOVWubKsTKqgUHtQZsE',
      badge: 'Fast Lane Loading',
    },
    {
      id: 5,
      category: 'Mitra & Toko',
      title: 'Paket Suplai Toko Kelontong & Grosir Pasar',
      subtitle: 'Konsolidasi master dus biskuit Roma Kelapa dan permen Kopiko siap kirim langsung ke toko pedagang retail.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy4U9GMcSM4ZgS6AGIUnL2zn6e8EjcvYxD6o21b1UmV6RyqWafVDINHRBIadBnE9fMS8QAnPdt2YyWeBH_Ull32wzjOsk072OP5poQEGO1RmUfsQeSLl34f62KBYdQ7MYKv9dDvqB8DMEHirBcxC0oUhYaHW-503XFiMrFL6HLWpRS5d-TdWqJkxPnFHXGDTUo9HNz9Ubwqf53xRCznQJwKcKtkvGR-GvzSZ-83Rs',
      badge: 'Distribusi Retail',
    },
    {
      id: 6,
      category: 'Mitra & Toko',
      title: 'Kebutuhan Renceng & Sachet Mitra Warkop',
      subtitle: 'Ketersediaan stabil produk sachet Torabika Duo dan Energen Cokelat untuk ratusan warkop aktif.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFYBCDSZFMk9-zSWL5b_vD-I7PC8DQx_EnTapADyANnwBCZoififCxZcSRSEA-bMKo7pDW6Z-W6q-BjOPc4DdLVbZ7fqNb7CZF6FzLA7R_modDTc-XqCrd0yQgl4_MOmsIPFyip6VglQ3PpefJzDaVPmnSnJDUSAtNCaEh5oZ_R7Er0un_m7ibd-cLrfCTPOpRpAsjdwd6dvBvwKEKEWc87GcSUQBfQNEARUCCkJk',
      badge: 'Food Service Channel',
    },
    {
      id: 7,
      category: 'Event & Edukasi',
      title: 'Pertemuan Rutin Agen & Pemilik Toko Grosir',
      subtitle: 'Sesi temu mitra untuk mendengarkan masukan rute dan memberikan pendampingan alokasi produk fast-moving.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfjEkutFjqcy1co3RbG3pUySevcPnq-syf8CIPm9vMIZmGai3JXF1-m-M9Sewn6vOOAInAUhI7NSIGnjt0aZpinjkZuuBwgEUr1R-6HctNVr6ynM48tJlT5YHf_xozY9527pFVEwAtlLVAS8qZJW8wYD6zEE_OalSiz630EKX1byBWpJ7Fch2uoVsUr6ChPJTa-O21zeX_kCj1UONCmpEYju8_pyTUx0bCcQiYV3Q',
      badge: 'Temu Mitra Kemitraan',
    },
    {
      id: 8,
      category: 'Event & Edukasi',
      title: 'Operasional Pagi Depot Logistik Krian',
      subtitle: 'Suasana kesiapan personel gudang dan pengemudi armada menyongsong gelombang pengiriman pertama pukul 07:00 WIB.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDV6axDOqGpqmsKGJKCvcFohyDtxf0TwuD3_kQcPo6BdVe3kBXI_C2YM4S_hP-fqUfjrc_5C4lzsSYzidlrtqW67O2WNX0DpeRG4dX6hY20ON93t7DLD0LdX2SZcNEfSdOeS7iZ00eSi-n9axZv_0baxk7SzSh6po35o0YZ-ppXqvCrlouKT6FyEtFJ2EMLKRMYPluF1PU4kC0Yih8FlXQxTK40PLJ0xrunQMzryjc',
      badge: 'Daily Briefing Krian',
    },
  ];

  const subroutes = [
    { title: 'Krian Kota', desc: 'Sentra pasar grosir, perimeter depo logistik, dan jalur arteri pertokoan utama.' },
    { title: 'Balongbendo', desc: 'Jalur barat penghubung industri dan koridor warung kelontong pedesaan.' },
    { title: 'Tarik', desc: 'Area pemukiman dan warkop aktif di ujung barat daya Sidoarjo.' },
    { title: 'Prambon', desc: 'Simpul pertanian dan pertokoan kelontong penyangga pasokan FMCG.' },
    { title: 'Wonoayu', desc: 'Kawasan pemukiman berkembang pesat dengan kepadatan toko ritel mandiri.' },
    { title: 'Sidoarjo Barat (Sub-Rute)', desc: 'Perimeter koridor Sukodono dan jalur lingkar industri pergudangan.' },
  ];

  const categoryFilters = [
    { id: 'Semua', label: 'Semua Foto', icon: 'grid_view' },
    { id: 'Gudang & QA', label: 'Gudang & QA', icon: 'warehouse' },
    { id: 'Armada & Logistik', label: 'Armada & Logistik', icon: 'local_shipping' },
    { id: 'Mitra & Toko', label: 'Mitra & Toko', icon: 'storefront' },
    { id: 'Event & Edukasi', label: 'Event & Edukasi', icon: 'groups' },
  ];

  const getCategoryCount = (catId) => {
    if (catId === 'Semua') return galleryItems.length;
    return galleryItems.filter((item) => item.category === catId).length;
  };

  const filteredItems = galleryItems.filter((item) =>
    selectedCategory === 'Semua' ? true : item.category === selectedCategory
  );


  return (
    <div className="w-full bg-surface pb-16">
      {/* ========================================================= */}
      {/* SECTION 0: HERO & PROFIL PERJALANAN LOGISTIK             */}
      {/* ========================================================= */}
      <section className="bg-surface-container-lowest border-b border-surface-container-high py-12 md:py-16">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <nav className="flex items-center gap-2 text-xs text-outline mb-6">
            <button onClick={() => setActiveNav && setActiveNav('home')} className="hover:text-primary transition-colors">
              Beranda
            </button>
            <span className="material-symbols-outlined text-[16px] text-surface-dim">chevron_right</span>
            <span className="text-on-surface font-semibold">Aktivitas & Jaringan Distribusi</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                Dokumentasi Operasional & Ekosistem Distribusi · Cabang Krian
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-on-surface tracking-tight leading-tight">
                Lebih Dekat dengan Aktivitas Distribusi Kami.
              </h1>
              <p className="text-base text-on-surface-variant leading-relaxed">
                Menyaksikan langsung dedikasi tim operasional PT Inbisco Niagatama Semesta dalam menjaga integritas barang, rotasi FEFO yang ketat, dan ketepatan pengantaran armada boks ke ribuan warung mitra.
              </p>
            </div>

            <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-surface-container-high p-2 bg-surface-container-low shadow-sm">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDV6axDOqGpqmsKGJKCvcFohyDtxf0TwuD3_kQcPo6BdVe3kBXI_C2YM4S_hP-fqUfjrc_5C4lzsSYzidlrtqW67O2WNX0DpeRG4dX6hY20ON93t7DLD0LdX2SZcNEfSdOeS7iZ00eSi-n9axZv_0baxk7SzSh6po35o0YZ-ppXqvCrlouKT6FyEtFJ2EMLKRMYPluF1PU4kC0Yih8FlXQxTK40PLJ0xrunQMzryjc"
                alt="Depot Logistik Krian"
                className="w-full h-64 sm:h-72 object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 1: 3 QUALITY HIGHLIGHTS                          */}
      {/* ========================================================= */}
      <section className="py-12 bg-surface">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-xs">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary-container mb-4">
                <span className="material-symbols-outlined text-[26px]">grid_view</span>
              </div>
              <h3 className="text-base font-bold font-display text-on-surface mb-1">
                Gudang Terorganisir
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Penataan barang menggunakan sistem racking berstandar industri dengan kode palet dan pelabelan batch lot FEFO jelas.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-xs">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-tertiary mb-4">
                <span className="material-symbols-outlined text-[26px]">sanitizer</span>
              </div>
              <h3 className="text-base font-bold font-display text-on-surface mb-1">
                Standar Kebersihan & Mutu
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Pembersihan rutin area gudang dan inspeksi fisik master dus untuk menjamin keamanan higienitas produk pangan Mayora.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-xs">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined text-[26px]">local_shipping</span>
              </div>
              <h3 className="text-base font-bold font-display text-on-surface mb-1">
                Kesiapan Armada Harian
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Pemeriksaan teknis armada harian dan sistem e-Lock menjamin integritas pesanan tiba tanpa kerusakan di toko Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: INTERACTIVE PHOTO GALLERY                     */}
      {/* ========================================================= */}
      <section className="py-14 bg-surface-container-low border-t border-surface-container-high">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                GALERI DOKUMENTASI RESMI
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-on-surface mt-1">
                Dokumentasi Lapangan & Ekosistem Kemitraan
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Pilih filter kategori untuk melihat dokumentasi unit kerja dan kesiapan distribusi Cabang Krian:
              </p>
            </div>

            {/* Category Filter Pills with Item Counters */}
            <div className="flex flex-wrap items-center gap-2">
              {categoryFilters.map((cat) => {
                const count = getCategoryCount(cat.id);
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-primary-container text-white shadow-xs scale-102 ring-1 ring-primary-container/20'
                        : 'bg-surface-container-lowest text-on-surface border border-surface-container-high hover:border-outline-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {cat.icon}
                    </span>
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${
                        isSelected
                          ? 'bg-white/25 text-white'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActivePhotoModal(item)}
                className="bg-surface-container-lowest rounded-xl border border-surface-container-high overflow-hidden shadow-xs hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-surface-container">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Badge Overlay */}
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-surface-container-lowest/90 backdrop-blur-xs text-[10px] font-bold text-on-surface shadow-xs border border-surface-container-high/80">
                      {item.badge}
                    </span>
                    {/* Hover Visual Preview Hint */}
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded bg-black/65 text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 backdrop-blur-xs">
                      <Eye className="h-3 w-3" />
                      <span>Buka Foto</span>
                    </span>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-bold font-display text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant line-clamp-2">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-3.5 pt-1 text-[11px] font-bold text-primary flex items-center justify-between border-t border-surface-container-low">
                  <span className="flex items-center gap-1 group-hover:underline">
                    <Eye className="h-3.5 w-3.5" />
                    <span>Lihat Foto Penuh</span>
                  </span>
                  <span className="material-symbols-outlined text-[15px] text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-transform">
                    open_in_full
                  </span>
                </div>
              </div>
            ))}

            {filteredItems.length === 0 && (
              <div className="col-span-full py-12 text-center bg-surface-container-lowest rounded-xl border border-surface-container-high p-8 space-y-2">
                <span className="material-symbols-outlined text-4xl text-outline">photo_library</span>
                <p className="text-sm font-semibold text-on-surface">Tidak ada dokumentasi dalam kategori ini</p>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Semua')}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Tampilkan Semua Foto
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: 6 SUB-ROUTES SIDOARJO                         */}
      {/* ========================================================= */}
      <section className="py-14 bg-surface border-t border-surface-container-high">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="mb-8">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              ZONA JANGKAUAN LOGISTIK
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-on-surface mt-1">
              Mengenal Area Layanan Depot Krian
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Rute pengiriman tetap mingguan terbagi dalam 6 koridor strategis:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {subroutes.map((r, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-1.5 border-l-4 border-l-primary"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold font-display text-on-surface">
                    {r.title}
                  </h4>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {r.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: CALL TO ACTION (CTA)                          */}
      {/* ========================================================= */}
      <section className="py-14 bg-surface-container-low border-t border-surface-container-high">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-primary uppercase tracking-wider block">
            KEMITRAAN DISTRIBUSI RESMI
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-on-surface max-w-xl mx-auto">
            Ingin Toko atau Usaha Anda Dipasok Langsung oleh Cabang Krian?
          </h2>
          <p className="text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">
            Dapatkan harga resmi pabrikan Mayora, pengiriman rutin terjadwal bebas ongkir, dan jaminan pasokan tanpa putus untuk toko kelontong, warkop, maupun grosir Anda.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setActiveNav && setActiveNav('partnership')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
            >
              <span>Daftar Kemitraan Toko</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveNav && setActiveNav('products')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-surface-variant bg-surface-container-lowest text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span>Lihat Katalog Produk</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* PHOTO LIGHTBOX MODAL (PORTALLED)                         */}
      {/* ========================================================= */}
      {activePhotoModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="photo-modal-title"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop */}
            <div
              onClick={() => setActivePhotoModal(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs anim-backdrop"
              aria-hidden="true"
            />

            {/* Centering Container */}
            <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl border border-surface-container-high overflow-hidden shadow-2xl text-left anim-modal z-10 my-6 sm:my-8"
              >
                <div className="relative h-72 sm:h-96 w-full bg-black">
                  <img
                    src={activePhotoModal.image}
                    alt={activePhotoModal.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setActivePhotoModal(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
                    aria-label="Tutup foto"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-primary-container text-white text-[10px] font-bold">
                      {activePhotoModal.badge}
                    </span>
                    <span className="text-xs font-semibold text-outline">
                      {activePhotoModal.category}
                    </span>
                  </div>
                  <h3 id="photo-modal-title" className="text-lg font-bold font-display text-on-surface">
                    {activePhotoModal.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {activePhotoModal.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
