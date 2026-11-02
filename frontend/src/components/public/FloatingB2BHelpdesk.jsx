import React, { useState } from 'react';
import { 
  MessageSquare, 
  X, 
  ChevronDown, 
  Truck, 
  Package, 
  CreditCard, 
  ArrowRight, 
  Clock, 
  PhoneCall, 
  Building2,
  ExternalLink
} from 'lucide-react';

export default function FloatingB2BHelpdesk({ setActiveNav }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);

  const quickFaqs = [
    {
      title: 'Jadwal Rute Armada Sidoarjo',
      icon: <Truck className="h-4 w-4 text-primary shrink-0" />,
      content: 'Armada boks Mayora beroperasi rutin Senin – Sabtu. Pesanan yang terkonfirmasi sebelum pukul 14:00 WIB tiba H+1 di 18 kecamatan Sidoarjo tanpa biaya ongkir.',
    },
    {
      title: 'Minimal Order (MOQ) & Retur',
      icon: <Package className="h-4 w-4 text-emerald-700 shrink-0" />,
      content: 'Mulai dari 1 karton per varian (bisa campur SKU Roma, Beng-Beng, Torabika). Retur dus cacat atau rusak di jalan langsung diproses ganti baru saat serah terima.',
    },
    {
      title: 'Fasilitas Tempo Pembayaran (TOP)',
      icon: <CreditCard className="h-4 w-4 text-amber-700 shrink-0" />,
      content: 'Fasilitas tempo 7 – 14 hari dibuka bagi toko yang telah aktif memesan tunai/COD minimal 3 kali dan diverifikasi oleh perwakilan sales wilayah Anda.',
    },
  ];

  const waMessage = encodeURIComponent(
    'Halo Tim Sales PT Inbisco Niagatama Semesta (Cabang Krian), saya pemilik toko ingin konsultasi pasokan produk Mayora dan jadwal pengiriman rute armada.'
  );
  const waUrl = `https://wa.me/6281234567890?text=${waMessage}`;

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      {/* Expanded Helpdesk Card */}
      {isOpen && (
        <div className="mb-3 w-88 sm:w-96 max-w-[calc(100vw-2.5rem)] bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-2xl overflow-hidden anim-modal flex flex-col">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#128C7E] to-[#075E54] text-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-display leading-tight">
                    Pusat Bantuan Cabang Krian
                  </h4>
                  <span className="text-[11px] text-white/80 block mt-0.5">
                    PT Inbisco Niagatama Semesta
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Tutup Helpdesk"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] bg-white/10 px-2.5 py-1 rounded-lg">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                <span>Layanan Depot Krian Aktif</span>
              </span>
              <span className="font-mono text-[10px] text-white/90">07:00 – 17:00 WIB</span>
            </div>
          </div>

          {/* Quick Informative Answers */}
          <div className="p-4 space-y-2.5 bg-surface-container-lowest">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
              Pertanyaan Cepat Mitra Toko:
            </span>

            <div className="space-y-1.5">
              {quickFaqs.map((faq, idx) => {
                const isActive = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-surface-container-high bg-surface-container-low overflow-hidden text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isActive ? -1 : idx)}
                      className="w-full p-2.5 flex items-center justify-between text-left font-semibold text-on-surface hover:text-primary transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        {faq.icon}
                        <span className="truncate">{faq.title}</span>
                      </div>
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-outline transition-transform duration-200 shrink-0 ${
                          isActive ? 'rotate-180 text-primary' : ''
                        }`}
                      />
                    </button>
                    {isActive && (
                      <div className="px-3 pb-3 pt-0 text-[11px] text-on-surface-variant leading-relaxed border-t border-surface-container-high/60 mt-0.5">
                        <div className="pt-2">{faq.content}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Direct Official WhatsApp Escalation */}
            <div className="pt-2 space-y-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1ebc57] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat WhatsApp Sales Cabang</span>
                <ExternalLink className="h-3 w-3 opacity-80" />
              </a>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (setActiveNav) {
                    setActiveNav('contact');
                  }
                }}
                className="w-full py-1.5 text-center text-xs text-on-surface-variant hover:text-primary font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Lihat Formulir & Rute Pengiriman Lengkap</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Pill Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-3 rounded-full text-white shadow-xl transition-all duration-300 flex items-center gap-2.5 font-bold text-xs cursor-pointer group hover:scale-105 active:scale-95 ${
          isOpen
            ? 'bg-neutral-800 hover:bg-neutral-900'
            : 'bg-gradient-to-r from-[#128C7E] to-[#075E54] hover:shadow-2xl'
        }`}
        aria-label="Buka Pusat Bantuan B2B"
      >
        {isOpen ? (
          <>
            <X className="h-4 w-4" />
            <span>Tutup Bantuan</span>
          </>
        ) : (
          <>
            <div className="relative">
              <MessageSquare className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-white"></span>
            </div>
            <span>B2B Hotline Cabang Krian</span>
          </>
        )}
      </button>
    </div>
  );
}

