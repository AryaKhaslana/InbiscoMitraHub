import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { api } from '../../services/api';
import { 
  Building2, 
  AlertTriangle, 
  MapPin, 
  ArrowRight, 
  Layers, 
  FileSpreadsheet, 
  FileText,
  RefreshCw,
  CheckCircle2,
  Truck,
  Eye,
  X,
  CreditCard,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { formatRupiah } from '../../lib/utils';

export default function ExecutiveOverview({ setCurrentScreen }) {
  const [selectedHub, setSelectedHub] = useState('jatim');
  const [loading, setLoading] = useState(true);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [manifestData, setManifestData] = useState(null);
  const [selectedDistributorDetail, setSelectedDistributorDetail] = useState(null);

  const [kpi, setKpi] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [distData, setDistData] = useState(null);
  const [fefoData, setFefoData] = useState(null);

  const fetchExecutiveData = useCallback(async () => {
    setLoading(true);
    try {
      const [kpiRes, riskRes, distRes, fefoRes] = await Promise.all([
        api.getAdminKpi(),
        api.getStockoutRisk(),
        api.getDistributorDirectory(),
        api.getFefoInventory(),
      ]);
      setKpi(kpiRes);
      setRiskData(riskRes);
      setDistData(distRes);
      setFefoData(fefoRes);
    } catch (err) {
      console.error('ExecutiveOverview fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExecutiveData();
    const onRefresh = () => fetchExecutiveData();
    window.addEventListener('supplysync:refresh', onRefresh);
    return () => window.removeEventListener('supplysync:refresh', onRefresh);
  }, [fetchExecutiveData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedDistributorDetail(null);
        setManifestData(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      await api.exportOrdersCsv();
    } catch (err) {
      alert(err.message || 'Gagal mengunduh CSV');
    } finally {
      setExportingCsv(false);
    }
  };

  const handleFetchManifest = async () => {
    try {
      const res = await api.getDailyManifest();
      setManifestData(res);
    } catch (err) {
      alert(err.message || 'Gagal memuat manifest harian');
    }
  };

  // Compute dynamic KPIs from real backend data
  const totalCartonsInKrian = fefoData?.summary?.totalCartonsInWarehouse ?? 1745;
  const riskItems = riskData?.items || [];
  const avgRunway =
    riskItems.length > 0
      ? (riskItems.reduce((sum, i) => sum + Number(i.runwayDays || 0), 0) / riskItems.length).toFixed(1)
      : '3.2';
  const criticalCount = riskData?.summary?.criticalSkuCount ?? 2;
  const activeStores = kpi?.activeStores ?? 10;
  const totalRegisteredStores = kpi?.totalRegisteredStores ?? 12;

  const macroKpis = [
    {
      title: 'Stok Gudang Hub Krian',
      value: totalCartonsInKrian.toLocaleString('id-ID'),
      unit: 'Dus FMCG',
      change: `${fefoData?.summary?.totalSkus || 8} SKU Aktif`,
      trend: 'up',
      note: `Total ${kpi?.totalOrders || 9} PO Grosir B2B tercatat`,
    },
    {
      title: 'Rata-rata Fill-Rate & Verifikasi',
      value: `${distData?.overallHealthPct || 94.2}%`,
      unit: 'SLA Jaringan',
      change: `${activeStores}/${totalRegisteredStores} Toko Verified`,
      trend: 'up',
      note: 'Target enterprise: 96.0%',
    },
    {
      title: 'Rata-rata Runway Inventori (DoI)',
      value: avgRunway,
      unit: 'Hari Operasional',
      change: `${criticalCount} SKU Kritis/High`,
      trend: Number(avgRunway) < 3.5 ? 'down' : 'up',
      note: 'Ambang batas aman minimum: 3.5 hari',
    },
    {
      title: 'Omzet Berisiko Stockout (48 Jam)',
      value: formatRupiah(riskData?.summary?.totalRevenueAtRiskIDR || 412500000),
      unit: '',
      change: `${kpi?.pendingDispatch || 4} DO Antre Muat`,
      trend: 'down',
      note: 'Mitigasi via Prescriptive Replenishment',
    },
  ];

  // Dynamic Triage items from live stockout risk & orders
  const topCriticalSkus = riskItems.slice(0, 2);
  const triageItems = [
    ...(topCriticalSkus.map((item, idx) => ({
      id: `TR-LIVE-${idx}`,
      title: idx === 0 ? 'CV Surya Krian Logistik (Hub Utama)' : 'Mitra Distribusi Sidoarjo Barat',
      sku: `${item.name.split('(')[0].trim()} (Stok: ${item.stockCartons} Dus)`,
      urgency: item.riskLevel === 'CRITICAL' ? 'KRITIS' : 'WASPADA',
      urgencyColor: item.riskLevel === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white',
      desc: `Runway tersisa ${item.runwayDays} hari (ADS: ${item.adsCartonsPerDay} dus/hari). Defisit ${item.deficitCartons} dus senilai ${formatRupiah(item.revenueAtRiskIDR)}.`,
      actionText: idx === 0 ? 'Tinjau & Otorisasi PO' : 'Lihat Radar Risiko',
      screen: idx === 0 ? 'smart-recommendations' : 'stockout-risk',
    }))),
    {
      id: 'TR-LOGISTIK',
      title: 'Antrean Dispatch & Armada Inbound',
      sku: `${kpi?.pendingDispatch || 4} Order Toko Menunggu Dispatch`,
      urgency: 'LOGISTIK',
      urgencyColor: 'bg-blue-600 text-white',
      desc: `${kpi?.uiBadges?.dispatchWave || 'Gelombang 2 siap muat'}. Pantau posisi GPS armada Wingbox dari DC Pasuruan.`,
      actionText: 'Lacak Armada & Order',
      screen: 'order-tracking',
    },
  ];

  // Fast moving SKUs from real OrderItem aggregation
  const fastMoving = kpi?.fastMovingProducts?.length
    ? kpi.fastMovingProducts
    : riskItems.slice(0, 5).map((r) => ({
        productId: r.productId,
        name: r.name,
        category: r.category,
        stockCartons: r.stockCartons,
        totalCartonsSold: r.adsCartonsPerDay * 7,
      }));
  const maxSold = Math.max(1, ...fastMoving.map((f) => f.totalCartonsSold || 1));

  // Category health from real FEFO inventory
  const categoryStats = React.useMemo(() => {
    const inv = fefoData?.inventory || [];
    if (!inv.length) return [];
    const map = new Map();
    for (const item of inv) {
      const cat = item.category || 'Lainnya';
      const cur = map.get(cat) || { category: cat, totalStock: 0, skus: 0, dangerSkus: 0 };
      cur.totalStock += item.stockCartons;
      cur.skus += 1;
      if (item.fefoStatus === 'DANGER' || item.stockCartons < 150) cur.dangerSkus += 1;
      map.set(cat, cur);
    }
    return Array.from(map.values());
  }, [fefoData]);

  const regionalDistributors = distData?.distributors || [];

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider mb-1">
            <Building2 className="h-4 w-4" />
            <span>Mayora Enterprise HQ • Manajemen Logistik Regional Jawa Timur</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-on-surface">
            Executive Overview &amp; Network Intelligence
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Pemantauan pergerakan produk Mayora, performa distributor regional, dan mitigasi risiko stok rantai pasok.
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
              <option value="nasional">Semua {distData?.totalNetworkDepots || 28} Depots</option>
            </select>
          </div>

          <Button
            onClick={handleFetchManifest}
            variant="outline"
            size="sm"
            className="text-xs font-semibold h-8"
          >
            <FileText className="h-3.5 w-3.5 mr-1 text-primary" />
            <span>Manifest Harian</span>
          </Button>

          <Button
            onClick={handleExportCsv}
            disabled={exportingCsv}
            size="sm"
            className="bg-primary text-white text-xs font-semibold h-8 hover:bg-primary-container"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
            <span>{exportingCsv ? 'Mengunduh...' : 'Laporan CSV'}</span>
          </Button>

          <Button
            onClick={fetchExecutiveData}
            variant="outline"
            size="sm"
            className="h-8 px-2"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Panduan Cepat & Konteks Eksekutif */}
      <div className="p-4 bg-surface-container-lowest border border-outline/10 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-on-surface">Konteks Eksekutif Jaringan:</span>
            <span className="text-on-surface-variant ml-1">
              Dashboard ini menyajikan telemetri makro ketersediaan produk Mayora di seluruh Jawa Timur. Gunakan panel <strong>Triage Prioritas Operasional</strong> di bawah untuk merespons SKU kritis atau antrean armada secara langsung.
            </span>
          </div>
        </div>
        <Badge variant="surface" className="text-[10px] shrink-0 font-mono">
          Telemetri Makro Enterprise
        </Badge>
      </div>

      {/* Live Manifest Preview Banner if triggered */}
      {manifestData && (
        <Card className="border-2 border-primary/20 bg-surface-container-lowest shadow-xs">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="font-bold text-on-surface">
                  Manifest Aktif: {manifestData.manifestNumber} ({manifestData.dispatchWave})
                </span>
                <Badge variant="surface" className="font-mono text-[10px]">{manifestData.fleetActive}</Badge>
              </div>
              <p className="text-on-surface-variant">
                Total Pengiriman: <strong>{manifestData.summary?.totalDeliveries} DO Toko</strong> • Total Muatan:{' '}
                <strong>{manifestData.summary?.totalCartonsToDispatch} Dus</strong> • Nilai Manifest:{' '}
                <strong className="font-mono text-primary">{manifestData.summary?.totalManifestValueFormatted}</strong>
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setManifestData(null)} className="h-7 text-xs">
              Tutup Preview
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 4 Macro KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {macroKpis.map((kpiItem, idx) => (
          <Card key={idx} className="border border-outline/10 shadow-xs hover:shadow-md transition-shadow bg-surface-container-lowest">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">{kpiItem.title}</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-on-surface font-mono">{kpiItem.value}</span>
                  {kpiItem.unit && <span className="text-xs text-on-surface-variant font-medium">{kpiItem.unit}</span>}
                </div>
              </div>
              <div className="mt-3 pt-2 bg-surface-container-low -mx-4 -mb-4 px-4 pb-3 rounded-b-xl border-t border-outline/5 text-xs">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${kpiItem.trend === 'up' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                    {kpiItem.change}
                  </span>
                  <span className="text-[10px] text-on-surface-variant truncate ml-2">{kpiItem.note}</span>
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
            <h2 className="text-base font-extrabold tracking-tight">Triage Prioritas Operasional: Data Real-Time Gudang &amp; Armada</h2>
          </div>
          <Badge variant="surface" className="text-[10px] font-mono text-primary bg-white">
            {triageItems.length} Antrean Tindakan
          </Badge>
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
              <h3 className="font-bold text-xs text-on-surface">Distribusi Permintaan &amp; Saldo Stok SKU Unggulan</h3>
              <p className="text-[11px] text-on-surface-variant">Ringkasan volume penjualan dan ketersediaan stok fisik gudang.</p>
            </div>
            <Badge variant="surface" className="text-[10px]">Top {fastMoving.length} SKUs</Badge>
          </div>

          <div className="space-y-3">
            {fastMoving.map((sku, i) => {
              const colors = ['bg-primary', 'bg-secondary', 'bg-amber-600', 'bg-emerald-600', 'bg-blue-600'];
              const pct = Math.min(100, Math.max(18, Math.round(((sku.totalCartonsSold || 10) / maxSold) * 100)));
              return (
                <div key={sku.productId || i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-on-surface">
                      {sku.name.split('(')[0].trim()}{' '}
                      <span className="text-[10px] text-on-surface-variant font-normal">({sku.category})</span>
                    </span>
                    <span className="font-mono font-bold text-on-surface">
                      Terjual: {sku.totalCartonsSold} Dus • Stok: <span className={sku.stockCartons < 150 ? 'text-red-600' : 'text-emerald-700'}>{sku.stockCartons} Dus</span>
                    </span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${colors[i % colors.length]} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Category Health Matrix (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-5 rounded-xl border border-outline/10 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-outline/10 pb-3">
              <h3 className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-primary" />
                Matriks Kesehatan Stok per Kategori
              </h3>
              <span className="text-[10px] font-mono text-emerald-700 font-bold">
                {fefoData?.summary?.safeCount || 4} Batch Aman FEFO
              </span>
            </div>

            <div className="space-y-2">
              {categoryStats.slice(0, 4).map((cat, idx) => {
                const isWarning = cat.dangerSkus > 0;
                return (
                  <div key={idx} className="p-2.5 bg-surface-container-low rounded-lg border border-outline/10 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-on-surface">Divisi {cat.category}</div>
                      <div className="text-[10px] text-on-surface-variant">
                        {cat.skus} SKU Terdaftar • Total Fisik: <strong>{cat.totalStock} Dus</strong>
                      </div>
                    </div>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                      isWarning ? 'text-amber-800 bg-amber-100' : 'text-emerald-800 bg-emerald-100'
                    }`}>
                      {isWarning ? 'Butuh Restock' : 'Optimal'}
                    </span>
                  </div>
                );
              })}
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
              <h3 className="text-sm font-bold text-on-surface">Ringkasan Kinerja Distributor Regional &amp; Status Stok Terkini</h3>
              <p className="text-xs text-on-surface-variant">Daftar simpul jaringan distribusi resmi PT Inbisco Niagatama Semesta di Jawa Timur.</p>
            </div>
            <span className="text-xs font-mono text-on-surface-variant">{regionalDistributors.length} Hub Terpantau</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline/10">
                  <th className="py-2.5 px-3 font-semibold">Nama Distributor Mitra</th>
                  <th className="py-2.5 px-3 font-semibold">Wilayah Cakupan</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Stok Aktif (Dus)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Armada</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Health Score</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status Operasional</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10 font-medium">
                {regionalDistributors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-on-surface-variant text-xs">
                      Tidak ada data distributor untuk filter wilayah ini.
                    </td>
                  </tr>
                ) : (
                  regionalDistributors.map((dist) => {
                    const statusBadge =
                      dist.status === 'SURPLUS_DONOR'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : dist.status === 'ATTENTION'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-blue-100 text-blue-800 border-blue-200';
                    return (
                      <tr
                        key={dist.id}
                        onClick={() => setSelectedDistributorDetail(dist)}
                        className="hover:bg-surface-container-low/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-3 font-bold text-on-surface">
                          <span className="group-hover:text-primary transition-colors">{dist.name}</span>
                          {dist.isFlagshipHub && (
                            <Badge variant="tertiary" className="ml-2 text-[9px] py-0 px-1">Hub Utama</Badge>
                          )}
                        </td>
                        <td className="py-3 px-3 text-on-surface-variant">{dist.hubCoverage}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-on-surface">
                          {Number(dist.onHandStockCartons).toLocaleString('id-ID')} Dus
                        </td>
                        <td className="py-3 px-3 text-right font-mono">{dist.activeTruckCount} Truk</td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-on-surface">{dist.healthPct}%</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                            {dist.status === 'SURPLUS_DONOR' ? 'Surplus (Donor)' : dist.status === 'ATTENTION' ? 'Perlu Atensi' : 'Optimal'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            onClick={() => setSelectedDistributorDetail(dist)}
                            variant="outline"
                            className="text-[11px] h-7 px-2.5 gap-1 hover:bg-surface-container font-semibold"
                            title="Buka Profil Simpul Jaringan"
                          >
                            <Eye className="h-3 w-3 text-primary" />
                            <span>Inspeksi</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Inspeksi Profil Simpul Distributor Regional */}
      {selectedDistributorDetail && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedDistributorDetail(null);
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest border border-outline/15 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 cursor-default"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-outline/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-on-surface">
                      {selectedDistributorDetail.name}
                    </h3>
                    {selectedDistributorDetail.isFlagshipHub && (
                      <Badge variant="tertiary" className="text-[9px] py-0 px-1 font-bold">
                        Hub Utama
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Cluster: <strong>{selectedDistributorDetail.cluster || 'Jawa Timur'}</strong> • ID: {selectedDistributorDetail.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDistributorDetail(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
                title="Tutup (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline/10 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-on-surface-variant text-[11px] block">Wilayah Cakupan (Kecamatan):</span>
                    <span className="font-bold text-on-surface text-xs leading-relaxed">
                      {selectedDistributorDetail.hubCoverage || 'Krian, Balongbendo, Tarik, Prambon, Wonoayu'}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    selectedDistributorDetail.status === 'SURPLUS_DONOR'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedDistributorDetail.status === 'ATTENTION'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedDistributorDetail.status === 'SURPLUS_DONOR' ? 'Surplus (Donor)' : selectedDistributorDetail.status === 'ATTENTION' ? 'Perlu Atensi' : 'Optimal'}
                  </span>
                </div>

                <div className="pt-2 border-t border-outline/10 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-on-surface-variant">Penanggung Jawab:</span>
                    <div className="font-semibold text-on-surface mt-0.5">{selectedDistributorDetail.contactPerson || 'Kepala Depo'}</div>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Line Kontak Darurat:</span>
                    <div className="font-mono text-primary font-semibold mt-0.5 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      0812-3099-8800
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Telemetry Stats */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline/10">
                  <span className="text-[10px] text-on-surface-variant block">Saldo Stok Fisik</span>
                  <strong className="text-sm font-mono text-on-surface mt-0.5 block">
                    {Number(selectedDistributorDetail.onHandStockCartons).toLocaleString('id-ID')} Dus
                  </strong>
                </div>
                <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline/10">
                  <span className="text-[10px] text-on-surface-variant block">Armada Truk Aktif</span>
                  <strong className="text-sm font-mono text-primary mt-0.5 block">
                    {selectedDistributorDetail.activeTruckCount} Truk
                  </strong>
                </div>
                <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline/10">
                  <span className="text-[10px] text-on-surface-variant block">Health SLA Jaringan</span>
                  <strong className="text-sm font-mono text-emerald-700 mt-0.5 block">
                    {selectedDistributorDetail.healthPct}%
                  </strong>
                </div>
              </div>

              {/* Credit Limit & Financial Clearance */}
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface flex items-center gap-1.5 text-[11px]">
                    <CreditCard className="h-3.5 w-3.5 text-primary" />
                    Plafon Kredit Mitra (Credit Limit):
                  </span>
                  <span className="font-mono font-bold text-on-surface">
                    {formatRupiah(selectedDistributorDetail.creditLimitIDR || 500000000)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-on-surface-variant">
                  <span>Kredit Terpakai:</span>
                  <span className="font-mono">{formatRupiah(selectedDistributorDetail.usedCreditIDR || 80000000)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-700 font-semibold pt-1 border-t border-outline/10">
                  <span>Sisa Saldo Plafon Kredit:</span>
                  <span className="font-mono">
                    {formatRupiah((selectedDistributorDetail.creditLimitIDR || 500000000) - (selectedDistributorDetail.usedCreditIDR || 80000000))}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-outline/10 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDistributorDetail(null)}
                className="text-xs h-8 px-4"
              >
                Tutup
              </Button>

              {selectedDistributorDetail.isFlagshipHub ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedDistributorDetail(null);
                    if (setCurrentScreen) setCurrentScreen('distributor-overview');
                  }}
                  className="bg-primary hover:bg-primary-container text-white text-xs font-bold px-4 gap-1.5 shadow-xs h-8"
                >
                  <span>Buka Depo Krian Logistik ➔</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedDistributorDetail(null);
                    if (setCurrentScreen) setCurrentScreen('stockout-risk');
                  }}
                  className="bg-primary hover:bg-primary-container text-white text-xs font-bold px-4 gap-1.5 shadow-xs h-8"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>Simulasi Rebalance Pasokan ➔</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
