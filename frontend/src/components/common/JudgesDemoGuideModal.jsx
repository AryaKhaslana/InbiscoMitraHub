import React, { useState } from 'react';
import { 
  Compass, 
  X, 
  ChevronRight, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Check, 
  Database,
  ExternalLink,
  Layers,
  Store,
  Warehouse
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export default function JudgesDemoGuideModal({ setActiveNav, switchRole, setAdminScreen, activeRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const demoSteps = [
    {
      step: 1,
      title: 'Pemesanan Toko Mitra (Storefront)',
      badge: 'Public Portal',
      desc: 'Toko memesan karton Mayora di katalog publik dengan pilihan bayar COD atau Tempo 14 Hari.',
      backendProof: 'Atomic Prisma transaction: stok fisik terpotong riil & nomor resi unik diterbitkan.',
      actionLabel: 'Buka Katalog Produk',
      actionIcon: ShoppingBag,
      onClick: () => {
        if (activeRole !== 'storefront' && switchRole) switchRole('storefront', 'products');
        else if (setActiveNav) setActiveNav('products');
        setIsOpen(false);
      },
    },
    {
      step: 2,
      title: 'Antrean & Dispatch Gudang (Depo Krian)',
      badge: 'Gudang FEFO',
      desc: 'Admin depo memvalidasi PO dan memajukan status berurutan: Konfirmasi → Packing FEFO → Kirim Armada.',
      backendProof: 'One-Way State Machine (PENDING → CONFIRMED → PACKING → DISPATCHED).',
      actionLabel: 'Buka Antrean Admin',
      actionIcon: Warehouse,
      onClick: () => {
        if (activeRole === 'storefront' && switchRole) switchRole('hq_admin');
        if (setAdminScreen) setAdminScreen('order-tracking');
        setIsOpen(false);
      },
    },
    {
      step: 3,
      title: 'Pelacakan Pengiriman & Faktur Resmi',
      badge: 'Live e-POD',
      desc: 'Toko melacak armada Suzuki Carry Box (W 8821 NA) dan dapat mencetak faktur PDF ber-PPN 11%.',
      backendProof: 'Cari bisa pakai nomor resi atau No. WhatsApp Toko. Data tersimpan di localStorage.',
      actionLabel: 'Buka Status Pesanan',
      actionIcon: Truck,
      onClick: () => {
        if (activeRole !== 'storefront' && switchRole) switchRole('storefront', 'track-order');
        else if (setActiveNav) setActiveNav('track-order', 'INB-2610-KR06');
        setIsOpen(false);
      },
    },
    {
      step: 4,
      title: 'Validasi Serah Terima & Audit Trail',
      badge: 'Governance',
      desc: 'Verifikasi tanda terima e-POD / BAST. Seluruh riwayat transaksi terkunci permanen di database.',
      backendProof: 'Audit Trail mencatat aktor, query, mutasi stok, dan timestamp secara immutable.',
      actionLabel: 'Buka Audit Trail & Log',
      actionIcon: FileText,
      onClick: () => {
        if (activeRole === 'storefront' && switchRole) switchRole('hq_admin');
        if (setAdminScreen) setAdminScreen('audit-logs');
        setIsOpen(false);
      },
    },
  ];

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <>
      {/* Floating Pill Trigger */}
      <div className={`fixed z-40 select-none ${activeRole === 'storefront' ? 'bottom-5 left-5' : 'bottom-5 right-5'}`}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-primary to-[#a80000] text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Compass className="h-3.5 w-3.5 text-white animate-spin-slow" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-display tracking-tight">Skenario Demo Juri</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <span className="text-[10px] text-white/80 block font-sans">Alur Pengujian 2 Menit</span>
          </div>
          <ChevronRight className="h-4 w-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest border border-outline/15 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8 cursor-default relative overflow-hidden"
          >
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-emerald-600 to-primary"></div>

            {/* Header */}
            <div className="flex items-start justify-between pt-1">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="tertiary" className="text-[10px] uppercase font-bold py-0.5 px-2">
                    GTNIC 2026 Innovation Showcase
                  </Badge>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center gap-1">
                    <Database className="h-3 w-3" /> Live Supabase PostgreSQL
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-on-surface">
                  Panduan Pengujian Sistem Rantai Pasok
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Gunakan 4 langkah praktis ini untuk memverifikasi bahwa sistem bekerja utuh (*end-to-end*): mulai dari pemesanan ritel hingga penegakan tata kelola logistik.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 4 Steps Bento Grid */}
            <div className="space-y-3">
              {demoSteps.map((st) => {
                const Icon = st.actionIcon;
                return (
                  <div
                    key={st.step}
                    className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container-high hover:border-primary/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {st.step}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-on-surface">{st.title}</h4>
                          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface-variant">
                            {st.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-tight">{st.desc}</p>
                        <div className="text-[10px] text-primary font-mono flex items-center gap-1">
                          <span>✓ {st.backendProof}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={st.onClick}
                      className="text-xs font-bold h-8 px-3.5 gap-1.5 bg-primary-container text-white shadow-xs hover:bg-primary shrink-0 cursor-pointer w-full sm:w-auto"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{st.actionLabel}</span>
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Quick Demo Data Box */}
            <div className="p-3 bg-surface-container-low/70 rounded-xl border border-surface-container-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-on-surface flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Nomor Resi Siap Uji (Klik untuk Salin):
                </span>
                <span className="text-[10px] text-on-surface-variant block">
                  Bisa dimasukkan ke portal pelacakan pesanan atau cari dengan no WhatsApp toko.
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {['INB-2610-KR06', 'INB-2610-KR05'].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleCopy(code)}
                    className="px-2.5 py-1 rounded-lg bg-surface-container-lowest border border-surface-container-high hover:border-primary text-[11px] font-mono text-on-surface hover:text-primary transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <span>{code}</span>
                    {copiedCode === code ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-outline" />}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    if (activeRole !== 'storefront' && switchRole) switchRole('storefront', 'driver');
                    else if (setActiveNav) setActiveNav('driver');
                    setIsOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Buka portal transmitter GPS smartphone driver"
                >
                  <span>📱 Portal Driver GPS</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-2 border-t border-surface-container-high flex items-center justify-between text-[11px] text-outline">
              <span>Arsitektur: React 19 • Node.js Express • Supabase PostgreSQL • Prisma ORM</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-xs h-8 px-4 cursor-pointer"
              >
                Tutup Panduan
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

