import React from 'react';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Truck, Navigation, ShieldCheck, Factory, Warehouse, Store, ArrowRight } from 'lucide-react';

export default function Moments() {
  const steps = [
    {
      step: '01',
      title: 'Pabrik & Central DC Pasuruan',
      desc: 'Produk Mayora (Roma Kelapa, Beng-Beng, Torabika) selesai diproduksi dengan segel batch dan kode FEFO.',
      icon: Factory,
      metric: 'Batch QC 100% Lolos',
    },
    {
      step: '02',
      title: 'Tronton Wingbox Antar-Depo',
      desc: 'Pengiriman via tol Trans Jawa Pandaan Menuju Krian dengan e-Lock seal and GPS telemetry real-time.',
      icon: Truck,
      metric: 'Transit Time: 1.5 Jam',
    },
    {
      step: '03',
      title: 'Depo Krian Sorting & Staging',
      desc: 'Penerimaan barang fisik, pencocokan nomor BAST, dan penataan rak FEFO berdasar tanggal kedaluwarsa.',
      icon: Warehouse,
      metric: 'Kapasitas 12.000 Dus',
    },
    {
      step: '04',
      title: 'Armada Canter Last-Mile ke Warung',
      desc: 'Distribusi gelombang 1 (Pagi) dan gelombang 2 (Siang) mengantar pesanan langsung ke etalase toko mitra.',
      icon: Store,
      metric: 'SLA < 24 Jam Pasti Tiba',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="space-y-3 max-w-2xl">
        <Badge variant="tertiary" className="text-xs uppercase">Jejak Distribusi & Armada</Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
          Perjalanan Dari Pabrik Hingga Ke Tangan Konsumen
        </h1>
        <p className="text-sm text-on-surface-variant">
          Simulasi rute rantai pasok cerdas yang menjaga ketersediaan barang dengan efisiensi tinggi dan nihil keterlambatan.
        </p>
      </div>

      {/* TIMELINE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Card key={s.step} className="border-outline/10 relative overflow-hidden flex flex-col justify-between">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-outline/30">{s.step}</span>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="font-bold text-base text-on-surface leading-tight">{s.title}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{s.desc}</p>
              </div>
              <div className="p-4 bg-surface-container-low border-t border-outline/10 flex items-center justify-between text-xs">
                <span className="font-semibold text-primary">{s.metric}</span>
                {idx < 3 && <ArrowRight className="h-4 w-4 text-outline hidden lg:block" />}
              </div>
            </Card>
          );
        })}
      </div>

      {/* ARMADA TELEMETRY SHOWCASE */}
      <div className="p-8 bg-surface-container-low rounded-2xl border border-outline/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Sistem Pemantauan Armada Logistik Cerdas
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Setiap truk pengiriman dilengkapi dengan sensor IoT GPS dan e-Lock tamper-proof seal.
            </p>
          </div>
          <Badge variant="success" className="text-xs py-1 px-3">
            Armada Aktif: 12 Canter + 4 Wingbox
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline/10 space-y-1">
            <span className="text-xs text-outline font-semibold">Kecepatan Rata-Rata Jalur Tol:</span>
            <div className="text-xl font-black text-on-surface">62 km/jam</div>
            <div className="text-[11px] text-emerald-700">Rute Optimal: Pandaan – Porong – Krian</div>
          </div>

          <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline/10 space-y-1">
            <span className="text-xs text-outline font-semibold">Status e-Lock Segel Box:</span>
            <div className="text-xl font-black text-emerald-700">TERKUNCI AMAN</div>
            <div className="text-[11px] text-on-surface-variant">Sensor pembuka hanya via QR BAST Depo</div>
          </div>

          <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline/10 space-y-1">
            <span className="text-xs text-outline font-semibold">Kapasitas Muatan (FTL Rate):</span>
            <div className="text-xl font-black text-primary">88.5% Efisien</div>
            <div className="text-[11px] text-on-surface-variant">Konsolidasi muatan ramah lingkungan</div>
          </div>
        </div>
      </div>
    </div>
  );
}
