import React from 'react';

export default function PublicFooter({ setActiveNav }) {
  const handleNav = (id) => {
    if (setActiveNav) {
      setActiveNav(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-[#1a1414] text-white/90 border-t border-[#362f2f] pt-14 pb-8" id="kontak">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
              </div>
              <span className="text-xl font-bold font-display text-white tracking-tight">
                Inbisco MitraHub
              </span>
            </div>
            <p className="text-sm text-[#b0a2a0] leading-relaxed">
              PT Inbisco Niagatama Semesta — Cabang Krian adalah unit distribusi regional resmi untuk produk Fast-Moving Consumer Goods (FMCG) terkemuka Mayora di wilayah Sidoarjo dan perimeter Jawa Timur.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#bd0000]/20 text-[11px] font-mono text-tertiary-container border border-tertiary-container/30">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span>
                DEPOT KRIAN OPERASIONAL
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 text-[11px] font-mono text-white/80">
                GTNIC 2026 INOVASI
              </span>
            </div>
          </div>

          {/* Navigasi */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Navigasi
            </h4>
            <ul className="space-y-2 text-sm text-[#b0a2a0]">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-white transition-colors">
                  Beranda
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-white transition-colors">
                  Tentang Kami
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('moments')} className="hover:text-white transition-colors">
                  Aktivitas & Jaringan
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('partnership')} className="hover:text-white transition-colors">
                  Peluang Kemitraan
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-white transition-colors">
                  Kontak Cabang
                </button>
              </li>
            </ul>
          </div>

          {/* Kategori Produk */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Kategori Produk
            </h4>
            <ul className="space-y-2 text-sm text-[#b0a2a0]">
              <li>
                <button onClick={() => handleNav('products')} className="hover:text-white transition-colors">
                  Semua Produk FMCG
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('products')} className="hover:text-white transition-colors">
                  Biskuit Roma Kelapa
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('products')} className="hover:text-white transition-colors">
                  Wafer & Cokelat Beng-Beng
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('products')} className="hover:text-white transition-colors">
                  Kopi Torabika & Kopiko Candy
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('products')} className="hover:text-white transition-colors">
                  Sereal Cokelat Energen
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('products')} className="hover:text-white transition-colors">
                  Air Mineral Le Minerale
                </button>
              </li>
            </ul>
          </div>

          {/* Hubungi Kantor Cabang */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Hubungi Kantor Cabang
            </h4>
            <div className="space-y-2.5 text-sm text-[#b0a2a0]">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-tertiary-container shrink-0 mt-0.5">location_on</span>
                <span>Jl. Raya Krian KM 29, Krian, Sidoarjo, Jawa Timur 61262</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-tertiary-container shrink-0">call</span>
                <span>WhatsApp: +62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-tertiary-container shrink-0">mail</span>
                <span>mitrahub.krian@inbisco.co.id</span>
              </div>
              <div className="pt-2 flex flex-col gap-1.5 text-xs font-bold">
                <button onClick={() => handleNav('partnership')} className="text-white hover:underline text-left">
                  Daftar Kemitraan Toko →
                </button>
                <button onClick={() => handleNav('login')} className="text-white hover:underline text-left">
                  Portal Masuk B2B Operasional →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* GTNIC Team Credential & Copyright */}
        <div className="pt-6 border-t border-[#362f2f] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#a0908e]">
          <div>
            © 2026 PT Inbisco Niagatama Semesta — Cabang Krian. Inovasi Garda Tech National Innovation Competition (GTNIC) 2026.
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white/90">SMK Telkom Sidoarjo:</span>
            <span>Raka Al-islami</span>
            <span>•</span>
            <span>Arya Chaka Braja Wisesa</span>
            <span>•</span>
            <span>Allifa Qurrota Ayunina</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
