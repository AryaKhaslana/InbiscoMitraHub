import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Sparkles, 
  Brain, 
  Truck, 
  CheckCircle2, 
  Sliders, 
  AlertTriangle, 
  FileSpreadsheet, 
  Clock, 
  Boxes, 
  Check, 
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { formatRupiah } from '../../lib/utils';
import confetti from 'canvas-confetti';

export default function SmartRecommendations({ setCurrentScreen }) {
  const [recommendations, setRecommendations] = useState([
    {
      id: 'REC-01',
      poCode: 'PO-REC-2026-0881',
      distributor: 'CV Surya Krian Logistik',
      distId: '#DIST-KR-04',
      territory: 'Krian, Balongbendo & Wonoayu, Sidoarjo • Rute Hub Koridor Barat',
      originDc: 'DC Pasuruan (42 km)',
      sku: 'Roma Kelapa 300g',
      category: 'Biskuit & Makanan Ringan',
      skuCode: 'MYR-BIS-001',
      recommendedDus: 850,
      totalValue: 182750000,
      urgency: 'CRITICAL',
      urgencyLabel: 'Prioritas Kritis - Segera Eksekusi',
      urgencyColor: 'bg-red-100 text-red-800 border-red-200',
      ads: 175,
      leadTimeDays: 3,
      safetyStock: 200,
      currentStock: 120,
      ftlPercent: 84.5,
      truckType: 'Isuzu Giga FVR Wingbox',
      approved: false,
      imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&auto=format&fit=crop&q=60'
    },
    {
      id: 'REC-02',
      poCode: 'PO-REC-2026-0882',
      distributor: 'Toko Grosir Jaya Abadi',
      distId: '#DIST-SDA-09',
      territory: 'Sidoarjo Kota & Buduran • Hub Koridor Timur',
      originDc: 'DC Pasuruan (38 km)',
      sku: 'Beng-Beng Regular 20g',
      category: 'Cokelat & Wafer',
      skuCode: 'MYR-WFR-002',
      recommendedDus: 400,
      totalValue: 86000000,
      urgency: 'MEDIUM',
      urgencyLabel: 'Prioritas Menengah - Siklus Reguler',
      urgencyColor: 'bg-amber-100 text-amber-800 border-amber-200',
      ads: 90,
      leadTimeDays: 2,
      safetyStock: 150,
      currentStock: 210,
      ftlPercent: 52.0,
      truckType: 'Colt Diesel Double (CDD)',
      approved: false,
      imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=200&auto=format&fit=crop&q=60'
    },
    {
      id: 'REC-03',
      poCode: 'PO-REC-2026-0883',
      distributor: 'UD Makmur Sentosa',
      distId: '#DIST-MLG-02',
      territory: 'Singosari & Malang Utara • Koridor Pegunungan',
      originDc: 'DC Singosari (18 km)',
      sku: 'Torabika Duo 25g',
      category: 'Kopi & Minuman',
      skuCode: 'MYR-KOP-003',
      recommendedDus: 600,
      totalValue: 89100000,
      urgency: 'SCHEDULED',
      urgencyLabel: 'Prioritas Terjadwal',
      urgencyColor: 'bg-blue-100 text-blue-800 border-blue-200',
      ads: 110,
      leadTimeDays: 4,
      safetyStock: 180,
      currentStock: 180,
      ftlPercent: 72.0,
      truckType: 'Fuso Fighter 6x2',
      approved: false,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=60'
    }
  ]);

  const [batchApproved, setBatchApproved] = useState(false);

  const handleApproveOne = (id) => {
    setRecommendations(prev => prev.map(rec => rec.id === id ? { ...rec, approved: true } : rec));
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
  };

  const handleApproveAll = () => {
    setRecommendations(prev => prev.map(rec => ({ ...rec, approved: true })));
    setBatchApproved(true);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider mb-1">
            <Brain className="h-4 w-4" />
            <span>HQ Replenishment Engine • Explainable AI Mayora Enterprise</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-on-surface">
            Prescriptive Replenishment Engine
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
            Sistem optimasi alokasi inventaris otomatis Mayora Enterprise HQ. Mengalkulasi laju penjualan dinamis (ADS), waktu tempuh logistik, dan utilitas kubikasi armada wingbox secara transparan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start lg:self-auto">
          <Button
            onClick={() => alert('Log audit algoritma preskriptif berhasil diunduh (format CSV).')}
            variant="outline"
            className="text-xs h-9"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5" />
            <span>Unduh Log Rekomendasi</span>
          </Button>

          <Button
            onClick={handleApproveAll}
            disabled={batchApproved}
            className="bg-primary text-white text-xs font-bold h-9 px-4 hover:bg-primary-container shadow-xs flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{batchApproved ? 'Semua PO Terotorisasi' : 'Otorisasi Semua PO Rekomendasi'}</span>
          </Button>
        </div>
      </div>

      {/* Badges Strip */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold">
          <Sparkles className="h-3.5 w-3.5" />
          EXPLAINABLE REPLENISHMENT AI
        </span>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          28 MITRA TERMONITOR REAL-TIME
        </span>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Zero Hallucination Protocol Active
        </span>
      </div>

      {/* Recommendation Cards */}
      <div className="space-y-6">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="border border-outline/10 shadow-xs overflow-hidden">
            {/* Card Header Strip */}
            <div className="bg-surface-container-low px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-outline/10">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shrink-0 ${
                  rec.urgency === 'CRITICAL' ? 'bg-red-600' : rec.urgency === 'MEDIUM' ? 'bg-amber-600' : 'bg-blue-600'
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-on-surface">{rec.distributor}</h3>
                    <span className="text-xs font-mono text-on-surface-variant">{rec.distId}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${rec.urgencyColor}`}>
                      {rec.urgencyLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">{rec.territory}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono bg-surface-container-lowest px-2 py-1 rounded text-on-surface-variant font-bold">
                  {rec.poCode}
                </span>
                <span className="bg-primary/10 text-primary font-semibold px-2 py-1 rounded">
                  {rec.originDc}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                {/* Left: Product & Quantity (4 cols) */}
                <div className="lg:col-span-4 flex items-center gap-4">
                  <img
                    src={rec.imageUrl}
                    alt={rec.sku}
                    className="w-20 h-20 object-cover rounded-lg border border-outline/15 shrink-0"
                  />
                  <div>
                    <div className="text-[10px] text-primary uppercase font-bold tracking-wider">{rec.category}</div>
                    <h4 className="text-base font-bold text-on-surface leading-tight mt-0.5">{rec.sku}</h4>
                    <div className="text-[11px] text-on-surface-variant font-mono mt-0.5">{rec.skuCode}</div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-primary font-mono">{rec.recommendedDus}</span>
                      <span className="text-xs font-semibold text-on-surface">Karton Dus</span>
                    </div>
                    <div className="text-xs font-bold text-on-surface-variant mt-0.5">
                      Est. Nilai: <span className="font-mono text-on-surface">{formatRupiah(rec.totalValue)}</span>
                    </div>
                  </div>
                </div>

                {/* Center: Explainable AI Logic & Metrics (5 cols) */}
                <div className="lg:col-span-5 p-3.5 bg-surface-container-low rounded-xl border border-outline/10 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-on-surface flex items-center gap-1.5">
                      <Brain className="h-3.5 w-3.5 text-primary" />
                      Kalkulasi Explainable AI (Formula Dinamis)
                    </span>
                    <Badge variant="tertiary" className="text-[9px] py-0 px-1 font-mono">GTNIC Model</Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-1.5 bg-surface-container-lowest rounded">
                      <div className="text-[9px] text-on-surface-variant">Laju (ADS)</div>
                      <div className="font-bold font-mono text-[11px] mt-0.5">{rec.ads} Dus</div>
                    </div>
                    <div className="p-1.5 bg-surface-container-lowest rounded">
                      <div className="text-[9px] text-on-surface-variant">Lead Time</div>
                      <div className="font-bold font-mono text-[11px] mt-0.5">{rec.leadTimeDays} Hari</div>
                    </div>
                    <div className="p-1.5 bg-surface-container-lowest rounded">
                      <div className="text-[9px] text-on-surface-variant">Buffer SS</div>
                      <div className="font-bold font-mono text-[11px] mt-0.5 text-emerald-700">+{rec.safetyStock}</div>
                    </div>
                    <div className="p-1.5 bg-surface-container-lowest rounded">
                      <div className="text-[9px] text-on-surface-variant">Stok Riil</div>
                      <div className="font-bold font-mono text-[11px] mt-0.5 text-error">{rec.currentStock}</div>
                    </div>
                  </div>

                  {/* FTL Wingbox utilization */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-on-surface-variant flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        <span>Armada: {rec.truckType}</span>
                      </span>
                      <span className="font-mono font-bold text-on-surface">{rec.ftlPercent}% FTL</span>
                    </div>
                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${rec.ftlPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Actions & Approval Status (3 cols) */}
                <div className="lg:col-span-3 flex flex-col items-stretch gap-2.5">
                  {rec.approved ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center space-y-1">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>PO Telah Diotorisasi!</span>
                      </div>
                      <p className="text-[10px] text-emerald-700">
                        Manifest dikirim ke DC Pasuruan untuk rilis armada esok subuh.
                      </p>
                    </div>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleApproveOne(rec.id)}
                        className="w-full bg-primary text-white text-xs font-bold py-2.5 hover:bg-primary-container shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Check className="h-4 w-4" />
                        <span>Otorisasi PO Ini</span>
                      </Button>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => setCurrentScreen && setCurrentScreen('what-if-simulator')}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-[11px] h-8"
                        >
                          <Sliders className="h-3 w-3 mr-1" />
                          Simulasi
                        </Button>
                        <Button
                          onClick={() => setCurrentScreen && setCurrentScreen('distributor-overview')}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-[11px] h-8"
                        >
                          Lihat Gudang
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Governance Note */}
      <Card className="border border-outline/10 shadow-xs bg-surface-container-low">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-on-surface">Kepatuhan Algoritma Tata Kelola Mayora (Enterprise Governance Note)</div>
            <div className="text-on-surface-variant mt-0.5 leading-relaxed">
              Seluruh rekomendasi alokasi inventaris tunduk pada batas kredit distributor yang diverifikasi perbankan dan kapasitas maksimal tonase armada logistik sesuai regulasi Dishub Jawa Timur.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
