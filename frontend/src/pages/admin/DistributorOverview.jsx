import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Warehouse, 
  AlertTriangle, 
  TrendingUp, 
  Truck, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Layers,
  Sliders,
  CheckSquare
} from 'lucide-react';
import { formatRupiah } from '../../lib/utils';

export default function DistributorOverview({ setCurrentScreen }) {
  const skus = [
    {
      name: 'Roma Kelapa 300g',
      skuCode: 'MYR-BIS-001',
      category: 'Biskuit',
      stockReal: 120,
      buffer: 350,
      doi: '0.8 Hari',
      status: 'CRITICAL',
      statusLabel: 'Kritis (<1 Hari)',
      statusColor: 'bg-red-100 text-red-800 border-red-200',
      fillPercent: 34,
      barColor: 'bg-red-600',
      actionScreen: 'restock-request'
    },
    {
      name: 'Beng-Beng Regular 20g',
      skuCode: 'MYR-WFR-002',
      category: 'Cokelat & Wafer',
      stockReal: 240,
      buffer: 300,
      doi: '2.7 Hari',
      status: 'WARNING',
      statusLabel: 'Waspada (2-3 Hari)',
      statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
      fillPercent: 55,
      barColor: 'bg-amber-500',
      actionScreen: 'restock-request'
    },
    {
      name: 'Torabika Duo 25g',
      skuCode: 'MYR-KOP-003',
      category: 'Kopi & Minuman',
      stockReal: 310,
      buffer: 250,
      doi: '4.1 Hari',
      status: 'NORMAL',
      statusLabel: 'Normal Aman',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-200',
      fillPercent: 78,
      barColor: 'bg-blue-600'
    },
    {
      name: 'Energen Cokelat Sereal 34g',
      skuCode: 'MYR-SER-004',
      category: 'Sarapan Sehat',
      stockReal: 420,
      buffer: 200,
      doi: '6.2 Hari',
      status: 'HEALTHY',
      statusLabel: 'Optimal Aman',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      fillPercent: 92,
      barColor: 'bg-emerald-600'
    },
    {
      name: 'Le Minerale 600ml Galon Mini',
      skuCode: 'MYR-AIR-005',
      category: 'Air Mineral Segar',
      stockReal: 580,
      buffer: 250,
      doi: '9.5 Hari',
      status: 'OPTIMAL',
      statusLabel: 'Stok Melimpah',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      fillPercent: 98,
      barColor: 'bg-emerald-600'
    }
  ];

  const recentLogs = [
    { time: '14:22 WIB', dsr: 'Bambang Sudiro', store: 'Toko Rejeki Makmur (Krian)', sku: 'Roma Kelapa 300g', qty: '40 Dus', amount: 8600000 },
    { time: '13:05 WIB', dsr: 'Agus Santoso', store: 'Warung Bu Siti (Balongbendo)', sku: 'Beng-Beng 20g', qty: '25 Dus', amount: 4950000 },
    { time: '11:40 WIB', dsr: 'Bambang Sudiro', store: 'Grosir Berkah Abadi (Tarik)', sku: 'Torabika Duo 25g', qty: '50 Dus', amount: 8250000 },
    { time: '09:15 WIB', dsr: 'Rian Pratama', store: 'Minimarket Mitra Mandiri (Krian)', sku: 'Energen Cokelat', qty: '30 Dus', amount: 5460000 }
  ];

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Dynamic Operational Notice / Urgent AI Alert */}
      <div className="p-3.5 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent border-l-4 border-l-red-600 rounded-r-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-on-surface">Peringatan Kritis Stokout: Roma Kelapa 300g</div>
            <div className="text-[11px] text-on-surface-variant">Sisa stok 120 dus (&lt;1 hari). Estimasi run-out: Besok Siang jika tanpa restock.</div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button 
            onClick={() => setCurrentScreen && setCurrentScreen('restock-request')}
            size="sm"
            className="bg-primary text-white text-xs font-bold h-8 hover:bg-primary-container shadow-xs"
          >
            Ajukan Restock Cepat
          </Button>
        </div>
      </div>

      {/* Operational Context Strip & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
            <span>Mayora B2B Network</span>
            <span>/</span>
            <span>Distributor Jatim</span>
            <span>/</span>
            <span className="text-primary font-bold">Depo Krian Logistik</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface mt-1">
            Ringkasan Operasional Depot
          </h1>
          <p className="text-xs text-on-surface-variant">
            Pusat monitoring gudang, inventori FEFO, dan orkestrasi pengiriman teritori Krian &amp; Sidoarjo Barat.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="surface" className="font-mono text-xs">Node: DEP-SDA-01</Badge>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-low rounded-lg text-xs font-semibold text-on-surface border border-outline/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Gudang Siaga</span>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Metrik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card className="border border-outline/10 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Total Stok Aktif</span>
              <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
                <Warehouse className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-on-surface">1.840</span>
              <span className="text-xs text-on-surface-variant font-medium">Karton Dus</span>
            </div>
            <div className="mt-3 pt-2.5 bg-surface-container-low -mx-4 -mb-4 px-4 pb-3 rounded-b-xl border-t border-outline/5">
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-on-surface-variant">Kapasitas Gudang 1 Krian</span>
                <span className="font-bold text-on-surface">76% Terisi</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '76%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-on-surface-variant mt-1">
                <span>Kapasitas: 2.400 Dus</span>
                <span>Sisa: 560 Dus</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="border-l-4 border-l-red-600 border border-outline/10 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">SKU Status Kritis</span>
              <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-700">
                <AlertTriangle className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-red-600">2</span>
              <span className="text-xs text-on-surface-variant font-medium">Produk Utama</span>
            </div>
            <div className="mt-3 pt-2.5 bg-surface-container-low -mx-4 -mb-4 px-4 pb-3 rounded-b-xl border-t border-outline/5">
              <div className="text-[11px] text-red-700 font-semibold truncate">Roma Kelapa (0.8h) &amp; Beng-Beng (2.7h)</div>
              <div className="text-[10px] text-on-surface-variant mt-0.5">Disarankan order sebelum pukul 15:00 WIB</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="border border-outline/10 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Penjualan Hari Ini</span>
              <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-on-surface">175</span>
              <span className="text-xs text-on-surface-variant font-medium">Dus Terjual</span>
            </div>
            <div className="mt-3 pt-2.5 bg-surface-container-low -mx-4 -mb-4 px-4 pb-3 rounded-b-xl border-t border-outline/5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                  +25% Di Atas Target
                </span>
                <span className="font-mono text-[10px] text-on-surface-variant">Target: 140 Dus</span>
              </div>
              <div className="text-[10px] text-on-surface-variant mt-1">Penjualan grosir tertinggi: Warung Krian Area</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="border border-outline/10 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Pengiriman Masuk (Inbound)</span>
              <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
                <Truck className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-on-surface">1</span>
              <span className="text-xs text-on-surface-variant font-medium">Truk Wingbox</span>
            </div>
            <div className="mt-3 pt-2.5 bg-surface-container-low -mx-4 -mb-4 px-4 pb-3 rounded-b-xl border-t border-outline/5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono font-bold text-on-surface">DO-2026-0881</span>
                <span className="text-purple-700 font-bold text-[10px] bg-purple-50 px-1 rounded">Transit Tol</span>
              </div>
              <div className="text-[10px] text-on-surface-variant mt-1">ETA: 09:45 WIB (35 menit lagi)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bento Section: Prescriptive AI Restock & Delivery Route Assurance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left AI Restock Spotlight: 7 cols */}
        <div className="lg:col-span-7 bg-gradient-to-br from-surface-container-lowest to-surface-container-low p-5 rounded-xl border border-outline/10 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-bold text-primary">Prescriptive AI Recommendation</div>
                  <h3 className="text-lg font-extrabold text-on-surface">Roma Kelapa 300g • 850 Dus</h3>
                </div>
              </div>
              <Badge variant="tertiary" className="text-[10px] font-mono">Conf: 98.4%</Badge>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Laju konsumsi melonjak <strong>+42%</strong> di teritori Krian &amp; Balongbendo. Tanpa tindakan pengisian cepat, stok diprediksi habis dalam <strong>19 jam</strong>. Rekomendasi restock 850 dus telah dipersiapkan dengan optimalisasi muatan wingbox pabrik Pasuruan.
            </p>

            <div className="grid grid-cols-3 gap-2.5 p-3 bg-surface-container-lowest rounded-lg border border-outline/10 text-xs">
              <div>
                <span className="text-[10px] text-on-surface-variant">Laju Harian (ADS)</span>
                <div className="font-bold text-on-surface mt-0.5">175 Dus / Hari</div>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant">Lead Time Pabrik</span>
                <div className="font-bold text-on-surface mt-0.5">3 Hari Kerja</div>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant">Buffer Pengaman</span>
                <div className="font-bold text-emerald-700 mt-0.5">+200 Dus Cadangan</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-4 mt-2 border-t border-outline/10">
            <Button
              onClick={() => setCurrentScreen && setCurrentScreen('restock-request')}
              className="bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-xs flex items-center gap-1.5"
            >
              <span>Ajukan PO Instan (850 Dus)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              onClick={() => setCurrentScreen && setCurrentScreen('what-if-simulator')}
              variant="outline"
              className="text-xs font-semibold flex items-center gap-1.5"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Simulasikan Skenario</span>
            </Button>
          </div>
        </div>

        {/* Right Delivery Hub Route Assurance: 5 cols */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-5 rounded-xl border border-outline/10 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                Cakupan Distribusi &amp; Rute Aktif
              </span>
              <Badge variant="surface" className="text-[10px]">3 Sektor</Badge>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 bg-surface-container-low rounded-lg border border-outline/10 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-on-surface">Sektor A: Krian Kota &amp; Industri</div>
                  <div className="text-[10px] text-on-surface-variant">42 Toko Terjadwal • Armada Isuzu #01</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">95% Tepat Waktu</span>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-lg border border-outline/10 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-on-surface">Sektor B: Balongbendo &amp; Arteri</div>
                  <div className="text-[10px] text-on-surface-variant">28 Toko Terjadwal • Armada Colt #03</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">91% Tepat Waktu</span>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-lg border border-outline/10 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-on-surface">Sektor C: Tarik &amp; Pedalaman</div>
                  <div className="text-[10px] text-on-surface-variant">19 Warung Terjadwal • Armada Carry #04</div>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">88% (Jalan Macet)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-outline/10 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Rata-rata Lead Time Pengiriman:</span>
            <span className="font-mono font-bold text-on-surface">14.2 Jam</span>
          </div>
        </div>
      </div>

      {/* Main SKU Inventory Health Grid */}
      <Card className="border border-outline/10 shadow-xs">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-primary" />
                Ringkasan Status Stok SKU Utama di Gudang
              </h3>
              <p className="text-xs text-on-surface-variant">Monitoring pergerakan stok real-time terhadap batas penyangga (safety stock).</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-on-surface-variant">FEFO Compliance:</span>
              <Badge variant="tertiary" className="text-[10px] font-mono">99.4% Valid</Badge>
            </div>
          </div>

          <div className="space-y-3">
            {skus.map((sku) => (
              <div key={sku.name} className="p-3.5 bg-surface-container-low rounded-xl border border-outline/10 hover:border-outline/25 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-[220px]">
                    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center font-bold text-xs text-primary shrink-0">
                      {sku.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-on-surface">{sku.name}</div>
                      <div className="text-[10px] text-on-surface-variant font-mono">{sku.skuCode} • {sku.category}</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex-1 max-w-md space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-on-surface-variant">Stok Fisik: <strong className="text-on-surface font-mono">{sku.stockReal} Dus</strong></span>
                      <span className="text-on-surface-variant font-mono">Buffer: {sku.buffer} Dus</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className={`h-full ${sku.barColor} rounded-full`} style={{ width: `${sku.fillPercent}%` }}></div>
                    </div>
                  </div>

                  {/* DoI and Action */}
                  <div className="flex items-center gap-3 justify-between md:justify-end">
                    <div className="text-right">
                      <div className="text-[10px] text-on-surface-variant">Days of Inv (DoI)</div>
                      <div className="font-bold font-mono text-xs text-on-surface">{sku.doi}</div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${sku.statusColor}`}>
                      {sku.statusLabel}
                    </span>

                    {sku.actionScreen && (
                      <Button
                        size="sm"
                        onClick={() => setCurrentScreen && setCurrentScreen(sku.actionScreen)}
                        className="bg-primary text-white text-xs h-7 px-3 hover:bg-primary-container"
                      >
                        Restock
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Grid: Active DO Tracking & Recent Sales Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Active Inbound Delivery Tracking Card: 6 cols */}
        <div className="lg:col-span-6 bg-surface-container-lowest p-5 rounded-xl border border-outline/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-outline/10 pb-3">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-xs text-on-surface">Lacak Surat Jalan DO-2026-0881</h3>
            </div>
            <Button
              onClick={() => setCurrentScreen && setCurrentScreen('order-tracking')}
              variant="outline"
              size="sm"
              className="text-xs h-7"
            >
              Lihat Detail Tracking
            </Button>
          </div>

          <div className="p-3 bg-surface-container-low rounded-lg text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Muatan:</span>
              <span className="font-bold text-on-surface">Roma Kelapa 300g (850 Dus)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Armada / Driver:</span>
              <span className="font-mono text-on-surface">Isuzu Wingbox (L 9482 UT) • Bambang S.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Estimasi Tiba:</span>
              <span className="font-bold text-primary">09:45 WIB (Dalam Perjalanan)</span>
            </div>
          </div>

          {/* Stepper */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2.5 text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-on-surface">Rilis Manifest &amp; Pemuatan Pasuruan DC (07:30)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-primary font-bold">
              <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px] shrink-0 animate-pulse">•</div>
              <span>Transit Tol Pandaan - Waru (08:40)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-on-surface-variant">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Penerimaan Fisik &amp; BAST Depo Krian (Est. 09:45)</span>
            </div>
          </div>
        </div>

        {/* Recent Sales Submission Feed: 6 cols */}
        <div className="lg:col-span-6 bg-surface-container-lowest p-5 rounded-xl border border-outline/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-outline/10 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-xs text-on-surface">Aktivitas &amp; Input Penjualan DSR Hari Ini</h3>
            </div>
            <Button
              onClick={() => setCurrentScreen && setCurrentScreen('daily-sales-input')}
              size="sm"
              className="bg-primary text-white text-xs h-7 px-3"
            >
              + Input DSR
            </Button>
          </div>

          <div className="space-y-2">
            {recentLogs.map((log, idx) => (
              <div key={idx} className="p-2.5 bg-surface-container-low rounded-lg border border-outline/10 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-on-surface">{log.store}</div>
                  <div className="text-[10px] text-on-surface-variant font-mono">
                    {log.time} • DSR: {log.dsr} • {log.sku} ({log.qty})
                  </div>
                </div>
                <div className="font-bold font-mono text-on-surface text-right">
                  {formatRupiah(log.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
