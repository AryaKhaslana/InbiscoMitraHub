import React from 'react';

export default function PublicFooter({ setActiveNav }) {
  const currentYear = new Date().getFullYear();

  const handleNav = (id, param) => {
    if (setActiveNav) {
      setActiveNav(id, param);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-[#181313] text-white/90 border-t border-[#332b2b] pt-14 pb-8" id="kontak">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.3fr_1.4fr] gap-x-10 gap-y-10 items-start mb-12">
          {/* Brand & Corporate Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-white shadow-xs">
                <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
              </div>
              <div>
                <span className="text-xl font-bold font-display text-white tracking-tight block leading-tight">
                  Inbisco MitraHub
                </span>
                <span className="text-[11px] text-[#a0908e] tracking-wide block">
                  Distribusi Resmi Mayora Group
                </span>
              </div>
            </div>
            <p className="text-sm text-[#b0a2a0] leading-relaxed">
              PT Inbisco Niagatama Semesta — Cabang Krian adalah pusat distribusi logistik resmi FMCG Mayora Group untuk wilayah Kabupaten Sidoarjo dan sekitarnya. Melayani kemitraan pasokan toko kelontong, warkop, ritel modern, dan grosir secara langsung dan terpercaya.
            </p>
            <div className="pt-1 text-xs text-[#b0a2a0] space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[#e2d5d3] font-medium">Cakupan Wilayah:</span>
                <span>18 Kecamatan di Kabupaten Sidoarjo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#e2d5d3] font-medium">Standar Distribusi:</span>
                <span>GDP & Kepatuhan Keamanan Pangan</span>
              </div>
            </div>
          </div>

          {/* Navigasi Layanan */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Navigasi Layanan
            </h3>
            <ul className="space-y-2.5 text-sm text-[#b0a2a0]">
              <li>
                <button type="button" onClick={() => handleNav('home')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Beranda
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('about')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Profil & Cabang
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('products')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Katalog Produk FMCG
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('moments')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Aktivitas & Jaringan
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('partnership')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Pendaftaran Mitra Toko
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('contact')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Kontak Cabang & FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Kategori Pasokan Utama */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Pasokan Produk Utama
            </h3>
            <ul className="space-y-2.5 text-sm text-[#b0a2a0]">
              <li>
                <button type="button" onClick={() => handleNav('products', 'Biskuit')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Biskuit & Roti (Roma Kelapa, Sari Gandum)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('products', 'Wafer & Cokelat')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Wafer & Cokelat (Beng-Beng, Malkist)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('products', 'Kopi & Teh')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Kopi Olahan (Torabika Duo, Creamy Latte)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('products', 'Sereal & Minuman')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Sereal Bergizi (Energen Cokelat & Vanila)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('products', 'Permen')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Kembang Gula (Kopiko, Kis Mint)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('products', 'Air Mineral')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Air Mineral Pegunungan (Le Minerale)
                </button>
              </li>
            </ul>
          </div>

          {/* Hubungi Kantor Cabang & Jam Operasional */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Kantor & Depot Distribusi
            </h3>
            <div className="space-y-2.5 text-sm text-[#b0a2a0]">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">location_on</span>
                <span>Jl. Raya Krian KM 29, Krian, Kabupaten Sidoarjo, Jawa Timur 61262</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary shrink-0">call</span>
                <span>WhatsApp: +62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary shrink-0">mail</span>
                <span>mitrahub.krian@inbisco.co.id</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">schedule</span>
                <span>Senin – Sabtu: 07:00 – 17:00 WIB</span>
              </div>
              <div className="pt-2 flex flex-col gap-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleNav('partnership')}
                  className="py-1.5 text-white hover:underline text-left inline-flex items-center cursor-pointer min-h-[32px]"
                >
                  Daftar Kemitraan Toko →
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('login')}
                  className="py-1.5 text-[#d0c0be] hover:text-white hover:underline text-left inline-flex items-center cursor-pointer min-h-[32px]"
                >
                  Portal Masuk B2B Operasional →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Corporate Legal & Copyright */}
        <div className="pt-6 border-t border-[#332b2b] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#a0908e]">
          <div>
            © {currentYear} PT Inbisco Niagatama Semesta — Cabang Krian. Seluruh hak cipta dilindungi undang-undang.
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[#b0a2a0]">
            <button
              type="button"
              onClick={() => handleNav('contact')}
              className="py-1.5 hover:text-white transition-colors text-left cursor-pointer min-h-[32px] inline-flex items-center"
            >
              Pusat Bantuan & FAQ
            </button>
            <span aria-hidden="true">•</span>
            <button
              type="button"
              onClick={() => handleNav('about')}
              className="py-1.5 hover:text-white transition-colors text-left cursor-pointer min-h-[32px] inline-flex items-center"
            >
              SOP Logistik & Retur
            </button>
            <span aria-hidden="true">•</span>
            <button
              type="button"
              onClick={() => handleNav('partnership')}
              className="py-1.5 hover:text-white transition-colors text-left cursor-pointer min-h-[32px] inline-flex items-center"
            >
              Syarat Kemitraan
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
