import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Sliders, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Truck, 
  Package, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { formatRupiah } from '../../lib/utils';

export default function WhatIfSimulator({ setCurrentScreen }) {
  // Simulator inputs
  const [stockOnHand, setStockOnHand] = useState(280);
  const [adsValue, setAdsValue] = useState(175);
  const [leadTime, setLeadTime] = useState(3);
  const [safetyStock, setSafetyStock] = useState(200);
  const [proposedRestock, setProposedRestock] = useState(850);
  const [dispatchMode, setDispatchMode] = useState('single'); // single | split

  // Scenario presets
  const handleApplyPreset = (preset) => {
    if (preset === 'normal') {
      setStockOnHand(280);
      setAdsValue(175);
      setLeadTime(3);
      setSafetyStock(200);
      setProposedRestock(850);
    } else if (preset === 'surge') {
      setStockOnHand(280);
      setAdsValue(260); // +48% demand surge
      setLeadTime(3);
      setSafetyStock(250);
      setProposedRestock(1200);
    } else if (preset === 'delay') {
      setStockOnHand(280);
      setAdsValue(175);
      setLeadTime(6); // severe logistics delay
      setSafetyStock(250);
      setProposedRestock(1000);
    }
  };

  // Calculations
  const results = useMemo(() => {
    // 14 days simulation points
    const pointsStatusQuo = [];
    const pointsWithRestock = [];

    let currentSq = stockOnHand;
    let currentRestock = stockOnHand;

    let stockoutDaySq = -1;
    let stockoutDayRestock = -1;
    let minTroughStock = stockOnHand;

    for (let day = 0; day <= 14; day++) {
      if (day > 0) {
        currentSq = Math.max(0, currentSq - adsValue);
        
        // At day === leadTime, arrival of restock
        if (day === leadTime) {
          currentRestock = currentRestock - adsValue + proposedRestock;
        } else {
          currentRestock = Math.max(0, currentRestock - adsValue);
        }
      }

      if (currentSq === 0 && stockoutDaySq === -1 && day > 0) {
        stockoutDaySq = day;
      }
      if (currentRestock === 0 && stockoutDayRestock === -1 && day > 0) {
        stockoutDayRestock = day;
      }

      if (day <= leadTime && currentRestock < minTroughStock) {
        minTroughStock = currentRestock;
      }

      pointsStatusQuo.push({ day, stock: currentSq });
      pointsWithRestock.push({ day, stock: currentRestock });
    }

    const runwayDaysSq = (stockOnHand / adsValue).toFixed(1);
    const stockoutRisk = minTroughStock <= 0 ? 'CRITICAL' : minTroughStock < safetyStock ? 'WARNING' : 'SAFE';
    
    // Revenue at risk if stockout occurs before arrival
    const daysLost = minTroughStock < 0 ? Math.abs(minTroughStock) / adsValue : 0;
    const revenueLoss = Math.round(daysLost * adsValue * 215000);

    const serviceLevel = minTroughStock > safetyStock ? 99.4 : minTroughStock > 0 ? 94.2 : 78.5;

    return {
      pointsStatusQuo,
      pointsWithRestock,
      runwayDaysSq,
      stockoutDaySq: stockoutDaySq > 0 ? stockoutDaySq : '>14 Hari',
      stockoutDayRestock: stockoutDayRestock > 0 ? stockoutDayRestock : '>14 Hari',
      minTroughStock,
      stockoutRisk,
      revenueLoss,
      serviceLevel,
      finalStock: pointsWithRestock[14]?.stock || 0
    };
  }, [stockOnHand, adsValue, leadTime, safetyStock, proposedRestock]);

  // Max value for SVG chart scaling
  const maxChartStock = Math.max(1200, stockOnHand + proposedRestock);

  const getSvgCoordinates = (day, stock) => {
    const x = 50 + (day / 14) * 600;
    const y = 200 - (stock / maxChartStock) * 160;
    return `${x},${y}`;
  };

  const pathStatusQuo = results.pointsStatusQuo.map(p => getSvgCoordinates(p.day, p.stock)).join(' L ');
  const pathRestock = results.pointsWithRestock.map(p => getSvgCoordinates(p.day, p.stock)).join(' L ');
  const ySafety = 200 - (safetyStock / maxChartStock) * 160;
  const xDelivery = 50 + (leadTime / 14) * 600;

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider mb-1">
            <Sliders className="h-4 w-4" />
            <span>Interactive Supply Chain Sandbox • Model Preskriptif GTNIC 2026</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-on-surface">
            What-if Restock &amp; Lead Time Simulator
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Uji ketahanan inventori gudang terhadap lonjakan permintaan retail, keterlambatan armada logistik, dan ukuran alokasi pabrik.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto">
          <Button
            onClick={() => handleApplyPreset('normal')}
            variant="outline"
            size="sm"
            className="text-xs h-8"
          >
            Normal Baseline
          </Button>
          <Button
            onClick={() => handleApplyPreset('surge')}
            variant="outline"
            size="sm"
            className="text-xs h-8 text-primary border-primary/30"
          >
            <Zap className="h-3.5 w-3.5 mr-1" />
            Lonjakan Demand (+48%)
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
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-outline/10 pb-3">
                <span className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-primary" />
                  Parameter Simulasi Dinamis
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">Live Recalculation</span>
              </div>

              {/* Slider 1: Stock on Hand */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="text-on-surface font-semibold">Stok Fisik Awal (Gudang Krian)</label>
                  <span className="font-mono font-bold text-primary">{stockOnHand} Dus</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="800"
                  step="10"
                  value={stockOnHand}
                  onChange={(e) => setStockOnHand(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant">
                  <span>50 Dus (Kritis)</span>
                  <span>800 Dus (Penuh)</span>
                </div>
              </div>

              {/* Slider 2: Average Daily Sales (ADS) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="text-on-surface font-semibold">Laju Penjualan Harian (ADS)</label>
                  <span className="font-mono font-bold text-on-surface">{adsValue} Dus / Hari</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="5"
                  value={adsValue}
                  onChange={(e) => setAdsValue(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant">
                  <span>50 Dus (Tenang)</span>
                  <span>300 Dus (Puncak Ramadhan/Event)</span>
                </div>
              </div>

              {/* Slider 3: Lead Time */}
              <div className="space-y-1.5">
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
                <div className="flex justify-between text-[10px] text-on-surface-variant">
                  <span>1 Hari (Expedited Pasuruan)</span>
                  <span>8 Hari (Jalur Macet / Bottleneck)</span>
                </div>
              </div>

              {/* Slider 4: Safety Stock */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="text-on-surface font-semibold">Ambang Batas Stok Aman (Safety Stock)</label>
                  <span className="font-mono font-bold text-emerald-700">{safetyStock} Dus</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="400"
                  step="25"
                  value={safetyStock}
                  onChange={(e) => setSafetyStock(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-2 bg-surface-container rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant">
                  <span>50 Dus</span>
                  <span>400 Dus (Buffer Tebal)</span>
                </div>
              </div>

              {/* Slider 5: Proposed Restock Volume */}
              <div className="space-y-1.5 pt-2 border-t border-outline/10">
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
                <div className="flex justify-between text-[10px] text-on-surface-variant">
                  <span>0 Dus (Tanpa Restock)</span>
                  <span>850 (1 Wingbox)</span>
                  <span>1.600 (2 Wingbox)</span>
                </div>
              </div>

              {/* Apply to Restock Request Button */}
              <Button
                onClick={() => setCurrentScreen && setCurrentScreen('restock-request')}
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
              <span className="text-[10px] text-on-surface-variant block">Runway Tanpa Restock</span>
              <span className="text-lg font-extrabold font-mono text-red-600 block mt-0.5">{results.runwayDaysSq} Hari</span>
            </div>
            <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline/10 text-center">
              <span className="text-[10px] text-on-surface-variant block">Titik Nadir Sebelum Tiba</span>
              <span className={`text-lg font-extrabold font-mono block mt-0.5 ${results.minTroughStock <= 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                {results.minTroughStock} Dus
              </span>
            </div>
            <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline/10 text-center">
              <span className="text-[10px] text-on-surface-variant block">Service Level (Fill-Rate)</span>
              <span className="text-lg font-extrabold font-mono text-on-surface block mt-0.5">{results.serviceLevel}%</span>
            </div>
            <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline/10 text-center">
              <span className="text-[10px] text-on-surface-variant block">Status Mitigasi</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                results.stockoutRisk === 'SAFE' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : results.stockoutRisk === 'WARNING' 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {results.stockoutRisk === 'SAFE' ? 'Aman Terlindungi' : results.stockoutRisk === 'WARNING' ? 'Dekat Buffer' : 'Beresiko Stockout'}
              </span>
            </div>
          </div>

          {/* SVG Depletion Chart */}
          <Card className="border border-outline/10 shadow-xs bg-surface-container-lowest overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-on-surface">Proyeksi Trajektori Stok 14 Hari (Daily Depletion)</h3>
                  <p className="text-xs text-on-surface-variant">Simulasi dinamika persediaan dengan titik kedatangan armada pada Hari ke-{leadTime}.</p>
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
                  {/* Grid Lines */}
                  <line x1="50" y1="40" x2="650" y2="40" stroke="#e5e2e1" strokeWidth="1" />
                  <line x1="50" y1="90" x2="650" y2="90" stroke="#e5e2e1" strokeWidth="1" />
                  <line x1="50" y1="140" x2="650" y2="140" stroke="#e5e2e1" strokeWidth="1" />
                  <line x1="50" y1="200" x2="650" y2="200" stroke="#e5e2e1" strokeWidth="1" />

                  {/* Safety threshold line */}
                  <line x1="50" y1={ySafety} x2="650" y2={ySafety} stroke="#735c00" strokeDasharray="4 4" strokeWidth="1.5" />
                  <text x="645" y={ySafety - 4} textAnchor="end" className="text-[10px] font-mono fill-tertiary">
                    Safety Stock ({safetyStock} Dus)
                  </text>

                  {/* Delivery Day vertical line */}
                  <line x1={xDelivery} y1="20" x2={xDelivery} y2="200" stroke="#900000" strokeDasharray="3 3" strokeWidth="1.5" />
                  <text x={xDelivery} y="15" textAnchor="middle" className="text-[10px] font-bold fill-primary">
                    Truk Tiba (H-{leadTime})
                  </text>

                  {/* Status Quo Path (Red) */}
                  <path d={`M ${pathStatusQuo}`} fill="none" stroke="#ba1a1a" strokeWidth="2" strokeDasharray="3 3" />

                  {/* With Restock Path (Gold/Amber) */}
                  <path d={`M ${pathRestock}`} fill="none" stroke="#cca830" strokeWidth="3" />

                  {/* Day Markers */}
                  {[0, 2, 4, 6, 8, 10, 12, 14].map(d => (
                    <text key={d} x={50 + (d / 14) * 600} y="215" textAnchor="middle" className="text-[10px] font-mono fill-gray-500">
                      H-{d}
                    </text>
                  ))}
                </svg>
              </div>

              {/* Explanatory note */}
              <div className="p-3 bg-surface-container-low rounded-lg text-xs space-y-1">
                <div className="font-bold text-on-surface">Analisis Hasil Simulasi:</div>
                <p className="text-on-surface-variant leading-relaxed">
                  {results.minTroughStock <= 0 ? (
                    <span className="text-red-700">
                      ⚠️ <strong>Terjadi kekosongan stok ({Math.abs(results.minTroughStock)} dus)!</strong> Pengiriman pada Hari ke-{leadTime} terlambat untuk mencegah stockout. Disarankan mempercepat dispatch pabrik atau mengambil pasokan lintas depot.
                    </span>
                  ) : (
                    <span className="text-emerald-800">
                      ✅ <strong>Stok aman terjaga!</strong> Titik terendah ({results.minTroughStock} dus) masih berada di atas ambang batas. Pengiriman {proposedRestock} dus pada Hari ke-{leadTime} berhasil memulihkan saldo inventori hingga {results.finalStock} dus di akhir periode.
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
