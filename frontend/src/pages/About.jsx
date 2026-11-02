import React from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Building2, 
  ShieldCheck, 
  MapPin, 
  Truck, 
  Target, 
  Users, 
  Award,
  ArrowRight,
  Handshake,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Headphones
} from 'lucide-react';

export default function About({ setActiveNav }) {
  const handleNav = (id) => {
    if (setActiveNav) {
      setActiveNav(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const coreValues = [
    {
      title: 'Kepercayaan',
      desc: 'Menjaga keaslian produk Mayora 100% dan integritas transaksi legal dengan faktur resmi dari prinsipal.',
      icon: 'verified',
    },
    {
      title: 'Ketepatan',
      desc: 'Menghargai perputaran modal pedagang dengan komitmen pengiriman barang tepat waktu sesuai rute berkala.',
      icon: 'schedule',
    },
    {
      title: 'Kemitraan',
      desc: 'Memandang toko kelontong, warkop, dan agen grosir sebagai rekan bisnis jangka panjang yang saling menumbuhkan.',
      icon: 'handshake',
    },
    {
      title: 'Pelayanan',
      desc: 'Memberikan respons komunikasi yang ramah, proaktif, dan solutif melalui dedicated sales representatif cabang.',
      icon: 'support_agent',
    },
  ];

  return (
    <div className="w-full bg-surface pb-16">
      {/* ========================================================= */}
      {/* SECTION 0: HERO & PROFIL PERUSAHAAN                      */}
      {/* ========================================================= */}
      <section className="bg-surface-container-lowest border-b border-surface-container-high py-12 md:py-16">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <nav className="flex items-center gap-2 text-xs text-outline mb-6">
            <button onClick={() => handleNav('home')} className="hover:text-primary transition-colors">
              Beranda
            </button>
            <span className="material-symbols-outlined text-[16px] text-surface-dim">chevron_right</span>
            <span className="text-on-surface font-semibold">Tentang Kami</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                Profil Distributor Resmi Mayora FMCG · Cabang Krian
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-on-surface tracking-tight leading-tight">
                Menghubungkan Produk Berkualitas dengan Peluang Usaha.
              </h1>

              <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed">
                PT Inbisco Niagatama Semesta — Cabang Krian adalah unit distribusi regional terpercaya yang mendistribusikan aneka produk Fast-Moving Consumer Goods (FMCG) terkemuka dari Mayora Group ke ribuan toko retail dan agen grosir di Sidoarjo dan perimeter Jawa Timur.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleNav('partnership')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-primary-container text-white text-sm font-bold hover:bg-secondary-container transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                  <span>Jelajahi Peluang Kemitraan</span>
                </button>
                <button
                  onClick={() => handleNav('moments')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-lg border border-surface-variant bg-surface-container-lowest text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors"
                >
                  <span>Lihat Aktivitas Pergudangan</span>
                </button>
              </div>
            </div>

            {/* Warehouse Hero Image */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden border border-surface-container-high shadow-md bg-surface-container-low p-2">
                <div className="relative h-[340px] sm:h-[400px] rounded-xl overflow-hidden">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFtNWrxQtwmBDUqITQA0Nv2nkrqw1i02N2a5JiQ0NhuhkSxq4t5fCZ-Rwqz9fua2UqyYayCCsg2Rrt4T8AVAxFoG52Q-UqK-CsSaBIUq09Xow0JIu7yfwqpzmX_VGlGxgFX7eVuna_ybHuol1xp1Vh9eSRZpnXDnIY7hRsU4zu4O3tz8hGFwnJNUmAjcT1JY374oXvhL9ann5haaOn4W0QyqyNb4YMJtPvolf-x_w"
                    alt="Operasional Pergudangan PT Inbisco Niagatama Semesta Cabang Krian"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 bg-surface-container-lowest/90 backdrop-blur-sm p-3.5 rounded-xl border border-surface-container-high">
                    <span className="text-xs font-bold font-display text-on-surface block">
                      Pergudangan PT Inbisco Niagatama Semesta Cabang Krian
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-mono">
                      Kawasan Pergudangan KM 29, Krian, Sidoarjo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 1: MENGENAL INBISCO                              */}
      {/* ========================================================= */}
      <section className="py-14 bg-surface">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                MENGENAL INBISCO
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-on-surface">
                Fondasi Distribusi Andal untuk Usaha Ritel & Grosir
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Sebagai mitra rantai pasok terdepan, kami mengoperasikan infrastruktur logistik modern dengan sistem manajemen kedaluwarsa First-Expired First-Out (FEFO) ketat. Setiap master dus produk Mayora seperti Roma, Beng-Beng, Torabika, Kopiko, Energen, dan Le Minerale dijamin tiba dalam kondisi mutu prima di tangan mitra usaha.
              </p>
            </div>

            <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-surface-container-high p-2 bg-surface-container-low shadow-xs">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBg8hHmUWhua4vOrn5Qy3CQqMucjuaaZGRWVdWpSLZv27T8NAiiy61AqLJHudCaLE-T49IjnLl9Ie0Z_frJMd6-gpxV-tthKLNwThyTB-7vvnk42BUW1KeTyTr3V2VYp2zmCOx9fV4ZTo0bRE50QtvItNsNNLVMU7EmFbYB8MKL0pCihJqKcNwIw5cUyD0iTeAJNztt_gcNBrrDtGw6bzbKfMlFMzRIYnXIBoorVoU"
                alt="Fasilitas Logistik Gudang PT Inbisco Niagatama Semesta"
                className="w-full h-64 sm:h-72 object-cover rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary-container mb-3 border border-surface-variant">
                <span className="material-symbols-outlined text-[24px]">account_balance</span>
              </div>
              <h3 className="text-base font-bold font-display text-on-surface mb-1.5">
                Distribusi Resmi Terintegrasi
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Pasokan langsung dari pabrik Mayora tanpa perantara bertingkat, memberikan kepastian legalitas faktur dan harga resmi terstandardisasi.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary-container mb-3 border border-surface-variant">
                <span className="material-symbols-outlined text-[24px]">storefront</span>
              </div>
              <h3 className="text-base font-bold font-display text-on-surface mb-1.5">
                Pemberdayaan Ritel Komersial Lokal
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Mendorong kemandirian warung kelontong dan warkop pedesaan dengan skema pembayaran tempo (TOP) dan ketersediaan stok konsisten.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: VISI DAN MISI                                 */}
      {/* ========================================================= */}
      <section className="py-14 bg-surface-container-low border-y border-surface-container-high">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              ARAH DAN TUJUAN KAMI
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-on-surface mt-1">
              Visi dan Misi Perusahaan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 md:p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase">
                <Target className="h-4 w-4" />
                <span>Visi Perusahaan</span>
              </div>
              <h3 className="text-xl font-bold font-display text-on-surface leading-snug">
                Menjadi Jaringan Distribusi FMCG Terbaik dan Paling Terpercaya di Jawa Timur
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Membangun ekosistem logistik rantai pasok cerdas yang menghubungkan produsen nasional dengan jutaan titik ritel tradisional secara berkeadilan, transparan, dan berkelanjutan.
              </p>
            </div>

            <div className="p-6 md:p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase">
                <Truck className="h-4 w-4" />
                <span>Misi Operasional</span>
              </div>
              <ul className="space-y-2.5 text-xs text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Menjamin ketersediaan produk FMCG Mayora bermutu tinggi tanpa risiko stockout.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Menyediakan armada pengiriman terjadwal dengan waktu tempuh maksimal 24 jam.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Mendukung digitalisasi pencatatan stok dan kemudahan reorder bagi warung kelontong.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: 4 NILAI UTAMA (CORE VALUES)                   */}
      {/* ========================================================= */}
      <section className="py-14 bg-surface">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              PRINSIP OPERASIONAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-on-surface mt-1">
              Nilai yang Kami Utamakan
            </h2>
            <p className="text-xs text-on-surface-variant mt-1.5">
              Empat pilar integritas yang mendasari setiap interaksi kami dengan mitra toko:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((v, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-xl bg-surface-container-lowest border border-surface-container-high hover:border-primary transition-all duration-200 shadow-xs"
              >
                <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-surface-container-high flex items-center justify-center text-primary-container mb-4">
                  <span className="material-symbols-outlined text-[26px]">{v.icon}</span>
                </div>
                <h3 className="text-base font-bold font-display text-on-surface mb-1.5">
                  {v.title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: DEPOT KRIAN & CTA                             */}
      {/* ========================================================= */}
      <section className="py-14 bg-surface-container-low border-t border-surface-container-high">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-surface-container-high p-2 bg-surface-container-lowest shadow-sm">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAGQkQYRt40vnNRsDYm-VMGWqacaUxoQ3onk5tLEPJ9mVQ3W5DRTnVuLDQ3SzzLXDwAv28jBcUws1-jqVL0nkkzdGp_xkH_luQ4vOaFWBho53feighZC4uWR1t1KRhPUd3hjUSMq8M_sAwLu8C-CV-DZ05DSaxDBzCJZfeXk6z0jCxLFG8c9pML3D2GfkqZlOpCcSKqUnPcUjWmQoUhghor8IX4VRuc0hRyCdRlU8"
                alt="Fasilitas Depo Distribusi Cabang Krian"
                className="w-full h-72 sm:h-80 object-cover rounded-xl"
              />
            </div>

            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                FASILITAS DEPOT REGIONAL
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-on-surface">
                Mengenal Fasilitas Depo Cabang Krian
              </h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Depo Krian berlokasi di simpul gerbang barat Sidoarjo, memiliki fasilitas racking bertingkat dengan kapasitas simpan hingga 15.000 karton dan 6 pintu loading dock simultan. Sistem ini memungkinkan muat cepat armada boks wingbox dan canter untuk memastikan distribusi tanpa penundaan.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => handleNav('partnership')}
                  className="px-6 py-3 rounded-lg bg-primary-container text-white text-xs font-bold hover:bg-secondary-container transition-colors shadow-sm"
                >
                  Daftar Kemitraan Sekarang →
                </button>
                <button
                  onClick={() => handleNav('contact')}
                  className="px-5 py-3 rounded-lg border border-surface-variant text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors"
                >
                  Hubungi Kantor Cabang
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
