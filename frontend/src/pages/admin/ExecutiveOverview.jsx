import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  ArrowRight, 
  Clock, 
  Layers, 
  FileSpreadsheet, 
  FileText, 
  Sparkles,
  Boxes,
  RotateCcw
} from 'lucide-react';
import { formatRupiah } from '../../lib/utils';

export default function ExecutiveOverview({ setCurrentScreen }) {
  const [selectedHub, setSelectedHub] = useState('jatim');
  const [filterPeriod, setFilterPeriod] = useState('30d');

  const macroKpis = [
    { title: 'Total Permintaan Jaringan', value: '48.240', unit: 'Dus FMCG', change: '+14.2% MoM', trend: 'up', note: 'Surplus konsumsi teritori Sidoarjo & Surabaya' },
    { title: 'Rata-rata Fill-Rate Jaringan', value: '94.6%', unit: 'SLA Pabrik', change: '-1.4% Target', trend: 'down', note: 'Target enterprise: 96.0%' },
    { title: 'Sisa Hari Inventori (DoI)', value: '5.8', unit: 'Hari Rata-rata', change: '+0.4 Hari', trend: 'up', note: 'Ambang batas aman minimum: 5.0 hari' },
    { title: 'Utilisasi Armada Wingbox (FTL)', value: '88.2%', unit: 'Kapasitas CBM', change: '+3.8% Optimal', trend: 'up', note: 'Target efisiensi pengiriman >85%' },
  ];

  const triageItems = [
    {
      id: 'TR-01',
      title: 'Distributor Sidoarjo Utama (CV Surya Krian)',
      sku: 'Roma Kelapa 300g (850 Dus Diajukan)',
      urgency: 'KRITIS',
      urgencyColor: 'bg-red-500 text-white',
      desc: 'Stok menipis hingga 0.8 hari akibat lonjakan retail lokal. Alokasi 850 dus telah dipersiapkan dari DC Pasuruan.',
      actionText: 'Tinjau & Otorisasi PO',
      screen: 'smart-recommendations'
    },
    {
      id: 'TR-02',
      title: 'Depot Malang Raya (Singosari Hub)',
      sku: 'Beng-Beng Regular 20g (400 Dus)',
      urgency: 'WASPADA',
      urgencyColor: 'bg-amber-500 text-white',
      desc: 'Sisa inventori 1.8 hari. Rerouting pasokan dari Singosari DC disarankan untuk menghindari stockout akhir pekan.',
      actionText: 'Lihat Radar Risiko',
      screen: 'stockout-risk'
    },
    {
      id: 'TR-03',
      title: 'Armada Ekspedisi Pantura (Tuban)',
      sku: 'Keterlambatan DO-2026-0798',
      urgency: 'LOGISTIK',
      urgencyColor: 'bg-blue-600 text-white',
      desc: 'Perbaikan jalan arteri Lamongan menambah waktu tempuh +1.5 jam. Jadwal tiba disesuaikan pukul 14:30 WIB.',
      actionText: 'Lacak Armada Inbound',
      screen: 'order-tracking'
    }
  ];

  const regionalDistributors = [
    { name: 'CV Surya Krian Logistik', hub: 'Sidoarjo Barat', doi: '0.8 Hari', stockLevel: '1.840 Dus', fillRate: '92.4%', status: 'Kritis Restock', statusColor: 'bg-red-100 text-red-800 border-red-200', action: 'smart-recommendations' },
    { name: 'PT Surabaya Distribusi Utama', hub: 'Surabaya Rungkut', doi: '8.4 Hari', stockLevel: '4.950 Dus', fillRate: '98.6%', status: 'Surplus Aman', statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', action: 'stockout-risk' },
    { name: 'Depot Malang Raya (Singosari)', hub: 'Malang Utara', doi: '1.8 Hari', stockLevel: '2.100 Dus', fillRate: '91.2%', status: 'Waspada Buffer', statusColor: 'bg-amber-100 text-amber-800 border-amber-200', action: 'stockout-risk' },
    { name: 'UD Kediri Makmur Sejahtera', hub: 'Kediri Kota', doi: '4.5 Hari', stockLevel: '2.800 Dus', fillRate: '95.8%', status: 'Terjadwal Normal', statusColor: 'bg-blue-100 text-blue-800 border-blue-200', action: 'what-if-simulator' },
    { name: 'PT Jember Logistik Niaga', hub: 'Jember & Lumajang', doi: '6.2 Hari', stockLevel: '3.400 Dus', fillRate: '96.0%', status: 'Stabil Optimal', statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', action: 'distributor-overview' },
    { name: 'CV Banyuwangi Pratama', hub: 'Banyuwangi Port', doi: '5.1 Hari', stockLevel: '1.950 Dus', fillRate: '94.8%', status: 'Stabil Normal', statusColor: 'bg-blue-100 text-blue-800 border-blue-200', action: 'distributor-overview' },
  ];

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider mb-1">
            <Building2 className="h-4 w-4" />
            <span>Mayora Enterprise HQ • Regional Governance Jawa Timur</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-on-surface">
            Executive Overview &amp; Network Intelligence
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Monitoring real-time pergerakan produk Mayora, performa 28 distributor regional, dan deteksi dini kerentanan kehabisan stok (stockout).
          </p>
        </div>

        {/* Filter and Export Bar */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <div className="flex items-center bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline/10 text-xs font-semibold gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <select
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              className="bg-transparent text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="jatim">Jawa Timur &amp; Madura (Hub Krian)</option>
              <option value="jateng">Jawa Tengah (Hub Solo Raya)</option>
              <option value="jabar">Jawa Barat (Hub Cikarang)</option>
              <option value="nasional">Nasional (Semua 18 Depots)</option>
            </select>
          </div>

          <Button
            onClick={() => alert('Laporan eksekutif CSV sedang diunduh...')}
            size="sm"
            className="bg-primary text-white text-xs font-semibold h-8 hover:bg-primary-container"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
            <span>Laporan CSV</span>
          </Button>
        </div>
      </div>

      {/* 4 Macro KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {macroKpis.map((kpi, idx) => (
          <Card key={idx} className="border border-outline/10 shadow-xs hover:shadow-md transition-shadow bg-surface-container-lowest">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">{kpi.title}</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-on-surface font-mono">{kpi.value}</span>
                  <span className="text-xs text-on-surface-variant font-medium">{kpi.unit}</span>
                </div>
              </div>
              <div className="mt-3 pt-2 bg-surface-container-low -mx-4 -mb-4 px-4 pb-3 rounded-b-xl border-t border-outline/5 text-xs">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${kpi.trend === 'up' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                    {kpi.change}
                  </span>
                  <span className="text-[10px] text-on-surface-variant truncate ml-2">{kpi.note}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SECTION 2: PRIORITY OPERATIONAL ACTIONS (TRIAGE BANNER) */}
      <div className="bg-gradient-to-r from-primary to-secondary p-5 rounded-xl shadow-sm text-white relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 animate-pulse text-amber-300" />
            <h2 className="text-base font-extrabold tracking-tight">Triage Prioritas Operasional: Butuh Otorisasi Segera</h2>
          </div>
          <Badge variant="surface" className="text-[10px] font-mono text-primary bg-white">3 Antrean Tindakan</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {triageItems.map((item) => (
            <div key={item.id} className="bg-white/10 backdrop-blur-xs rounded-lg p-3.5 border border-white/15 flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs truncate text-white">{item.title}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${item.urgencyColor}`}>
                    {item.urgency}
                  </span>
                </div>
                <div className="font-semibold text-xs text-amber-200">{item.sku}</div>
                <p className="text-[11px] text-white/80 mt-1 leading-relaxed">{item.desc}</p>
              </div>

              <button
                onClick={() => setCurrentScreen && setCurrentScreen(item.screen)}
                className="mt-1 w-full py-1.5 px-3 bg-white text-primary text-xs font-bold rounded hover:bg-white/90 transition-all flex items-center justify-center gap-1 shadow-xs"
              >
                <span>{item.actionText}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bento Grid: Fast Moving SKU Trends & Matriks Kesehatan Stok */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: SKU Demand Distribution (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-5 rounded-xl border border-outline/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-outline/10 pb-3">
            <div>
              <h3 className="font-bold text-xs text-on-surface">Distribusi Permintaan &amp; Tren Penjualan SKU Unggulan</h3>
              <p className="text-[11px] text-on-surface-variant">Volume karton terjual 30 hari terakhir di seluruh Jawa Timur.</p>
            </div>
            <Badge variant="surface" className="text-[10px]">Top 5 SKUs</Badge>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Roma Kelapa 300g', category: 'Biskuit', dus: '18.450', percent: 85, color: 'bg-primary' },
              { name: 'Beng-Beng Regular 20g', category: 'Cokelat & Wafer', dus: '12.200', percent: 65, color: 'bg-secondary' },
              { name: 'Torabika Duo 25g', category: 'Kopi & Minuman', dus: '9.800', percent: 52, color: 'bg-amber-600' },
              { name: 'Energen Cokelat 34g', category: 'Sarapan Sereal', dus: '7.400', percent: 40, color: 'bg-emerald-600' },
              { name: 'Le Minerale 600ml', category: 'Air Mineral Segar', dus: '6.150', percent: 32, color: 'bg-blue-600' },
            ].map((sku, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-on-surface">{sku.name} <span className="text-[10px] text-on-surface-variant font-normal">({sku.category})</span></span>
                  <span className="font-mono font-bold text-on-surface">{sku.dus} Dus</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${sku.color} rounded-full`} style={{ width: `${sku.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Category Health Matrix (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-5 rounded-xl border border-outline/10 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-outline/10 pb-3">
              <h3 className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-primary" />
                Matriks Kesehatan Stok Kategori
              </h3>
              <span className="text-[10px] font-mono text-emerald-700 font-bold">FEFO 99.4%</span>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 bg-surface-container-low rounded-lg border border-outline/10 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-on-surface">Divisi Biskuit (Roma Series)</div>
                  <div className="text-[10px] text-on-surface-variant">Stok Aman: 92% • Buffer Stabil</div>
                </div>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">92%</span>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-lg border border-outline/10 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-on-surface">Divisi Cokelat &amp; Wafer (Beng-Beng)</div>
                  <div className="text-[10px] text-on-surface-variant">Stok Waspada: 88% • Butuh Restock</div>
                </div>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">88%</span>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-lg border border-outline/10 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-on-surface">Divisi Kopi &amp; Beverage (Torabika)</div>
                  <div className="text-[10px] text-on-surface-variant">Stok Optimal: 96% • Pasokan Driyorejo</div>
                </div>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">96%</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setCurrentScreen && setCurrentScreen('stockout-risk')}
            variant="outline"
            className="w-full text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <span>Buka Radar Stockout Seluruh Jaringan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Regional Distributors Performance Table */}
      <Card className="border border-outline/10 shadow-xs">
        <CardContent className="p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-on-surface">Ringkasan Kinerja Distributor Regional &amp; Status Restock Terkini</h3>
              <p className="text-xs text-on-surface-variant">Daftar simpul jaringan distribusi resmi PT Inbisco Niagatama Semesta di Jawa Timur.</p>
            </div>
            <span className="text-xs font-mono text-on-surface-variant">6 Hub Terpantau</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline/10">
                  <th className="py-2.5 px-3 font-semibold">Nama Distributor Mitra</th>
                  <th className="py-2.5 px-3 font-semibold">Wilayah Hub</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Stok Aktif</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Runway DoI</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Fill-Rate</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status Operasional</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10 font-medium">
                {regionalDistributors.map((dist, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-on-surface">{dist.name}</td>
                    <td className="py-3 px-3 text-on-surface-variant">{dist.hub}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-on-surface">{dist.stockLevel}</td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span className={dist.doi.includes('0.8') ? 'text-red-600 font-bold' : 'text-on-surface'}>
                        {dist.doi}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-on-surface">{dist.fillRate}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${dist.statusColor}`}>
                        {dist.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        size="sm"
                        onClick={() => setCurrentScreen && setCurrentScreen(dist.action)}
                        variant="outline"
                        className="text-[11px] h-7 px-2.5"
                      >
                        Inspeksi
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
