import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { api } from '../../services/api';
import { 
  Sliders, 
  ArrowRight,
  Zap,
  RefreshCw,
  Boxes,
  Truck
} from 'lucide-react';
import { formatRupiah } from '../../lib/utils';

export default function WhatIfSimulator({ setCurrentScreen }) {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [stockOnHand, setStockOnHand] = useState(140);
  const [adsValue, setAdsValue] = useState(140);
  const [leadTime, setLeadTime] = useState(3);
  const [safetyStock, setSafetyStock] = useState(196);
  const [proposedRestock, setProposedRestock] = useState(850);
  const [dispatchMode, setDispatchMode] = useState('SINGLE'); // SINGLE | SPLIT
  const [simResult, setSimResult] = useState(null);
  const [loadingSim, setLoadingSim] = useState(false);

  // Load real products from Supabase on mount
  useEffect(() => {
    let preselected = null;
    try {
      const raw = sessionStorage.getItem('supplysync_sim_sku');
      if (raw) {
        preselected = JSON.parse(raw);
        sessionStorage.removeItem('supplysync_sim_sku');
      }
    } catch {}

    api.getProducts()
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.products || [];
        setProducts(list);
        if (preselected && preselected.productId) {
          setSelectedProductId(preselected.productId);
          setStockOnHand(preselected.stockOnHand ?? 140);
          setAdsValue(preselected.ads ?? 140);
          setSafetyStock(preselected.safetyStock ?? 196);
          setProposedRestock(preselected.proposedRestockQty ?? 850);
        } else if (list.length > 0) {
          const roma = list.find((p) => p.sku?.includes('ROMA')) || list[0];
          setSelectedProductId(roma.id);
          setStockOnHand(roma.stockCartons ?? 140);
        }
      })
      .catch(() => {});
  }, []);

  const currentProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0] || null;
  }, [products, selectedProductId]);

  const handleSelectProduct = (id) => {
    setSelectedProductId(id);
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setStockOnHand(prod.stockCartons);
    }
  };

  // Run backend simulation engine whenever parameters change (debounced 180ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingSim(true);
      api.runWhatIfSimulation({
        productId: currentProduct?.id,
        sku: currentProduct?.sku || 'MYR-BIS-ROMAKELAPA-300',
        stockOnHand,
        ads: adsValue,
        baseAds: 140,
        leadTimeDays: leadTime,
        safetyStock,
        proposedRestockQty: proposedRestock,
        unitPrice: currentProduct?.cartonPrice || 215000,
        dispatchMode,
      })
        .then((res) => setSimResult(res))
        .catch((err) => console.error('WhatIfSimulation error:', err))
        .finally(() => setLoadingSim(false));
    }, 180);

    return () => clearTimeout(timer);
  }, [currentProduct, stockOnHand, adsValue, leadTime, safetyStock, proposedRestock, dispatchMode]);

  const handleApplyPreset = (preset) => {
    const realStock = currentProduct ? currentProduct.stockCartons : 140;
    if (preset === 'normal') {
      setStockOnHand(realStock);
      setAdsValue(140);
      setLeadTime(3);
      setSafetyStock(196);
      setProposedRestock(850);
      setDispatchMode('SINGLE');
    } else if (preset === 'surge') {
      setStockOnHand(realStock);
      setAdsValue(240);
      setLeadTime(3);
      setSafetyStock(280);
      setProposedRestock(1200);
      setDispatchMode('SINGLE');
    } else if (preset === 'delay') {
      setStockOnHand(realStock);
      setAdsValue(160);
      setLeadTime(6);
      setSafetyStock(250);
      setProposedRestock(1000);
      setDispatchMode('SPLIT');
    }
  };

  // Real-time 60fps trajectory computation from live slider values (matches backend simulation math)
  const trajectory = useMemo(() => {
    const pts = [];
    const restock = proposedRestock;
    for (let day = 0; day <= 14; day++) {
      const sq = Math.max(0, Math.round(stockOnHand - day * adsValue));
      let prop;
      if (dispatchMode === 'SPLIT') {
        const batch1 = day >= leadTime ? Math.round(restock * 0.5) : 0;
        const batch2 = day >= leadTime + 3 ? Math.round(restock * 0.5) : 0;
        prop = Math.max(0, Math.round(stockOnHand + batch1 + batch2 - day * adsValue));
      } else {
        const arrived = day >= leadTime ? restock : 0;
        prop = Math.max(0, Math.round(stockOnHand + arrived - day * adsValue));
      }
      pts.push({ day, statusQuoStock: sq, proposedStock: prop });
    }
    return pts;
  }, [stockOnHand, adsValue, leadTime, proposedRestock, dispatchMode]);

  const maxChartStock = Math.max(1200, stockOnHand + proposedRestock);
  const getSvgCoordinates = (day, stock) => {
    const x = 50 + (day / 14) * 600;
    const y = 200 - (Math.min(maxChartStock, stock) / maxChartStock) * 160;
    return `${x},${y}`;
  };

  const pathStatusQuo = trajectory.map((p) => getSvgCoordinates(p.day, p.statusQuoStock)).join(' L ');
  const pathRestock = trajectory.map((p) => getSvgCoordinates(p.day, p.proposedStock)).join(' L ');
  const ySafety = 200 - (safetyStock / maxChartStock) * 160;
  const xDelivery = 50 + (leadTime / 14) * 600;

  // Instant reactive metrics for 0ms slider dragging feedback
  const beforeRunway = adsValue > 0 ? (stockOnHand / adsValue).toFixed(1) : '99.9';
  const afterRunway = adsValue > 0 ? ((stockOnHand + proposedRestock) / adsValue).toFixed(1) : '99.9';
  const stockAtArrival = Math.round(stockOnHand - adsValue * leadTime);
  const ftlPct = ((proposedRestock / 1000) * 100).toFixed(1);
  const revenueProtected = proposedRestock * (currentProduct?.cartonPrice || 215000);

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider mb-1">
            <Sliders className="h-4 w-4" />
            <span>Interactive Supply Chain Sandbox • Live Backend Simulation Engine</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-on-surface">
            What-if Restock &amp; Lead Time Simulator
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Uji ketahanan inventori gudang terhadap lonjakan permintaan retail, keterlambatan armada logistik, dan ukuran alokasi pabrik via endpoint <code>/api/v1/simulation/what-if</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
          <Button
            onClick={() => handleApplyPreset('normal')}
            variant="outline"
            size="sm"
            className="text-xs h-8"
          >
            Reset ke Stok Riil DB
          </Button>
          <Button
            onClick={() => handleApplyPreset('surge')}
            variant="outline"
            size="sm"
            className="text-xs h-8 text-primary border-primary/30"
          >
            <Zap className="h-3.5 w-3.5 mr-1" />
            Lonjakan Demand (+70%)
          </Button>
          <Button
            onClick={() => handleApplyPreset('delay')}
            variant="outline"
            size="sm"
            className="text-xs h-8 text-amber-700 border-amber-300"
          >
            Delay Logistik (6 Hari)
          </Button>
        </div>
      </div>

      {/* Main Grid: 5 cols Sliders + 7 cols Interactive Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="border border-outline/10 shadow-xs bg-surface-container-lowest">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-outline/10 pb-3">
                <span className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-primary" />
                  Parameter Simulasi Dinamis
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono flex items-center gap-1">
                  {loadingSim && <RefreshCw className="h-3 w-3 animate-spin text-primary" />}
                  {loadingSim ? 'Menghitung...' : 'Tersinkronisasi'}
                </span>
              </div>

              {/* SKU Selector from Real DB */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <Boxes className="h-3.5 w-3.5 text-primary" />
                  <span>Pilih SKU Produk Mayora</span>
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs bg-surface-container-low border border-outline/20 rounded-lg font-semibold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name.split('(')[0].trim()} (Stok: {p.stockCartons} Dus)
                    </option>
                  ))}
                </select>
              </div>

              {/* Slider 1: Stock on Hand */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="text-on-surface font-semibold">Stok Fisik Awal (Gudang Krian)</label>
                  <span className="font-mono font-bold text-primary">{stockOnHand} Dus</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="800"
                  step="10"
                  value={stockOnHand}
                  onChange={(e) => setStockOnHand(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant">
                  <span>20 Dus (Kritis)</span>
                  <span>Stok DB: {currentProduct?.stockCartons ?? 140} Dus</span>
                  <span>800 Dus</span>
                </div>
              </div>

              {/* Slider 2: Average Daily Sales (ADS) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="text-on-surface font-semibold">Laju Penjualan Harian (ADS)</label>
                  <span className="font-mono font-bold text-on-surface">{adsValue} Dus / Hari</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="320"
                  step="5"
                  value={adsValue}
                  onChange={(e) => setAdsValue(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 3: Lead Time */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="text-on-surface font-semibold">Waktu Tempuh &amp; Dispatch (Lead Time)</label>
                  <span className="font-mono font-bold text-amber-700">{leadTime} Hari Kerja</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={leadTime}
                  onChange={(e) => setLeadTime(Number(e.target.value))}
                  className="w-full accent-amber-600 h-2 bg-surface-container rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 4: Safety Stock */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="text-on-surface font-semibold">Ambang Batas Stok Aman (Safety Stock)</label>
                  <span className="font-mono font-bold text-emerald-700">{safetyStock} Dus</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="400"
                  step="10"
                  value={safetyStock}
                  onChange={(e) => setSafetyStock(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-2 bg-surface-container rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 5: Proposed Restock Volume */}
              <div className="space-y-1 pt-2 border-t border-outline/10">
                <div className="flex justify-between text-xs">
                  <label className="text-on-surface font-bold text-primary">Volume Restock Diajukan</label>
                  <span className="font-mono font-extrabold text-base text-primary">{proposedRestock} Dus</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1600"
                  step="50"
                  value={proposedRestock}
                  onChange={(e) => setProposedRestock(Number(e.target.value))}
                  className="w-full accent-primary h-2.5 bg-surface-container rounded-lg cursor-pointer"
                />
              </div>

              {/* Dispatch Mode Radio */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="font-semibold text-on-surface flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-primary" />
                  Metode Pengiriman:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDispatchMode('SINGLE')}
                    className={`px-2.5 py-1 rounded font-bold text-[11px] ${
                      dispatchMode === 'SINGLE' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    Single Drop
                  </button>
                  <button
                    type="button"
                    onClick={() => setDispatchMode('SPLIT')}
                    className={`px-2.5 py-1 rounded font-bold text-[11px] ${
                      dispatchMode === 'SPLIT' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    Split 2 Gelombang
                  </button>
                </div>
              </div>

              {/* Apply to Restock Request Button */}
              <Button
                onClick={() => {
                  sessionStorage.setItem(
                    'supplysync_sim_restock',
                    JSON.stringify({
                      productId: currentProduct?.id,
                      sku: currentProduct?.sku,
                      quantityCartons: proposedRestock,
                    })
                  );
                  setCurrentScreen && setCurrentScreen('restock-request');
                }}
                className="w-full bg-primary text-white text-xs font-bold py-2.5 hover:bg-primary-container shadow-xs flex items-center justify-center gap-1.5 mt-2"
              >
                <span>Terapkan Nilai {proposedRestock} Dus ke Pengajuan PO</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Live Depletion Chart & Stress Test KPIs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Key Simulation KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline/10 text-center">
              <span className="text-[10px] text-on-surface-variant block">Runway Status Quo</span>
              <span className="text-lg font-extrabold font-mono text-red-600 block mt-0.5">{beforeRunway} Hari</span>
            </div>
            <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline/10 text-center">
              <span className="text-[10px] text-on-surface-variant block">Runway Setelah Restock</span>
              <span className="text-lg font-extrabold font-mono text-emerald-700 block mt-0.5">{afterRunway} Hari</span>
            </div>
            <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline/10 text-center">
              <span className="text-[10px] text-on-surface-variant block">Utilisasi Armada FTL</span>
              <span className="text-lg font-extrabold font-mono text-on-surface block mt-0.5">{ftlPct}%</span>
            </div>
            <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline/10 text-center">
              <span className="text-[10px] text-on-surface-variant block">Omzet Terlindungi</span>
              <span className="text-xs font-extrabold font-mono text-primary block mt-1.5">
                {formatRupiah(revenueProtected)}
              </span>
            </div>
          </div>

          {/* SVG Depletion Chart */}
          <Card className="border border-outline/10 shadow-xs bg-surface-container-lowest overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-on-surface">
                    Proyeksi Trajektori Stok 14 Hari — {currentProduct?.name?.split('(')[0] || 'Roma Kelapa'}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Kedatangan armada pada Hari ke-{leadTime} ({dispatchMode === 'SPLIT' ? 'Split 2 Batch' : 'Single Drop'}).
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-red-600 inline-block"></span>
                    <span className="text-on-surface-variant text-[11px]">Status Quo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-amber-600 inline-block rounded-full"></span>
                    <span className="text-on-surface text-[11px] font-bold">Setelah Restock</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-gray-400 inline-block border-t border-dashed"></span>
                    <span className="text-on-surface-variant text-[11px]">Buffer ({safetyStock})</span>
                  </div>
                </div>
              </div>

              {/* Chart SVG */}
              <div className="relative w-full bg-surface-container-low rounded-xl p-3 overflow-hidden">
                <svg className="w-full h-56 overflow-visible" viewBox="0 0 700 220">
                  <line x1="50" y1="40" x2="650" y2="40" stroke="#e5e2e1" strokeWidth="1" />
                  <line x1="50" y1="90" x2="650" y2="90" stroke="#e5e2e1" strokeWidth="1" />
                  <line x1="50" y1="140" x2="650" y2="140" stroke="#e5e2e1" strokeWidth="1" />
                  <line x1="50" y1="200" x2="650" y2="200" stroke="#e5e2e1" strokeWidth="1" />

                  {/* Safety threshold line */}
                  <line x1="50" y1={ySafety} x2="650" y2={ySafety} stroke="#735c00" strokeDasharray="4 4" strokeWidth="1.5" />
                  <text x="645" y={Math.max(15, ySafety - 4)} textAnchor="end" className="text-[10px] font-mono fill-tertiary">
                    Safety Stock ({safetyStock} Dus)
                  </text>

                  {/* Delivery Day vertical line */}
                  <line x1={xDelivery} y1="20" x2={xDelivery} y2="200" stroke="#900000" strokeDasharray="3 3" strokeWidth="1.5" />
                  <text x={xDelivery} y="15" textAnchor="middle" className="text-[10px] font-bold fill-primary">
                    Truk Tiba (H+{leadTime})
                  </text>

                  {/* Status Quo Path (Red) */}
                  <path d={`M ${pathStatusQuo}`} fill="none" stroke="#ba1a1a" strokeWidth="2" strokeDasharray="3 3" />

                  {/* With Restock Path (Gold/Amber) */}
                  <path d={`M ${pathRestock}`} fill="none" stroke="#cca830" strokeWidth="3" />

                  {/* Day Markers */}
                  {[0, 2, 4, 6, 8, 10, 12, 14].map((d) => (
                    <text key={d} x={50 + (d / 14) * 600} y="215" textAnchor="middle" className="text-[10px] font-mono fill-gray-500">
                      H+{d}
                    </text>
                  ))}
                </svg>
              </div>

              {/* Explanatory note from Backend Simulation Engine */}
              <div className="p-3 bg-surface-container-low rounded-lg text-xs space-y-1">
                <div className="font-bold text-on-surface flex items-center justify-between">
                  <span>Kesimpulan Engine Simulasi Backend:</span>
                  <Badge variant="surface" className="font-mono text-[10px]">
                    {simResult?.afterMetrics?.riskStatus || 'TERKALKULASI'}
                  </Badge>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  {simResult?.explanation ||
                    (stockAtArrival <= 0
                      ? `Peringatan: Terjadi defisit ${Math.abs(stockAtArrival)} dus sebelum truk tiba pada Hari ke-${leadTime}. Disarankan mempercepat lead time atau mengambil Cross-Depot Rebalancing.`
                      : `Stok saat truk tiba masih tersisa ${stockAtArrival} dus. Alokasi ${proposedRestock} dus mengamankan pasokan hingga ${afterRunway} hari ke depan.`)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
