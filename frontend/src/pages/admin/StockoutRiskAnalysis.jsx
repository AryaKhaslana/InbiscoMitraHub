import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { api } from '../../services/api';
import { 
  AlertTriangle, 
  ShieldAlert, 
  DollarSign, 
  Clock, 
  Truck, 
  CheckCircle2, 
  Sliders, 
  Sparkles,
  Layers,
  ArrowRightLeft,
  RefreshCw,
  X
} from 'lucide-react';
import { formatRupiah } from '../../lib/utils';
import confetti from 'canvas-confetti';

export default function StockoutRiskAnalysis({ setCurrentScreen }) {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedTransferSku, setSelectedTransferSku] = useState(null);
  const [rebalanceConfirmItem, setRebalanceConfirmItem] = useState(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [lastTransferReceipt, setLastTransferReceipt] = useState(null);

  const fetchRiskAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getStockoutRisk();
      setRiskData(res);
      if (res?.items?.length > 0) {
        setSelectedTransferSku((prev) => {
          const stillExists = prev && res.items.find((i) => i.productId === prev.productId);
          return stillExists || res.items[0];
        });
      }
    } catch (err) {
      console.error('StockoutRiskAnalysis fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiskAnalysis();
    const onRefresh = () => fetchRiskAnalysis();
    window.addEventListener('supplysync:refresh', onRefresh);

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setRebalanceConfirmItem(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('supplysync:refresh', onRefresh);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [fetchRiskAnalysis]);

  const rawItems = riskData?.items || [];

  const categories = useMemo(() => {
    return Array.from(new Set(rawItems.map((i) => i.category).filter(Boolean)));
  }, [rawItems]);

  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (selectedSeverity !== 'ALL' && item.riskLevel !== selectedSeverity) return false;
      return true;
    });
  }, [rawItems, selectedCategory, selectedSeverity]);

  const threatenedSkus = useMemo(() => {
    return rawItems.filter(
      (item) => item.riskLevel === 'CRITICAL' || item.riskLevel === 'HIGH' || (item.deficitCartons && item.deficitCartons > 0)
    );
  }, [rawItems]);

  const activeTransferTarget = selectedTransferSku || threatenedSkus[0] || rawItems[0];

  const handleAuthorizeTransfer = async (overrideItem = null) => {
    const isSyntheticEvent =
      overrideItem &&
      (overrideItem.nativeEvent ||
        overrideItem._reactName ||
        typeof overrideItem.preventDefault === 'function');
    const validOverride = isSyntheticEvent ? null : overrideItem;
    const target = validOverride || activeTransferTarget;
    if (!target) return;
    setIsAuthorizing(true);
    setLastTransferReceipt(null);
    try {
      const rec = target.crossDepotRecommendation || {};
      const qty = rec.suggestedTransferCartons || 200;
      const payload = {
        quantityCartons: Number(qty),
        sourceDepot: String(rec.donorDepot || 'Depo Mojokerto (Hub Jatim 2)').slice(0, 100),
        targetDepot: String(rec.targetDepot || 'CV Surya Krian Logistik (Hub Jatim 1)').slice(0, 100),
        notes: `Cross-depot emergency rebalancing untuk ${target.name || target.sku || 'SKU'}`.slice(0, 240),
      };
      if (target.sku) payload.sku = String(target.sku).trim();
      if (
        target.productId &&
        typeof target.productId === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target.productId)
      ) {
        payload.productId = target.productId;
      }
      const result = await api.crossDepotTransfer(payload);
      setLastTransferReceipt(result);
      setRebalanceConfirmItem(null);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      await fetchRiskAnalysis();
    } catch (err) {
      alert(err.message || 'Gagal mengeksekusi transfer antar-depot');
    } finally {
      setIsAuthorizing(false);
    }
  };

  const criticalCount = riskData?.summary?.criticalSkuCount ?? 0;
  const totalRevAtRisk = riskData?.summary?.totalRevenueAtRiskIDR ?? 0;
  const totalDeficit = rawItems.reduce((sum, i) => sum + (i.deficitCartons || 0), 0);
  const avgRunway =
    rawItems.length > 0
      ? (rawItems.reduce((sum, i) => sum + Number(i.runwayDays || 0), 0) / rawItems.length).toFixed(1)
      : '2.4';

  const getSeverityBadge = (level) => {
    if (level === 'CRITICAL') {
      return { label: 'Kritis (<2 Hari)', color: 'bg-red-100 text-red-800 border-red-200' };
    }
    if (level === 'HIGH') {
      return { label: 'Siaga Tinggi (2-4 Hari)', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    }
    if (level === 'MODERATE') {
      return { label: 'Waspada (4-6 Hari)', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
    return { label: 'Optimal (>6.5 Hari)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="h-4 w-4" />
            <span>HQ Early Warning Radar • Telemetri Ketersediaan Stok</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-on-surface">
            Pusat Peringatan Dini &amp; Kerentanan Stok
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Deteksi dini probabilitas kelangkaan pasokan (stockout) secara real-time berdasarkan saldo stok fisik gudang.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Badge
            variant={criticalCount > 0 ? 'destructive' : 'outline'}
            className={`text-xs font-bold ${criticalCount > 0 ? 'animate-pulse' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}
          >
            {criticalCount} SKU Kritis / Siaga
          </Badge>
          <Button
            onClick={fetchRiskAnalysis}
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            <span>Refresh Radar</span>
          </Button>
        </div>
      </div>

      {/* Summary Severity KPI Cluster (3 Distinct Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Critical Risk SKU */}
        <Card className="border border-outline/10 shadow-xs relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-1 ${criticalCount > 0 ? 'bg-red-600' : 'bg-emerald-600'}`}></div>
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${criticalCount > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                  SKU Kritis &amp; Siaga Tinggi
                </span>
                <div className="text-2xl lg:text-3xl font-extrabold text-on-surface mt-1">
                  {criticalCount} SKU Terancam
                </div>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${criticalCount > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {criticalCount > 0 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              </div>
            </div>
            {threatenedSkus.length > 0 && (
              <div className="mt-4 pt-2.5 bg-surface-container-low rounded-lg p-2.5 space-y-1">
                <span className="text-[11px] font-semibold text-on-surface">Prioritas Penanganan Gudang Krian:</span>
                <div className="flex flex-wrap gap-1">
                  {threatenedSkus.slice(0, 3).map((it) => (
                    <span key={it.productId} className="text-[10px] font-mono bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant">
                      {it.name.split('(')[0].trim()} ({it.runwayDays}h)
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Potential Revenue at Risk */}
        <Card className="border border-outline/10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Potensi Omzet Berisiko</span>
                <div className="text-2xl lg:text-3xl font-extrabold text-on-surface mt-1">
                  {formatRupiah(totalRevAtRisk)}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 pt-2.5 bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between text-xs text-on-surface-variant">
              <span>Total Defisit terhadap Target 5 Hari:</span>
              <span className={`font-mono font-bold ${totalDeficit > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                {totalDeficit > 0 ? `-${totalDeficit} Dus B2B` : '0 Dus B2B'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Lead Time Vulnerability Buffer */}
        <Card className="border border-outline/10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Rata-rata Runway Gudang</span>
                <div className="text-2xl lg:text-3xl font-extrabold text-on-surface mt-1">{avgRunway} Hari</div>
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
      {activeTransferTarget && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container-lowest shadow-sm relative overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-primary text-white text-[10px] uppercase font-bold tracking-wider">
                      Peluang Rerouting Cepat Antar-Depot
                    </span>
                    <span className="text-xs font-bold text-on-surface">
                      Keseimbangan Antar-Depot (Cross-Depot Rebalancing)
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-on-surface">
                    Transfer {activeTransferTarget.crossDepotRecommendation?.suggestedTransferCartons || 200} Dus{' '}
                    {activeTransferTarget.name.split('(')[0].trim()} dari{' '}
                    {activeTransferTarget.crossDepotRecommendation?.donorDepot || 'Depo Mojokerto'} ke Depo Krian
                  </h3>
                  <p className="text-xs text-on-surface-variant max-w-3xl">
                    Stok saat ini di Gudang Krian adalah <strong>{activeTransferTarget.stockCartons} dus</strong> (runway{' '}
                    <strong>{activeTransferTarget.runwayDays} hari</strong>, safety stock {activeTransferTarget.safetyStock} dus).
                    Rute via {activeTransferTarget.crossDepotRecommendation?.routeVia || 'Tol Jombang–Mojokerto -> Exit Krian'}{' '}
                    memakan waktu {activeTransferTarget.crossDepotRecommendation?.estimatedTransitHours || 1.5} jam dan langsung menambah ketersediaan stok Gudang Krian.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0 self-start lg:self-auto">
                <Button
                  onClick={() => handleAuthorizeTransfer(activeTransferTarget)}
                  disabled={isAuthorizing}
                  className="bg-primary text-white text-xs font-bold px-4 py-2 hover:bg-primary-container shadow-xs flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {isAuthorizing
                      ? 'Memproses Otorisasi Transfer...'
                      : `Otorisasi Transfer +${activeTransferTarget.crossDepotRecommendation?.suggestedTransferCartons || 200} Dus`}
                  </span>
                </Button>
              </div>
            </div>

            {lastTransferReceipt && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Resi Transfer {lastTransferReceipt.transferCode} Berhasil! Stok {lastTransferReceipt.productName.split('(')[0]}{' '}
                    bertambah dari {lastTransferReceipt.previousStock} Dus menjadi {lastTransferReceipt.newStock} Dus.
                  </span>
                </div>
                <span className="font-mono text-[11px] font-semibold">
                  Nilai: {formatRupiah(lastTransferReceipt.transferValueIDR)}
                </span>
              </div>
            )}

            {/* Quick interactive transfer route visualization bar */}
            <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-on-surface">
                  {activeTransferTarget.crossDepotRecommendation?.donorDepot || 'Depo Donor'}
                </span>
              </div>
              <div className="flex-1 max-w-xs flex items-center gap-2 justify-center text-primary font-mono text-[11px] font-bold">
                <span>-{activeTransferTarget.crossDepotRecommendation?.suggestedTransferCartons || 200} Dus</span>
                <div className="h-0.5 flex-1 bg-primary relative">
                  <div className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-primary rotate-45"></div>
                </div>
                <span className="text-emerald-700">
                  +{activeTransferTarget.crossDepotRecommendation?.suggestedTransferCartons || 200} Dus
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-on-surface">Depot Krian:</span>
                <span className="text-emerald-700 font-mono font-bold">
                  {activeTransferTarget.stockCartons} Dus →{' '}
                  {activeTransferTarget.stockCartons +
                    (activeTransferTarget.crossDepotRecommendation?.suggestedTransferCartons || 200)}{' '}
                  Dus
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Severity Matrix & Interactive Prioritization Table */}
      <Card className="border border-outline/10 shadow-xs">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-outline/10 pb-4">
            <div>
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Matriks Prioritas Risiko Ketersediaan SKU
              </h3>
              <p className="text-xs text-on-surface-variant">
                Klik baris SKU mana saja untuk menjadikannya target simulasi Cross-Depot Rebalancing di atas.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-8 px-2 text-xs bg-surface-container border border-outline/20 rounded-md font-semibold"
              >
                <option value="ALL">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="h-8 px-2 text-xs bg-surface-container border border-outline/20 rounded-md font-semibold"
              >
                <option value="ALL">Semua Tingkat Risiko</option>
                <option value="CRITICAL">Kritis (&lt;2 Hari)</option>
                <option value="HIGH">Siaga Tinggi (2-4 Hari)</option>
                <option value="MODERATE">Waspada (4-6.5 Hari)</option>
                <option value="OPTIMAL">Optimal (&gt;6.5 Hari)</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
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
                  <th className="py-2.5 px-3 font-semibold uppercase tracking-wider">Donor Terdekat</th>
                  <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-right">Stok Riil / Buffer SS</th>
                  <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-right">Laju ADS</th>
                  <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-right">Runway (DoI)</th>
                  <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-right">Omzet Berisiko</th>
                  <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-center">Status</th>
                  <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10 font-medium">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-on-surface-variant text-xs">
                      Tidak ada SKU produk yang cocok dengan filter kriteria yang dipilih.{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('ALL');
                          setSelectedSeverity('ALL');
                        }}
                        className="text-primary font-bold hover:underline ml-1 cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                  const badge = getSeverityBadge(item.riskLevel);
                  const isSelected = activeTransferTarget?.productId === item.productId;
                  return (
                    <tr
                      key={item.productId}
                      onClick={() => setSelectedTransferSku(item)}
                      className={`hover:bg-surface-container-low transition-colors cursor-pointer ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-on-surface">{item.name.split('(')[0].trim()}</div>
                        <div className="text-[10px] text-on-surface-variant font-mono">
                          {item.sku} • {item.category}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-on-surface font-semibold">
                          {item.crossDepotRecommendation?.donorDepot || 'Depo Mojokerto'}
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-mono">
                          Saran Transfer: +{item.crossDepotRecommendation?.suggestedTransferCartons} Dus
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-bold text-on-surface">{item.stockCartons} Dus</div>
                        <div className="text-[10px] text-on-surface-variant font-mono">SS: {item.safetyStock} Dus</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-on-surface-variant">
                        {item.adsCartonsPerDay} Dus/hr
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`font-mono font-bold text-xs ${item.runwayDays < 2 ? 'text-red-600' : 'text-on-surface'}`}>
                          {item.runwayDays} Hari
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-on-surface">
                        {item.revenueAtRiskIDR > 0 ? formatRupiah(item.revenueAtRiskIDR) : '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedTransferSku(item);
                              setRebalanceConfirmItem(item);
                            }}
                            variant="outline"
                            className="text-[11px] h-7 px-2 font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            Rebalance Antar-Depo
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setCurrentScreen && setCurrentScreen('smart-recommendations')}
                            className="bg-primary text-white text-[11px] h-7 px-2.5 hover:bg-primary-container"
                          >
                            PO Pabrik
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Visual Analysis: Regional Vulnerability & Lead Time Stress Testing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
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
                <div className="font-bold text-on-surface">Koridor 2: Tol Jombang - Mojokerto - Exit Krian</div>
                <div className="text-[10px] text-on-surface-variant">Jalur Cross-Depot Rebalancing Darurat</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">
                Lancar (1.5 Jam)
              </span>
            </div>
            <div className="p-3 bg-surface-container-low rounded-lg border border-outline/10 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-on-surface">Koridor 3: Jalur Arteri Surabaya - Krian - Balongbendo</div>
                <div className="text-[10px] text-on-surface-variant">Rute pengiriman harian armada canter retail</div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800">
                Padat Sore (+25 Menit)
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-surface-container-lowest p-5 rounded-xl border border-outline/10 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 border-b border-outline/10 pb-2.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-xs text-on-surface">Panduan Singkat &amp; Konteks Radar</h3>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Pusat mitigasi preventif untuk mencegah kekosongan stok fisik di Gudang Krian sebelum terjadi lost-sales di tingkat toko mitra.
            </p>
            <div className="p-2.5 bg-surface-container-low rounded-lg border border-outline/10 text-xs space-y-2">
              <div className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                <span className="text-on-surface-variant leading-tight">
                  <strong className="text-on-surface">Simulasi Rebalance:</strong> Klik baris SKU di tabel untuk memilih target rebalance stok dari depo terdekat.
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                <span className="text-on-surface-variant leading-tight">
                  <strong className="text-on-surface">Otorisasi Transfer:</strong> Eksekusi penyeimbangan stok antar-depot instan saat darurat tanpa menunggu siklus pabrik.
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setCurrentScreen && setCurrentScreen('what-if-simulator')}
            variant="outline"
            className="w-full text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Uji Skenario di What-If Simulator</span>
          </Button>
        </div>
      </div>

      {/* Modal: Konfirmasi Otorisasi Rebalancing Antar-Depot */}
      {rebalanceConfirmItem && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setRebalanceConfirmItem(null); }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest border border-outline/15 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 cursor-default"
          >
            <div className="flex items-start justify-between border-b border-outline/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-on-surface">
                    Otorisasi Rebalancing Antar-Depot
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium">
                    Protokol Pemindahan Stok Darurat Antar-Depot
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRebalanceConfirmItem(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Visual Route Strip: Donor -> Target */}
            <div className="p-3.5 bg-surface-container-low rounded-xl space-y-2 border border-outline/10 text-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-outline uppercase font-bold block">Pemberi Stok (Source)</span>
                  <span className="font-bold text-on-surface">
                    {rebalanceConfirmItem.crossDepotRecommendation?.donorDepot || 'Depo Mitra Mojokerto'}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono block">Status: Surplus Buffer</span>
                </div>
                <ArrowRightLeft className="h-4 w-4 text-primary shrink-0 mx-2" />
                <div className="space-y-0.5 text-right">
                  <span className="text-[10px] text-outline uppercase font-bold block">Penerima Stok (Target)</span>
                  <span className="font-bold text-on-surface">
                    {rebalanceConfirmItem.crossDepotRecommendation?.targetDepot || 'CV Surya Krian Logistik'}
                  </span>
                  <span className="text-[10px] text-red-600 font-mono block">Status: Defisit / Kritis</span>
                </div>
              </div>
            </div>

            {/* Detail SKU & Dampak */}
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-surface-container-low rounded-xl space-y-1.5 border border-outline/10">
                <div className="font-bold text-on-surface text-sm">
                  {rebalanceConfirmItem.name}
                </div>
                <div className="text-[11px] text-on-surface-variant font-mono">
                  SKU: {rebalanceConfirmItem.sku} • Kategori: {rebalanceConfirmItem.category}
                </div>

                <div className="pt-2 border-t border-outline/10 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-on-surface-variant block">Stok Krian Saat Ini:</span>
                    <strong className="text-red-600 font-mono text-xs">{rebalanceConfirmItem.stockCartons} Dus</strong>
                    <span className="text-[10px] text-outline block">(Runway {rebalanceConfirmItem.runwayDays} Hari)</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">Jumlah Rebalance:</span>
                    <strong className="text-primary font-mono text-xs">
                      +{rebalanceConfirmItem.crossDepotRecommendation?.suggestedTransferCartons || 200} Dus
                    </strong>
                    <span className="text-[10px] text-emerald-700 block">(Stok Baru: {rebalanceConfirmItem.stockCartons + (rebalanceConfirmItem.crossDepotRecommendation?.suggestedTransferCartons || 200)} Dus)</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <Truck className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block">Rute &amp; Waktu Tempuh Cepat:</strong>
                  <span>
                    Via {rebalanceConfirmItem.crossDepotRecommendation?.routeVia || 'Tol Jombang–Mojokerto -> Exit Krian'} (Estimasi {rebalanceConfirmItem.crossDepotRecommendation?.estimatedTransitHours || 1.5} jam perjalanan via armada Hino Box).
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="pt-3 border-t border-outline/10 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRebalanceConfirmItem(null)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                size="sm"
                disabled={isAuthorizing}
                onClick={() => handleAuthorizeTransfer(rebalanceConfirmItem)}
                className="bg-primary hover:bg-primary-container text-white text-xs font-bold px-4 gap-1.5 shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  {isAuthorizing
                    ? 'Memproses Transfer...'
                    : `Eksekusi Transfer +${rebalanceConfirmItem.crossDepotRecommendation?.suggestedTransferCartons || 200} Dus`}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
