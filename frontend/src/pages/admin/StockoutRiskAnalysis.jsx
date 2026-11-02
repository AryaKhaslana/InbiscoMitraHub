import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert, 
  DollarSign, 
  Clock, 
  Truck, 
  CheckCircle2, 
  Sliders, 
  Sparkles,
  MapPin,
  RefreshCw,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { formatRupiah } from '../../lib/utils';
import confetti from 'canvas-confetti';

export default function StockoutRiskAnalysis({ setCurrentScreen }) {
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [transferAuthorized, setTransferAuthorized] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const initialItems = [
    {
      id: 'RISK-01',
      sku: 'Roma Kelapa 300g',
      category: 'Biskuit',
      skuCode: 'MYR-BIS-001',
      depot: 'CV Surya Krian Logistik',
      region: 'SDA',
      stockReal: 120,
      buffer: 350,
      doi: 0.8,
      doiLabel: '0.8 Hari',
      revenueAtRisk: 182750000,
      severity: 'CRITICAL',
      severityLabel: 'Kritis (<1 Hari)',
      severityColor: 'bg-red-100 text-red-800 border-red-200',
      fillPercent: 34,
      barColor: 'bg-red-600',
      actionType: 'RESTOCK_DISPATCH'
    },
    {
      id: 'RISK-02',
      sku: 'Beng-Beng Regular 20g',
      category: 'Cokelat',
      skuCode: 'MYR-WFR-002',
      depot: 'PT Sidoarjo Niaga Makmur',
      region: 'SDA',
      stockReal: 210,
      buffer: 400,
      doi: 1.4,
      doiLabel: '1.4 Hari',
      revenueAtRisk: 86000000,
      severity: 'CRITICAL',
      severityLabel: 'Kritis (<2 Hari)',
      severityColor: 'bg-red-100 text-red-800 border-red-200',
      fillPercent: 52,
      barColor: 'bg-red-600',
      actionType: 'CROSS_DEPOT'
    },
    {
      id: 'RISK-03',
      sku: 'Torabika Duo 25g',
      category: 'Kopi',
      skuCode: 'MYR-KOP-003',
      depot: 'Depot Malang Barat (Singosari)',
      region: 'MLG',
      stockReal: 180,
      buffer: 350,
      doi: 1.8,
      doiLabel: '1.8 Hari',
      revenueAtRisk: 66800000,
      severity: 'CRITICAL',
      severityLabel: 'Kritis (<2 Hari)',
      severityColor: 'bg-red-100 text-red-800 border-red-200',
      fillPercent: 51,
      barColor: 'bg-red-600',
      actionType: 'FACTORY_EXPEDITE'
    },
    {
      id: 'RISK-04',
      sku: 'Energen Cokelat 34g',
      category: 'Sarapan',
      skuCode: 'MYR-SER-004',
      depot: 'Depo Surabaya Rungkut',
      region: 'SBY',
      stockReal: 390,
      buffer: 300,
      doi: 3.2,
      doiLabel: '3.2 Hari',
      revenueAtRisk: 42000000,
      severity: 'WARNING',
      severityLabel: 'Waspada (3 Hari)',
      severityColor: 'bg-amber-100 text-amber-800 border-amber-200',
      fillPercent: 75,
      barColor: 'bg-amber-500',
      actionType: 'MONITOR'
    },
    {
      id: 'RISK-05',
      sku: 'Le Minerale 600ml Galon Mini',
      category: 'Air Mineral',
      skuCode: 'MYR-AIR-005',
      depot: 'CV Surya Krian Logistik',
      region: 'SDA',
      stockReal: 580,
      buffer: 250,
      doi: 7.5,
      doiLabel: '7.5 Hari',
      revenueAtRisk: 0,
      severity: 'SAFE',
      severityLabel: 'Aman (>5 Hari)',
      severityColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      fillPercent: 95,
      barColor: 'bg-emerald-600',
      actionType: 'NONE'
    }
  ];

  const filteredItems = useMemo(() => {
    return initialItems.filter(item => {
      if (selectedRegion !== 'ALL' && item.region !== selectedRegion) return false;
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (selectedSeverity !== 'ALL' && item.severity !== selectedSeverity) return false;
      return true;
    });
  }, [selectedRegion, selectedCategory, selectedSeverity]);

  const handleAuthorizeTransfer = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      setTransferAuthorized(true);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }, 700);
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="h-4 w-4" />
            <span>HQ Early Warning Radar • Resilience Engine GTNIC 2026</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-on-surface">
            Pusat Peringatan Dini &amp; Kerentanan Stok
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Deteksi dini probabilitas kelangkaan pasokan (stockout) sebelum berdampak pada ketiadaan produk di warung &amp; ritel Jawa Timur.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Badge variant="destructive" className="text-xs font-bold animate-pulse">3 SKU Kritis Terdeteksi</Badge>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Realtime Telemetry Active</span>
          </div>
        </div>
      </div>

      {/* Summary Severity KPI Cluster (3 Distinct Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Critical Risk SKU */}
        <Card className="border border-outline/10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-600"></div>
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Tingkat Kritis (Runway &lt; 2 Hari)</span>
                <div className="text-2xl lg:text-3xl font-extrabold text-on-surface mt-1">3 SKU Terancam</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 pt-2.5 bg-surface-container-low rounded-lg p-2.5 space-y-1">
              <span className="text-[11px] font-semibold text-on-surface">Node Distribusi Terdampak:</span>
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] font-mono bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant">CV Surya Krian</span>
                <span className="text-[10px] font-mono bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant">PT Sidoarjo Dist.</span>
                <span className="text-[10px] font-mono bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant">Depot Malang Barat</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Potential Revenue at Risk */}
        <Card className="border border-outline/10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Potensi Omzet Berisiko</span>
                <div className="text-2xl lg:text-3xl font-extrabold text-on-surface mt-1">Rp 412.500.000</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 pt-2.5 bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between text-xs text-on-surface-variant">
              <span>Estimasi kerugian 48 jam:</span>
              <span className="font-mono font-bold text-red-600">-2.400 Dus B2B</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Lead Time Vulnerability Buffer */}
        <Card className="border border-outline/10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Rata-rata Waktu Penyangga (Buffer)</span>
                <div className="text-2xl lg:text-3xl font-extrabold text-on-surface mt-1">1.3 Hari</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 pt-2.5 bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between text-xs text-on-surface-variant">
              <span>Ambang Batas Minimum Aman:</span>
              <span className="font-mono font-bold text-on-surface">3.5 Hari Kerja</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Cross-Depot Balancing High Priority Mitigator (Proactive Action Card) */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container-lowest shadow-sm relative overflow-hidden">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary text-white text-[10px] uppercase font-bold tracking-wider">
                    Peluang Rerouting Cepat
                  </span>
                  <span className="text-xs font-bold text-on-surface">Keseimbangan Antar-Depot (Cross-Depot Rebalancing)</span>
                </div>
                <h3 className="text-base font-extrabold text-on-surface">
                  Transfer 300 Dus Roma Kelapa dari Depot Surabaya Rungkut ke Depot Krian
                </h3>
                <p className="text-xs text-on-surface-variant max-w-3xl">
                  Depot Rungkut saat ini memiliki surplus inventori <strong>+140% di atas buffer aman</strong> (9.2 hari). Pemindahan lintas depot melalui Tol Waru-Krian hanya memakan waktu <strong>28 menit</strong>, secara instan menaikkan runway Krian dari 0.8 hari menjadi 2.5 hari.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start lg:self-auto">
              {transferAuthorized ? (
                <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Transfer Resmi Diotorisasi (DO-XDEP-088)</span>
                </div>
              ) : (
                <Button
                  onClick={handleAuthorizeTransfer}
                  disabled={isAuthorizing}
                  className="bg-primary text-white text-xs font-bold px-4 py-2 hover:bg-primary-container shadow-xs flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isAuthorizing ? 'Mengirim Instruksi Transfer...' : 'Otorisasi Transfer Antar-Depot Sekarang'}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Quick interactive transfer route visualization bar */}
          <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-on-surface">Surabaya Rungkut (Surplus)</span>
              <span className="text-on-surface-variant font-mono">1.100 Dus</span>
            </div>
            <div className="flex-1 max-w-xs flex items-center gap-2 justify-center text-primary font-mono text-[11px] font-bold">
              <span>-300 Dus</span>
              <div className="h-0.5 flex-1 bg-primary relative">
                <div className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-primary rotate-45"></div>
              </div>
              <span className="text-emerald-700">+300 Dus</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-on-surface">Depot Krian (Kritis)</span>
              <span className="text-emerald-700 font-mono font-bold">120 Dus → 420 Dus</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Severity Matrix & Interactive Prioritization Table */}
      <Card className="border border-outline/10 shadow-xs">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-outline/10 pb-4">
            <div>
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Matriks Prioritas Risiko Stockout Seluruh Jaringan
              </h3>
              <p className="text-xs text-on-surface-variant">Evaluasi real-time SKU terhadap ambang batas kehabisan barang di level distributor.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="h-8 px-2 text-xs bg-surface-container border border-outline/20 rounded-md font-semibold"
              >
                <option value="ALL">Semua Wilayah</option>
                <option value="SDA">Sidoarjo & Krian</option>
                <option value="SBY">Surabaya Raya</option>
                <option value="MLG">Malang Raya</option>
              </select>

              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="h-8 px-2 text-xs bg-surface-container border border-outline/20 rounded-md font-semibold"
              >
                <option value="ALL">Semua Tingkat</option>
                <option value="CRITICAL">Kritis (&lt;2 Hari)</option>
                <option value="WARNING">Waspada (2-4 Hari)</option>
                <option value="SAFE">Aman (&gt;4 Hari)</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedRegion('ALL');
                  setSelectedCategory('ALL');
                  setSelectedSeverity('ALL');
                }}
                className="h-8 text-xs px-2.5"
              >
                Reset Filter
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline/10">
                  <th className="py-2.5 px-3 font-semibold uppercase tracking-wider">SKU &amp; Kategori</th>
                  <th className="py-2.5 px-3 font-semibold uppercase tracking-wider">Lokasi Depot</th>
                  <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-right">Stok Riil / Buffer</th>
                  <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-right">Runway (DoI)</th>
                  <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-right">Omzet Berisiko</th>
                  <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-center">Status</th>
                  <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-right">Tindakan Rekomendasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10 font-medium">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-on-surface">{item.sku}</div>
                      <div className="text-[10px] text-on-surface-variant font-mono">{item.skuCode} • {item.category}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-on-surface font-semibold">{item.depot}</div>
                      <div className="text-[10px] text-on-surface-variant font-mono">Region: {item.region}</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="font-mono font-bold text-on-surface">{item.stockReal} Dus</div>
                      <div className="text-[10px] text-on-surface-variant font-mono">Bfr: {item.buffer} Dus</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`font-mono font-bold text-xs ${item.doi < 2 ? 'text-red-600' : 'text-on-surface'}`}>
                        {item.doiLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-on-surface">
                      {item.revenueAtRisk > 0 ? formatRupiah(item.revenueAtRisk) : '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.severityColor}`}>
                        {item.severityLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {item.actionType === 'RESTOCK_DISPATCH' && (
                        <Button
                          size="sm"
                          onClick={() => setCurrentScreen && setCurrentScreen('smart-recommendations')}
                          className="bg-primary text-white text-[11px] h-7 px-2.5 hover:bg-primary-container"
                        >
                          Replenish PO
                        </Button>
                      )}
                      {item.actionType === 'CROSS_DEPOT' && (
                        <Button
                          size="sm"
                          onClick={() => setCurrentScreen && setCurrentScreen('what-if-simulator')}
                          variant="outline"
                          className="text-[11px] h-7 px-2.5"
                        >
                          Simulasi Reroute
                        </Button>
                      )}
                      {item.actionType === 'FACTORY_EXPEDITE' && (
                        <Badge variant="tertiary" className="text-[10px]">Expedite Pasuruan</Badge>
                      )}
                      {item.actionType === 'MONITOR' && (
                        <span className="text-[11px] text-on-surface-variant">Pantau DSR</span>
                      )}
                      {item.actionType === 'NONE' && (
                        <span className="text-[11px] text-emerald-700 font-semibold">Stok Stabil</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Visual Analysis: Regional Vulnerability & Lead Time Stress Testing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Section 1: Route Vulnerability Breakdown: 7 cols */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-5 rounded-xl border border-outline/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-outline/10 pb-3">
            <span className="font-bold text-xs text-on-surface flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-primary" />
              Peta Kerentanan Koridor Pengiriman Logistik Jawa Timur
            </span>
            <Badge variant="surface" className="text-[10px]">Kondisi Riil Jalan</Badge>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 bg-surface-container-low rounded-lg border border-outline/10 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-on-surface">Koridor 1: Tol Pandaan - Gempol - Waru</div>
                <div className="text-[10px] text-on-surface-variant">Arteri Pabrik Pasuruan ke Hub Krian &amp; Sidoarjo</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">
                Lancar (45 Menit)
              </span>
            </div>
            <div className="p-3 bg-surface-container-low rounded-lg border border-outline/10 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-on-surface">Koridor 2: Jalur Arteri Surabaya - Krian - Balongbendo</div>
                <div className="text-[10px] text-on-surface-variant">Rute pengiriman harian armada canter retail</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800">
                Padat Sore (+25 Menit)
              </span>
            </div>
            <div className="p-3 bg-surface-container-low rounded-lg border border-outline/10 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-on-surface">Koridor 3: Pantura Tuban - Lamongan</div>
                <div className="text-[10px] text-on-surface-variant">Distribusi pasokan regional barat</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-red-100 text-red-800">
                Perbaikan Jalan (+1.5 Jam)
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Proactive Safety Stock Protocol: 5 cols */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-5 rounded-xl border border-outline/10 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 border-b border-outline/10 pb-2.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-xs text-on-surface">Protokol Mitigasi GTNIC 2026</h3>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Model prediktif SupplySync secara dinamis menyesuaikan batas safety stock berdasarkan cuaca, historis kepadatan rute logistik, dan event retail lokal di Jawa Timur.
            </p>
            <div className="p-2.5 bg-surface-container-low rounded-lg border border-outline/10 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Algoritma Active:</span>
                <span className="font-bold font-mono text-primary">Dynamic Buffer v2.4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Confidence Interval:</span>
                <span className="font-bold font-mono text-on-surface">97.8% (Sigma 2.5)</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setCurrentScreen && setCurrentScreen('what-if-simulator')}
            variant="outline"
            className="w-full text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Jalankan Simulator Skenario Stress-Test</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
